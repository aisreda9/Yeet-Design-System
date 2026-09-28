package design.yeet.ds.molecules

import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.Layout
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.constrainHeight
import androidx.compose.ui.unit.constrainWidth
import androidx.compose.ui.unit.dp

/**
 * Колонка строк с разделителем между ними (web: `.y-field + .y-field::before`, `.y-list-item + .y-list-item::before`):
 * линия 1 dp с отступами `inset` слева и справа, поверх верхнего края каждой строки, кроме первой.
 */
@Composable
internal fun DividedColumn(
    modifier: Modifier,
    dividerColor: Color,
    inset: Dp = 16.dp,
    content: @Composable () -> Unit,
) {
    val lines = remember { mutableStateOf(IntArray(0)) }
    Layout(
        content = content,
        modifier = modifier.drawWithContent {
            drawContent()
            val x = inset.toPx()
            val h = 1.dp.toPx()
            for (y in lines.value) drawRect(dividerColor, topLeft = Offset(x, y.toFloat()), size = Size(size.width - 2 * x, h))
        },
    ) { measurables, constraints ->
        val placeables = measurables.map { it.measure(constraints.copy(minHeight = 0, maxHeight = Constraints.Infinity)) }
        val width = constraints.constrainWidth(placeables.maxOfOrNull { it.width } ?: 0)
        val height = constraints.constrainHeight(placeables.sumOf { it.height })
        layout(width, height) {
            val ys = IntArray((placeables.size - 1).coerceAtLeast(0))
            var y = 0
            placeables.forEachIndexed { i, p ->
                if (i > 0) ys[i - 1] = y
                p.place(0, y)
                y += p.height
            }
            if (!ys.contentEquals(lines.value)) lines.value = ys
        }
    }
}
