package design.yeet.ds.molecules

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.minimumInteractiveComponentSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import design.yeet.ds.atoms.Avatar
import design.yeet.ds.atoms.ButtonRow
import design.yeet.ds.atoms.ButtonStyle
import design.yeet.ds.atoms.ColorDot
import design.yeet.ds.atoms.ControlSize
import design.yeet.ds.atoms.ControlSurface
import design.yeet.ds.atoms.Icon
import design.yeet.ds.atoms.IconButtonImpl
import design.yeet.ds.atoms.Text
import design.yeet.ds.atoms.TextTone
import design.yeet.ds.atoms.TextVariant
import design.yeet.ds.atoms.background
import design.yeet.ds.atoms.content
import design.yeet.ds.icons.IconName
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews
import design.yeet.ds.theme.YeetTheme
import design.yeet.ds.theme.bleed
import design.yeet.tokens.YeetHapticEvent
import design.yeet.tokens.YeetItemColor
import design.yeet.tokens.YeetSpace
import design.yeet.tokens.buttonInverseBg
import design.yeet.tokens.buttonInverseFg
import design.yeet.tokens.cardBg

/* ─── SegmentControl ────────────────────────────────────────────────── */

/** Пункт [SegmentControl]: текст, иконка или оба. `value` озвучивается у сегмента-иконки. */
data class Segment(val value: String, val label: String? = null, val icon: IconName? = null)

/**
 * Переключатель вкладок: под активным сегментом — пилюля `Inverse`, которая переезжает между пунктами (`nav`, пружина quick).
 * **Контексты:** «Вещи / Образы / Вишлист» в Гардеробе, «Образы · 1 / Вещи» в поездке, режимы создания образа (иконки).
 *
 * Для TalkBack — группа (`selectableGroup`) пунктов `Role.Tab` с состоянием «выбрано» (`selectable`).
 * Зона нажатия — вся высота пункта; отдельный [minimumInteractiveComponentSize] сегментам не нужен: он раздвинул бы
 * контейнер и пилюлю (у S 40 пункты по 32 — касание рядом Compose доводит до 48 сам, как `::after` в вебе).
 *
 * Controlled: выбор снаружи (`value` + `onChange`). Uncontrolled — перегрузка с `defaultValue`.
 *
 * @param fit по ширине содержимого (вложенный переключатель «Вещи / Образы» в Вишлисте).
 */
@Composable
fun SegmentControl(
    segments: List<Segment>,
    value: String,
    modifier: Modifier = Modifier,
    onChange: ((String) -> Unit)? = null,
    size: ControlSize = ControlSize.L,
    fit: Boolean = false,
) {
    val c = YeetTheme.colors
    val haptics = YeetTheme.haptics
    val radius = YeetTheme.radius.xl
    val index = segments.indexOfFirst { it.value == value }
    val pill = rememberSlidingPill(index)
    Row(
        modifier
            .then(if (fit) Modifier else Modifier.fillMaxWidth())
            .height(IntrinsicSize.Min)
            .clip(RoundedCornerShape(radius))
            .background(c.bgSubtle)
            .padding(4.dp)
            .slidingPill(pill, c.buttonInverseBg, radius)
            .selectableGroup(),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        segments.forEachIndexed { i, s ->
            val active = i == index
            val iconOnly = s.icon != null && s.label == null
            val fg = when {
                active -> c.buttonInverseFg
                iconOnly -> c.textSecondary
                else -> ButtonStyle.Ghost.content(c)
            }
            val select = {
                if (!active) {
                    haptics.perform(YeetHapticEvent.Select)
                    onChange?.invoke(s.value)
                }
            }
            val itemModifier = Modifier
                .slidingPillItem(pill, i)
                .then(if (fit) Modifier else Modifier.weight(1f))
                .fillMaxHeight()
            ControlSurface(
                onClick = select,
                modifier = itemModifier,
                shape = RoundedCornerShape(radius),
                background = Color.Transparent,
                contentColor = fg,
                role = Role.Tab,
                selected = active,
                contentDescription = if (iconOnly) s.value else null,
            ) {
                if (iconOnly) {
                    Box(Modifier.heightIn(min = size.height - 8.dp).padding(horizontal = 8.dp), contentAlignment = Alignment.Center) {
                        Icon(s.icon!!, size = if (size == ControlSize.S) 20.dp else 24.dp)
                    }
                } else {
                    ButtonRow(size = size, fullWidth = !fit, leftIcon = s.icon, rightIcon = null, minHeight = size.height - 8.dp) {
                        Text(s.label.orEmpty(), maxLines = 1, overflow = TextOverflow.Ellipsis)
                    }
                }
            }
        }
    }
}

/**
 * Uncontrolled [SegmentControl] (web: `defaultValue` без `value`, useControllableState): выбор хранится внутри
 * (`rememberSaveable` — переживает поворот экрана и смерть процесса), о смене сообщает [onChange].
 *
 * @param defaultValue начальный сегмент; по умолчанию — первый.
 */
@Composable
fun SegmentControl(
    segments: List<Segment>,
    modifier: Modifier = Modifier,
    defaultValue: String? = null,
    onChange: ((String) -> Unit)? = null,
    size: ControlSize = ControlSize.L,
    fit: Boolean = false,
) {
    var current by rememberSaveable { mutableStateOf(defaultValue ?: segments.firstOrNull()?.value.orEmpty()) }
    SegmentControl(
        segments = segments,
        value = current,
        modifier = modifier,
        onChange = { v ->
            current = v
            onChange?.invoke(v)
        },
        size = size,
        fit = fit,
    )
}

/* ─── ChipGroup ─────────────────────────────────────────────────────── */

/**
 * Чипс: не выбран — `Tertiary`, выбран — `Soft`. `removable` — «×» справа, `dropdown` — ⇕ справа.
 * @param value идентичность чипса для `onToggle` / `onRemove` / выбора; по умолчанию — `label`.
 */
data class Chip(
    val label: String,
    val selected: Boolean = false,
    val removable: Boolean = false,
    val colorDot: YeetItemColor? = null,
    val dropdown: Boolean = false,
    val value: String? = null,
)

/** Идентичность чипса (web: `chipId`): `value`, иначе `label`. */
val Chip.id: String get() = value ?: label

/**
 * Группа чипсов на базе `Button S`: не выбран — `Tertiary`, выбран — `Soft`.
 * `wrap` — перенос строк (теги, цвета), иначе горизонтальный скролл (фильтры, поводы) с выходом за поля экрана.
 *
 * **Выбор** — как в вебе, три способа:
 * - `chips[].selected` + [onToggle] — состояние снаружи (эта перегрузка);
 * - `value` + `onValueChange` — controlled-перегрузка, `selected` у чипсов не читается;
 * - `defaultValue` — uncontrolled-перегрузка: группа хранит выбор сама (`rememberSaveable`).
 *
 * Для TalkBack чипс с [onToggle] — переключатель (`toggleable`, `Role.Checkbox`: «отмечено / не отмечено»),
 * фильтр-дропдаун — кнопка. Чипс 40 занимает в раскладке 48 ([minimumInteractiveComponentSize]), рисуется прежним.
 *
 * @param center подсказки по центру (Поиск в сторах).
 * @param bleed на сколько лента со скроллом выходит за поля слева и справа (web: −gutter). 0 — без выхода.
 * @param onRemove «×» у `removable` — отдельная кнопка «Удалить: …» внутри капсулы, приходит `Chip.id`.
 * Без него, как раньше, нажатие на весь чипс вызывает [onToggle] с подсказкой TalkBack «Удалить».
 */
@Composable
fun ChipGroup(
    chips: List<Chip>,
    modifier: Modifier = Modifier,
    onToggle: ((String) -> Unit)? = null,
    onAdd: (() -> Unit)? = null,
    wrap: Boolean = false,
    center: Boolean = false,
    bleed: Dp = YeetSpace.screenGutter,
    onRemove: ((String) -> Unit)? = null,
) {
    ChipGroupLayout(
        chips = chips,
        modifier = modifier,
        isSelected = { it.selected },
        toggleable = onToggle != null,
        onChipClick = { chip -> onToggle?.invoke(chip.id) },
        onRemove = onRemove,
        onAdd = onAdd,
        wrap = wrap,
        center = center,
        bleed = bleed,
    )
}

/**
 * Controlled-выбор чипсов (web: `value` + `onValueChange`): выбранные — по `Chip.id`, `selected` у чипсов не читается.
 * @param multiple `false` — одиночный выбор (повод, категория): новый чипс снимает прежний, повторное нажатие — снимает выбор.
 * @param onToggle дополнительно: нажатый чипс (например, дропдаун, который открывает sheet и не выбирается).
 */
@Composable
fun ChipGroup(
    chips: List<Chip>,
    value: List<String>,
    onValueChange: (List<String>) -> Unit,
    modifier: Modifier = Modifier,
    multiple: Boolean = true,
    onToggle: ((String) -> Unit)? = null,
    onRemove: ((String) -> Unit)? = null,
    onAdd: (() -> Unit)? = null,
    wrap: Boolean = false,
    center: Boolean = false,
    bleed: Dp = YeetSpace.screenGutter,
) {
    ChipGroupLayout(
        chips = chips,
        modifier = modifier,
        isSelected = { it.id in value },
        toggleable = true,
        onChipClick = { chip ->
            if (!chip.dropdown) onValueChange(toggleChip(value, chip.id, multiple))
            onToggle?.invoke(chip.id)
        },
        onRemove = onRemove,
        onAdd = onAdd,
        wrap = wrap,
        center = center,
        bleed = bleed,
    )
}

/**
 * Uncontrolled-выбор чипсов (web: `defaultValue`): группа хранит выбор сама (`rememberSaveable`) и сообщает новый
 * выбор целиком в [onValueChange]. Остальное — как у controlled-перегрузки.
 */
@Composable
fun ChipGroup(
    chips: List<Chip>,
    defaultValue: List<String>,
    modifier: Modifier = Modifier,
    onValueChange: ((List<String>) -> Unit)? = null,
    multiple: Boolean = true,
    onToggle: ((String) -> Unit)? = null,
    onRemove: ((String) -> Unit)? = null,
    onAdd: (() -> Unit)? = null,
    wrap: Boolean = false,
    center: Boolean = false,
    bleed: Dp = YeetSpace.screenGutter,
) {
    var current by rememberSaveable { mutableStateOf(defaultValue.toList()) }
    ChipGroup(
        chips = chips,
        value = current,
        onValueChange = { v ->
            current = v
            onValueChange?.invoke(v)
        },
        modifier = modifier,
        multiple = multiple,
        onToggle = onToggle,
        onRemove = onRemove,
        onAdd = onAdd,
        wrap = wrap,
        center = center,
        bleed = bleed,
    )
}

/** Новый выбор после нажатия на чипс `id` (web: `setValue(cur => …)` в ChipGroup). */
private fun toggleChip(current: List<String>, id: String, multiple: Boolean): List<String> = when {
    id in current -> current.filter { it != id }
    multiple -> current + id
    else -> listOf(id)
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ChipGroupLayout(
    chips: List<Chip>,
    modifier: Modifier,
    isSelected: (Chip) -> Boolean,
    toggleable: Boolean,
    onChipClick: (Chip) -> Unit,
    onRemove: ((String) -> Unit)?,
    onAdd: (() -> Unit)?,
    wrap: Boolean,
    center: Boolean,
    bleed: Dp,
) {
    val items: @Composable () -> Unit = {
        if (onAdd != null) {
            IconButtonImpl(IconName.Plus, "Добавить", onAdd, variant = ButtonStyle.Primary, size = ControlSize.S, diameter = 36.dp, iconSize = 20.dp)
        }
        chips.forEach { chip ->
            ChipButton(
                chip = chip,
                selected = isSelected(chip),
                toggleable = toggleable,
                onClick = { onChipClick(chip) },
                onRemove = if (chip.removable && onRemove != null) ({ onRemove(chip.id) }) else null,
            )
        }
    }
    val arrangement = if (center) Arrangement.spacedBy(4.dp, Alignment.CenterHorizontally) else Arrangement.spacedBy(4.dp)
    if (wrap) {
        // чипсы 40 в зонах нажатия 48: строки без промежутка — между капсулами визуально 8
        FlowRow(modifier.fillMaxWidth(), horizontalArrangement = arrangement, verticalArrangement = Arrangement.spacedBy(0.dp)) { items() }
    } else {
        Row(
            modifier
                .fillMaxWidth()
                .bleed(bleed)
                .horizontalScroll(rememberScrollState())
                .padding(PaddingValues(horizontal = bleed)),
            horizontalArrangement = arrangement,
            verticalAlignment = Alignment.CenterVertically,
        ) { items() }
    }
}

@Composable
private fun ChipButton(
    chip: Chip,
    selected: Boolean,
    toggleable: Boolean,
    onClick: () -> Unit,
    onRemove: (() -> Unit)?,
) {
    val c = YeetTheme.colors
    val haptics = YeetTheme.haptics
    val style = if (selected) ButtonStyle.Soft else ButtonStyle.Tertiary
    // «×» отдельной кнопкой (onRemove) рисуется в содержимом, а не как rightIcon
    val trailing = when {
        chip.removable && onRemove == null -> IconName.Cross
        chip.dropdown -> IconName.ChevronUpDown
        else -> null
    }
    // фильтр-дропдаун открывает sheet — это кнопка, а не переключатель
    val isToggle = toggleable && !chip.dropdown
    ControlSurface(
        onClick = {
            haptics.perform(YeetHapticEvent.Select)
            onClick()
        },
        modifier = Modifier.minimumInteractiveComponentSize(),
        shape = RoundedCornerShape(YeetTheme.radius.xl),
        background = style.background(c),
        contentColor = style.content(c),
        role = if (isToggle) Role.Checkbox else Role.Button,
        selected = if (isToggle || chip.dropdown) null else selected,
        toggled = if (isToggle) selected else null,
        onClickLabel = if (chip.removable && onRemove == null) "Удалить" else null,
    ) {
        ButtonRow(
            size = ControlSize.S,
            fullWidth = false,
            leftIcon = null,
            rightIcon = trailing,
            startPadding = 16.dp,
            endPadding = when {
                onRemove != null -> 0.dp
                trailing != null -> 12.dp
                else -> 16.dp
            },
            rightIconSize = 20.dp,
            rightIconTint = if (chip.removable) c.textSecondary else Color.Unspecified,
        ) {
            if (chip.colorDot != null) ColorDot(chip.colorDot)
            Text(chip.label, maxLines = 1)
            if (onRemove != null) ChipRemoveButton(chip.label, onRemove)
        }
    }
}

/**
 * «×» внутри капсулы чипса — отдельная кнопка «Удалить: …» (web: `y-chip__remove`, зона 40).
 * Вложенный `clickable` — своя граница слияния семантики: TalkBack фокусирует чипс и «×» по отдельности.
 */
@Composable
private fun ChipRemoveButton(label: String, onRemove: () -> Unit) {
    Box(
        Modifier
            .heightIn(min = ControlSize.S.height)
            .widthIn(min = ControlSize.S.height)
            .clickable(role = Role.Button, onClick = onRemove)
            .semantics { contentDescription = "Удалить: $label" }
            .padding(end = 12.dp),
        contentAlignment = Alignment.Center,
    ) {
        Icon(IconName.Cross, size = 20.dp, tint = YeetTheme.colors.textSecondary)
    }
}

/* ─── ListItem ──────────────────────────────────────────────────────── */

/** Тип строки (Figma list-item · Type). */
enum class ListItemType { Action, Expandable, Radio }

internal val LocalInListGroup = staticCompositionLocalOf { false }

/**
 * Строка списка в sheet: высота 24, gap 12, Body.
 * **Action** — действие с вещью (создать образ, редактировать, удалить), **Expandable** — категории одежды,
 * **Radio** — одиночный выбор (год рождения, страна, пол).
 * Внутри [ListGroup] — строка 56 (72 с описанием), паддинг 16 / 20, нажатие подсвечивается фоном.
 *
 * @param expanded Expandable: раскрыта ли строка.
 * @param checked Radio: выбрана ли строка.
 * @param description вторая строка Caption: почта в профиле.
 * @param leading элемент слева вместо иконки: аватар 40.
 * @param trailing элемент справа: флаг страны, счётчик, «↗».
 */
@Composable
fun ListItem(
    label: String,
    modifier: Modifier = Modifier,
    type: ListItemType = ListItemType.Action,
    icon: IconName? = null,
    expanded: Boolean = false,
    checked: Boolean = false,
    description: String? = null,
    leading: (@Composable () -> Unit)? = null,
    trailing: (@Composable () -> Unit)? = null,
    onClick: (() -> Unit)? = null,
) {
    val c = YeetTheme.colors
    val motion = YeetTheme.motion
    val haptics = YeetTheme.haptics
    val inGroup = LocalInListGroup.current
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val pressedBg by animateColorAsState(if (pressed && inGroup) c.borderSubtle else c.borderSubtle.copy(alpha = 0f), motion.select(), label = "rowPressed")

    val click = when {
        type == ListItemType.Radio -> Modifier.selectable(
            selected = checked,
            interactionSource = interaction,
            indication = null,
            role = Role.RadioButton,
            onClick = {
                if (!checked) haptics.perform(YeetHapticEvent.Select)
                onClick?.invoke()
            },
        )
        type == ListItemType.Expandable -> Modifier
            .clickable(interactionSource = interaction, indication = null, role = Role.Button, onClickLabel = if (expanded) "Свернуть" else "Развернуть") { onClick?.invoke() }
            .semantics { stateDescription = if (expanded) "Развёрнуто" else "Свёрнуто" }
        onClick != null -> Modifier.clickable(interactionSource = interaction, indication = null, role = Role.Button, onClick = onClick)
        else -> Modifier
    }
    val minHeight = when {
        !inGroup -> 24.dp
        description != null -> 72.dp
        else -> 56.dp
    }
    Row(
        modifier
            .fillMaxWidth()
            .background(pressedBg)
            .then(click)
            .heightIn(min = minHeight)
            .then(if (inGroup) Modifier.padding(horizontal = 20.dp, vertical = 16.dp) else Modifier),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        when {
            type == ListItemType.Radio -> Box(
                Modifier.size(24.dp).background(if (checked) c.accent else c.bgSubtle, CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                // флоу: синий круг с галочкой, не точка
                if (checked) Icon(IconName.Check, size = 16.dp, tint = c.textOnAccent)
            }
            leading != null -> leading()
            icon != null -> Icon(icon)
        }
        if (description != null) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(label)
                Text(description, variant = TextVariant.Caption, tone = TextTone.Secondary)
            }
        } else {
            Text(label, modifier = Modifier.weight(1f))
        }
        if (type == ListItemType.Expandable) {
            Icon(if (expanded) IconName.ChevronUp else IconName.ChevronDown, size = if (inGroup) 20.dp else 24.dp)
        } else {
            trailing?.invoke()
        }
    }
}

/**
 * Группа строк-переходов на карточке `cardBg`, радиус 20, разделители `divider` с отступом 16:
 * «Корзина вещей →», «Язык ↗», «Поддержка ↗». Для пар «ключ — значение» — [InputGroup] + [Field].
 * **Контексты:** Настройки.
 */
@Composable
fun ListGroup(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    val c = YeetTheme.colors
    CompositionLocalProvider(LocalInListGroup provides true) {
        DividedColumn(
            modifier = modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(YeetTheme.radius.lg))
                .background(c.cardBg),
            dividerColor = c.divider,
            content = content,
        )
    }
}

@YeetPreviews
@Composable
private fun SelectionPreview() = YeetPreviewSurface {
    var tab by remember { mutableStateOf("items") }
    SegmentControl(
        segments = listOf(Segment("items", "Вещи"), Segment("outfits", "Образы"), Segment("wishlist", "Вишлист")),
        value = tab,
        onChange = { tab = it },
    )
    SegmentControl(
        segments = listOf(Segment("Холст", icon = IconName.Collage), Segment("Вещи", icon = IconName.Wardrobe)),
        value = "Холст",
        size = ControlSize.S,
        fit = true,
    )
    var chips by remember {
        mutableStateOf(listOf(Chip("Лето", selected = true), Chip("Осень"), Chip("Работа", dropdown = true), Chip("Синий", colorDot = YeetItemColor.BLUE)))
    }
    ChipGroup(chips = chips, onToggle = { l -> chips = chips.map { if (it.label == l) it.copy(selected = !it.selected) else it } })
    ChipGroup(chips = listOf(Chip("базовое", removable = true), Chip("офис", removable = true)), onAdd = {}, wrap = true)
    // uncontrolled: выбор внутри группы и сегмента, «×» — отдельная кнопка
    SegmentControl(
        segments = listOf(Segment("day", "День"), Segment("week", "Неделя"), Segment("month", "Месяц")),
        defaultValue = "week",
        size = ControlSize.M,
    )
    ChipGroup(
        chips = listOf(Chip("Работа"), Chip("Прогулка"), Chip("Свидание"), Chip("Спорт")),
        defaultValue = listOf("Прогулка"),
        multiple = false,
    )
    ChipGroup(
        chips = listOf(Chip("базовое", removable = true), Chip("офис", removable = true)),
        defaultValue = listOf("офис"),
        onRemove = {},
        wrap = true,
    )
    var radio by remember { mutableStateOf("1990") }
    Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
        ListItem("Создать образ", icon = IconName.Collage, onClick = {})
        ListItem("Удалить", icon = IconName.Trash, onClick = {})
        ListItem("Верх", type = ListItemType.Expandable, icon = IconName.Top, expanded = true, onClick = {})
        listOf("1990", "1991").forEach { y -> ListItem(y, type = ListItemType.Radio, checked = radio == y, onClick = { radio = y }) }
        ListItem("Алекс", description = "alex@yeet.app", leading = { Avatar(initial = "А") })
    }
    ListGroup {
        ListItem("Корзина вещей", trailing = { Icon(IconName.ChevronRight, size = 20.dp) }, onClick = {})
        ListItem("Язык", trailing = { Icon(IconName.ExternalLink, size = 20.dp) }, onClick = {})
        ListItem("Поддержка", trailing = { Icon(IconName.ExternalLink, size = 20.dp) }, onClick = {})
    }
}
