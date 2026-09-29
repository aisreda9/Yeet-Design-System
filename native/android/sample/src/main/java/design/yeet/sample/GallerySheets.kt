package design.yeet.sample

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.unit.dp
import design.yeet.ds.atoms.Button
import design.yeet.ds.atoms.ButtonStyle
import design.yeet.ds.atoms.ControlSize
import design.yeet.ds.atoms.Text
import design.yeet.ds.atoms.TextTone
import design.yeet.ds.molecules.Chip
import design.yeet.ds.molecules.ChipGroup
import design.yeet.ds.molecules.InputBar
import design.yeet.ds.molecules.ListItem
import design.yeet.ds.molecules.ListItemType
import design.yeet.ds.organisms.Dialog
import design.yeet.ds.organisms.FooterAction
import design.yeet.ds.organisms.Overlay
import design.yeet.ds.organisms.Sheet

/** Случаи единого правила шторки (design/SHEETS-AUDIT.md, #58), которые проверяются руками на устройстве. */
private enum class SheetCase { None, Long, Description, Search, LongLabels, Notice, NoTitle }

private val Countries = listOf(
    "Армения", "Беларусь", "Грузия", "Казахстан", "Кыргызстан", "Молдова", "Россия", "Сербия", "Таджикистан", "Турция",
    "Узбекистан", "Черногория", "Германия", "Испания", "Италия", "Португалия", "Франция", "Кипр", "ОАЭ", "Таиланд",
)

/**
 * Витрина шторок: длинная шторка (прокрутка только тела, верх — статус-бар + 8, шапка и футер на месте),
 * описание, поле над клавиатурой, длинные подписи кнопок (столбец), уведомление с одной кнопкой, шторка без заголовка.
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun SheetRulesSection() {
    var case by rememberSaveable { mutableStateOf(SheetCase.None) }
    val close = { case = SheetCase.None }

    Text("Смахивание из тела — только когда список в самом начале; с хэндла и футера — всегда.", tone = TextTone.Secondary)
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        listOf(
            "Длинная" to SheetCase.Long,
            "С описанием" to SheetCase.Description,
            "Поиск (IME)" to SheetCase.Search,
            "Длинные кнопки" to SheetCase.LongLabels,
            "Уведомление" to SheetCase.Notice,
            "Без заголовка" to SheetCase.NoTitle,
        ).forEach { (label, value) ->
            Button(label, onClick = { case = value }, variant = ButtonStyle.Tertiary, size = ControlSize.S)
        }
    }

    Overlay(visible = case == SheetCase.Long, onClose = close) {
        var country by remember { mutableStateOf("Россия") }
        Sheet(title = "Страна", footer = FooterAction("Отмена", onClick = close) to FooterAction("Готово", onClick = close)) {
            Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
                Countries.forEach { name ->
                    ListItem(name, type = ListItemType.Radio, checked = country == name, onClick = { country = name })
                }
            }
        }
    }
    Overlay(visible = case == SheetCase.Description, onClose = close) {
        var currency by remember { mutableStateOf("₽") }
        Sheet(title = "Валюта", description = "Цены вещей пересчитаются по курсу на сегодня") {
            Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
                listOf("₽ Рубль", "$ Доллар", "€ Евро").forEach { name ->
                    val key = name.take(1)
                    ListItem(name, type = ListItemType.Radio, checked = currency == key, onClick = { currency = key })
                }
            }
        }
    }
    Overlay(visible = case == SheetCase.Search, onClose = close) {
        var query by remember { mutableStateOf("") }
        Sheet(title = "Свой повод") {
            InputBar(placeholder = "Например, свидание", value = query, onChange = { query = it })
            ChipGroup(chips = listOf(Chip("Работа"), Chip("Свидание"), Chip("Прогулка"), Chip("Театр"), Chip("Путешествие")))
        }
    }
    Overlay(visible = case == SheetCase.LongLabels, onClose = close) {
        Sheet(
            title = "Фильтры",
            onClose = close,
            footer = FooterAction("Сбросить все фильтры", onClick = close) to FooterAction("Показать 128 вещей", onClick = close),
        ) {
            ChipGroup(chips = listOf(Chip("Верх", selected = true), Chip("Низ"), Chip("Обувь"), Chip("Аксессуары")), wrap = true)
        }
    }
    Overlay(visible = case == SheetCase.Notice, onClose = close) {
        Dialog(title = "Готово!", description = "Образ сохранён в календарь на завтра", cancel = null, confirm = "Ок!", onConfirm = close)
    }
    Overlay(visible = case == SheetCase.NoTitle, onClose = close) {
        Sheet(label = "Фото профиля") {
            Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
                ListItem("Сделать фото", onClick = close)
                ListItem("Выбрать из галереи", onClick = close)
            }
        }
    }
}
