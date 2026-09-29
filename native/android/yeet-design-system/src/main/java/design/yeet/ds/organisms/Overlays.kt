package design.yeet.ds.organisms

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.AnimationSpec
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animate
import androidx.compose.animation.core.snap
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.draggable
import androidx.compose.foundation.gestures.rememberDraggableState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.displayCutout
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.union
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.nestedscroll.NestedScrollConnection
import androidx.compose.ui.input.nestedscroll.NestedScrollSource
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.Layout
import androidx.compose.ui.layout.layout
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.semantics.dismiss
import androidx.compose.ui.semantics.isTraversalGroup
import androidx.compose.ui.semantics.paneTitle
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.Velocity
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.DialogProperties
import androidx.compose.ui.window.DialogWindowProvider
import design.yeet.ds.atoms.Button
import design.yeet.ds.atoms.ButtonStyle
import design.yeet.ds.atoms.ControlSize
import design.yeet.ds.atoms.IconButton
import design.yeet.ds.atoms.Text
import design.yeet.ds.atoms.TextTone
import design.yeet.ds.atoms.TextVariant
import design.yeet.ds.icons.IconName
import design.yeet.ds.molecules.StatRow
import design.yeet.ds.molecules.StatTile
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews
import design.yeet.ds.theme.YeetTheme
import design.yeet.ds.theme.yeetFloatingShadow
import design.yeet.tokens.YeetComponent
import design.yeet.tokens.YeetGesture
import design.yeet.tokens.YeetHapticEvent
import design.yeet.tokens.YeetMotionScheme
import design.yeet.tokens.YeetRadius
import design.yeet.tokens.YeetSpace
import design.yeet.tokens.YeetSpring
import design.yeet.tokens.sheetBg
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlin.math.max
import androidx.compose.ui.window.Dialog as WindowDialog

/* ─── Значения, которых ещё нет в токенах ───────────────────────────── */

// TODO(tokens, #93): radius-overlay = 48 — одно скругление на все 4 угла шторки и диалога (решение владельца в #58).
//  Заменить на токен, когда его добавит tokens-сессия; пока то же значение — радиус таб-бара (концентрично экрану 56 при отступе 8).
private val OverlayRadius: Dp get() = YeetRadius.bar

// TODO(tokens, #93): sheet-top-gap — верх высокой шторки на «статус-бар + 8» (D2). На Android статус-бар — WindowInsets.statusBars.
private val SheetTopGap: Dp get() = YeetSpace.s8

/** Отступ плавающей шторки от краёв экрана и от клавиатуры (D3, D4). */
private val OverlayInset: Dp get() = YeetSpace.s8

/** Пара кнопок футера — через 7 (Figma, в токенах шага 7 нет). */
private val FooterGap = 7.dp

/* ─── Sheet & Dialog ────────────────────────────────────────────────── */

/** Действие в футере sheet / dialog: пара кнопок L равной ширины через 7. */
data class FooterAction(val label: String, val variant: ButtonStyle? = null, val onClick: (() -> Unit)? = null)

/**
 * Figma sheet · Type.
 * `Modal` — плавающая карточка поверх overlay: отступ 8 от краёв экрана, все углы 48 (`radius-overlay`, концентрично углу экрана).
 * `Panel` — постоянная панель экрана (детали, стилист, профиль) во всю ширину, 32 сверху, с тенью.
 */
enum class SheetType { Modal, Panel }

/** Форма плавающего sheet / dialog: все 4 угла 48 (`radius-overlay`). */
val SheetModalShape: Shape
    get() = RoundedCornerShape(OverlayRadius)

/**
 * Кнопки футера: две — равные половины через 7; если подпись не помещается в половину — столбец во всю ширину (D7).
 * Одна кнопка — во всю ширину.
 */
@Composable
private fun SheetFooter(actions: List<FooterAction>, modifier: Modifier = Modifier) {
    Layout(
        modifier = modifier.fillMaxWidth(),
        content = {
            actions.forEachIndexed { i, a ->
                Button(
                    a.label,
                    onClick = { a.onClick?.invoke() },
                    variant = a.variant ?: if (i == 0 && actions.size > 1) ButtonStyle.Tertiary else ButtonStyle.Primary,
                    size = ControlSize.L,
                    fullWidth = true,
                )
            }
        },
    ) { measurables, constraints ->
        val gap = FooterGap.roundToPx()
        val width = if (constraints.hasBoundedWidth) constraints.maxWidth else measurables.sumOf { it.maxIntrinsicWidth(Constraints.Infinity) }
        val count = measurables.size.coerceAtLeast(1)
        val cell = (width - gap * (count - 1)) / count
        val inRow = count == 1 || measurables.all { it.maxIntrinsicWidth(Constraints.Infinity) <= cell }
        val childWidth = if (inRow) cell else width
        val placeables = measurables.map {
            it.measure(Constraints(minWidth = childWidth, maxWidth = childWidth, minHeight = 0, maxHeight = constraints.maxHeight))
        }
        val height = if (inRow) placeables.maxOfOrNull { it.height } ?: 0 else placeables.sumOf { it.height } + gap * (placeables.size - 1)
        layout(width, height.coerceAtLeast(constraints.minHeight)) {
            var x = 0
            var y = 0
            placeables.forEach { p ->
                p.place(x, y)
                if (inRow) x += p.width + gap else y += p.height + gap
            }
        }
    }
}

@Composable
private fun SheetHandle() {
    // TODO(tokens, #93): sheet-handle — отдельный цвет хэндла ≈ 1,5 : 1 (D8); пока bg-subtle, хэндл декоративный
    Box(
        Modifier
            .size(width = 48.dp, height = 4.dp)
            .background(YeetTheme.colors.bgSubtle, RoundedCornerShape(YeetTheme.radius.xs)),
    )
}

/** Кнопка 40 с отступом −8: иконка на 20 от края шторки, строка заголовка не растёт (web: margin −8). */
private fun Modifier.negativeMargin(margin: Dp): Modifier = layout { measurable, constraints ->
    val m = margin.roundToPx()
    val p = measurable.measure(constraints)
    layout((p.width - m).coerceAtLeast(0), (p.height - 2 * m).coerceAtLeast(0)) { p.place(0, -m) }
}

@Composable
private fun SheetHead(title: String?, headingVariant: TextVariant, onClose: (() -> Unit)?) {
    if (onClose != null) {
        Row(Modifier.fillMaxWidth().heightIn(min = 24.dp), verticalAlignment = Alignment.CenterVertically) {
            if (title != null) Text(title, variant = headingVariant, modifier = Modifier.weight(1f)) else Spacer(Modifier.weight(1f))
            IconButton(IconName.Cross, label = "Закрыть", onClick = onClose, variant = ButtonStyle.Ghost, size = ControlSize.S, modifier = Modifier.negativeMargin(8.dp))
        }
    } else if (title != null) {
        Text(title, variant = headingVariant)
    }
}

/**
 * Bottom sheet — основа всех выборов, действий и фильтров. Всё временное открывается sheet'ом, а не новым экраном.
 *
 * **Modal** (единое правило шторки, `design/SHEETS-AUDIT.md` + решения #58):
 * хэндл → 16 → заголовок H3 → 16 → [описание → 20 →] контент → 16 → кнопки L через 7 → 20.
 * Без хэндла заголовок на 20 от верха; без заголовка контент сразу на 16 под хэндлом.
 * Хэндл, заголовок и футер закреплены, **прокручивается только тело**. Шторка растёт по содержимому,
 * но не выше «экран − статус-бар − 8» — это ограничение даёт [Overlay]. Внутри тела не кладите `LazyColumn`:
 * тело уже прокручивается (`verticalScroll`), длинный список — обычный `Column`.
 * Смахивание из тела — только когда оно прокручено в самое начало (nested scroll, см. [Overlay]).
 *
 * **Panel** — постоянная панель экрана: H2, без прокрутки тела, с тенью.
 *
 * Контент: `ListItem` (действия, радио, категории), `ChipGroup` (фильтры; лента уходит в край через `Modifier.bleed(20.dp)`),
 * `InputBar` (поиск), `AccountCard` (аккаунты).
 *
 * @param footer пара кнопок (secondary-action, primary-action); стиль по умолчанию — Tertiary + Primary. Безопасное действие — синее справа.
 * @param onClose крестик справа от заголовка: высокая шторка (Outfit Creation / Item Filter). По умолчанию тогда без хэндла.
 * @param description абзац-пояснение под заголовком (Body серым).
 * @param label имя для TalkBack, если заголовка нет (шторка источника фото, D10). С `title` имя берётся из заголовка.
 * @param handle показывать хэндл (Figma: Show Handle). По умолчанию — да, если нет крестика.
 */
@Composable
fun Sheet(
    modifier: Modifier = Modifier,
    title: String? = null,
    type: SheetType = SheetType.Modal,
    footer: Pair<FooterAction, FooterAction>? = null,
    onClose: (() -> Unit)? = null,
    description: String? = null,
    label: String? = null,
    handle: Boolean = onClose == null,
    content: @Composable ColumnScope.() -> Unit = {},
) {
    if (type == SheetType.Panel) {
        PanelSheet(modifier, title, footer, description, handle, content)
        return
    }
    val hasHead = title != null || onClose != null
    ModalSurface(
        modifier = modifier,
        paneTitle = title ?: label,
        top = if (handle) 8.dp else 20.dp,
        showHead = handle || hasHead,
        head = {
            if (handle) {
                Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { SheetHandle() }
                if (hasHead) Spacer(Modifier.height(16.dp))
            }
            SheetHead(title, TextVariant.H3, onClose)
        },
        footer = footer?.let { listOf(it.first, it.second) },
    ) {
        if (description != null) {
            Text(description, tone = TextTone.Secondary)
            Spacer(Modifier.height(20.dp))
        }
        content()
    }
}

/**
 * Каркас плавающей шторки и диалога: закреплённая шапка, тело с прокруткой, закреплённый футер.
 * Высоту ограничивает родитель ([Overlay]); тело забирает остаток (`weight(fill = false)`).
 */
@Composable
private fun ModalSurface(
    modifier: Modifier,
    paneTitle: String?,
    top: Dp,
    showHead: Boolean,
    head: @Composable ColumnScope.() -> Unit,
    footer: List<FooterAction>?,
    body: @Composable ColumnScope.() -> Unit,
) {
    val shape = SheetModalShape
    Column(
        modifier
            .fillMaxWidth()
            .background(YeetTheme.colors.sheetBg, shape)
            .semantics {
                isTraversalGroup = true
                if (paneTitle != null) this.paneTitle = paneTitle
            }
            .padding(top = top),
    ) {
        if (showHead) {
            Column(Modifier.fillMaxWidth().padding(horizontal = YeetSpace.screenGutter), content = head)
            Spacer(Modifier.height(16.dp))
        }
        Column(
            Modifier
                .weight(1f, fill = false)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                // поля внутри прокрутки: лента чипсов выходит в край шторки (bleed), клип — только по вертикали
                .padding(horizontal = YeetSpace.screenGutter),
            content = body,
        )
        if (footer != null) {
            SheetFooter(footer, Modifier.padding(start = YeetSpace.screenGutter, end = YeetSpace.screenGutter, top = 16.dp, bottom = 20.dp))
        } else {
            Spacer(Modifier.height(20.dp))
        }
    }
}

@Composable
private fun PanelSheet(
    modifier: Modifier,
    title: String?,
    footer: Pair<FooterAction, FooterAction>?,
    description: String?,
    handle: Boolean,
    content: @Composable ColumnScope.() -> Unit,
) {
    val shape = RoundedCornerShape(topStart = YeetComponent.sheetRadius, topEnd = YeetComponent.sheetRadius)
    Column(
        modifier
            .fillMaxWidth()
            .yeetFloatingShadow(shape)
            .background(YeetTheme.colors.sheetBg, shape)
            .padding(start = 20.dp, end = 20.dp, top = if (handle) 8.dp else 20.dp, bottom = 20.dp),
    ) {
        if (handle) {
            Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { SheetHandle() }
            if (title != null) Spacer(Modifier.height(20.dp))
        }
        if (title != null) {
            Text(title, variant = TextVariant.H2)
            Spacer(Modifier.height(16.dp))
        } else if (handle) {
            Spacer(Modifier.height(16.dp))
        }
        if (description != null) {
            Text(description, tone = TextTone.Secondary)
            Spacer(Modifier.height(20.dp))
        }
        content()
        if (footer != null) {
            Spacer(Modifier.height(20.dp))
            SheetFooter(listOf(footer.first, footer.second))
        }
    }
}

/**
 * Figma dialog · Tone.
 * `Default` — Tertiary + Primary («Выйти / Сохранить и выйти»).
 * `Destructive` — необратимое действие серым слева, безопасная «Отмена» синей справа («Очистить / Отмена»).
 * `Danger` — удаление аккаунта: красная Destructive слева, «Отменить» синей справа.
 */
enum class DialogTone { Default, Destructive, Danger }

/**
 * Подтверждение в той же плавающей форме, что и sheet Modal, **без хэндла** (D1): заголовок на 20 от верха,
 * заголовок → 16 → описание → 16 → контент → 16 → кнопки. **Безопасное действие всегда синее справа.**
 * Без `cancel` — уведомление с одной кнопкой `confirm` Tertiary во всю ширину («Ок!»).
 *
 * В слое [Overlay]: `Destructive` и `Danger` (alertdialog, D6) закрываются **только кнопками и «Назад»** —
 * «Назад» вызывает `onCancel`; тап по затемнению и смахивание не работают. `Default` закрывается как шторка,
 * «Назад» — `onCancel`, если он есть.
 */
@Composable
fun Dialog(
    title: String,
    cancel: String?,
    confirm: String,
    modifier: Modifier = Modifier,
    tone: DialogTone = DialogTone.Default,
    description: String? = null,
    onCancel: (() -> Unit)? = null,
    onConfirm: (() -> Unit)? = null,
    content: (@Composable ColumnScope.() -> Unit)? = null,
) {
    val risky = tone != DialogTone.Default
    val layer = LocalOverlay.current
    val currentOnCancel by rememberUpdatedState(onCancel)
    if (layer != null) {
        SideEffect {
            layer.dialog = true
            layer.locked = risky
            layer.back = if (onCancel != null) ({ currentOnCancel?.invoke() }) else null
        }
        DisposableEffect(layer) {
            onDispose {
                layer.dialog = false
                layer.locked = false
                layer.back = null
            }
        }
    }
    val footer = when {
        cancel == null -> listOf(FooterAction(confirm, ButtonStyle.Tertiary, onConfirm))
        risky -> listOf(
            FooterAction(confirm, if (tone == DialogTone.Danger) ButtonStyle.Destructive else ButtonStyle.Tertiary, onConfirm),
            FooterAction(cancel, ButtonStyle.Primary, onCancel),
        )
        else -> listOf(FooterAction(cancel, ButtonStyle.Tertiary, onCancel), FooterAction(confirm, ButtonStyle.Primary, onConfirm))
    }
    ModalSurface(modifier = modifier, paneTitle = title, top = 20.dp, showHead = false, head = {}, footer = footer) {
        Text(title, variant = TextVariant.H3)
        if (description != null) {
            Spacer(Modifier.height(16.dp))
            Text(description, tone = TextTone.Secondary)
        }
        if (content != null) {
            Spacer(Modifier.height(16.dp))
            content()
        }
    }
}

/* ─── Overlay ───────────────────────────────────────────────────────── */

/** Связь слоя с содержимым: диалог сообщает, что он alertdialog и куда вести «Назад». */
@Stable
internal class OverlayController {
    /** Внутри — [Dialog]: появление `appear`, а не пружина шторки. */
    var dialog by mutableStateOf(false)

    /** Подтверждение destructive / danger: не закрывается затемнением и смахиванием. */
    var locked by mutableStateOf(false)

    /** «Назад» внутри слоя — `onCancel` диалога вместо закрытия слоя. */
    var back by mutableStateOf<(() -> Unit)?>(null)
}

internal val LocalOverlay = staticCompositionLocalOf<OverlayController?> { null }

/** Появление и возврат шторки — пружина quick без перелёта (D5); «уменьшить движение» — мгновенно. */
private fun YeetMotionScheme.sheet(): AnimationSpec<Float> =
    if (reduced) snap() else spring(dampingRatio = Spring.DampingRatioNoBouncy, stiffness = YeetSpring.quickStiffness)

/**
 * Модальный слой (web: Overlay): затемнение `bgOverlay` и прижатая к низу плавающая шторка.
 *
 * **Геометрия.** 8 от краёв слева и справа; снизу `max(8, навигационная панель)`, над клавиатурой — 8 от клавиатуры (D3, D4);
 * сверху не выше «статус-бар + 8» (D2) — высокая шторка прокручивает тело, шапка и футер на месте.
 *
 * **Движение.** Шторка выезжает на пружине quick без перелёта (D5), [Dialog] — `appear`; уход — `exit`, целиком за край
 * из текущего положения. «Уменьшить движение» (`ANIMATOR_DURATION_SCALE = 0`) — всё мгновенно.
 *
 * **Смахивание.** С хэндла, шапки и футера — сразу; из тела — только когда тело прокручено в начало (nested scroll:
 * тело сначала докручивается к началу, остаток жеста тянет шторку). Вниз 1 : 1, вверх — с сопротивлением.
 * Закрывается дальше 30 % высоты (хаптика `threshold` в момент пересечения) или броском быстрее 500 dp/с
 * (скорость — `VelocityTracker` Compose: пауза перед отпусканием обнуляет бросок); иначе возвращается.
 *
 * **Закрытие.** Смахивание, тап по затемнению, «Назад», действие TalkBack «Закрыть» — всё через `onClose`
 * (родитель ставит `visible = false`, уход доигрывает слой). Подтверждение `Destructive` / `Danger` — только кнопками,
 * «Назад» → `onCancel` (D6). Если родитель оставил слой открытым, шторка возвращается на место.
 *
 * **Доступность.** Слой — отдельное окно: TalkBack переходит в него и объявляет `paneTitle` (заголовок шторки / диалога).
 *
 * ```
 * Overlay(visible = open, onClose = { open = false }) {
 *     Sheet(title = "Сезон", footer = FooterAction("Сбросить") to FooterAction("Применить")) { … }
 * }
 * ```
 */
@Composable
fun Overlay(
    visible: Boolean,
    onClose: () -> Unit,
    modifier: Modifier = Modifier,
    dismissible: Boolean = true,
    content: @Composable () -> Unit,
) {
    val motion = YeetTheme.motion
    val haptics = YeetTheme.haptics
    val overlayAlpha = YeetTheme.colors.bgOverlay.alpha
    val density = LocalDensity.current
    val scope = rememberCoroutineScope()
    val currentOnClose by rememberUpdatedState(onClose)
    val currentVisible by rememberUpdatedState(visible)
    val controller = remember { OverlayController() }
    val closable = dismissible && !controller.locked
    val currentClosable by rememberUpdatedState(closable)

    var inWindow by remember { mutableStateOf(visible) }
    val enter = remember { Animatable(0f) }
    var offset by remember { mutableFloatStateOf(0f) }
    var sheetHeight by remember { mutableFloatStateOf(0f) }
    var bottomGap by remember { mutableFloatStateOf(0f) }
    var passedThreshold by remember { mutableStateOf(false) }
    var settleJob by remember { mutableStateOf<Job?>(null) }

    LaunchedEffect(visible) {
        if (visible) {
            inWindow = true
            offset = 0f
            // ждём первый замер: до него шторка не видна и не прыгает в конечное положение на кадр
            snapshotFlow { sheetHeight }.first { it > 0f }
            enter.animateTo(1f, if (controller.dialog) motion.appear() else motion.sheet())
        } else if (inWindow) {
            enter.animateTo(0f, motion.exit())
            inWindow = false
            offset = 0f
        }
    }
    if (!inWindow) return

    fun dragBy(delta: Float) {
        settleJob?.cancel()
        // вверх — с сопротивлением (rubber band), вниз — за пальцем
        offset += if (offset + delta < 0f) delta * (1f - YeetGesture.rubberBand) else delta
        val over = sheetHeight > 0f && offset > sheetHeight * YeetGesture.swipeDistance
        if (over != passedThreshold) {
            passedThreshold = over
            if (over) haptics.perform(YeetHapticEvent.Threshold)
        }
    }

    fun settleBack() {
        settleJob?.cancel()
        settleJob = scope.launch {
            animate(offset, 0f, animationSpec = motion.sheet()) { v, _ -> offset = v }
        }
    }

    fun requestClose() {
        passedThreshold = false
        currentOnClose()
        // родитель отклонил закрытие (visible остался true) — шторка возвращается
        scope.launch {
            withFrameNanos { }
            withFrameNanos { }
            if (currentVisible) settleBack()
        }
    }

    fun settle(velocity: Float) {
        val fling = velocity / density.density > YeetGesture.swipeVelocity
        if (currentClosable && offset > 0f && (offset > sheetHeight * YeetGesture.swipeDistance || fling)) {
            requestClose()
        } else {
            passedThreshold = false
            if (offset != 0f) settleBack()
        }
    }

    // Тело шторки прокручивается само; жест шторки получает только остаток: палец вниз, когда тело уже в начале
    val bodyConnection = remember {
        object : NestedScrollConnection {
            override fun onPreScroll(available: Offset, source: NestedScrollSource): Offset {
                // шторка уже оттянута — палец вверх сначала возвращает её, потом прокручивает тело
                if (source != NestedScrollSource.Drag || offset <= 0f || available.y >= 0f) return Offset.Zero
                val d = max(available.y, -offset)
                dragBy(d)
                return Offset(0f, d)
            }

            override fun onPostScroll(consumed: Offset, available: Offset, source: NestedScrollSource): Offset {
                if (source != NestedScrollSource.Drag || !currentClosable || available.y <= 0f) return Offset.Zero
                dragBy(available.y)
                return Offset(0f, available.y)
            }

            override suspend fun onPreFling(available: Velocity): Velocity {
                if (offset == 0f) return Velocity.Zero
                settle(available.y)
                return available
            }
        }
    }
    val dragState = rememberDraggableState { delta -> dragBy(delta) }

    WindowDialog(
        onDismissRequest = {
            // «Назад»: диалог — onCancel; закрываемый слой — закрыть; alertdialog без onCancel — ничего
            val back = controller.back
            if (back != null) back() else if (closable) requestClose()
        },
        properties = DialogProperties(dismissOnBackPress = true, dismissOnClickOutside = false, usePlatformDefaultWidth = false, decorFitsSystemWindows = false),
    ) {
        // Затемнение рисует окно диалога (dimAmount = альфа bgOverlay: 40 % / 60 %) — оно покрывает и системные панели
        val window = (LocalView.current.parent as? DialogWindowProvider)?.window
        val dragDim = if (sheetHeight > 0f) 1f - (offset.coerceAtLeast(0f) / sheetHeight).coerceIn(0f, 1f) else 1f
        SideEffect { window?.setDimAmount(overlayAlpha * enter.value.coerceIn(0f, 1f) * dragDim) }

        // Снизу: над клавиатурой — 8 от неё, иначе max(8, навигационная панель)
        val gap = with(density) { OverlayInset.roundToPx() }
        val navBottom = WindowInsets.navigationBars.getBottom(density)
        val imeBottom = WindowInsets.ime.getBottom(density)
        val bottomPx = if (imeBottom > navBottom) imeBottom + gap else max(gap, navBottom)
        val topPx = WindowInsets.statusBars.getTop(density) + with(density) { SheetTopGap.roundToPx() }
        SideEffect { bottomGap = bottomPx.toFloat() }

        Box(
            modifier
                .fillMaxSize()
                .pointerInput(Unit) { detectTapGestures { if (currentClosable) requestClose() } },
            contentAlignment = Alignment.BottomCenter,
        ) {
            Box(
                Modifier
                    .windowInsetsPadding(WindowInsets.navigationBars.union(WindowInsets.displayCutout).only(WindowInsetsSides.Horizontal))
                    .padding(
                        start = OverlayInset,
                        end = OverlayInset,
                        top = with(density) { topPx.toDp() },
                        bottom = with(density) { bottomPx.toDp() },
                    )
                    .widthIn(max = 600.dp)
                    .fillMaxWidth()
                    .onSizeChanged { sheetHeight = it.height.toFloat() }
                    .graphicsLayer {
                        alpha = if (sheetHeight > 0f) 1f else 0f
                        translationY = offset + (1f - enter.value) * (sheetHeight + bottomGap)
                    }
                    // тап по шторке не закрывает слой (и не делает шторку «кнопкой» для TalkBack)
                    .pointerInput(Unit) { detectTapGestures { } }
                    .semantics {
                        if (closable) dismiss(label = "Закрыть") { requestClose(); true }
                    }
                    .nestedScroll(bodyConnection)
                    .draggable(
                        state = dragState,
                        orientation = Orientation.Vertical,
                        enabled = closable,
                        onDragStarted = { settleJob?.cancel() },
                        onDragStopped = { velocity -> settle(velocity) },
                    ),
            ) {
                CompositionLocalProvider(LocalOverlay provides controller) { content() }
            }
        }
    }
}

@YeetPreviews
@Composable
private fun OverlaysPreview() = YeetPreviewSurface {
    Sheet(title = "Сезон", footer = FooterAction("Сбросить") to FooterAction("Применить")) {
        Text("Контент шторки", tone = TextTone.Secondary)
    }
    Sheet(title = "Валюта", description = "Цены вещей пересчитаются по курсу на сегодня") {
        Text("Список валют", tone = TextTone.Secondary)
    }
    Sheet(title = "Фильтры", onClose = {}, footer = FooterAction("Сбросить все фильтры") to FooterAction("Показать 128 вещей")) {
        Text("Высокая шторка: крестик вместо хэндла, длинные подписи кнопок — столбцом", tone = TextTone.Secondary)
    }
    Sheet(label = "Фото профиля") {
        Text("Без заголовка: контент на 16 под хэндлом", tone = TextTone.Secondary)
    }
}

@YeetPreviews
@Composable
private fun DialogsPreview() = YeetPreviewSurface {
    Dialog(title = "Очистить корзину?", description = "Все вещи из корзины удаляются навсегда, их уже не вернуть", cancel = "Отмена", confirm = "Очистить", tone = DialogTone.Destructive)
    Dialog(title = "Удалить аккаунт?", cancel = "Отменить", confirm = "Удалить", tone = DialogTone.Danger) {
        StatRow {
            StatTile("Вещей", "128")
            StatTile("Образов", "36")
        }
    }
    Dialog(title = "Готово!", description = "Образ сохранён в календарь", cancel = null, confirm = "Ок!")
}

@YeetPreviews
@Composable
private fun PanelPreview() = YeetPreviewSurface {
    Sheet(title = "Панель деталей", type = SheetType.Panel) {
        Text("Постоянная панель экрана — во всю ширину, с тенью", tone = TextTone.Secondary)
    }
}
