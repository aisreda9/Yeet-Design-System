package design.yeet.ds.organisms

import androidx.compose.animation.core.Animatable
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.layout.Layout
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import design.yeet.ds.atoms.Badge
import design.yeet.ds.atoms.BadgeVariant
import design.yeet.ds.atoms.ColorDot
import design.yeet.ds.atoms.ControlSurface
import design.yeet.ds.atoms.Icon
import design.yeet.ds.atoms.Text
import design.yeet.ds.atoms.TextVariant
import design.yeet.ds.icons.IconName
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews
import design.yeet.ds.theme.YeetTheme
import design.yeet.tokens.YeetComponent
import design.yeet.tokens.YeetGesture
import design.yeet.tokens.YeetItemColor
import design.yeet.tokens.cardBg
import kotlin.math.roundToInt

/* ─── Cards ─────────────────────────────────────────────────────────── */

/** Категория вещи: иллюстрация-заглушка и название для TalkBack. */
enum class Garment(val title: String, val icon: IconName) {
    Top("Верх", IconName.Top),
    Bottom("Низ", IconName.Bottom),
    Outerwear("Верхняя одежда", IconName.Outerwear),
    Shoe("Обувь", IconName.Shoe),
    Accessories("Аксессуары", IconName.Accessories),
    Container("Сумка", IconName.Container),
}

/**
 * Вещь: фото без фона (`src`) или иллюстрация по категории (обводка тоньше на крупном размере — визуально 1.3).
 * @param color точка цвета вещи в правом нижнем углу (только у иллюстрации).
 */
@Composable
fun ItemArt(
    kind: Garment,
    modifier: Modifier = Modifier,
    color: YeetItemColor? = null,
    size: Dp = 88.dp,
    src: Painter? = null,
    alt: String? = null,
) {
    Box(modifier.size(size), contentAlignment = Alignment.Center) {
        if (src != null) {
            Image(src, contentDescription = alt, contentScale = ContentScale.Fit, modifier = Modifier.fillMaxSize())
        } else {
            Icon(kind.icon, size = size, strokeWidth = maxOf(0.35f, 1.3f * 24f / size.value.coerceAtLeast(1f)))
            if (color != null) {
                ColorDot(color, Modifier.align(Alignment.BottomEnd).offset(x = (-4).dp, y = (-4).dp), size = maxOf(10.dp, size / 7))
            }
        }
    }
}

/**
 * Карточка вещи 173×172 в сетке 2 колонки: вещь без фона на `cardBg`, радиус 20. Карточка резиновая —
 * вещь масштабируется пропорционально ширине (88, фото 138 при ширине 173).
 * **Контексты:** Гардероб (сетка), результаты поиска (`discount`), создание образа (`selected`).
 *
 * @param image фото вещи без фона. Без него — иллюстрация по `kind`.
 * @param discount скидка на товаре: «-10%» (Figma: Show Discount + Discount).
 * @param label метка-счётчик: «30 раз», «20 дней» (Профиль).
 * @param name название для TalkBack: «Чёрная сумка». По умолчанию — категория.
 * @param selected режим выбора (создание образа): `null` — без галочки.
 * @param onRemove убрать вещь из образа: «×» 20 серым в правом верхнем углу (Outfit Creation / Item Selection).
 */
@Composable
fun ItemCard(
    kind: Garment,
    modifier: Modifier = Modifier,
    color: YeetItemColor? = null,
    image: Painter? = null,
    discount: String? = null,
    label: String? = null,
    name: String? = null,
    selected: Boolean? = null,
    onClick: (() -> Unit)? = null,
    onRemove: (() -> Unit)? = null,
) {
    val c = YeetTheme.colors
    val a11y = listOfNotNull(name ?: kind.title, discount?.let { "скидка $it" }, label).joinToString(", ")
    Box(modifier) {
        ControlSurface(
            onClick = onClick,
            modifier = Modifier.fillMaxWidth().aspectRatio(173f / 172f),
            shape = RoundedCornerShape(YeetComponent.cardRadius),
            background = c.cardBg,
            contentColor = c.textPrimary,
            pressScale = YeetGesture.pressScaleCard,
            selected = selected,
            contentDescription = a11y,
        ) {
            BoxWithConstraints(Modifier.fillMaxSize().clearAndSetSemantics { }, contentAlignment = Alignment.Center) {
                val k = maxWidth / 173.dp
                ItemArt(kind, color = color, src = image, size = (if (image != null) 138.dp else 88.dp) * k)
                val badge = when {
                    discount != null -> discount to BadgeVariant.Danger
                    label != null -> label to BadgeVariant.Secondary
                    else -> null
                }
                if (badge != null) Badge(badge.first, Modifier.align(Alignment.TopStart).padding(16.dp), variant = badge.second)
                if (selected == true) SelectionCheck(Modifier.align(Alignment.TopEnd).padding(16.dp))
            }
        }
        if (onRemove != null) {
            // «×» — отдельная кнопка рядом с карточкой, не внутри неё
            Box(
                Modifier
                    .align(Alignment.TopEnd)
                    .padding(4.dp)
                    .size(44.dp)
                    .clickable(role = Role.Button, onClick = onRemove)
                    .semantics { contentDescription = "Убрать: $a11y" },
                contentAlignment = Alignment.Center,
            ) { Icon(IconName.Cross, size = 20.dp, tint = c.textSecondary) }
        }
    }
}

/** Галочка выбора: появляется на пружине `drop`, а не мгновенно. */
@Composable
private fun SelectionCheck(modifier: Modifier) {
    val c = YeetTheme.colors
    val motion = YeetTheme.motion
    val pop = remember { Animatable(0.4f) }
    LaunchedEffect(Unit) { pop.animateTo(1f, motion.drop()) }
    Box(
        modifier
            .graphicsLayer {
                scaleX = pop.value
                scaleY = pop.value
                alpha = ((pop.value - 0.4f) / 0.6f).coerceIn(0f, 1f)
            }
            .size(24.dp)
            .background(c.accent, CircleShape),
        contentAlignment = Alignment.Center,
    ) { Icon(IconName.Check, size = 16.dp, strokeWidth = 2f, tint = c.textOnAccent) }
}

/** Вещь на коллаже: центр в `x`, `y` (% от стороны), размер в единицах макета 353. */
data class CollageItem(
    val kind: Garment,
    val x: Float,
    val y: Float,
    val size: Dp? = null,
    val color: YeetItemColor? = null,
    val src: Painter? = null,
)

/**
 * Слой вещей коллажа. `base` — ширина макета, в которой заданы размеры вещей:
 * слой растягивается по контейнеру и масштабирует вещи.
 */
@Composable
fun CollageLayer(
    items: List<CollageItem>,
    modifier: Modifier = Modifier,
    defaultSize: Dp = 96.dp,
    base: Dp = 353.dp,
) {
    BoxWithConstraints(modifier.fillMaxSize()) {
        val k = maxWidth / base
        Layout(content = {
            items.forEach { ItemArt(it.kind, color = it.color, src = it.src, size = (it.size ?: defaultSize) * k) }
        }) { measurables, constraints ->
            val placeables = measurables.map { it.measure(Constraints()) }
            layout(constraints.maxWidth, constraints.maxHeight) {
                placeables.forEachIndexed { i, p ->
                    val item = items[i]
                    p.place(
                        (constraints.maxWidth * item.x / 100f - p.width / 2f).roundToInt(),
                        (constraints.maxHeight * item.y / 100f - p.height / 2f).roundToInt(),
                    )
                }
            }
        }
    }
}

/** Точечный фон коллажа (Figma pattern): точка 2×2 в клетке 10×10, поле точек с отступом 14 от краёв. */
fun Modifier.collagePattern(color: androidx.compose.ui.graphics.Color): Modifier = drawBehind {
    val pad = 14.dp.toPx()
    val step = 10.dp.toPx()
    val r = 1.dp.toPx()
    var y = pad + step / 2
    while (y < size.height - pad) {
        var x = pad + step / 2
        while (x < size.width - pad) {
            drawCircle(color, radius = r, center = Offset(x, y))
            x += step
        }
        y += step
    }
}

/**
 * Коллаж образа 353×353 (квадрат по ширине): `cardBg` + точечный паттерн, вещи раскладываются свободно.
 * @param label повод: «Прогулка», «Ужин» — бейдж Secondary в 20 от угла.
 * @param footer панель снизу: цена образа, переход (белая плашка, радиус 12 — концентрично карточке 20 при отступе 8, #217).
 */
@Composable
fun OutfitCollage(
    items: List<CollageItem>,
    modifier: Modifier = Modifier,
    label: String? = null,
    footer: (@Composable RowScope.() -> Unit)? = null,
) {
    val c = YeetTheme.colors
    Box(
        modifier
            .fillMaxWidth()
            .aspectRatio(1f)
            .clip(RoundedCornerShape(YeetComponent.cardRadius))
            .background(c.cardBg)
            .collagePattern(c.patternDot),
    ) {
        CollageLayer(items)
        if (label != null) Badge(label, Modifier.align(Alignment.TopStart).padding(20.dp), variant = BadgeVariant.Secondary)
        if (footer != null) {
            Row(
                Modifier
                    .align(Alignment.BottomCenter)
                    .padding(8.dp)
                    .fillMaxWidth()
                    .background(c.bgElevated, RoundedCornerShape(YeetTheme.radius.sm))
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                content = footer,
            )
        }
    }
}

/* ─── WeatherCard ───────────────────────────────────────────────────── */

/** Погода (web: weatherKinds / weatherNames). Цветные иконки — через `weatherIcon` (SVG из src/icons/weather). */
enum class Weather(val title: String) {
    Sunny("Солнечно, облачка (главная)"),
    ClearDay("Ясно"),
    ClearNight("Ясно, ночь"),
    PcloudyDay("Переменная облачность"),
    PcloudyNight("Переменная облачность, ночь"),
    Mcloudy("Облачно"),
    Fog("Туман"),
    Rain("Дождь"),
    Shower("Ливень"),
    Tstorm("Гроза"),
    Snow("Снег"),
    Windy("Ветрено"),
}

/**
 * Карточка погоды на экране «Сегодня»: иконка + температура (Roboto Slab 24) + описание Caption.
 * Инвертированный фон `bgInverse`, радиус 20 (левый нижний угол 8).
 *
 * @param icon линейная иконка вместо цветной (по умолчанию `Sun`, если нет `weatherIcon`).
 * @param weatherIcon цветная иконка погоды (Painter из ресурсов приложения — src/icons/weather/<kind>.svg).
 * @param alert предупреждение второй строкой: «Через 1 час дождь, захвати зонт».
 * @param tilt наклон −10° поверх коллажа (экран «Образы дня»).
 */
@Composable
fun WeatherCard(
    temperature: String,
    description: String,
    modifier: Modifier = Modifier,
    weather: Weather = Weather.Sunny,
    icon: IconName? = null,
    weatherIcon: Painter? = null,
    alert: String? = null,
    tilt: Boolean = false,
) {
    val c = YeetTheme.colors
    val t = YeetTheme.typography
    val lg = YeetTheme.radius.lg
    Column(
        modifier
            .graphicsLayer {
                if (tilt) {
                    rotationZ = -10f
                    transformOrigin = TransformOrigin(0f, 0f)
                }
            }
            .background(c.bgInverse, RoundedCornerShape(topStart = lg, topEnd = lg, bottomEnd = lg, bottomStart = 8.dp))
            .padding(horizontal = 20.dp, vertical = 16.dp)
            .semantics(mergeDescendants = true) { contentDescription = listOfNotNull(weather.title, temperature, description, alert).joinToString(", ") },
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            when {
                icon == null && weatherIcon != null -> Image(weatherIcon, contentDescription = null, modifier = Modifier.size(24.dp))
                else -> Icon(icon ?: IconName.Sun, tint = c.textInverse)
            }
            // Figma: Roboto Slab 400 24/24, −0.4
            BasicText(temperature, style = t.h2.merge(TextStyle(lineHeight = 24.sp, color = c.textInverse)))
        }
        Column {
            BasicText(description, style = t.caption.merge(TextStyle(fontWeight = t.body.fontWeight, color = c.textInverseSecondary)))
            if (alert != null) Text(alert, variant = TextVariant.Caption, color = c.textInverse)
        }
    }
}

@YeetPreviews
@Composable
private fun CardsPreview() = YeetPreviewSurface {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        ItemCard(Garment.Top, Modifier.weight(1f), color = YeetItemColor.BLUE, discount = "-10%", onClick = {})
        ItemCard(Garment.Shoe, Modifier.weight(1f), selected = true, onClick = {}, onRemove = {})
    }
    OutfitCollage(
        items = listOf(
            CollageItem(Garment.Outerwear, 30f, 30f, 140.dp),
            CollageItem(Garment.Top, 70f, 28f, 110.dp, YeetItemColor.WHITE),
            CollageItem(Garment.Bottom, 35f, 72f, 120.dp, YeetItemColor.BLUE),
            CollageItem(Garment.Shoe, 72f, 75f, 90.dp),
        ),
        label = "Прогулка",
        footer = {
            Column(Modifier.weight(1f)) {
                Text("120 640 ₽", variant = TextVariant.H2, heading = false)
                Text("4 вещи", variant = TextVariant.Caption, color = YeetTheme.colors.textSecondary)
            }
            Icon(IconName.ChevronRight)
        },
    )
    WeatherCard(temperature = "+18°", description = "Солнечно, ветер 3 м/с", alert = "Через 1 час дождь, захвати зонт")
    WeatherCard(temperature = "+12°", description = "Облачно", tilt = true, modifier = Modifier.padding(start = 8.dp, top = 40.dp))
}
