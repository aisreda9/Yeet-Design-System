package design.yeet.sample

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import design.yeet.ds.atoms.Avatar
import design.yeet.ds.atoms.AvatarSize
import design.yeet.ds.atoms.Badge
import design.yeet.ds.atoms.BadgeVariant
import design.yeet.ds.atoms.Button
import design.yeet.ds.atoms.ButtonStyle
import design.yeet.ds.atoms.ColorDot
import design.yeet.ds.atoms.ControlSize
import design.yeet.ds.atoms.Divider
import design.yeet.ds.atoms.Icon
import design.yeet.ds.atoms.IconButton
import design.yeet.ds.atoms.Logo
import design.yeet.ds.atoms.Stamp
import design.yeet.ds.atoms.StampTone
import design.yeet.ds.atoms.Text
import design.yeet.ds.atoms.TextTone
import design.yeet.ds.atoms.TextVariant
import design.yeet.ds.icons.IconName
import design.yeet.ds.molecules.Account
import design.yeet.ds.molecules.AccountCard
import design.yeet.ds.molecules.AccountCardKind
import design.yeet.ds.molecules.AvatarStack
import design.yeet.ds.molecules.BarAction
import design.yeet.ds.molecules.Chip
import design.yeet.ds.molecules.ChipGroup
import design.yeet.ds.molecules.EmptyState
import design.yeet.ds.molecules.EmptyStateAction
import design.yeet.ds.molecules.Field
import design.yeet.ds.molecules.FieldInput
import design.yeet.ds.molecules.Hint
import design.yeet.ds.molecules.InputBar
import design.yeet.ds.molecules.InputGroup
import design.yeet.ds.molecules.InputGroupSize
import design.yeet.ds.molecules.ListGroup
import design.yeet.ds.molecules.ListItem
import design.yeet.ds.molecules.ListItemType
import design.yeet.ds.molecules.LoadingState
import design.yeet.ds.molecules.Segment
import design.yeet.ds.molecules.SegmentControl
import design.yeet.ds.molecules.SendAction
import design.yeet.ds.molecules.Snackbar
import design.yeet.ds.molecules.StatRow
import design.yeet.ds.molecules.StatTile
import design.yeet.ds.organisms.AccountsSheet
import design.yeet.ds.organisms.BottomBar
import design.yeet.ds.organisms.BottomNav
import design.yeet.ds.organisms.CollageItem
import design.yeet.ds.organisms.Dialog
import design.yeet.ds.organisms.DialogTone
import design.yeet.ds.organisms.FooterAction
import design.yeet.ds.organisms.Garment
import design.yeet.ds.organisms.Header
import design.yeet.ds.organisms.HeaderAction
import design.yeet.ds.organisms.HeaderTextAction
import design.yeet.ds.organisms.HeaderType
import design.yeet.ds.organisms.ItemCard
import design.yeet.ds.organisms.Overlay
import design.yeet.ds.organisms.OutfitCollage
import design.yeet.ds.organisms.Sheet
import design.yeet.ds.organisms.SheetType
import design.yeet.ds.organisms.Tab
import design.yeet.ds.organisms.TabBar
import design.yeet.ds.organisms.WeatherCard
import design.yeet.ds.theme.YeetTheme
import design.yeet.tokens.YeetBrand
import design.yeet.tokens.YeetGesture
import design.yeet.tokens.YeetItemColor
import kotlinx.coroutines.delay

private val accounts = listOf(
    Account("1", "Саша", "sasha@yeet.app"),
    Account("2", "Тимур", "timur@yeet.app", color = YeetItemColor.ORANGE),
)

private enum class Modal { None, Sheet, Filter, Dialog, Destructive, Danger, Accounts }

/** Витрина: все компоненты библиотеки в светлой / тёмной теме и брендах. */
@Composable
fun Gallery(
    mode: ThemeMode,
    onModeChange: (ThemeMode) -> Unit,
    brand: YeetBrand?,
    onBrandChange: (YeetBrand?) -> Unit,
) {
    val c = YeetTheme.colors
    val density = LocalDensity.current
    var headerHeight by remember { mutableIntStateOf(0) }
    var navHeight by remember { mutableIntStateOf(0) }
    var tab by remember { mutableStateOf(Tab.Wardrobe) }
    var modal by remember { mutableStateOf(Modal.None) }
    var snackbar by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(snackbar) {
        if (snackbar != null) {
            delay(YeetGesture.snackbarMillis)
            snackbar = null
        }
    }

    Box(Modifier.fillMaxSize().background(c.bgCanvas)) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(
                start = 20.dp,
                end = 20.dp,
                top = with(density) { headerHeight.toDp() } + 8.dp,
                bottom = with(density) { navHeight.toDp() } + 24.dp,
            ),
            verticalArrangement = Arrangement.spacedBy(32.dp),
        ) {
            item { Section("Тема") { ThemeSection(mode, onModeChange, brand, onBrandChange) } }
            item { Section("Цвета и типографика") { TokensSection() } }
            item { Section("Icon") { IconsSection() } }
            item { Section("Button · IconButton") { ButtonsSection() } }
            item { Section("Badge · Avatar · AvatarStack") { DisplaySection() } }
            item { Section("ChipGroup") { ChipsSection() } }
            item { Section("SegmentControl") { SegmentsSection() } }
            item { Section("ListItem · ListGroup") { ListsSection() } }
            item { Section("Field · InputGroup · InputBar") { InputsSection() } }
            item { Section("Stamp") { StampSection() } }
            item {
                Section("Snackbar · EmptyState · LoadingState · Hint") {
                    Button("Показать snackbar", onClick = { snackbar = "Вещь перемещена в архив" }, variant = ButtonStyle.Tertiary, size = ControlSize.M)
                    Snackbar("Добавлено в вишлист", onClose = {})
                    EmptyState(
                        title = "Гардероб пуст",
                        description = "Добавь первую вещь — и мы соберём из неё образы",
                        action = EmptyStateAction("Добавить вещь", ButtonStyle.Primary),
                        modifier = Modifier.fillMaxWidth(),
                    )
                    LoadingState("Собираю образы из твоих вещей…", Modifier.fillMaxWidth())
                    Hint("Перемещай и масштабируй вещи")
                }
            }
            item {
                Section("Sheet · Dialog · AccountsSheet") {
                    FlowButtons(
                        "Sheet" to { modal = Modal.Sheet },
                        "Фильтр с ×" to { modal = Modal.Filter },
                        "Dialog" to { modal = Modal.Dialog },
                        "Destructive" to { modal = Modal.Destructive },
                        "Danger" to { modal = Modal.Danger },
                        "Аккаунты" to { modal = Modal.Accounts },
                    )
                    Sheet(title = "Панель деталей", type = SheetType.Panel) {
                        Text("Панель поверх фото — во всю ширину, с тенью", tone = TextTone.Secondary)
                    }
                }
            }
            item { Section("Шторки · единое правило") { SheetRulesSection() } }
            item {
                Section("AccountCard") {
                    AccountCard(accounts[0], kind = AccountCardKind.Current)
                    AccountCard(accounts[1], kind = AccountCardKind.Other, onClick = {})
                    AccountCard(accounts[0], kind = AccountCardKind.Settings)
                }
            }
            item { Section("Header") { HeadersSection() } }
            item {
                Section("TabBar · BottomBar") {
                    TabBar(active = tab, onChange = { tab = it })
                    BottomBar(label = "Создать образ", onClick = {}, secondary = HeaderAction(IconName.ArrowsShuffle, "Перемешать"), navigationBarPadding = false)
                }
            }
            item { Section("ItemCard · OutfitCollage") { CardsSection() } }
            item {
                Section("StatTile · WeatherCard") {
                    StatRow {
                        StatTile("Вещей", "128")
                        StatTile("Образов", "36")
                        StatTile("Надето", "74%")
                    }
                    WeatherCard(temperature = "+18°", description = "Солнечно, ветер 3 м/с", alert = "Через 1 час дождь, захвати зонт")
                    Box(Modifier.padding(top = 24.dp, start = 8.dp)) {
                        WeatherCard(temperature = "+12°", description = "Облачно", icon = IconName.Sun, tilt = true)
                    }
                }
            }
            item {
                Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { Logo(tint = c.textSecondary, height = 24.dp) }
            }
        }

        Header(
            HeaderType.Large(title = "Yeet DS", subtitle = "Jetpack Compose · Design System 2.0", action = HeaderAction(IconName.More, "Ещё")),
            modifier = Modifier.onSizeChanged { headerHeight = it.height },
        )

        Column(
            Modifier
                .align(Alignment.BottomCenter)
                .onSizeChanged { navHeight = it.height },
        ) {
            snackbar?.let { text ->
                Snackbar(text, modifier = Modifier.padding(horizontal = 20.dp).padding(bottom = 8.dp), onUndo = { snackbar = null }, onClose = { snackbar = null })
            }
            BottomNav(active = tab, fab = tab == Tab.Wardrobe, onFab = { snackbar = "Добавить вещь" }, onTabChange = { tab = it })
        }
    }

    Overlay(visible = modal == Modal.Sheet, onClose = { modal = Modal.None }) {
        var season by remember { mutableStateOf("Лето") }
        Sheet(
            title = "Сезон",
            footer = FooterAction("Сбросить", onClick = { season = "" }) to FooterAction("Применить", onClick = { modal = Modal.None }),
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
                listOf("Лето", "Осень", "Зима", "Весна").forEach { s ->
                    ListItem(s, type = ListItemType.Radio, checked = season == s, onClick = { season = s })
                }
            }
        }
    }
    Overlay(visible = modal == Modal.Filter, onClose = { modal = Modal.None }) {
        Sheet(title = "Фильтры", onClose = { modal = Modal.None }) {
            ChipGroup(chips = listOf(Chip("Верх", selected = true), Chip("Низ"), Chip("Обувь"), Chip("Аксессуары")), wrap = true)
        }
    }
    Overlay(visible = modal == Modal.Dialog, onClose = { modal = Modal.None }) {
        Dialog(title = "Точно хочешь выйти?", description = "Изменения не сохранятся", cancel = "Выйти", confirm = "Сохранить и выйти", onCancel = { modal = Modal.None }, onConfirm = { modal = Modal.None })
    }
    Overlay(visible = modal == Modal.Destructive, onClose = { modal = Modal.None }) {
        Dialog(
            title = "Очистить корзину?",
            description = "Все вещи из корзины удаляются навсегда, их уже не вернуть",
            cancel = "Отмена",
            confirm = "Очистить",
            tone = DialogTone.Destructive,
            onCancel = { modal = Modal.None },
            onConfirm = { modal = Modal.None },
        )
    }
    Overlay(visible = modal == Modal.Danger, onClose = { modal = Modal.None }) {
        Dialog(
            title = "Удалить аккаунт?",
            description = "Вещи, образы и поездки удалятся без возможности восстановления",
            cancel = "Отменить",
            confirm = "Удалить",
            tone = DialogTone.Danger,
            onCancel = { modal = Modal.None },
            onConfirm = { modal = Modal.None },
        ) {
            StatRow {
                StatTile("Вещей", "128")
                StatTile("Образов", "36")
                StatTile("Поездок", "4")
            }
        }
    }
    Overlay(visible = modal == Modal.Accounts, onClose = { modal = Modal.None }) {
        AccountsSheet(accounts = accounts, onSwitch = { modal = Modal.None }, onAdd = { modal = Modal.None })
    }
}

@Composable
private fun Section(title: String, content: @Composable ColumnScope.() -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(title, variant = TextVariant.H3)
        content()
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun FlowButtons(vararg buttons: Pair<String, () -> Unit>) {
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        buttons.forEach { (label, action) -> Button(label, onClick = action, variant = ButtonStyle.Tertiary, size = ControlSize.S) }
    }
}

@Composable
private fun ThemeSection(mode: ThemeMode, onModeChange: (ThemeMode) -> Unit, brand: YeetBrand?, onBrandChange: (YeetBrand?) -> Unit) {
    SegmentControl(
        segments = ThemeMode.entries.map { Segment(it.name, it.title) },
        value = mode.name,
        onChange = { v -> onModeChange(ThemeMode.valueOf(v)) },
        size = ControlSize.M,
    )
    ChipGroup(
        chips = listOf(Chip("Yeet", selected = brand == null)) + YeetBrand.entries.map { Chip(it.title, selected = brand == it) },
        onToggle = { label -> onBrandChange(YeetBrand.entries.firstOrNull { it.title == label }) },
    )
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun TokensSection() {
    val c = YeetTheme.colors
    val swatches = listOf(
        "bg-canvas" to c.bgCanvas, "bg-elevated" to c.bgElevated, "bg-subtle" to c.bgSubtle, "bg-inverse" to c.bgInverse,
        "text-primary" to c.textPrimary, "text-secondary" to c.textSecondary, "accent" to c.accent, "accent-soft" to c.accentSoft,
        "danger" to c.danger, "danger-soft" to c.dangerSoft,
    )
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        swatches.forEach { (name, color) -> Swatch(name, color) }
    }
    Text("H1 · Гардероб", variant = TextVariant.H1)
    Text("H2 · Образы на каждый день", variant = TextVariant.H2)
    Text("H3 · Заголовок карточки", variant = TextVariant.H3)
    Text("Body · Полный шкаф, а надеть нечего?")
    Text("Caption · Подписи и мета-данные", variant = TextVariant.Caption, tone = TextTone.Secondary)
    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) { YeetItemColor.entries.forEach { ColorDot(it, size = 20.dp) } }
}

@Composable
private fun Swatch(name: String, color: Color) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Box(Modifier.size(width = 72.dp, height = 40.dp).background(color, RoundedCornerShape(12.dp)).border(1.dp, YeetTheme.colors.borderSubtle, RoundedCornerShape(12.dp)))
        Text(name, variant = TextVariant.Caption, tone = TextTone.Secondary)
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun IconsSection() {
    FlowRow(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        IconName.entries.forEach { Icon(it, title = it.key) }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ButtonsSection() {
    ButtonStyle.entries.forEach { style ->
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            Button(style.name, onClick = {}, variant = style, size = ControlSize.M)
            IconButton(IconName.Plus, "Добавить", onClick = {}, variant = style, size = ControlSize.M)
            IconButton(IconName.More, "Ещё", onClick = {}, variant = style, size = ControlSize.S)
        }
    }
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        ControlSize.entries.forEach { size -> Button(size.name, onClick = {}, size = size, leftIcon = IconName.Heart) }
    }
    Button("Войти с Apple", onClick = {}, variant = ButtonStyle.Secondary, size = ControlSize.XL, leftIcon = IconName.Apple, fullWidth = true)
    Button("Недоступно", onClick = {}, enabled = false, fullWidth = true)
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun DisplaySection() {
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        BadgeVariant.entries.forEach { Badge(it.name, variant = it) }
    }
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
        Avatar(size = AvatarSize.L, initial = "С")
        Avatar(size = AvatarSize.M, initial = "Т", color = YeetItemColor.ORANGE)
        Avatar(size = AvatarSize.M, initial = "Б", color = YeetItemColor.YELLOW)
        Avatar(size = AvatarSize.M)
        Avatar(size = AvatarSize.S, initial = "A")
    }
    AvatarStack(accounts = accounts, onOpen = {}, onAdd = {})
    Divider(label = "или")
}

@Composable
private fun ChipsSection() {
    var chips by remember {
        mutableStateOf(listOf(Chip("Все", selected = true), Chip("Верх"), Chip("Низ"), Chip("Обувь"), Chip("Аксессуары"), Chip("Сумки")))
    }
    ChipGroup(chips = chips, onToggle = { l -> chips = chips.map { it.copy(selected = it.label == l) } })
    var tags by remember { mutableStateOf(listOf("базовое", "офис", "лето")) }
    ChipGroup(chips = tags.map { Chip(it, removable = true) }, onToggle = { l -> tags = tags - l }, onAdd = { tags = tags + "тег ${tags.size + 1}" }, wrap = true)
    ChipGroup(chips = listOf(Chip("Сезон", dropdown = true), Chip("Цвет", dropdown = true, selected = true), Chip("Синий", colorDot = YeetItemColor.BLUE)))
}

@Composable
private fun SegmentsSection() {
    var v by remember { mutableStateOf("items") }
    SegmentControl(listOf(Segment("items", "Вещи"), Segment("outfits", "Образы"), Segment("wishlist", "Вишлист")), value = v, onChange = { v = it })
    var mode by remember { mutableStateOf("Холст") }
    SegmentControl(
        listOf(Segment("Холст", icon = IconName.Collage), Segment("Вещи", icon = IconName.Wardrobe), Segment("Фильтры", icon = IconName.Settings)),
        value = mode,
        onChange = { mode = it },
        size = ControlSize.S,
        fit = true,
    )
}

@Composable
private fun ListsSection() {
    var expanded by remember { mutableStateOf(false) }
    var country by remember { mutableStateOf("Россия") }
    Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
        ListItem("Создать образ", icon = IconName.Collage, onClick = {})
        ListItem("Редактировать", icon = IconName.Pen, onClick = {})
        ListItem("В архив", icon = IconName.Archive, onClick = {})
        ListItem("Верх", type = ListItemType.Expandable, icon = IconName.Top, expanded = expanded, onClick = { expanded = !expanded })
        listOf("Россия", "Грузия", "Казахстан").forEach { name ->
            ListItem(name, type = ListItemType.Radio, checked = country == name, onClick = { country = name })
        }
    }
    ListGroup {
        ListItem("Корзина вещей", trailing = { Icon(IconName.ChevronRight, size = 20.dp) }, onClick = {})
        ListItem("Язык", trailing = { Icon(IconName.ExternalLink, size = 20.dp) }, onClick = {})
        ListItem("Поддержка", trailing = { Icon(IconName.ExternalLink, size = 20.dp) }, onClick = {})
    }
}

@Composable
private fun InputsSection() {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var visible by remember { mutableStateOf(false) }
    InputGroup {
        Field(label = "Почта", input = FieldInput(email, { email = it }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)))
        Field(
            label = "Пароль",
            input = FieldInput(
                password,
                { password = it },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                visualTransformation = if (visible) VisualTransformation.None else PasswordVisualTransformation(),
            ),
            trailingIcon = if (visible) IconName.EyeOff else IconName.Eye,
            onTrailingClick = { visible = !visible },
        )
    }
    InputGroup(size = InputGroupSize.L) {
        Field(label = "Категория", value = "Верх", trailingIcon = IconName.ChevronUpDown, onClick = {})
        Field(label = "Цвет", value = "Синий", colorDot = YeetItemColor.BLUE, trailingIcon = IconName.ChevronUpDown, onClick = {})
        Field(label = "Год рождения", value = "1890", error = true)
    }
    var query by remember { mutableStateOf("Белая рубашка") }
    InputBar(
        placeholder = "Уточните текстом",
        value = query,
        onChange = { query = it },
        fieldIcon = IconName.Search,
        leading = BarAction(IconName.ChevronLeft, "Назад"),
        trailing = BarAction(IconName.ImageAdd, "Поиск по фото"),
    )
    var message by remember { mutableStateOf("") }
    InputBar(placeholder = "Спроси у стилиста", value = message, onChange = { message = it }, send = SendAction("Отправить", onClick = { message = "" }))
}

@Composable
private fun StampSection() {
    var done by remember { mutableStateOf(false) }
    Row(horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
        Stamp(label = "Надеть", onClick = { done = !done }, done = done)
        Stamp(label = "Не нравится", onClick = {}, tone = StampTone.Secondary)
    }
}

@Composable
private fun HeadersSection() {
    Header(HeaderType.Large(title = "Гардероб", action = HeaderAction(IconName.More, "Ещё")), statusBarPadding = false)
    Header(HeaderType.Large(title = "Твои образы", accent = HeaderTextAction("на каждый день")), statusBarPadding = false)
    Header(HeaderType.Bar(titleChip = "Архив вещей", actions = listOf(HeaderAction(IconName.More, "Ещё"))), statusBarPadding = false)
    Header(HeaderType.Bar(titleChip = "Тбилиси", titleChipSub = "8-13 сент · 5 ночей"), statusBarPadding = false)
    Header(HeaderType.Bar(title = "Настройки"), statusBarPadding = false)
    Header(HeaderType.Back(title = "Вход и регистрация", textAction = HeaderTextAction("Пропустить")), statusBarPadding = false)
    Header(HeaderType.Search(query = "Белая рубашка", filters = listOf(Chip("Цена"), Chip("Сортировка"))), statusBarPadding = false)
}

@Composable
private fun CardsSection() {
    var selected by remember { mutableStateOf(setOf(1)) }
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        ItemCard(Garment.Top, Modifier.weight(1f), color = YeetItemColor.BLUE, discount = "-10%", onClick = {})
        ItemCard(Garment.Outerwear, Modifier.weight(1f), label = "30 раз", onClick = {}, onRemove = {})
    }
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        listOf(Garment.Shoe, Garment.Container).forEachIndexed { i, g ->
            ItemCard(
                g,
                Modifier.weight(1f),
                selected = i in selected,
                onClick = { selected = if (i in selected) selected - i else selected + i },
            )
        }
    }
    OutfitCollage(
        items = listOf(
            CollageItem(Garment.Outerwear, 30f, 30f, 140.dp),
            CollageItem(Garment.Top, 70f, 28f, 110.dp, YeetItemColor.WHITE),
            CollageItem(Garment.Bottom, 35f, 72f, 120.dp, YeetItemColor.BLUE),
            CollageItem(Garment.Shoe, 72f, 75f, 90.dp, YeetItemColor.BLACK),
        ),
        label = "Прогулка",
        footer = {
            Column(Modifier.weight(1f)) {
                Text("120 640 ₽", variant = TextVariant.H2, heading = false)
                Text("4 вещи", variant = TextVariant.Caption, tone = TextTone.Secondary)
            }
            Icon(IconName.ChevronRight)
        },
    )
}
