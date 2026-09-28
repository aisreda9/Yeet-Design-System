package design.yeet.ds.molecules

import androidx.compose.animation.core.Animatable
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.onPlaced
import androidx.compose.ui.layout.positionInParent
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.toSize
import design.yeet.ds.theme.YeetTheme
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.launch

/**
 * Пилюля выбранного пункта, которая переезжает между пунктами (сегмент, таб-бар) — web: useSlidingPill.
 * Пункты сообщают свои границы через [slidingPillItem], контейнер рисует пилюлю через [slidingPill].
 * Первый замер — без анимации, дальше переход `nav` (пружина quick); при «уменьшить движение» — мгновенно.
 */
@Stable
internal class SlidingPillState {
    val bounds = mutableStateMapOf<Int, Rect>()
    val x = Animatable(0f)
    val y = Animatable(0f)
    val width = Animatable(0f)
    val height = Animatable(0f)
    var ready by mutableStateOf(false)
}

@Composable
internal fun rememberSlidingPill(index: Int): SlidingPillState {
    val state = remember { SlidingPillState() }
    val motion = YeetTheme.motion
    val target = state.bounds[index]
    LaunchedEffect(target) {
        if (target == null) {
            state.ready = false
            return@LaunchedEffect
        }
        if (!state.ready) {
            state.x.snapTo(target.left)
            state.y.snapTo(target.top)
            state.width.snapTo(target.width)
            state.height.snapTo(target.height)
            state.ready = true
        } else {
            coroutineScope {
                launch { state.x.animateTo(target.left, motion.nav()) }
                launch { state.y.animateTo(target.top, motion.nav()) }
                launch { state.width.animateTo(target.width, motion.nav()) }
                launch { state.height.animateTo(target.height, motion.nav()) }
            }
        }
    }
    return state
}

/** Первым в цепочке модификаторов пункта: границы пункта в координатах контейнера. */
internal fun Modifier.slidingPillItem(state: SlidingPillState, index: Int): Modifier = onPlaced { coords ->
    val rect = Rect(coords.positionInParent(), coords.size.toSize())
    if (state.bounds[index] != rect) state.bounds[index] = rect
}

/** На контейнере (том же, в котором лежат пункты): пилюля под выбранным пунктом. */
internal fun Modifier.slidingPill(state: SlidingPillState, color: Color, radius: Dp): Modifier = drawBehind {
    if (!state.ready) return@drawBehind
    val r = radius.toPx()
    drawRoundRect(
        color = color,
        topLeft = Offset(state.x.value, state.y.value),
        size = Size(state.width.value.coerceAtLeast(0f), state.height.value.coerceAtLeast(0f)),
        cornerRadius = CornerRadius(r, r),
    )
}
