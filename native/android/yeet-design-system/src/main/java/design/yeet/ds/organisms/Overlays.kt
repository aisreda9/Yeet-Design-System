package design.yeet.ds.organisms

import androidx.compose.animation.core.Animatable
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.draggable
import androidx.compose.foundation.gestures.rememberDraggableState
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.semantics.paneTitle
import androidx.compose.ui.semantics.semantics
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
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews
import design.yeet.ds.theme.YeetTheme
import design.yeet.ds.theme.yeetFloatingShadow
import design.yeet.tokens.YeetComponent
import design.yeet.tokens.YeetGesture
import design.yeet.tokens.YeetHapticEvent
import design.yeet.tokens.sheetBg
import kotlinx.coroutines.launch
import androidx.compose.ui.window.Dialog as WindowDialog

/* ─── Sheet & Dialog ────────────────────────────────────────────────── */

/** Действие в футере sheet / dialog: пара кнопок L 50/50 через 7. */
data class FooterAction(val label: String, val variant: ButtonStyle? = null, val onClick: (() -> Unit)? = null)

/**
 * Figma sheet · Type.
 * `Modal` — плавающая карточка поверх overlay: отступ 8 от краёв экрана, радиус 32 сверху и 48 снизу (концентрично углу экрана).
 * `Panel` — постоянная панель деталей во всю ширину, 32 сверху, с тенью.
 */
enum class SheetType { Modal, Panel }

/** Форма плавающего sheet / dialog: 32 сверху, 48 снизу. */
val SheetModalShape: Shape
    get() = RoundedCornerShape(
        topStart = YeetComponent.sheetRadius, topEnd = YeetComponent.sheetRadius,
        bottomEnd = YeetComponent.sheetRadiusBottom, bottomStart = YeetComponent.sheetRadiusBottom,
    )

@Composable
private fun SheetFooter(actions: Pair<FooterAction, FooterAction>) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
        listOf(actions.first, actions.second).forEachIndexed { i, a ->
            Button(
                a.label,
                onClick = { a.onClick?.invoke() },
                modifier = Modifier.weight(1f),
                variant = a.variant ?: if (i == 0) ButtonStyle.Tertiary else ButtonStyle.Primary,
                size = ControlSize.L,
                fullWidth = true,
            )
        }
    }
}

@Composable
private fun SheetHandle() {
    Box(
        Modifier
            .size(width = 48.dp, height = 4.dp)
            .background(YeetTheme.colors.bgSubtle, RoundedCornerShape(YeetTheme.radius.xs)),
    )
}

/**
 * Bottom sheet — основа всех выборов, действий и фильтров. Всё временное открывается sheet'ом, а не новым экраном.
 * Modal: хэндл → 16 → заголовок H3 → 12 → контент → 16 → пара кнопок L через 7. Фон — `sheetBg` (elevated).
 * Контент: `ListItem` (действия, радио, категории), `ChipGroup` (фильтры), `InputBar` (поиск), `AccountCard` (аккаунты).
 * Показывается поверх экрана через [Overlay] (затемнение, выезд, свайп вниз — закрыть).
 *
 * @param footer пара кнопок (secondary-action, primary-action); стиль по умолчанию — Tertiary + Primary.
 * @param onClose крестик справа от заголовка вместо хэндла: высокая шторка со своим скроллом (Outfit Creation / Item Filter).
 */
@Composable
fun Sheet(
    modifier: Modifier = Modifier,
    title: String? = null,
    type: SheetType = SheetType.Modal,
    footer: Pair<FooterAction, FooterAction>? = null,
    onClose: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit = {},
) {
    val c = YeetTheme.colors
    val modal = type == SheetType.Modal
    val shape = if (modal) SheetModalShape else RoundedCornerShape(topStart = YeetComponent.sheetRadius, topEnd = YeetComponent.sheetRadius)
    val headingVariant = if (modal) TextVariant.H3 else TextVariant.H2
    Column(
        modifier
            .fillMaxWidth()
            .then(if (modal) Modifier else Modifier.yeetFloatingShadow(shape))
            .background(c.sheetBg, shape)
            .semantics { if (modal && title != null) paneTitle = title }
            .padding(start = 20.dp, end = 20.dp, top = 8.dp, bottom = 20.dp),
    ) {
        if (onClose == null) {
            Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { SheetHandle() }
            if (title != null) {
                Spacer(Modifier.height(if (modal) 16.dp else 20.dp))
                Text(title, variant = headingVariant)
            }
        } else {
            // без хэндла заголовок на 20 от верха
            Spacer(Modifier.height(12.dp))
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                if (title != null) Text(title, variant = headingVariant, modifier = Modifier.weight(1f)) else Spacer(Modifier.weight(1f))
                IconButton(IconName.Cross, label = "Закрыть", onClick = onClose, variant = ButtonStyle.Ghost, size = ControlSize.S, modifier = Modifier.offset(x = 8.dp))
            }
        }
        Spacer(Modifier.height(if (title != null || onClose != null) (if (modal) 12.dp else 16.dp) else 16.dp))
        content()
        if (footer != null) {
            Spacer(Modifier.height(if (modal) 16.dp else 20.dp))
            SheetFooter(footer)
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
 * Подтверждение в той же плавающей форме, что и sheet Modal. **Безопасное действие всегда синее справа.**
 * Показывается через [Overlay]. `content` — плитки статистики, текст с выделением (удаление аккаунта).
 */
@Composable
fun Dialog(
    title: String,
    cancel: String,
    confirm: String,
    modifier: Modifier = Modifier,
    tone: DialogTone = DialogTone.Default,
    description: String? = null,
    onCancel: (() -> Unit)? = null,
    onConfirm: (() -> Unit)? = null,
    content: (@Composable ColumnScope.() -> Unit)? = null,
) {
    val risky = tone != DialogTone.Default
    val footer = if (risky) {
        FooterAction(confirm, if (tone == DialogTone.Danger) ButtonStyle.Destructive else ButtonStyle.Tertiary, onConfirm) to
            FooterAction(cancel, ButtonStyle.Primary, onCancel)
    } else {
        FooterAction(cancel, ButtonStyle.Tertiary, onCancel) to FooterAction(confirm, ButtonStyle.Primary, onConfirm)
    }
    Column(
        modifier
            .fillMaxWidth()
            .background(YeetTheme.colors.sheetBg, SheetModalShape)
            .semantics { paneTitle = title }
            .padding(start = 20.dp, end = 20.dp, top = 8.dp, bottom = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { SheetHandle() }
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(title, variant = TextVariant.H3)
            if (description != null) Text(description, tone = TextTone.Secondary)
        }
        if (content != null) Column(content = content)
        SheetFooter(footer)
    }
}

/* ─── Overlay ───────────────────────────────────────────────────────── */

/**
 * Модальный слой (web: Overlay): затемнение `bgOverlay`, плавающая шторка у нижнего края с отступом 8
 * (слева, справа, снизу), выезд на пружине `nav` (quick), уход быстрее (`exit`).
 * Закрытие: тап по затемнению, «Назад», свайп шторки вниз дальше 30 % высоты или броском быстрее 500 dp/с
 * (хаптика `threshold` в момент пересечения порога).
 * Рисуется в отдельном окне (Dialog), поэтому перекрывает весь экран, включая нижнюю навигацию.
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

    var inWindow by remember { mutableStateOf(visible) }
    val enter = remember { Animatable(0f) }
    val drag = remember { Animatable(0f) }
    var sheetHeight by remember { mutableFloatStateOf(0f) }
    var passedThreshold by remember { mutableStateOf(false) }

    LaunchedEffect(visible) {
        if (visible) {
            inWindow = true
            drag.snapTo(0f)
            enter.animateTo(1f, motion.nav())
        } else if (inWindow) {
            enter.animateTo(0f, motion.exit())
            inWindow = false
        }
    }
    if (!inWindow) return

    val inset = with(density) { 8.dp.toPx() }
    val threshold = sheetHeight * YeetGesture.swipeDistance
    val dragState = rememberDraggableState { delta ->
        scope.launch {
            // вверх — с сопротивлением (rubber band), вниз — за пальцем
            val next = drag.value + if (drag.value + delta < 0f) delta * (1f - YeetGesture.rubberBand) else delta
            drag.snapTo(next)
            val over = next > threshold && threshold > 0f
            if (over != passedThreshold) {
                passedThreshold = over
                if (over) haptics.perform(YeetHapticEvent.Threshold)
            }
        }
    }

    WindowDialog(
        onDismissRequest = { if (dismissible) currentOnClose() },
        properties = DialogProperties(dismissOnBackPress = dismissible, dismissOnClickOutside = false, usePlatformDefaultWidth = false, decorFitsSystemWindows = false),
    ) {
        // Затемнение рисует окно диалога (dimAmount = альфа bgOverlay: 40 % / 60 %) — оно покрывает и системные панели
        val window = (LocalView.current.parent as? DialogWindowProvider)?.window
        SideEffect { window?.setDimAmount(overlayAlpha * enter.value.coerceIn(0f, 1f)) }
        Box(
            modifier
                .fillMaxSize()
                .clickable(interactionSource = remember { MutableInteractionSource() }, indication = null, enabled = dismissible) { currentOnClose() },
            contentAlignment = Alignment.BottomCenter,
        ) {
            Box(
                Modifier
                    .statusBarsPadding()
                    .navigationBarsPadding()
                    .padding(start = 8.dp, end = 8.dp, bottom = 8.dp)
                    .widthIn(max = 600.dp)
                    .fillMaxWidth()
                    .onSizeChanged { sheetHeight = it.height.toFloat() }
                    .graphicsLayer { translationY = drag.value + (1f - enter.value) * (sheetHeight + inset) }
                    // тап по шторке не закрывает overlay
                    .clickable(interactionSource = remember { MutableInteractionSource() }, indication = null) { }
                    .draggable(
                        state = dragState,
                        orientation = Orientation.Vertical,
                        enabled = dismissible,
                        onDragStopped = { velocity ->
                            val fling = with(density) { velocity.toDp().value } > YeetGesture.swipeVelocity
                            if (dismissible && (drag.value > threshold || fling)) {
                                currentOnClose()
                            } else {
                                drag.animateTo(0f, motion.`return`())
                            }
                            passedThreshold = false
                        },
                    ),
            ) { content() }
        }
    }
}

@YeetPreviews
@Composable
private fun OverlaysPreview() = YeetPreviewSurface {
    Sheet(title = "Сезон", footer = FooterAction("Сбросить") to FooterAction("Применить")) {
        Text("Контент шторки", tone = TextTone.Secondary)
    }
    Sheet(title = "Фильтры", onClose = {}) {
        Text("Высокая шторка со своим скроллом", tone = TextTone.Secondary)
    }
    Dialog(title = "Очистить корзину?", description = "Все вещи из корзины удаляются навсегда, их уже не вернуть", cancel = "Отмена", confirm = "Очистить", tone = DialogTone.Destructive)
    Dialog(title = "Удалить аккаунт?", cancel = "Отменить", confirm = "Удалить", tone = DialogTone.Danger)
}
