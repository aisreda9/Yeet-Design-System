package design.yeet.ds.organisms

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.focusable
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.RoundRect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathFillType
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.isShiftPressed
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.CustomAccessibilityAction
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.customActions
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import design.yeet.ds.molecules.Hint
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews
import design.yeet.ds.theme.YeetTheme
import design.yeet.tokens.YeetBorderWidth
import design.yeet.tokens.YeetHapticEvent
import design.yeet.tokens.YeetItemColor
import design.yeet.tokens.YeetLayer
import design.yeet.tokens.YeetSize
import design.yeet.tokens.cardBg
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/* ─── CropFrame ─────────────────────────────────────────────────────── */

/** Рамка в долях контейнера 0…1: левый верхний угол, ширина, высота. */
@Immutable
data class CropRect(val x: Float, val y: Float, val w: Float, val h: Float) {
    companion object {
        /** Рамка из флоу Search / Photo / Crop `1371:38089`: 353 × 226 в 20 от краёв экрана 393 × 852, верх на 315. */
        val Default = CropRect(20f / 393f, 315f / 852f, 353f / 393f, 226f / 852f)
    }
}

/** Уголок: видимая часть 32, зона захвата 44 выходит за рамку на 10 (web: `.y-crop__corner`). */
private val CornerLength = 32.dp
private val CornerZone = 44.dp
private val CornerOutside = 10.dp

/** Шаг клавиатуры: стрелки — 4, с Shift — 20; `+` / `−` — масштаб × 1.05. */
private val KeyStep = 4.dp
private val KeyStepLarge = 20.dp
private const val KeyScale = 1.05f

// TODO(tokens, #93): нет цвета волосяной рамки кропа при перетаскивании (web: rgb(255 255 255 / 0.4)) — textOnPhoto × 0.4
private const val ActiveRingAlpha = 0.4f

private enum class CropMode { Move, NW, NE, SW, SE }

/**
 * Рамка обрезки фото (Search / Photo / Crop `1371:38089`). React: `<CropFrame src value onChange hint min>`.
 * Снаружи рамки — затемнение `bgOverlay`, по углам — белые уголки 2 dp (радиус 20). Рамку двигают пальцем, углы тянут
 * (противоположный угол стоит на месте), двумя пальцами масштабируют вокруг центра; рамка не выходит за фото
 * и не меньше `min`. Начало жеста — хаптика `Threshold`. Геометрия в долях контейнера — рамка остаётся на месте
 * при любой ширине экрана.
 *
 * Клавиатура: стрелки двигают (Shift — шаг крупнее), `+` / `−` масштабируют. TalkBack: «Рамка: 90 × 27 % фото» и
 * действия «Сдвинуть …», «Увеличить / Уменьшить рамку».
 *
 * @param value рамка (состояние поднято наверх).
 * @param photo фото под рамкой (`ContentScale.Crop`). Вместо него можно передать `content`.
 * @param hint подсказка `Hint` внизу (в 20 над кнопкой L); `null` — без подсказки.
 * @param min минимальная сторона рамки.
 */
@Composable
fun CropFrame(
    value: CropRect,
    onValueChange: (CropRect) -> Unit,
    modifier: Modifier = Modifier,
    photo: Painter? = null,
    alt: String? = null,
    hint: String? = "Перемещай и масштабируй рамку",
    min: Dp = 64.dp,
    content: @Composable BoxScope.() -> Unit = {},
) {
    val c = YeetTheme.colors
    val space = YeetTheme.space
    val haptics = YeetTheme.haptics
    val motion = YeetTheme.motion
    val density = LocalDensity.current
    val radius = YeetTheme.radius.lg
    val latestValue by rememberUpdatedState(value)
    val latestOnChange by rememberUpdatedState(onValueChange)
    val minPx by rememberUpdatedState(with(density) { min.toPx() })
    var box by remember { mutableStateOf(IntSize.Zero) }
    var active by remember { mutableStateOf(false) }
    val ring by animateFloatAsState(if (active) 1f else 0f, motion.fade(), label = "cropActive")

    val set: (CropRect) -> Unit = { r ->
        val w = box.width.toFloat()
        val h = box.height.toFloat()
        if (w > 0f && h > 0f) latestOnChange(r.fit(w, h, minPx))
    }
    val move: (Dp, Dp) -> Unit = { dx, dy ->
        val w = box.width.toFloat()
        val h = box.height.toFloat()
        if (w > 0f && h > 0f) {
            val v = latestValue
            set(v.copy(x = v.x + with(density) { dx.toPx() } / w, y = v.y + with(density) { dy.toPx() } / h))
        }
    }
    val pct: (Float) -> Int = { (it * 100f).roundToInt() }

    Box(
        modifier
            .clipToBounds()
            .onSizeChanged { box = it }
            .semantics {
                contentDescription = "Рамка: ${pct(value.w)} × ${pct(value.h)} % фото"
                customActions = listOf(
                    CustomAccessibilityAction("Сдвинуть влево") { move(-KeyStepLarge, 0.dp); true },
                    CustomAccessibilityAction("Сдвинуть вправо") { move(KeyStepLarge, 0.dp); true },
                    CustomAccessibilityAction("Сдвинуть вверх") { move(0.dp, -KeyStepLarge); true },
                    CustomAccessibilityAction("Сдвинуть вниз") { move(0.dp, KeyStepLarge); true },
                    CustomAccessibilityAction("Увеличить рамку") { set(latestValue.scaled(KeyScale)); true },
                    CustomAccessibilityAction("Уменьшить рамку") { set(latestValue.scaled(1f / KeyScale)); true },
                )
            }
            .onKeyEvent { e ->
                if (e.type != KeyEventType.KeyDown) return@onKeyEvent false
                val step = if (e.isShiftPressed) KeyStepLarge else KeyStep
                when (e.key) {
                    Key.DirectionLeft -> move(-step, 0.dp)
                    Key.DirectionRight -> move(step, 0.dp)
                    Key.DirectionUp -> move(0.dp, -step)
                    Key.DirectionDown -> move(0.dp, step)
                    Key.Plus, Key.Equals, Key.NumPadAdd -> set(value.scaled(KeyScale))
                    Key.Minus, Key.NumPadSubtract -> set(value.scaled(1f / KeyScale))
                    else -> return@onKeyEvent false
                }
                true
            }
            .focusable()
            .pointerInput(Unit) {
                awaitEachGesture {
                    val down = awaitFirstDown(requireUnconsumed = false)
                    val w = size.width.toFloat()
                    val h = size.height.toFloat()
                    if (w <= 0f || h <= 0f) return@awaitEachGesture
                    val start = latestValue
                    val mode = start.hit(down.position, w, h, CornerZone.toPx(), CornerOutside.toPx()) ?: return@awaitEachGesture
                    down.consume()
                    haptics.perform(YeetHapticEvent.Threshold)
                    active = true
                    var pinchStart: CropRect? = null
                    var pinchDistance = 1f
                    var dragging = true
                    try {
                        while (true) {
                            val event = awaitPointerEvent()
                            val pressed = event.changes.filter { it.pressed }
                            if (pressed.isEmpty()) break
                            if (pressed.size >= 2) {
                                // второй палец может лечь и мимо рамки — щипок ловит весь контейнер
                                val distance = (pressed[0].position - pressed[1].position).getDistance()
                                val ps = pinchStart
                                if (ps == null) {
                                    pinchStart = latestValue
                                    pinchDistance = max(distance, 1f)
                                    dragging = false
                                } else {
                                    set(ps.scaled(distance / pinchDistance))
                                }
                            } else if (dragging) {
                                val change = pressed.firstOrNull { it.id == down.id }
                                if (change != null) {
                                    val dx = (change.position.x - down.position.x) / w
                                    val dy = (change.position.y - down.position.y) / h
                                    set(
                                        if (mode == CropMode.Move) {
                                            start.copy(x = start.x + dx, y = start.y + dy)
                                        } else {
                                            start.resized(mode, dx, dy, minPx / w, minPx / h)
                                        },
                                    )
                                }
                            }
                            event.changes.forEach { it.consume() }
                        }
                    } finally {
                        active = false
                    }
                }
            },
    ) {
        if (photo != null) {
            Image(photo, contentDescription = alt, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
        }
        content()
        // затемнение вокруг рамки, волосяная рамка при жесте и уголки
        Box(
            Modifier
                .fillMaxSize()
                .drawBehind {
                    val l = value.x * size.width
                    val t = value.y * size.height
                    val r = (value.x + value.w) * size.width
                    val b = (value.y + value.h) * size.height
                    val rad = radius.toPx()
                    val dim = Path().apply {
                        fillType = PathFillType.EvenOdd
                        addRect(Rect(Offset.Zero, size))
                        addRoundRect(RoundRect(rect = Rect(l, t, r, b), cornerRadius = CornerRadius(rad)))
                    }
                    drawPath(dim, c.bgOverlay)
                    if (ring > 0f) {
                        val thin = YeetBorderWidth.thin.toPx()
                        drawRoundRect(
                            color = c.textOnPhoto.copy(alpha = ActiveRingAlpha * ring),
                            topLeft = Offset(l + thin / 2f, t + thin / 2f),
                            size = Size(r - l - thin, b - t - thin),
                            cornerRadius = CornerRadius(rad - thin / 2f),
                            style = Stroke(width = thin),
                        )
                    }
                    val stroke = YeetBorderWidth.thick.toPx()
                    drawPath(cornersPath(l, t, r, b, rad, CornerLength.toPx(), stroke / 2f), c.textOnPhoto, style = Stroke(width = stroke))
                },
        )
        if (hint != null) {
            // в 20 над кнопкой L внизу экрана: 20 + 52 + 20
            Hint(hint, Modifier.align(Alignment.BottomCenter).padding(bottom = space.s20 + YeetSize.controlL + space.s20).zIndex(YeetLayer.float))
        }
    }
}

/** Что под пальцем: угол (зона 44, выходит за рамку на 10), сама рамка или ничего. */
private fun CropRect.hit(p: Offset, w: Float, h: Float, zone: Float, outside: Float): CropMode? {
    val l = x * w
    val t = y * h
    val r = (x + this.w) * w
    val b = (y + this.h) * h
    fun inZone(cx: Float, cy: Float, left: Boolean, top: Boolean): Boolean {
        val zl = if (left) cx - outside else cx - zone + outside
        val zt = if (top) cy - outside else cy - zone + outside
        return p.x >= zl && p.x <= zl + zone && p.y >= zt && p.y <= zt + zone
    }
    return when {
        inZone(l, t, left = true, top = true) -> CropMode.NW
        inZone(r, t, left = false, top = true) -> CropMode.NE
        inZone(l, b, left = true, top = false) -> CropMode.SW
        inZone(r, b, left = false, top = false) -> CropMode.SE
        p.x >= l && p.x <= r && p.y >= t && p.y <= b -> CropMode.Move
        else -> null
    }
}

private fun clamp(v: Float, lo: Float, hi: Float): Float = min(max(v, lo), hi)

/** Рамка в пределах фото и не меньше `min` (web: `fit`). */
private fun CropRect.fit(w: Float, h: Float, minPx: Float): CropRect {
    val mw = min(minPx / w, 1f)
    val mh = min(minPx / h, 1f)
    val nw = clamp(this.w, mw, 1f)
    val nh = clamp(this.h, mh, 1f)
    return CropRect(clamp(x, 0f, 1f - nw), clamp(y, 0f, 1f - nh), nw, nh)
}

/** Масштаб вокруг центра рамки. */
private fun CropRect.scaled(k: Float): CropRect {
    val cx = x + w / 2f
    val cy = y + h / 2f
    val nw = w * k
    val nh = h * k
    return CropRect(cx - nw / 2f, cy - nh / 2f, nw, nh)
}

/** Угол тянется, противоположный стоит на месте (web: `move` для nw / ne / sw / se). */
private fun CropRect.resized(mode: CropMode, dx: Float, dy: Float, mw: Float, mh: Float): CropRect {
    val left = mode == CropMode.NW || mode == CropMode.SW
    val top = mode == CropMode.NW || mode == CropMode.NE
    val right = x + w
    val bottom = y + h
    val nx = if (left) clamp(x + dx, 0f, right - mw) else x
    val ny = if (top) clamp(y + dy, 0f, bottom - mh) else y
    val nw = if (left) right - nx else clamp(w + dx, mw, 1f - x)
    val nh = if (top) bottom - ny else clamp(h + dy, mh, 1f - y)
    return CropRect(nx, ny, nw, nh)
}

/** Четыре уголка длиной `len` со скруглением `rad`; `inset` — половина толщины, чтобы линия лежала внутри рамки. */
private fun cornersPath(l: Float, t: Float, r: Float, b: Float, rad: Float, len: Float, inset: Float): Path {
    val s = inset
    val d = 2f * max(rad - s, 0f)
    return Path().apply {
        moveTo(l + s, t + len)
        lineTo(l + s, t + rad)
        arcTo(Rect(l + s, t + s, l + s + d, t + s + d), 180f, 90f, false)
        lineTo(l + len, t + s)

        moveTo(r - len, t + s)
        lineTo(r - rad, t + s)
        arcTo(Rect(r - s - d, t + s, r - s, t + s + d), 270f, 90f, false)
        lineTo(r - s, t + len)

        moveTo(r - s, b - len)
        lineTo(r - s, b - rad)
        arcTo(Rect(r - s - d, b - s - d, r - s, b - s), 0f, 90f, false)
        lineTo(r - len, b - s)

        moveTo(l + len, b - s)
        lineTo(l + rad, b - s)
        arcTo(Rect(l + s, b - s - d, l + s + d, b - s), 90f, 90f, false)
        lineTo(l + s, b - len)
    }
}

@YeetPreviews
@Composable
private fun CropFramePreview() = YeetPreviewSurface {
    var rect by remember { mutableStateOf(CropRect(0.1f, 0.2f, 0.8f, 0.5f)) }
    val c = YeetTheme.colors
    CropFrame(rect, onValueChange = { rect = it }, modifier = Modifier.fillMaxWidth().height(360.dp)) {
        Box(Modifier.fillMaxSize().background(c.cardBg).collagePattern(c.patternDot), contentAlignment = Alignment.Center) {
            ItemArt(Garment.Outerwear, color = YeetItemColor.BEIGE, size = 200.dp)
        }
    }
}
