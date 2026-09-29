package design.yeet.ds.molecules

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import design.yeet.ds.atoms.Text
import design.yeet.ds.atoms.TextTone
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews

/* ─── RadioList ─────────────────────────────────────────────────────── */

/**
 * Вариант [RadioList] (web: `RadioOption`).
 * @param trailing элемент справа, как `ListItem(trailing)`: флаг страны, код валюты «₽ · RUB» серым.
 */
class RadioOption(
    val value: String,
    val label: String,
    val trailing: (@Composable () -> Unit)? = null,
)

/**
 * Одиночный выбор строками `ListItem(type = ListItemType.Radio)` (Figma: list-item · Type=Radio) в колонке с gap 20.
 * Для TalkBack — группа (`selectableGroup`) строк `Role.RadioButton` с состоянием «выбрано»; стрелки клавиатуры
 * и D-pad двигают фокус между строками сами (в вебе это делает roving tabindex).
 *
 * Controlled: выбор снаружи (`value` + `onChange`). Uncontrolled — перегрузка с `defaultValue`.
 * **Контексты:** год рождения, пол, страна (с флагом), валюта (с кодом справа).
 *
 * @param value выбранное значение; `null` — ничего не выбрано.
 * @param label имя группы для TalkBack: «Год рождения», «Страна» (web: `aria-label` у radiogroup).
 */
@Composable
fun RadioList(
    options: List<RadioOption>,
    value: String?,
    onChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String? = null,
) {
    Column(
        modifier
            .fillMaxWidth()
            .then(if (label != null) Modifier.semantics { contentDescription = label } else Modifier)
            .selectableGroup(),
        verticalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        options.forEach { o ->
            ListItem(
                label = o.label,
                type = ListItemType.Radio,
                checked = o.value == value,
                trailing = o.trailing,
                onClick = { if (o.value != value) onChange(o.value) },
            )
        }
    }
}

/**
 * Uncontrolled [RadioList] (web: `defaultValue`): выбор хранится внутри (`rememberSaveable`), о смене сообщает [onChange].
 * @param defaultValue начальный выбор; `null` — ничего не выбрано.
 */
@Composable
fun RadioList(
    options: List<RadioOption>,
    modifier: Modifier = Modifier,
    defaultValue: String? = null,
    onChange: ((String) -> Unit)? = null,
    label: String? = null,
) {
    var current by rememberSaveable { mutableStateOf(defaultValue) }
    RadioList(
        options = options,
        value = current,
        onChange = { v ->
            current = v
            onChange?.invoke(v)
        },
        modifier = modifier,
        label = label,
    )
}

@YeetPreviews
@Composable
private fun RadioListPreview() = YeetPreviewSurface {
    var year by remember { mutableStateOf<String?>("1991") }
    RadioList(
        options = listOf("1990", "1991", "1992").map { RadioOption(it, it) },
        value = year,
        onChange = { year = it },
        label = "Год рождения",
    )
    RadioList(
        options = listOf(
            RadioOption("rub", "Рубль", trailing = { Text("₽ · RUB", tone = TextTone.Secondary) }),
            RadioOption("usd", "Доллар", trailing = { Text("$ · USD", tone = TextTone.Secondary) }),
        ),
        defaultValue = "rub",
        label = "Валюта",
    )
}
