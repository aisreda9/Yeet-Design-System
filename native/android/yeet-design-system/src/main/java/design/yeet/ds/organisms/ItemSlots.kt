package design.yeet.ds.organisms

import androidx.compose.animation.core.FiniteAnimationSpec
import androidx.compose.animation.core.animate
import androidx.compose.animation.core.calculateTargetValue
import androidx.compose.animation.rememberSplineBasedDecay
import androidx.compose.foundation.background
import androidx.compose.foundation.focusable
import androidx.compose.foundation.gestures.FlingBehavior
import androidx.compose.foundation.gestures.ScrollScope
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.CustomAccessibilityAction
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.customActions
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import design.yeet.ds.atoms.ControlSize
import design.yeet.ds.atoms.IconButton
import design.yeet.ds.atoms.Text
import design.yeet.ds.atoms.TextVariant
import design.yeet.ds.icons.IconName
import design.yeet.ds.molecules.DividedColumn
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews
import design.yeet.ds.theme.YeetTheme
import design.yeet.ds.theme.bleed
import design.yeet.ds.theme.yeetFloatingShadow
import design.yeet.tokens.YeetGesture
import design.yeet.tokens.YeetHapticEvent
import design.yeet.tokens.YeetItemColor
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.floor
import kotlin.math.roundToInt

/* ─── ItemSlots ─────────────────────────────────────────────────────── */

/** Карточка вещи в ряду выбора — 173 × 172, как в сетке гардероба (Figma `1371:41906`). */
private val SlotCard = 173.dp

/** Кнопка «+» в карточке «+»: в 21 от края, рядом с последней вещью (web: `.y-item-slot__add`). */
private val SlotAddInset = 21.dp

/**
 * Выбор вещей в образ (Outfit Creation / Item Selection `1371:41906`, пустой `1371:41989`): панель с секциями
 * «Верх / Низ / Обувь», между секциями — разделитель во всю ширину. Фон `bgElevated`, радиус 32 сверху, тень floating —
 * как у панели шторки. React: `<ItemSlots><ItemSlot …/></ItemSlots>`.
 */
@Composable
fun ItemSlots(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    val c = YeetTheme.colors
    val shape = RoundedCornerShape(topStart = YeetTheme.radius.xl, topEnd = YeetTheme.radius.xl)
    DividedColumn(
        modifier = modifier
            .fillMaxWidth()
            .yeetFloatingShadow(shape)
            .background(c.bgElevated, shape),
        dividerColor = c.divider,
        inset = 0.dp,
        content = content,
    )
}

/**
 * Секция выбора: заголовок H2 и горизонтальный ряд со снапом по центру. Выбранная карточка 173 — по центру экрана,
 * соседние обрезаны краем, в конце — карточка «+» (кнопка L 52). Ряд выходит на поля экрана.
 * Без вещей — только «+» по центру (`414:1491`).
 *
 * - Свайп листает со снапом по центру карточки (бросок — по инерции, но не меньше одной вещи, если быстрее
 *   `YeetGesture.swipeVelocity`); выбор — по карточке в центре после остановки, хаптика `Select`.
 * - Клавиатура: ← / →; TalkBack: «Верх: 2 из 5» + действия «Предыдущая / Следующая вещь».
 * - Смена `index` снаружи прокручивает ряд на `page`; при «Уменьшить движение» — сразу.
 *
 * @param itemCount сколько вещей в ряду.
 * @param index какая вещь выбрана — стоит по центру ряда.
 * @param onIndexChange ряд пролистали — по центру другая вещь.
 * @param onAdd карточка «+» в конце ряда; без обработчика карточки нет.
 * @param addLabel подпись «+» для TalkBack. По умолчанию «Добавить: <title>».
 * @param item карточка вещи `k` — обычно `ItemCard(…, onRemove = …)`; ширина задаётся рядом (173).
 */
@Composable
fun ItemSlot(
    title: String,
    itemCount: Int,
    modifier: Modifier = Modifier,
    index: Int = 0,
    onIndexChange: ((Int) -> Unit)? = null,
    onAdd: (() -> Unit)? = null,
    addLabel: String? = null,
    item: @Composable (index: Int) -> Unit,
) {
    val space = YeetTheme.space
    val motion = YeetTheme.motion
    val haptics = YeetTheme.haptics
    val density = LocalDensity.current
    val gap = space.s8
    val stepPx = with(density) { (SlotCard + gap).toPx() }
    val selected = if (itemCount == 0) 0 else index.coerceIn(0, itemCount - 1)

    val scroll = rememberScrollState(initial = (selected * stepPx).roundToInt())
    val spec: FiniteAnimationSpec<Float> = motion.page()
    val decay = rememberSplineBasedDecay<Float>()

    // Последняя вещь, о которой ряд уже сообщил (или которую выставили снаружи): без лишних onIndexChange
    var reported by remember { mutableIntStateOf(selected) }
    val latestCount by rememberUpdatedState(itemCount)
    val latestSpec by rememberUpdatedState(spec)
    val latestOnChange by rememberUpdatedState(onIndexChange)

    val settle: (Int) -> Unit = { k ->
        if (k != reported) {
            reported = k
            haptics.perform(YeetHapticEvent.Select)
            latestOnChange?.invoke(k)
        }
    }
    val latestSettle by rememberUpdatedState(settle)

    val fling = remember(scroll, stepPx, decay) {
        object : FlingBehavior {
            override suspend fun ScrollScope.performFling(initialVelocity: Float): Float {
                val count = latestCount
                if (count < 1 || stepPx <= 0f) return 0f
                val from = scroll.value.toFloat()
                val here = from / stepPx
                val projected = decay.calculateTargetValue(from, initialVelocity) / stepPx
                val velocityDp = initialVelocity / density.density
                var target = projected.roundToInt()
                // быстрый бросок листает хотя бы на одну вещь
                if (velocityDp > YeetGesture.swipeVelocity) target = maxOf(target, floor(here).toInt() + 1)
                if (velocityDp < -YeetGesture.swipeVelocity) target = minOf(target, ceil(here).toInt() - 1)
                target = target.coerceIn(0, count - 1)
                var last = from
                animate(from, target * stepPx, initialVelocity, latestSpec) { value, _ ->
                    scrollBy(value - last)
                    last = value
                }
                latestSettle(target)
                return 0f
            }
        }
    }

    // index снаружи → ряд доезжает до вещи
    LaunchedEffect(selected, itemCount, stepPx) {
        if (itemCount == 0) return@LaunchedEffect
        reported = selected
        val target = (selected * stepPx).roundToInt()
        if (abs(scroll.value - target) > 1) scroll.animateScrollTo(target, spec)
    }

    val go: (Int) -> Unit = { k ->
        if (k in 0 until itemCount && k != selected) {
            reported = k
            haptics.perform(YeetHapticEvent.Select)
            onIndexChange?.invoke(k)
        }
    }

    Column(
        modifier
            .fillMaxWidth()
            .padding(start = space.screenGutter, end = space.screenGutter, top = space.s20, bottom = space.s20),
        verticalArrangement = Arrangement.spacedBy(space.s16),
    ) {
        Text(title, variant = TextVariant.H2)
        BoxWithConstraints(Modifier.fillMaxWidth().bleed(space.screenGutter)) {
            // поля ряда: первая и последняя карточка встают по центру (web: 50 % + gutter − 173 / 2)
            val pad = ((maxWidth - SlotCard) / 2).coerceAtLeast(0.dp)
            val many = itemCount > 1
            Row(
                Modifier
                    .fillMaxWidth()
                    .then(
                        if (many) {
                            Modifier.semantics {
                                contentDescription = "$title: ${selected + 1} из $itemCount"
                                customActions = buildList {
                                    if (selected > 0) add(CustomAccessibilityAction("Предыдущая вещь") { go(selected - 1); true })
                                    if (selected < itemCount - 1) add(CustomAccessibilityAction("Следующая вещь") { go(selected + 1); true })
                                }
                            }
                        } else {
                            Modifier
                        },
                    )
                    .onKeyEvent { e ->
                        if (!many || e.type != KeyEventType.KeyDown) return@onKeyEvent false
                        when (e.key) {
                            Key.DirectionLeft -> go(selected - 1)
                            Key.DirectionRight -> go(selected + 1)
                            else -> return@onKeyEvent false
                        }
                        true
                    }
                    .focusable(many)
                    .horizontalScroll(scroll, enabled = many || onAdd != null, flingBehavior = fling)
                    .padding(horizontal = pad),
                horizontalArrangement = Arrangement.spacedBy(gap),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                repeat(itemCount) { k -> Box(Modifier.width(SlotCard)) { item(k) } }
                if (onAdd != null) {
                    val empty = itemCount == 0
                    Box(
                        Modifier
                            .width(SlotCard)
                            .aspectRatio(173f / 172f)
                            .padding(start = if (empty) 0.dp else SlotAddInset),
                        contentAlignment = if (empty) Alignment.Center else Alignment.CenterStart,
                    ) {
                        IconButton(IconName.Plus, label = addLabel ?: "Добавить: ${title.lowercase()}", onClick = onAdd, size = ControlSize.L)
                    }
                }
            }
        }
    }
}

@YeetPreviews
@Composable
private fun ItemSlotsPreview() = YeetPreviewSurface {
    val tops = listOf(Garment.Top to YeetItemColor.WHITE, Garment.Top to YeetItemColor.BLUE, Garment.Outerwear to YeetItemColor.BEIGE)
    var top by remember { mutableIntStateOf(1) }
    ItemSlots {
        ItemSlot("Верх", itemCount = tops.size, index = top, onIndexChange = { top = it }, onAdd = {}) { k ->
            ItemCard(tops[k].first, color = tops[k].second, onRemove = {})
        }
        ItemSlot("Обувь", itemCount = 0, onAdd = {}) { }
    }
}
