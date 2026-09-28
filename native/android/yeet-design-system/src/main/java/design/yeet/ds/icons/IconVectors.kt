package design.yeet.ds.icons

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.addPathNodes
import androidx.compose.ui.unit.dp

/** Толщина обводки ui-icons в Figma: 1.3 в сетке 24. */
const val DefaultIconStrokeWidth = 1.3f

private val cache = HashMap<Long, ImageVector>()

/**
 * ImageVector иконки (24×24, чёрная обводка — красится через tint / ColorFilter).
 * `strokeWidth` — в единицах сетки 24, как strokeWidth у SVG (для крупных иллюстраций вещей — тоньше).
 * Векторы кешируются.
 */
fun IconName.imageVector(strokeWidth: Float = DefaultIconStrokeWidth): ImageVector {
    val key = (ordinal.toLong() shl 32) or strokeWidth.toRawBits().toLong().and(0xFFFFFFFFL)
    synchronized(cache) {
        return cache.getOrPut(key) { buildIcon(this, strokeWidth) }
    }
}

private fun buildIcon(name: IconName, strokeWidth: Float): ImageVector {
    val builder = ImageVector.Builder(
        name = name.key,
        defaultWidth = 24.dp,
        defaultHeight = 24.dp,
        viewportWidth = 24f,
        viewportHeight = 24f,
    )
    for (p in iconPaths(name)) {
        val grouped = p.translateX != 0f || p.translateY != 0f
        if (grouped) builder.addGroup(translationX = p.translateX, translationY = p.translateY)
        builder.addPath(
            pathData = addPathNodes(p.d),
            fill = if (p.filled) SolidColor(Color.Black) else null,
            stroke = if (p.stroked) SolidColor(Color.Black) else null,
            strokeLineWidth = strokeWidth,
            strokeLineCap = p.cap,
            strokeLineJoin = p.join,
            strokeLineMiter = 4f,
        )
        if (grouped) builder.clearGroup()
    }
    return builder.build()
}

/** Сплошная фигура одного пути (словесный знак, звезда штампа). */
internal fun filledVector(name: String, paths: List<String>, width: Float, height: Float, translateX: Float = 0f, translateY: Float = 0f): ImageVector {
    val builder = ImageVector.Builder(name = name, defaultWidth = width.dp, defaultHeight = height.dp, viewportWidth = width, viewportHeight = height)
    builder.addGroup(translationX = translateX, translationY = translateY)
    for (d in paths) builder.addPath(pathData = addPathNodes(d), fill = SolidColor(Color.Black))
    builder.clearGroup()
    return builder.build()
}

/** Словесный знак yeet (src/icons/brand.ts). */
val YeetLogoVector: ImageVector by lazy {
    filledVector(
        name = "yeet",
        paths = YeetBrandPaths.logo,
        width = YeetBrandPaths.logoViewportWidth,
        height = YeetBrandPaths.logoViewportHeight,
        translateX = -YeetBrandPaths.logoViewportX,
        translateY = -YeetBrandPaths.logoViewportY,
    )
}

/** 12-лучевая звезда штампа (shapes / main-action). */
val YeetStampStarVector: ImageVector by lazy {
    filledVector(name = "stamp", paths = listOf(YeetBrandPaths.stampStar), width = YeetBrandPaths.stampViewport, height = YeetBrandPaths.stampViewport)
}
