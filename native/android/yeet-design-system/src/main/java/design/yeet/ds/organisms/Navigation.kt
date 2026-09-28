package design.yeet.ds.organisms

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import design.yeet.ds.atoms.Button
import design.yeet.ds.atoms.ButtonStyle
import design.yeet.ds.atoms.ControlSize
import design.yeet.ds.atoms.Icon
import design.yeet.ds.atoms.IconButton
import design.yeet.ds.atoms.Text
import design.yeet.ds.atoms.TextTone
import design.yeet.ds.atoms.TextVariant
import design.yeet.ds.icons.IconName
import design.yeet.ds.molecules.BarAction
import design.yeet.ds.molecules.Chip
import design.yeet.ds.molecules.ChipGroup
import design.yeet.ds.molecules.InputBar
import design.yeet.ds.molecules.rememberSlidingPill
import design.yeet.ds.molecules.slidingPill
import design.yeet.ds.molecules.slidingPillItem
import design.yeet.ds.theme.ScrollEdgePosition
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews
import design.yeet.ds.theme.YeetTheme
import design.yeet.ds.theme.scrollEdgeFade
import design.yeet.ds.theme.yeetFloatingShadow
import design.yeet.tokens.YeetHapticEvent
import design.yeet.tokens.buttonTertiaryBg
import design.yeet.tokens.tabBarBg

/* ─── Header ────────────────────────────────────────────────────────── */

/** Действие-иконка в шапке и нижней панели (web: Action). */
data class HeaderAction(val icon: IconName, val label: String, val onClick: (() -> Unit)? = null)

/** Текстовое действие («Пропустить») или акцентная строка заголовка. */
data class HeaderTextAction(val label: String, val onClick: (() -> Unit)? = null)

/**
 * Figma header · Type. Варианты выбираются по роли в контексте:
 *
 * | Type | Где |
 * |---|---|
 * | `Large` | Корневые вкладки: Гардероб, Стилист, Профиль, Поиск |
 * | `Bar` | Новая вещь, Архив, Корзина, детали вещи и образа, создание образа |
 * | `Back` | Вход, восстановление пароля, онбординг |
 * | `Search` | Поиск, результаты, поиск по гардеробу |
 */
sealed interface HeaderType {
    /**
     * H1 + действие справа (+ подзаголовок).
     * @param accent вторая строка H1 акцентом с раскрывашкой: «на каждый день ⇕» (выбор повода на главной).
     */
    data class Large(
        val title: String,
        val subtitle: String? = null,
        val accent: HeaderTextAction? = null,
        val action: HeaderAction? = null,
    ) : HeaderType

    /**
     * «Назад» + title-chip (Button M Tertiary) + до 2 действий.
     * @param title заголовок простым текстом по центру (Настройки).
     * @param titleChipSub вторая строка в пилюле заголовка: «8-13 сент · 5 ночей».
     * @param center вместо чипа: шаги создания образа (SegmentControl S с иконками).
     */
    data class Bar(
        val title: String? = null,
        val titleChip: String? = null,
        val titleChipSub: String? = null,
        val onBack: (() -> Unit)? = null,
        val actions: List<HeaderAction> = emptyList(),
        val center: (@Composable () -> Unit)? = null,
    ) : HeaderType

    /** «Назад» (+ «Пропустить» Ghost) и H1 ниже. */
    data class Back(
        val title: String,
        val onBack: (() -> Unit)? = null,
        val textAction: HeaderTextAction? = null,
    ) : HeaderType

    /** InputBar (назад + поле + поиск по фото) + фильтры-дропдауны. */
    data class Search(
        val query: String = "",
        val placeholder: String = "Уточните текстом",
        val onBack: (() -> Unit)? = null,
        val onQueryChange: ((String) -> Unit)? = null,
        val filters: List<Chip>? = null,
    ) : HeaderType
}

/**
 * Закреплённая шапка экрана: отступ под статус-бар (WindowInsets), сплошная подложка `bgCanvas`
 * и полоса затухания 24 снизу — контент скроллится под шапку и плавно гаснет.
 * Ставьте шапку **поверх** скроллящегося контента (после него в Box), с `contentPadding` сверху.
 *
 * React: `<Header type="large" title="Гардероб" />` → `Header(HeaderType.Large(title = "Гардероб"))`.
 */
@Composable
fun Header(
    type: HeaderType,
    modifier: Modifier = Modifier,
    statusBarPadding: Boolean = true,
) {
    val c = YeetTheme.colors
    Column(
        modifier
            .fillMaxWidth()
            .scrollEdgeFade(ScrollEdgePosition.Top, 24.dp, c.bgCanvas)
            .background(c.bgCanvas)
            .then(if (statusBarPadding) Modifier.windowInsetsPadding(WindowInsets.statusBars) else Modifier)
            .padding(start = 20.dp, end = 20.dp, top = 8.dp),
    ) {
        when (type) {
            is HeaderType.Large -> LargeHeader(type)
            is HeaderType.Bar -> BarHeader(type)
            is HeaderType.Back -> BackHeader(type)
            is HeaderType.Search -> SearchHeader(type)
        }
    }
}

@Composable
private fun LargeHeader(h: HeaderType.Large) {
    val c = YeetTheme.colors
    Row(
        Modifier.fillMaxWidth().heightIn(min = if (h.action != null) 48.dp else 36.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(h.title, variant = TextVariant.H1, modifier = Modifier.weight(1f))
        if (h.action != null) IconButton(h.action.icon, h.action.label, onClick = { h.action.onClick?.invoke() })
    }
    if (h.accent != null) {
        Row(
            Modifier.clickable(role = Role.Button) { h.accent.onClick?.invoke() },
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(h.accent.label, variant = TextVariant.H1, color = c.textAccent, heading = false)
            Icon(IconName.ChevronUpDown, size = 20.dp, tint = c.textAccent)
        }
    }
    if (h.subtitle != null) {
        // флоу: подзаголовок через 12 от заголовка
        Spacer(Modifier.height(12.dp))
        Text(h.subtitle, tone = TextTone.Secondary)
        Spacer(Modifier.height(4.dp))
    }
}

@Composable
private fun BarHeader(h: HeaderType.Bar) {
    val c = YeetTheme.colors
    // три колонки: боковые поровну, центр по ширине содержимого — заголовок по центру экрана
    Row(Modifier.fillMaxWidth().heightIn(min = 48.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.weight(1f), contentAlignment = Alignment.CenterStart) {
            IconButton(IconName.ChevronLeft, "Назад", onClick = { h.onBack?.invoke() })
        }
        Box(contentAlignment = Alignment.Center) {
            when {
                h.center != null -> h.center.invoke()
                h.titleChip != null && h.titleChipSub != null -> Column(
                    Modifier
                        .heightIn(min = 48.dp)
                        .background(c.buttonTertiaryBg, RoundedCornerShape(YeetTheme.radius.xl))
                        .padding(horizontal = 20.dp, vertical = 4.dp)
                        .semantics(mergeDescendants = true) { heading() },
                    verticalArrangement = Arrangement.Center,
                ) {
                    Text(h.titleChip, maxLines = 1, heading = false)
                    Text(h.titleChipSub, variant = TextVariant.Caption, tone = TextTone.Secondary, maxLines = 1)
                }
                h.titleChip != null -> Box(
                    Modifier
                        .heightIn(min = 48.dp)
                        .background(c.buttonTertiaryBg, RoundedCornerShape(YeetTheme.radius.xl))
                        .padding(horizontal = 20.dp),
                    contentAlignment = Alignment.Center,
                ) { Text(h.titleChip, maxLines = 1, overflow = TextOverflow.Ellipsis, heading = true) }
                h.title != null -> Text(h.title, maxLines = 1, overflow = TextOverflow.Ellipsis, heading = true)
            }
        }
        Row(Modifier.weight(1f), horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End)) {
            h.actions.take(2).forEach { a -> IconButton(a.icon, a.label, onClick = { a.onClick?.invoke() }) }
        }
    }
    Spacer(Modifier.height(8.dp))
}

@Composable
private fun BackHeader(h: HeaderType.Back) {
    Row(
        Modifier.fillMaxWidth().heightIn(min = 48.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(IconName.ChevronLeft, "Назад", onClick = { h.onBack?.invoke() })
        if (h.textAction != null) {
            Button(h.textAction.label, onClick = { h.textAction.onClick?.invoke() }, variant = ButtonStyle.Ghost, size = ControlSize.M)
        }
    }
    Spacer(Modifier.height(20.dp))
    Text(h.title, variant = TextVariant.H1)
    Spacer(Modifier.height(4.dp))
}

@Composable
private fun SearchHeader(h: HeaderType.Search) {
    InputBar(
        placeholder = h.placeholder,
        value = h.query,
        onChange = h.onQueryChange,
        fieldIcon = IconName.Search,
        leading = BarAction(IconName.ChevronLeft, "Назад", onClick = h.onBack),
        trailing = BarAction(IconName.ImageAdd, "Поиск по фото"),
    )
    if (h.filters != null) {
        // поиск: фильтры на 20 ниже поля
        Spacer(Modifier.height(20.dp))
        ChipGroup(chips = h.filters.map { it.copy(dropdown = true) })
    }
    Spacer(Modifier.height(8.dp))
}

/* ─── TabBar & BottomNav ────────────────────────────────────────────── */

/** Вкладки основной навигации. У «Профиля» вместо иконки — кружок с буквой (`initial`). */
enum class Tab(val label: String, val icon: IconName?) {
    Today("Сегодня", IconName.Home),
    Search("Поиск", IconName.SearchByImage),
    Wardrobe("Гардероб", IconName.Wardrobe),
    Stylist("Стилист", IconName.Ai),
    Profile("Профиль", null),
}

/**
 * Плавающий таб-бар 56: 5 вкладок-иконок без подписей, радиус 48, тень `floating`.
 * Под активной вкладкой — пилюля `bgSubtle`, которая переезжает (`nav`); неактивные иконки серые.
 */
@Composable
fun TabBar(
    active: Tab,
    modifier: Modifier = Modifier,
    initial: String = "С",
    onChange: ((Tab) -> Unit)? = null,
) {
    val c = YeetTheme.colors
    val motion = YeetTheme.motion
    val haptics = YeetTheme.haptics
    val shape = RoundedCornerShape(YeetTheme.radius.bar)
    val pill = rememberSlidingPill(Tab.entries.indexOf(active))
    Row(
        modifier
            .height(56.dp)
            .yeetFloatingShadow(shape)
            .background(c.tabBarBg, shape)
            .padding(4.dp)
            .slidingPill(pill, c.bgSubtle, YeetTheme.radius.xl)
            .selectableGroup(),
        horizontalArrangement = Arrangement.spacedBy(3.dp),
    ) {
        Tab.entries.forEachIndexed { i, tab ->
            val selected = tab == active
            val color by animateColorAsState(if (selected) c.textPrimary else c.textSecondary, motion.fade(), label = "tabColor")
            Box(
                Modifier
                    .slidingPillItem(pill, i)
                    .weight(1f)
                    .fillMaxHeight()
                    .selectable(
                        selected = selected,
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null,
                        role = Role.Tab,
                        onClick = {
                            if (!selected) {
                                haptics.perform(YeetHapticEvent.Select)
                                onChange?.invoke(tab)
                            }
                        },
                    )
                    .semantics { contentDescription = tab.label },
                contentAlignment = Alignment.Center,
            ) {
                if (tab.icon != null) {
                    Icon(tab.icon, tint = color)
                } else {
                    // флоу: кружок 20 с обводкой 1.3 и буквой Roboto Slab 14 (размер не масштабируется — подпись озвучивается)
                    val fontSize = with(LocalDensity.current) { 14.dp.toSp() }
                    Box(
                        Modifier.size(20.dp).border(1.3.dp, color, CircleShape).clearAndSetSemantics { },
                        contentAlignment = Alignment.Center,
                    ) {
                        BasicText(
                            initial,
                            style = TextStyle(
                                fontFamily = YeetTheme.typography.display,
                                fontWeight = FontWeight(500),
                                fontSize = fontSize,
                                lineHeight = fontSize,
                                color = color,
                                textAlign = TextAlign.Center,
                            ),
                            maxLines = 1,
                        )
                    }
                }
            }
        }
    }
}

/**
 * Нижняя навигация: [TabBar] (+ FAB «+» на экранах с добавлением) на подложке с затуханием 40 сверху, отступ снизу 20.
 * При появлении FAB таб-бар сжимается и уступает место кнопке — `nav` (quick, 744 мс).
 * **Контексты:** все корневые вкладки; FAB — Гардероб и Вишлист.
 */
@Composable
fun BottomNav(
    active: Tab,
    modifier: Modifier = Modifier,
    fab: Boolean = false,
    initial: String = "С",
    onFab: (() -> Unit)? = null,
    onTabChange: ((Tab) -> Unit)? = null,
    navigationBarPadding: Boolean = true,
) {
    val c = YeetTheme.colors
    val progress by animateFloatAsState(if (fab) 1f else 0f, YeetTheme.motion.nav(), label = "fab")
    val p = progress.coerceAtLeast(0f)
    Row(
        modifier
            .fillMaxWidth()
            .scrollEdgeFade(ScrollEdgePosition.Bottom, 40.dp, c.bgCanvas)
            .background(c.bgCanvas)
            .then(if (navigationBarPadding) Modifier.windowInsetsPadding(WindowInsets.navigationBars) else Modifier)
            .padding(start = 20.dp, end = 20.dp, bottom = 20.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        TabBar(active, Modifier.weight(1f), initial = initial, onChange = onTabChange)
        if (p > 0.001f) {
            Spacer(Modifier.width(7.dp * p.coerceAtMost(1f)))
            Box(Modifier.width(56.dp * p), contentAlignment = Alignment.CenterEnd) {
                Box(Modifier.graphicsLayer { val s = 0.4f + 0.6f * p; scaleX = s; scaleY = s; alpha = p.coerceIn(0f, 1f) }) {
                    IconButton(IconName.Plus, "Добавить", onClick = { onFab?.invoke() }, variant = ButtonStyle.Primary, size = ControlSize.XL, floating = true, enabled = fab)
                }
            }
        }
    }
}

/**
 * Закреплённая нижняя кнопка (CTA) поверх контента: «Добавить», «Создать образ», «Переместить в гардероб».
 * Справа опционально — вторичное действие `IconButton Secondary L`. Затухание 24 сверху.
 */
@Composable
fun BottomBar(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    secondary: HeaderAction? = null,
    enabled: Boolean = true,
    navigationBarPadding: Boolean = true,
) {
    val c = YeetTheme.colors
    Row(
        modifier
            .fillMaxWidth()
            .scrollEdgeFade(ScrollEdgePosition.Bottom, 24.dp, c.bgCanvas)
            .background(c.bgCanvas)
            .then(if (navigationBarPadding) Modifier.windowInsetsPadding(WindowInsets.navigationBars) else Modifier)
            .padding(start = 20.dp, end = 20.dp, bottom = 20.dp),
        horizontalArrangement = Arrangement.spacedBy(7.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Button(label, onClick = onClick, modifier = Modifier.weight(1f), variant = ButtonStyle.Primary, size = ControlSize.L, fullWidth = true, enabled = enabled)
        if (secondary != null) {
            IconButton(secondary.icon, secondary.label, onClick = { secondary.onClick?.invoke() }, variant = ButtonStyle.Secondary, size = ControlSize.L)
        }
    }
}

@YeetPreviews
@Composable
private fun NavigationPreview() = YeetPreviewSurface {
    Header(HeaderType.Large(title = "Гардероб", action = HeaderAction(IconName.More, "Ещё")), statusBarPadding = false)
    Header(HeaderType.Large(title = "Твои образы", accent = HeaderTextAction("на каждый день")), statusBarPadding = false)
    Header(HeaderType.Bar(titleChip = "Архив вещей", actions = listOf(HeaderAction(IconName.More, "Ещё"))), statusBarPadding = false)
    Header(HeaderType.Bar(titleChip = "Тбилиси", titleChipSub = "8-13 сент · 5 ночей"), statusBarPadding = false)
    Header(HeaderType.Back(title = "Вход и регистрация", textAction = HeaderTextAction("Пропустить")), statusBarPadding = false)
    Header(HeaderType.Search(query = "Белая рубашка", filters = listOf(Chip("Цена"), Chip("Сортировка"))), statusBarPadding = false)
    var tab by remember { mutableStateOf(Tab.Wardrobe) }
    BottomNav(active = tab, fab = tab == Tab.Wardrobe, onTabChange = { tab = it }, navigationBarPadding = false)
    BottomBar(label = "Создать образ", onClick = {}, secondary = HeaderAction(IconName.ArrowsShuffle, "Перемешать"), navigationBarPadding = false)
}
