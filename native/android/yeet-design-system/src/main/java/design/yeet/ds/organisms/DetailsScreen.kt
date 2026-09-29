package design.yeet.ds.organisms

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.State
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.PointerEventPass
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.layout
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import design.yeet.ds.atoms.Stamp
import design.yeet.ds.atoms.Text
import design.yeet.ds.atoms.TextTone
import design.yeet.ds.icons.IconName
import design.yeet.ds.molecules.ListGroup
import design.yeet.ds.molecules.ListItem
import design.yeet.ds.theme.YeetPreviews
import design.yeet.ds.theme.YeetTheme
import design.yeet.tokens.YeetItemColor
import design.yeet.tokens.YeetLayer
import design.yeet.tokens.YeetSize
import design.yeet.tokens.buttonTertiaryBg
import kotlin.math.roundToInt

/* ─── DetailsScreen ─────────────────────────────────────────────────── */

// TODO(tokens, #93): порогов сворачивания нет в токенах — web: Screen, гистерезис 24 / 8 pt (templates/index.tsx)
/** Фото сворачивается после 24 dp скролла… */
private val CollapseAfter = 24.dp

/** …и разворачивается, только когда скролл вернулся ниже 8 dp: шапка меняется, и без запаса морф дрожал бы на границе. */
private val ExpandBelow = 8.dp

/** Миниатюра в шапке — 48, как на экранах DS 2.0 (`349:10430`, web: `photoCollapse.thumb`). */
private val Thumb = YeetSize.controlM

/** Панель не короче экрана + 120 и уходит под нижнюю панель: свёрнутое состояние держится при малом контенте (web: `.y-details .y-sheet--panel`). */
private val PanelOverscroll = 120.dp

/**
 * Детали вещи и образа (Wardrobe / Item Details `349:9258 → 349:9976`, Outfit Details `349:8637 → 349:10430`,
 * Animations «new things» `354:17405 → 354:17449`). React: `<DetailsScreen media thumb title titleChip actions onBack bottom stamp>`.
 *
 * В покое: шапка `Bar`, под ней фото — квадрат во всю ширину минус поля, под фото — панель деталей (`Sheet` Panel).
 * После 24 dp скролла (обратно — ниже 8 dp, гистерезис как у шапки в вебе):
 * - панель поднимается поверх фото (место фото в потоке схлопывается до 25 = порог + 1, поэтому прокрутка ровно
 *   на порог ставит панель под шапку);
 * - фото сворачивается в миниатюру 48 по центру шапки (сдвиг + масштаб, `motion.collapse`), скругление — 16, как у карточки 48;
 *   обратно фото опускается под панель, только когда долетело;
 * - пилюля `titleChip` уступает место миниатюре; нижняя панель и штамп остаются на месте.
 * При «Уменьшить движение» `motion.collapse` — `snap()`: миниатюра появляется сразу.
 *
 * Свёрнутое фото не нажимается и не озвучивается (в миниатюре кнопок нет).
 *
 * @param media фото вещи, коллаж образа — квадрат во всю ширину под шапкой.
 * @param thumb своя миниатюра 48 в шапке (вещь на подложке, мини-коллаж): проявляется, а фото на подлёте гаснет.
 *   По умолчанию миниатюра — само фото, уменьшенное до 48.
 * @param title заголовок панели (H2).
 * @param titleChip пилюля по центру шапки в покое («Новая вещь»).
 * @param actions кнопки справа в шапке, по умолчанию — «Ещё».
 * @param bottom закреплённый низ: `BottomBar`. Панель уходит под него, контент получает отступ по его высоте.
 * @param stamp штамп «Надеть»: закреплён справа внизу поверх контента и не едет со скроллом (`349:8637`).
 * @param scrollState скролл панели: по нему считается сворачивание (как `scrollTop` в вебе).
 * @param systemBarsPadding отступы под статус-бар (шапка) и навигацию (штамп); `false` — экран внутри другого контейнера.
 */
@Composable
fun DetailsScreen(
    media: @Composable () -> Unit,
    modifier: Modifier = Modifier,
    thumb: (@Composable () -> Unit)? = null,
    title: String? = null,
    titleChip: String? = null,
    actions: List<HeaderAction> = listOf(HeaderAction(IconName.More, "Ещё")),
    onBack: (() -> Unit)? = null,
    bottom: (@Composable () -> Unit)? = null,
    stamp: (@Composable () -> Unit)? = null,
    scrollState: ScrollState = rememberScrollState(),
    systemBarsPadding: Boolean = true,
    content: @Composable ColumnScope.() -> Unit,
) {
    val c = YeetTheme.colors
    val space = YeetTheme.space
    val radius = YeetTheme.radius
    val motion = YeetTheme.motion
    val density = LocalDensity.current
    val statusTop = if (systemBarsPadding) WindowInsets.statusBars.asPaddingValues().calculateTopPadding() else 0.dp
    // фото под шапкой: статус-бар + 8 + ряд кнопок 48 + 20 (web: y138 на экране 393 × 852)
    val headerRow = YeetSize.controlM
    val mediaTop = statusTop + space.s8 + headerRow + space.s20

    // Гистерезис 24 / 8 по позиции скролла
    var collapsed by remember { mutableStateOf(false) }
    val collapsePx = with(density) { CollapseAfter.toPx() }
    val expandPx = with(density) { ExpandBelow.toPx() }
    LaunchedEffect(scrollState, collapsePx, expandPx) {
        snapshotFlow { scrollState.value }.collect { y ->
            collapsed = if (collapsed) y > expandPx else y > collapsePx
        }
    }
    val progress = animateFloatAsState(if (collapsed) 1f else 0f, motion.collapse(), label = "detailsCollapse")
    val raised by remember { derivedStateOf { progress.value > 0f } }
    val mediaAlpha = animateFloatAsState(if (collapsed && thumb != null) 0f else 1f, motion.fade(), label = "detailsMediaFade")
    var bottomHeight by remember { mutableIntStateOf(0) }

    BoxWithConstraints(modifier.fillMaxSize().background(c.bgCanvas)) {
        val gutter = space.screenGutter
        val screenHeight = maxHeight
        val photo = (maxWidth - gutter * 2).coerceAtLeast(1.dp)
        val scale = Thumb / photo
        // цель морфа: квадрат 48 по центру ряда кнопок шапки
        val dx = (maxWidth - Thumb) / 2 - gutter
        val dy = -(headerRow + space.s20)
        val thumbRadius = radius.md

        // 1. Фото: под панелью в покое, над шапкой свёрнутым
        Box(
            Modifier
                .zIndex(if (raised) YeetLayer.sticky else YeetLayer.base)
                .padding(start = gutter, top = mediaTop)
                .size(photo)
                .graphicsLayer {
                    val p = progress.value
                    val s = 1f + (scale - 1f) * p
                    transformOrigin = TransformOrigin(0f, 0f)
                    translationX = dx.toPx() * p
                    translationY = dy.toPx() * p
                    scaleX = s
                    scaleY = s
                    alpha = mediaAlpha.value
                    // скругление миниатюры — 16, как у карточки 48, а не уменьшенное скругление фото
                    shape = RoundedCornerShape(thumbRadius.toPx() / scale * p)
                    clip = p > 0f
                }
                .then(if (collapsed) Modifier.clearAndSetSemantics { }.blockPointers() else Modifier),
        ) { media() }

        // 2. Панель деталей в скролле; место фото схлопывается
        Column(
            Modifier
                .zIndex(YeetLayer.raised)
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(top = mediaTop),
        ) {
            CollapsingSpacer(expanded = photo + space.s20, collapsed = CollapseAfter + 1.dp, progress = progress)
            Sheet(
                modifier = if (screenHeight < Dp.Infinity) Modifier.heightIn(min = screenHeight + PanelOverscroll) else Modifier,
                title = title,
                type = SheetType.Panel,
            ) {
                content()
                if (bottom != null) Spacer(Modifier.height(with(density) { bottomHeight.toDp() }))
            }
        }

        // 3. Шапка: пилюля уступает место миниатюре
        Header(
            HeaderType.Bar(
                onBack = onBack,
                actions = actions,
                center = { DetailsHeaderCenter(titleChip, thumb, progress) },
            ),
            modifier = Modifier.zIndex(YeetLayer.bar),
            statusBarPadding = systemBarsPadding,
        )

        // 4. Низ и штамп: закреплены, со скроллом не едут
        if (bottom != null) {
            Box(
                Modifier
                    .align(Alignment.BottomCenter)
                    .zIndex(YeetLayer.bar)
                    .onSizeChanged { bottomHeight = it.height },
            ) { bottom() }
        }
        if (stamp != null) {
            Box(
                Modifier
                    .align(Alignment.BottomEnd)
                    .zIndex(YeetLayer.sticky)
                    .then(if (systemBarsPadding) Modifier.windowInsetsPadding(WindowInsets.navigationBars) else Modifier)
                    .padding(end = gutter, bottom = space.s28),
            ) { stamp() }
        }
    }
}

/** Место фото в потоке: высота идёт за `progress` в фазе раскладки, без рекомпозиции на каждом кадре. */
@Composable
private fun CollapsingSpacer(expanded: Dp, collapsed: Dp, progress: State<Float>) {
    Spacer(
        Modifier
            .fillMaxWidth()
            .layout { measurable, constraints ->
                val from = expanded.toPx()
                val to = collapsed.toPx()
                val h = (from + (to - from) * progress.value).roundToInt().coerceAtLeast(0)
                val placeable = measurable.measure(Constraints.fixed(constraints.maxWidth, h))
                layout(placeable.width, placeable.height) { placeable.place(0, 0) }
            },
    )
}

/** Центр шапки: пилюля `titleChip` гаснет, своя миниатюра проявляется. */
@Composable
private fun DetailsHeaderCenter(titleChip: String?, thumb: (@Composable () -> Unit)?, progress: State<Float>) {
    val c = YeetTheme.colors
    Box(contentAlignment = Alignment.Center) {
        if (titleChip != null) {
            Box(
                Modifier
                    .graphicsLayer { alpha = 1f - progress.value }
                    .heightIn(min = YeetSize.controlM)
                    .background(c.buttonTertiaryBg, RoundedCornerShape(YeetTheme.radius.xl))
                    .padding(horizontal = YeetTheme.space.s20),
                contentAlignment = Alignment.Center,
            ) { Text(titleChip, maxLines = 1, overflow = TextOverflow.Ellipsis, heading = true) }
        }
        if (thumb != null) {
            Box(
                Modifier
                    .size(Thumb)
                    .graphicsLayer { alpha = progress.value }
                    .clip(RoundedCornerShape(YeetTheme.radius.md))
                    .clearAndSetSemantics { },
            ) { thumb() }
        }
    }
}

/** Свёрнутое фото не нажимается (web: `pointer-events: none`): касания гасятся до потомков. */
private fun Modifier.blockPointers(): Modifier = pointerInput(Unit) {
    awaitPointerEventScope {
        while (true) {
            awaitPointerEvent(PointerEventPass.Initial).changes.forEach { it.consume() }
        }
    }
}

@YeetPreviews
@Composable
private fun DetailsScreenPreview() = YeetTheme {
    Box(Modifier.height(720.dp)) {
        DetailsScreen(
            media = {
                OutfitCollage(
                    items = listOf(
                        CollageItem(Garment.Outerwear, 30f, 30f, 140.dp),
                        CollageItem(Garment.Top, 70f, 28f, 110.dp, YeetItemColor.WHITE),
                        CollageItem(Garment.Bottom, 35f, 72f, 120.dp, YeetItemColor.BLUE),
                    ),
                )
            },
            title = "Прогулка",
            titleChip = "Образ",
            systemBarsPadding = false,
            stamp = { Stamp("Надеть", onClick = {}) },
        ) {
            Text("Лёгкий образ на тёплый вечер", tone = TextTone.Secondary)
            Spacer(Modifier.height(16.dp))
            ListGroup {
                ListItem("Сезон")
                ListItem("Повод")
            }
        }
    }
}
