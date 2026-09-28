package design.yeet.ds.molecules

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.Layout
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import design.yeet.ds.atoms.Text
import design.yeet.ds.atoms.TextTone
import design.yeet.ds.atoms.TextVariant
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews
import design.yeet.ds.theme.YeetTheme
import design.yeet.tokens.cardBg

/* ─── StatTile ──────────────────────────────────────────────────────── */

/** Плитка статистики: `label` Caption grey + `value` H2. Ставится в [StatRow] по 3. */
@Composable
fun StatTile(label: String, value: String, modifier: Modifier = Modifier) {
    Column(
        modifier
            .background(YeetTheme.colors.cardBg, RoundedCornerShape(YeetTheme.radius.lg))
            .padding(horizontal = 20.dp, vertical = 16.dp)
            .semantics(mergeDescendants = true) { },
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Text(label, variant = TextVariant.Caption, tone = TextTone.Secondary)
        Text(value, variant = TextVariant.H2, tone = TextTone.Primary, heading = false)
    }
}

/**
 * Ряд плиток: делит ширину поровну (web: flex 1) через `gap`, все плитки — одной высоты (по самой высокой).
 */
@Composable
fun StatRow(modifier: Modifier = Modifier, gap: Dp = 8.dp, content: @Composable () -> Unit) {
    Layout(content, modifier.fillMaxWidth()) { measurables, constraints ->
        val n = measurables.size
        if (n == 0) return@Layout layout(0, 0) {}
        val gapPx = gap.roundToPx()
        val cell = ((constraints.maxWidth - gapPx * (n - 1)) / n).coerceAtLeast(0)
        val height = measurables.maxOf { it.maxIntrinsicHeight(cell) }
        val placeables = measurables.map { it.measure(Constraints.fixed(cell, height)) }
        layout(constraints.maxWidth, height) {
            placeables.forEachIndexed { i, p -> p.place(i * (cell + gapPx), 0) }
        }
    }
}

@YeetPreviews
@Composable
private fun DataPreview() = YeetPreviewSurface {
    StatRow {
        StatTile("Вещей", "128")
        StatTile("Образов", "36")
        StatTile("Надето", "74%")
    }
}
