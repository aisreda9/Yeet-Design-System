package design.yeet.ds.organisms

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FiniteAnimationSpec
import androidx.compose.foundation.clickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.CustomAccessibilityAction
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.customActions
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import design.yeet.ds.atoms.Stamp
import design.yeet.ds.atoms.StampTone
import design.yeet.ds.icons.IconName
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews
import design.yeet.ds.theme.YeetTheme
import design.yeet.ds.theme.bleed
import design.yeet.tokens.YeetComponent
import design.yeet.tokens.YeetGesture
import design.yeet.tokens.YeetHapticEvent
import design.yeet.tokens.YeetItemColor
import design.yeet.tokens.YeetLayer
import design.yeet.tokens.YeetLayout
import kotlin.math.abs
import kotlin.math.floor
import kotlin.math.hypot
import kotlin.math.sign
import kotlinx.coroutines.launch

/* ─── OutfitPager ───────────────────────────────────────────────────── */

/**
 * Образ в пейджере.
 * @param id стабильный ключ: по нему превью «переезжает» в коллаж, а не перерисовывается.
 * @param label повод-бейдж на коллаже («Прогулка»).
 * @param name имя для TalkBack: «Образ 2 из 5» + это имя.
 */
@Immutable
data class PagerLook(
    val id: String,
    val items: List<CollageItem>,
    val label: String? = null,
    val name: String? = null,
)

/**
 * Ось пейджера.
 * `Y` — стопка образов (главная `232:1355`, «Удиви меня» `798:1741`): превью соседей сверху и снизу.
 * `X` — лента («С чем носить» `463:1534`): соседние страницы за краем экрана.
 */
enum class PagerAxis { X, Y }

/** Коллаж 353 = экран 393 минус поля 20 (Figma). На узком экране — по ширине контейнера. */
private val PagerPage = YeetLayout.screenWidth - YeetLayout.screenGutter * 2

/** Стопка, Figma Animations «scale» `354:17678`: куда уходят образы за превью (сдвиг от превью, масштаб × 0.75, прозрачность 0). */
private val StackAboveShift = 44.dp
private val StackBelowShift = 107.dp
private const val StackFarScale = 0.75f

/** Слоты поверх коллажа 353 (Figma `232:1355`, `463:1534`): погода над левым верхним углом, штамп и «Не нравится» у низа. */
private val WeatherTop = (-43).dp
private val StampTop = 280.dp
private val SkipTop = 321.dp

/**
 * Пейджер образов: стопка (`Y`) или лента (`X`). React: `<OutfitPager looks axis preview index onIndexChange weather stamp skip>`.
 *
 * Жест (web: `useSwipePager`):
 * - начинается после touch slop и закрепляется за доминирующей осью; жест поперёк оси отдаётся родителю
 *   (вертикальный скролл под лентой не ломается);
 * - дальше 30 % страницы (`YeetGesture.swipeDistance`) или бросок быстрее 500 dp/с (`YeetGesture.swipeVelocity`) —
 *   соседний образ. Скорость — по последним 80 мс с точкой отпускания: протянул, подержал палец > 80 мс и отпустил —
 *   это не бросок;
 * - на первом и последнем образе — резинка (`YeetGesture.rubberBand`), перелистнуть нельзя;
 * - хаптика `Threshold` — один раз при пересечении порога; при смене — `Skip` (стопка) или `Select` (лента).
 *
 * Доводка — пружиной `swap` (стопка: превью ↔ коллаж) или `page` (лента); при «Уменьшить движение» — мгновенно,
 * палец по-прежнему ведёт 1 : 1. Тап по превью соседа — к нему.
 *
 * Доступность: пейджер — один узел TalkBack «Образы, Образ 2 из 5: …» с действиями «Предыдущий / Следующий образ»
 * (меню действий TalkBack), смена объявляется `liveRegion`. Скрытые образы не озвучиваются.
 * Клавиатура: стрелки по оси, Home / End.
 *
 * @param index текущий образ (состояние поднято наверх, как у `HorizontalPager`).
 * @param onIndexChange смена образа: жест, тап по превью, клавиатура, действие TalkBack.
 * @param preview размер превью соседей в стопке: 96 — главная, 150 — «Удиви меня».
 * @param enabled `false` выключает жест и действия (например, пока открыта шторка).
 * @param weather слот над левым верхним углом коллажа: `WeatherCard(tilt = true)`.
 * @param stamp слот у правого нижнего угла: `Stamp` «Надеть» / «Сохранить».
 * @param skip слот у левого нижнего угла: `Stamp(tone = Secondary)` «Не нравится» (лента «С чем носить»).
 */
@Composable
fun OutfitPager(
    looks: List<PagerLook>,
    index: Int,
    onIndexChange: (Int) -> Unit,
    modifier: Modifier = Modifier,
    axis: PagerAxis = PagerAxis.Y,
    preview: Dp = 96.dp,
    enabled: Boolean = true,
    label: String = "Образы",
    weather: (@Composable () -> Unit)? = null,
    stamp: (@Composable () -> Unit)? = null,
    skip: (@Composable () -> Unit)? = null,
) {
    val count = looks.size
    val current = if (count == 0) 0 else index.coerceIn(0, count - 1)
    val motion = YeetTheme.motion
    val haptics = YeetTheme.haptics
    val space = YeetTheme.space
    val cardRadius = YeetComponent.cardRadius
    val density = LocalDensity.current
    val scope = rememberCoroutineScope()
    val stack = axis == PagerAxis.Y
    val spec: FiniteAnimationSpec<Float> = if (stack) motion.swap() else motion.page()

    // position — «непрерывный» индекс (доводка между образами), drag — сдвиг за пальцем, px
    val position = remember { Animatable(current.toFloat()) }
    val drag = remember { Animatable(0f) }
    LaunchedEffect(current) { position.animateTo(current.toFloat(), spec) }

    val latestIndex by rememberUpdatedState(current)
    val latestCount by rememberUpdatedState(count)
    val latestOnChange by rememberUpdatedState(onIndexChange)
    val latestSpec by rememberUpdatedState(spec)
    val go: (Int) -> Unit = { to -> if (to in 0 until latestCount && to != latestIndex) latestOnChange(to) }

    val currentName = looks.getOrNull(current)?.name
    val state = if (count == 0) "" else "Образ ${current + 1} из $count" + (currentName?.let { ": $it" } ?: "")
    val prevLabel = "Предыдущий образ"
    val nextLabel = "Следующий образ"
    val prevKey = if (stack) Key.DirectionUp else Key.DirectionLeft
    val nextKey = if (stack) Key.DirectionDown else Key.DirectionRight

    BoxWithConstraints(modifier.fillMaxWidth(), contentAlignment = Alignment.TopCenter) {
        val page = if (maxWidth < PagerPage) maxWidth else PagerPage
        val gap = space.s20
        val top = if (stack) preview + gap else 0.dp
        val height = if (stack) page + top * 2 else page
        val pagePx = with(density) { page.toPx() }
        val latestPagePx by rememberUpdatedState(pagePx)

        Box(
            Modifier
                .width(page)
                .height(height)
                .semantics {
                    contentDescription = label
                    stateDescription = state
                    liveRegion = LiveRegionMode.Polite
                    if (enabled) {
                        customActions = buildList {
                            if (current > 0) add(CustomAccessibilityAction(prevLabel) { go(current - 1); true })
                            if (current < count - 1) add(CustomAccessibilityAction(nextLabel) { go(current + 1); true })
                        }
                    }
                }
                .onKeyEvent { e ->
                    if (!enabled || e.type != KeyEventType.KeyDown) return@onKeyEvent false
                    val to = when (e.key) {
                        prevKey -> current - 1
                        nextKey -> current + 1
                        Key.MoveHome -> 0
                        Key.MoveEnd -> count - 1
                        else -> return@onKeyEvent false
                    }
                    go(to)
                    true
                }
                .focusable(enabled && count > 1),
        ) {
            // Слой образов с жестом. Лента выходит на поля экрана и обрезается по ним (web: viewport −gutter, overflow hidden).
            Box(
                Modifier
                    .matchParentSize()
                    .then(if (stack) Modifier else Modifier.bleed(gap).clipToBounds())
                    .pointerInput(enabled, stack) {
                        if (!enabled) return@pointerInput
                        // Не позже системного slop: иначе родительский скролл заберёт жест раньше нас
                        val slop = minOf(YeetGesture.touchSlop.toPx(), viewConfiguration.touchSlop)
                        awaitEachGesture {
                            val down = awaitFirstDown(requireUnconsumed = false)
                            val tracker = FlickTracker()
                            tracker.add(down.uptimeMillis, down.position)
                            val start = down.position
                            var locked = false
                            var crossed = false
                            var finished = false
                            try {
                                while (true) {
                                    val event = awaitPointerEvent()
                                    val change = event.changes.firstOrNull { it.id == down.id } ?: break
                                    val dx = change.position.x - start.x
                                    val dy = change.position.y - start.y
                                    val d = if (stack) dy else dx
                                    if (!change.pressed) {
                                        if (!locked) break
                                        change.consume()
                                        // точка отпускания: палец мог стоять перед подъёмом — тогда скорость 0
                                        tracker.add(change.uptimeMillis, change.position)
                                        val v = tracker.velocity(change.uptimeMillis)
                                        val along = if (stack) v.y else v.x // px/мс
                                        val velocityDp = along * 1000f / 1.dp.toPx()
                                        val flick = abs(velocityDp) > YeetGesture.swipeVelocity && sign(velocityDp) == sign(d)
                                        if (abs(d) > latestPagePx * YeetGesture.swipeDistance || flick) {
                                            val target = latestIndex + if (d < 0f) 1 else -1
                                            if (target in 0 until latestCount) {
                                                haptics.perform(if (stack) YeetHapticEvent.Skip else YeetHapticEvent.Select)
                                                go(target)
                                            }
                                        }
                                        finished = true
                                        scope.launch { drag.animateTo(0f, latestSpec) }
                                        break
                                    }
                                    tracker.add(change.uptimeMillis, change.position)
                                    if (!locked) {
                                        if (hypot(dx, dy) < slop) continue
                                        val ours = if (stack) abs(dy) > abs(dx) else abs(dx) > abs(dy)
                                        if (!ours) break // жест поперёк — не наш, отдаём родителю
                                        locked = true
                                    }
                                    change.consume()
                                    val i = latestIndex
                                    val edge = (d > 0f && i == 0) || (d < 0f && i == latestCount - 1)
                                    val over = !edge && abs(d) > latestPagePx * YeetGesture.swipeDistance
                                    if (over && !crossed) haptics.perform(YeetHapticEvent.Threshold) // один раз на пороге
                                    crossed = over
                                    val next = if (edge) rubberBand(d, latestPagePx) else d
                                    scope.launch { drag.snapTo(next) }
                                }
                            } finally {
                                if (locked && !finished) scope.launch { drag.animateTo(0f, latestSpec) }
                            }
                        }
                    },
            ) {
                val pageModifier = Modifier.width(page)
                val window = (current - 3).coerceAtLeast(0)..(current + 3).coerceAtMost(count - 1)
                for (k in window) {
                    val look = looks[k]
                    key(look.id) {
                        val isCurrent = k == current
                        val neighbour = abs(k - current) == 1
                        val tap = if (neighbour && enabled) {
                            Modifier.clickable(interactionSource = remember { MutableInteractionSource() }, indication = null) {
                                haptics.perform(YeetHapticEvent.Select)
                                go(k)
                            }
                        } else {
                            Modifier
                        }
                        Box(
                            pageModifier
                                .zIndex(if (isCurrent) YeetLayer.raised else YeetLayer.base)
                                .graphicsLayer {
                                    val r = k - position.value
                                    if (stack) {
                                        val scale = preview.toPx() / pagePx
                                        val slot = stackSlot(r, top.toPx(), pagePx, gap.toPx(), StackAboveShift.toPx(), StackBelowShift.toPx(), scale)
                                        transformOrigin = TransformOrigin(0.5f, 0f)
                                        translationY = top.toPx() + slot.y + drag.value
                                        scaleX = slot.scale
                                        scaleY = slot.scale
                                        alpha = slot.alpha
                                        // у превью радиус 20, как у миниатюры: до масштаба — 20 / scale
                                        val t = abs(r).coerceAtMost(1f)
                                        val radius = cardRadius.toPx()
                                        shape = RoundedCornerShape(mix(radius, radius / scale, t))
                                        clip = true
                                    } else {
                                        translationX = gap.toPx() + r * (pagePx + gap.toPx()) + drag.value
                                    }
                                }
                                .then(tap)
                                .clearAndSetSemantics { },
                        ) {
                            // бейдж повода на превью не читается — только у текущего
                            OutfitCollage(look.items, label = if (isCurrent) look.label else null)
                        }
                    }
                }
            }

            // Слоты поверх текущего коллажа; жест под ними не начинается (соседние узлы в Compose не делят касание)
            if (weather != null || stamp != null || skip != null) {
                Box(Modifier.offset(y = top).size(page).zIndex(YeetLayer.float)) {
                    if (weather != null) Box(Modifier.offset(x = gap, y = WeatherTop)) { weather() }
                    if (skip != null) Box(Modifier.offset(x = gap, y = SkipTop)) { skip() }
                    if (stamp != null) Box(Modifier.align(Alignment.TopEnd).offset(x = -gap, y = StampTop)) { stamp() }
                }
            }
        }
    }
}

/** Положение образа в стопке: сдвиг от верха коллажа, масштаб, прозрачность. */
private class StackSlot(val y: Float, val scale: Float, val alpha: Float)

/**
 * Геометрия стопки (web: `.is-prev / .is-next / .is-above / .is-below`) для «непрерывного» `r = k − position`:
 * между целыми слотами — линейно, поэтому доводка пружиной ведёт все образы одновременно.
 */
private fun stackSlot(r: Float, top: Float, page: Float, gap: Float, above: Float, below: Float, scale: Float): StackSlot {
    fun at(i: Int): StackSlot = when {
        i <= -2 -> StackSlot(-top - above, scale * StackFarScale, 0f)
        i == -1 -> StackSlot(-top, scale, 1f)
        i == 0 -> StackSlot(0f, 1f, 1f)
        i == 1 -> StackSlot(page + gap, scale, 1f)
        else -> StackSlot(page + below, scale * StackFarScale, 0f)
    }
    val clamped = r.coerceIn(-2f, 2f)
    val lo = floor(clamped).toInt()
    val f = clamped - lo
    val a = at(lo)
    if (f == 0f) return a
    val b = at(lo + 1)
    return StackSlot(mix(a.y, b.y, f), mix(a.scale, b.scale, f), mix(a.alpha, b.alpha, f))
}

private fun mix(a: Float, b: Float, t: Float): Float = a + (b - a) * t

/**
 * Резинка за границей (как UIScrollView, web: `rubberBand`): чем дальше тянешь, тем меньше отдаёт.
 * `offset` — сколько палец прошёл за границу, `size` — размер объекта по оси. Результат всегда < size.
 */
internal fun rubberBand(offset: Float, size: Float, c: Float = YeetGesture.rubberBand): Float {
    if (size <= 0f) return 0f
    val x = abs(offset)
    return sign(offset) * (1f - 1f / (x * c / size + 1f)) * size
}

/**
 * Скорость пальца по последним 80 мс, px/мс (web: `velocityTracker`). Средняя по всему жесту врёт: палец мог долго стоять,
 * а потом резко бросить. И наоборот: протянул, подержал и отпустил — броска нет. Поэтому при отпускании точку подъёма
 * добавляют (`add` перед `velocity`), а `velocity(now)` отдаёт 0, если с последней точки прошло больше окна.
 */
internal class FlickTracker {
    private class Sample(val t: Long, val x: Float, val y: Float)

    private val samples = ArrayList<Sample>()

    fun add(timeMillis: Long, position: Offset) {
        samples.add(Sample(timeMillis, position.x, position.y))
        while (samples.size > 2 && timeMillis - samples[0].t > VelocityWindowMillis) samples.removeAt(0)
    }

    fun velocity(nowMillis: Long): Offset {
        if (samples.size < 2) return Offset.Zero
        val a = samples[0]
        val b = samples[samples.size - 1]
        if (nowMillis - b.t > VelocityWindowMillis) return Offset.Zero // палец стоял — это не бросок
        val dt = (b.t - a.t).coerceAtLeast(1L).toFloat()
        return Offset((b.x - a.x) / dt, (b.y - a.y) / dt)
    }

    private companion object {
        // TODO(tokens, #93): окна скорости броска нет в tokens.motion.gesture (web: VELOCITY_WINDOW в utils/gesture.ts)
        const val VelocityWindowMillis = 80L
    }
}

private val previewLooks = listOf(
    PagerLook(
        "walk",
        listOf(
            CollageItem(Garment.Outerwear, 30f, 30f, 140.dp),
            CollageItem(Garment.Top, 70f, 28f, 110.dp, YeetItemColor.WHITE),
            CollageItem(Garment.Bottom, 35f, 72f, 120.dp, YeetItemColor.BLUE),
            CollageItem(Garment.Shoe, 72f, 75f, 90.dp),
        ),
        label = "Прогулка",
        name = "Прогулка",
    ),
    PagerLook(
        "office",
        listOf(
            CollageItem(Garment.Top, 32f, 30f, 130.dp, YeetItemColor.BEIGE),
            CollageItem(Garment.Bottom, 66f, 45f, 130.dp, YeetItemColor.BLACK),
            CollageItem(Garment.Shoe, 30f, 76f, 90.dp),
        ),
        label = "Работа",
        name = "Работа",
    ),
    PagerLook(
        "dinner",
        listOf(
            CollageItem(Garment.Outerwear, 35f, 35f, 150.dp, YeetItemColor.BROWN),
            CollageItem(Garment.Container, 72f, 70f, 90.dp),
        ),
        label = "Ужин",
        name = "Ужин",
    ),
)

@YeetPreviews
@Composable
private fun OutfitPagerPreview() = YeetPreviewSurface {
    var stackIndex by remember { mutableIntStateOf(1) }
    OutfitPager(
        looks = previewLooks,
        index = stackIndex,
        onIndexChange = { stackIndex = it },
        weather = { WeatherCard(temperature = "+18°", description = "Солнечно", tilt = true) },
        stamp = { Stamp("Надеть", onClick = {}) },
    )
    var stripIndex by remember { mutableIntStateOf(0) }
    OutfitPager(
        looks = previewLooks,
        index = stripIndex,
        onIndexChange = { stripIndex = it },
        axis = PagerAxis.X,
        skip = { Stamp("Не нравится", onClick = {}, tone = StampTone.Secondary, icon = IconName.ThumbDown) },
    )
}
