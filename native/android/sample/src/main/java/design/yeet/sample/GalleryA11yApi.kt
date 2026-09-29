package design.yeet.sample

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import design.yeet.ds.atoms.Button
import design.yeet.ds.atoms.ButtonStyle
import design.yeet.ds.atoms.ControlSize
import design.yeet.ds.atoms.IconButton
import design.yeet.ds.atoms.Link
import design.yeet.ds.atoms.Stamp
import design.yeet.ds.atoms.StampDoneSize
import design.yeet.ds.atoms.Text
import design.yeet.ds.atoms.TextTone
import design.yeet.ds.atoms.TextVariant
import design.yeet.ds.icons.IconName
import design.yeet.ds.molecules.Chip
import design.yeet.ds.molecules.ChipGroup
import design.yeet.ds.molecules.Field
import design.yeet.ds.molecules.FieldInput
import design.yeet.ds.molecules.FormField
import design.yeet.ds.molecules.InputGroup
import design.yeet.ds.molecules.RadioList
import design.yeet.ds.molecules.RadioOption
import design.yeet.ds.molecules.Segment
import design.yeet.ds.molecules.SegmentControl
import design.yeet.ds.theme.YeetTheme
import kotlinx.coroutines.delay

/**
 * Витрина «Доступность + API» (web: Phase 4 atoms / molecules): Button `loading`, Link, Stamp `doneSize`,
 * uncontrolled SegmentControl / ChipGroup / RadioList, FormField, пароль с «глазом».
 */
@Composable
internal fun A11yApiSections() {
    Column(verticalArrangement = Arrangement.spacedBy(32.dp)) {
        A11ySection("Button · loading") { LoadingSection() }
        A11ySection("Link") { LinkSection() }
        A11ySection("Stamp · doneSize") { StampDoneSizeSection() }
        A11ySection("Uncontrolled: SegmentControl · ChipGroup") { UncontrolledSection() }
        A11ySection("RadioList") { RadioListSection() }
        A11ySection("FormField · пароль") { FormFieldSection() }
    }
}

@Composable
private fun A11ySection(title: String, content: @Composable ColumnScope.() -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(title, variant = TextVariant.H3)
        content()
    }
}

@Composable
private fun LoadingSection() {
    var loading by remember { mutableStateOf(false) }
    LaunchedEffect(loading) {
        if (loading) {
            delay(2000)
            loading = false
        }
    }
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
        Button("Войти", onClick = { loading = true }, loading = loading)
        Button("Сохранить", onClick = { loading = true }, variant = ButtonStyle.Tertiary, size = ControlSize.S, loading = loading)
        IconButton(IconName.ArrowUp, label = "Отправить", onClick = { loading = true }, variant = ButtonStyle.Primary, loading = loading)
        IconButton(IconName.More, label = "Ещё", onClick = {}, size = ControlSize.S)
    }
}

@Composable
private fun LinkSection() {
    Row(horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically) {
        Text("Продолжая, ты принимаешь", variant = TextVariant.Caption, tone = TextTone.Secondary)
        Link("условия", href = "https://yeet.app/terms", variant = TextVariant.Caption, color = YeetTheme.colors.textSecondary)
    }
    Link("support@yeet.app", href = "mailto:support@yeet.app")
}

@Composable
private fun StampDoneSizeSection() {
    var done by remember { mutableStateOf(false) }
    Row(horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
        Stamp(label = "Надеть", onClick = { done = !done }, done = done, doneSize = StampDoneSize.S)
        Text(if (done) "S: сжат до 56" else "Нажми — сожмётся до 56", tone = TextTone.Secondary)
    }
}

@Composable
private fun UncontrolledSection() {
    var last by remember { mutableStateOf("—") }
    SegmentControl(
        segments = listOf(Segment("day", "День"), Segment("week", "Неделя"), Segment("month", "Месяц")),
        defaultValue = "week",
        onChange = { last = "Сегмент: $it" },
        size = ControlSize.M,
    )
    ChipGroup(
        chips = listOf(Chip("Работа"), Chip("Прогулка"), Chip("Свидание"), Chip("Спорт")),
        defaultValue = listOf("Прогулка"),
        onValueChange = { last = "Повод: ${it.joinToString().ifEmpty { "нет" }}" },
        multiple = false,
    )
    var tags by remember { mutableStateOf(listOf("базовое", "офис", "лето")) }
    ChipGroup(
        chips = tags.map { Chip(it, removable = true) },
        defaultValue = listOf("офис"),
        onValueChange = { last = "Теги: ${it.joinToString().ifEmpty { "нет" }}" },
        onRemove = { id -> tags = tags - id },
        wrap = true,
    )
    Text(last, variant = TextVariant.Caption, tone = TextTone.Secondary)
}

@Composable
private fun RadioListSection() {
    RadioList(
        options = listOf(
            RadioOption("rub", "Рубль", trailing = { Text("₽ · RUB", tone = TextTone.Secondary) }),
            RadioOption("usd", "Доллар", trailing = { Text("$ · USD", tone = TextTone.Secondary) }),
            RadioOption("eur", "Евро", trailing = { Text("€ · EUR", tone = TextTone.Secondary) }),
        ),
        defaultValue = "rub",
        label = "Валюта",
    )
}

@Composable
private fun FormFieldSection() {
    var email by remember { mutableStateOf("") }
    var submitted by remember { mutableStateOf(false) }
    val invalid = submitted && !email.contains('@')
    FormField(
        label = "Почта",
        description = "Пришлём код для входа",
        error = if (invalid) "Проверьте адрес" else null,
        required = true,
    ) {
        InputGroup {
            Field(label = "Почта", input = FieldInput(email, { email = it }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)))
        }
    }
    var password by remember { mutableStateOf("") }
    FormField(label = "Пароль", hideLabel = true, description = "Не меньше 8 символов") {
        InputGroup {
            Field(label = "Пароль", input = FieldInput(password, { password = it }, password = true))
        }
    }
    Button("Продолжить", onClick = { submitted = true }, fullWidth = true, size = ControlSize.L)
}
