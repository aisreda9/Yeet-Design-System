package design.yeet.ds.theme

import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.drawOutline
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.layout.layout
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * Тень shadow/floating (y 8, blur 40, 12 % / 50 %) — как box-shadow в CSS и эффект-стиль в Figma.
 * Рисуется через setShadowLayer: с API 28 — на всех операциях с аппаратным ускорением;
 * на API 26–27 тень не рисуется (компонент остаётся без тени, раскладка не меняется).
 */
fun Modifier.yeetFloatingShadow(shape: Shape): Modifier = composed {
    floatingShadow(LocalYeetShadow.current, shape)
}

/** Тень с явным стилем (для превью и нестандартных поверхностей). */
fun Modifier.floatingShadow(style: YeetShadowStyle, shape: Shape): Modifier = drawBehind {
    val outline = shape.createOutline(size, layoutDirection, this)
    // CSS blur radius = 2σ; Android setShadowLayer(radius): σ = radius · 0.57735 + 0.5
    val sigma = style.blur.toPx() / 2f
    val radius = ((sigma - 0.5f) / 0.57735f).coerceAtLeast(0f)
    val paint = Paint()
    paint.asFrameworkPaint().apply {
        isAntiAlias = true
        color = android.graphics.Color.TRANSPARENT
        setShadowLayer(radius, style.offsetX.toPx(), style.offsetY.toPx(), style.color.toArgb())
    }
    drawIntoCanvas { it.drawOutline(outline, paint) }
}

/** Сторона полосы затухания (ScrollEdge). */
enum class ScrollEdgePosition { Top, Bottom }

/**
 * Полоса затухания за пределами элемента: контент скроллится под закреплённую шапку / нижнюю навигацию
 * и плавно гаснет (web: ScrollEdge, альфа-маска над bg-canvas — работает в обеих темах).
 * `Top` — полоса под элементом (шапка), `Bottom` — над элементом (нижняя навигация).
 * Элемент должен рисоваться поверх контента (стоять после него в Box).
 */
fun Modifier.scrollEdgeFade(position: ScrollEdgePosition, size: Dp, color: Color): Modifier = drawWithContent {
    val h = size.toPx()
    if (position == ScrollEdgePosition.Top) {
        drawRect(Brush.verticalGradient(listOf(color, color.copy(alpha = 0f)), startY = this.size.height, endY = this.size.height + h), topLeft = Offset(0f, this.size.height), size = Size(this.size.width, h))
    } else {
        drawRect(Brush.verticalGradient(listOf(color.copy(alpha = 0f), color), startY = -h, endY = 0f), topLeft = Offset(0f, -h), size = Size(this.size.width, h))
    }
    drawContent()
}

/**
 * Выход за поля экрана (web: margin 0 calc(-1 * gutter)) — лента чипсов / карусель видна до края,
 * чтобы было понятно, что её можно листать.
 */
fun Modifier.bleed(horizontal: Dp): Modifier = layout { measurable, constraints ->
    val extra = horizontal.roundToPx() * 2
    if (!constraints.hasBoundedWidth || extra == 0) {
        val p = measurable.measure(constraints)
        return@layout layout(p.width, p.height) { p.place(0, 0) }
    }
    val p = measurable.measure(constraints.copy(minWidth = constraints.maxWidth + extra, maxWidth = constraints.maxWidth + extra))
    layout(constraints.maxWidth, p.height) { p.place(-extra / 2, 0) }
}

internal val HairlineWidth = 1.dp
