package design.yeet.sample

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import design.yeet.ds.atoms.Stamp
import design.yeet.ds.atoms.StampTone
import design.yeet.ds.atoms.Text
import design.yeet.ds.atoms.TextTone
import design.yeet.ds.atoms.TextVariant
import design.yeet.ds.icons.IconName
import design.yeet.ds.molecules.ListGroup
import design.yeet.ds.molecules.ListItem
import design.yeet.ds.organisms.BottomBar
import design.yeet.ds.organisms.CollageItem
import design.yeet.ds.organisms.CropFrame
import design.yeet.ds.organisms.CropRect
import design.yeet.ds.organisms.DetailsScreen
import design.yeet.ds.organisms.Garment
import design.yeet.ds.organisms.ItemArt
import design.yeet.ds.organisms.ItemCard
import design.yeet.ds.organisms.ItemSlot
import design.yeet.ds.organisms.ItemSlots
import design.yeet.ds.organisms.OutfitCollage
import design.yeet.ds.organisms.OutfitPager
import design.yeet.ds.organisms.PagerAxis
import design.yeet.ds.organisms.PagerLook
import design.yeet.ds.organisms.WeatherCard
import design.yeet.ds.organisms.collagePattern
import design.yeet.ds.theme.YeetTheme
import design.yeet.tokens.YeetItemColor
import design.yeet.tokens.cardBg

/* Витрина новых организмов (#93): OutfitPager, ItemSlots, CropFrame, DetailsScreen. */

private val sampleLooks = listOf(
    PagerLook(
        "walk",
        listOf(
            CollageItem(Garment.Outerwear, 30f, 30f, 140.dp),
            CollageItem(Garment.Top, 70f, 28f, 110.dp, YeetItemColor.WHITE),
            CollageItem(Garment.Bottom, 35f, 72f, 120.dp, YeetItemColor.BLUE),
            CollageItem(Garment.Shoe, 72f, 75f, 90.dp, YeetItemColor.BLACK),
        ),
        label = "Прогулка",
        name = "Прогулка",
    ),
    PagerLook(
        "office",
        listOf(
            CollageItem(Garment.Top, 32f, 30f, 130.dp, YeetItemColor.BEIGE),
            CollageItem(Garment.Bottom, 66f, 45f, 130.dp, YeetItemColor.BLACK),
            CollageItem(Garment.Shoe, 30f, 76f, 90.dp, YeetItemColor.BROWN),
        ),
        label = "Работа",
        name = "Работа",
    ),
    PagerLook(
        "dinner",
        listOf(
            CollageItem(Garment.Outerwear, 35f, 35f, 150.dp, YeetItemColor.BROWN),
            CollageItem(Garment.Bottom, 70f, 50f, 120.dp, YeetItemColor.BLACK),
            CollageItem(Garment.Container, 72f, 80f, 80.dp),
        ),
        label = "Ужин",
        name = "Ужин",
    ),
    PagerLook(
        "sport",
        listOf(
            CollageItem(Garment.Top, 40f, 32f, 130.dp, YeetItemColor.GREEN),
            CollageItem(Garment.Shoe, 62f, 72f, 110.dp, YeetItemColor.WHITE),
        ),
        label = "Спорт",
        name = "Спорт",
    ),
)

/** Раздел витрины «OutfitPager · ItemSlots · CropFrame · DetailsScreen». */
@Composable
internal fun OrganismsSection() {
    Column(verticalArrangement = Arrangement.spacedBy(24.dp)) {
        OutfitPagerDemo()
        ItemSlotsDemo()
        CropFrameDemo()
        DetailsScreenDemo()
    }
}

@Composable
private fun Caption(text: String) = Text(text, variant = TextVariant.Caption, tone = TextTone.Secondary)

@Composable
internal fun OutfitPagerDemo() {
    var stack by remember { mutableIntStateOf(0) }
    var worn by remember { mutableStateOf(false) }
    Caption("Стопка (Y): свайп вверх / вниз, тап по превью, TalkBack — действия «Предыдущий / Следующий образ»")
    OutfitPager(
        looks = sampleLooks,
        index = stack,
        onIndexChange = {
            stack = it
            worn = false
        },
        weather = { WeatherCard(temperature = "+18°", description = "Солнечно", tilt = true) },
        stamp = { Stamp("Надеть", onClick = { worn = !worn }, done = worn) },
    )
    var strip by remember { mutableIntStateOf(0) }
    Caption("Лента (X): «С чем носить»")
    OutfitPager(
        looks = sampleLooks,
        index = strip,
        onIndexChange = { strip = it },
        axis = PagerAxis.X,
        skip = { Stamp("Не нравится", onClick = { if (strip < sampleLooks.size - 1) strip += 1 }, tone = StampTone.Secondary, icon = IconName.ThumbDown) },
        stamp = { Stamp("Сохранить", onClick = {}) },
    )
}

@Composable
internal fun ItemSlotsDemo() {
    val tops = remember { mutableStateOf(listOf(YeetItemColor.WHITE, YeetItemColor.BLUE, YeetItemColor.BEIGE, YeetItemColor.BLACK)) }
    var top by remember { mutableIntStateOf(1) }
    var bottom by remember { mutableIntStateOf(0) }
    var shoes by remember { mutableStateOf(emptyList<YeetItemColor>()) }
    Caption("ItemSlots: ряд со снапом по центру, ← / → с клавиатуры, «+» в конце")
    ItemSlots {
        ItemSlot("Верх", itemCount = tops.value.size, index = top, onIndexChange = { top = it }, onAdd = { tops.value = tops.value + YeetItemColor.GREEN }) { k ->
            ItemCard(Garment.Top, color = tops.value[k], onRemove = {
                tops.value = tops.value.filterIndexed { i, _ -> i != k }
                top = top.coerceAtMost((tops.value.size - 1).coerceAtLeast(0))
            })
        }
        ItemSlot("Низ", itemCount = 2, index = bottom, onIndexChange = { bottom = it }, onAdd = {}) { k ->
            ItemCard(Garment.Bottom, color = if (k == 0) YeetItemColor.BLUE else YeetItemColor.GREY, onRemove = {})
        }
        ItemSlot("Обувь", itemCount = shoes.size, onAdd = { shoes = shoes + YeetItemColor.BLACK }) { k ->
            ItemCard(Garment.Shoe, color = shoes[k], onRemove = { shoes = shoes.filterIndexed { i, _ -> i != k } })
        }
    }
}

@Composable
internal fun CropFrameDemo() {
    val c = YeetTheme.colors
    var rect by remember { mutableStateOf(CropRect(0.08f, 0.2f, 0.84f, 0.45f)) }
    Caption("CropFrame: двигай рамку, тяни углы, щипок — масштаб")
    CropFrame(
        value = rect,
        onValueChange = { rect = it },
        modifier = Modifier.fillMaxWidth().height(420.dp).clip(RoundedCornerShape(YeetTheme.radius.lg)),
    ) {
        Box(Modifier.fillMaxSize().background(c.cardBg).collagePattern(c.patternDot), contentAlignment = Alignment.Center) {
            ItemArt(Garment.Outerwear, color = YeetItemColor.BEIGE, size = 220.dp)
        }
    }
}

@Composable
internal fun DetailsScreenDemo() {
    Caption("DetailsScreen: прокрути панель — фото свернётся в миниатюру 48 в шапке")
    Box(Modifier.fillMaxWidth().height(720.dp).clip(RoundedCornerShape(YeetTheme.radius.lg))) {
        DetailsScreen(
            media = { OutfitCollage(items = sampleLooks[0].items) },
            title = "Прогулка",
            titleChip = "Образ",
            systemBarsPadding = false,
            stamp = { Stamp("Надеть", onClick = {}) },
            bottom = { BottomBar(label = "Изменить образ", onClick = {}, navigationBarPadding = false) },
        ) {
            Text("Лёгкий образ на тёплый вечер: плащ, белая футболка и синие джинсы", tone = TextTone.Secondary)
            Spacer(Modifier.height(16.dp))
            ListGroup {
                ListItem("Сезон", description = "Весна, осень")
                ListItem("Повод", description = "Прогулка")
                ListItem("Надет", description = "12 раз")
            }
        }
    }
}
