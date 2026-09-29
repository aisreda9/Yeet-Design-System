package design.yeet.ds.molecules

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import design.yeet.ds.atoms.Text
import design.yeet.ds.atoms.TextTone
import design.yeet.ds.atoms.TextVariant
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews

/* ─── FormField ─────────────────────────────────────────────────────── */

/** Что [FormField] сообщает вложенному [Field] (web: `aria-labelledby`, `aria-invalid` + текст ошибки). */
internal class FormFieldState(val a11yLabel: String, val error: String?)

internal val LocalFormField = compositionLocalOf<FormFieldState?> { null }

/**
 * Что [FormField] передаёт своему полю (web: `FormFieldControlProps`). `Field` внутри FormField получает это сам;
 * для своего поля (не `Field`) повесьте [modifier] на узел ввода — имя для TalkBack и ошибка в семантике (`error()`).
 *
 * @param label имя поля для TalkBack (с «обязательное поле», если `required`).
 * @param error текст ошибки или `null`.
 */
class FormFieldControl internal constructor(
    val label: String,
    val error: String?,
    val modifier: Modifier,
)

/**
 * Обёртка поля формы (React: `<FormField label hideLabel description error required>`): лейбл над полем, подсказка
 * и текст ошибки под ним. Само поле не рисует: внутри — `Field` в `InputGroup`, `InputBar` и т. п.
 *
 * ```kotlin
 * FormField(label = "Почта", description = "Пришлём код для входа", error = if (bad) "Проверьте адрес" else null) {
 *     InputGroup { Field(label = "Почта", input = FieldInput(email, { email = it })) }
 * }
 * ```
 * Для TalkBack: поле озвучивается именем [label] (видимый лейбл не дублируется), ошибка — через `error()` в семантике
 * поля и объявляется при появлении (live region, как `aria-live="polite"`), подсказка читается следом за полем.
 * **Контексты:** вход и регистрация (почта, пароль с ошибкой), профиль (имя), новая вещь (название, цена).
 *
 * @param hideLabel лейбл только для TalkBack — когда плейсхолдер в `Field` уже говорит, что вводить (вход, поиск).
 * @param description подсказка под полем: «Мы пришлём код на эту почту».
 * @param error текст ошибки; `null` или пустая строка — ошибки нет.
 * @param required обязательное поле: к имени для TalkBack добавляется «обязательное поле» (в Compose нет `aria-required`).
 */
@Composable
fun FormField(
    label: String,
    modifier: Modifier = Modifier,
    description: String? = null,
    error: String? = null,
    required: Boolean = false,
    hideLabel: Boolean = false,
    content: @Composable (control: FormFieldControl) -> Unit,
) {
    val errorText = error?.takeIf { it.isNotEmpty() }
    val a11yLabel = if (required) "$label, обязательное поле" else label
    Column(modifier.fillMaxWidth()) {
        if (!hideLabel) {
            // видимый лейбл; для TalkBack имя несёт само поле — не читаем дважды
            Text(
                label,
                modifier = Modifier.padding(horizontal = 20.dp).clearAndSetSemantics { },
                variant = TextVariant.Caption,
                tone = TextTone.Secondary,
            )
            Spacer(Modifier.height(8.dp))
        }
        CompositionLocalProvider(LocalFormField provides FormFieldState(a11yLabel, errorText)) {
            content(FormFieldControl(a11yLabel, errorText, formControlSemantics(a11yLabel, errorText)))
        }
        if (description != null) {
            Spacer(Modifier.height(8.dp))
            Text(description, modifier = Modifier.padding(horizontal = 20.dp), variant = TextVariant.Caption, tone = TextTone.Secondary)
        }
        // live region живёт всё время: ошибка, появившаяся после отправки, объявляется
        Column(Modifier.semantics(mergeDescendants = true) { liveRegion = LiveRegionMode.Polite }) {
            if (errorText != null) {
                Spacer(Modifier.height(8.dp))
                Text(errorText, modifier = Modifier.padding(horizontal = 20.dp), variant = TextVariant.Caption, tone = TextTone.Danger)
            }
        }
    }
}

/** Семантика узла ввода: имя и ошибка. */
private fun formControlSemantics(label: String, errorText: String?): Modifier = Modifier.semantics {
    contentDescription = label
    if (errorText != null) error(errorText)
}

@YeetPreviews
@Composable
private fun FormFieldPreview() = YeetPreviewSurface {
    var email by remember { mutableStateOf("sasha@") }
    FormField(label = "Почта", description = "Пришлём код для входа", error = "Проверьте адрес", required = true) {
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
}
