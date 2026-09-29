package design.yeet.ds.atoms

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material3.LocalContentColor
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.paint
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.vector.rememberVectorPainter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import design.yeet.ds.icons.DefaultIconStrokeWidth
import design.yeet.ds.icons.IconName
import design.yeet.ds.icons.YeetBrandPaths
import design.yeet.ds.icons.YeetLogoVector
import design.yeet.ds.icons.imageVector
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews
import design.yeet.ds.theme.YeetTheme

/**
 * Линейная иконка 24×24 из набора ui-icons. Цвет наследуется (`LocalContentColor`, web: currentColor).
 *
 * React: `<Icon name size title strokeWidth />`.
 * @param title описание для TalkBack; без него иконка декоративная и не озвучивается.
 * @param strokeWidth толщина обводки в сетке 24 (по умолчанию 1.3, как в Figma).
 */
@Composable
fun Icon(
    name: IconName,
    modifier: Modifier = Modifier,
    size: Dp = 24.dp,
    title: String? = null,
    strokeWidth: Float = DefaultIconStrokeWidth,
    tint: Color = LocalContentColor.current,
) {
    val vector = remember(name, strokeWidth) { name.imageVector(strokeWidth) }
    val painter = rememberVectorPainter(vector)
    val semantics = if (title != null) Modifier.semantics { contentDescription = title; role = Role.Image } else Modifier
    Box(
        modifier
            .size(size)
            .then(semantics)
            .paint(painter, contentScale = ContentScale.Fit, colorFilter = if (tint == Color.Unspecified) null else ColorFilter.tint(tint)),
    )
}

/**
 * Словесный знак yeet. Цвет наследуется: на акцентном фоне (Splash) — `textOnAccent`,
 * в подвале настроек — `textSecondary`.
 */
@Composable
fun Logo(
    modifier: Modifier = Modifier,
    height: Dp = 32.dp,
    tint: Color = LocalContentColor.current,
) {
    val painter = rememberVectorPainter(YeetLogoVector)
    Box(
        modifier
            .height(height)
            .aspectRatio(YeetBrandPaths.logoViewportWidth / YeetBrandPaths.logoViewportHeight)
            .semantics { contentDescription = "yeet"; role = Role.Image }
            .paint(painter, contentScale = ContentScale.Fit, colorFilter = ColorFilter.tint(tint)),
    )
}

@OptIn(ExperimentalLayoutApi::class)
@YeetPreviews
@Composable
private fun IconPreview() = YeetPreviewSurface {
    FlowRow(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        IconName.entries.forEach { Icon(it) }
    }
    Logo(tint = YeetTheme.colors.accent)
}
