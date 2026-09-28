package design.yeet.ds.molecules

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import design.yeet.ds.atoms.ButtonStyle
import design.yeet.ds.atoms.ColorDot
import design.yeet.ds.atoms.ControlSize
import design.yeet.ds.atoms.Icon
import design.yeet.ds.atoms.IconButton
import design.yeet.ds.atoms.IconButtonImpl
import design.yeet.ds.atoms.Text
import design.yeet.ds.icons.IconName
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews
import design.yeet.ds.theme.YeetTheme
import design.yeet.ds.theme.yeetFloatingShadow
import design.yeet.tokens.YeetItemColor
import design.yeet.tokens.inputBg

/* ─── Field ─────────────────────────────────────────────────────────── */

/** Поле ввода внутри [Field] (web: `input` — InputHTMLAttributes). */
data class FieldInput(
    val value: String,
    val onValueChange: (String) -> Unit,
    val keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    val keyboardActions: KeyboardActions = KeyboardActions.Default,
    val visualTransformation: VisualTransformation = VisualTransformation.None,
    val enabled: Boolean = true,
)

/** Высота строки в группе (Figma input-group · Size): M 48 / L 52 / XL 56. */
enum class InputGroupSize(val rowHeight: Dp) { M(48.dp), L(52.dp), XL(56.dp) }

internal val LocalInputGroupSize = staticCompositionLocalOf { InputGroupSize.XL }

private fun defaultTrailingLabel(icon: IconName): String = when (icon) {
    IconName.Eye -> "Показать пароль"
    IconName.EyeOff -> "Скрыть пароль"
    IconName.ChevronUpDown -> "Выбрать"
    IconName.ExternalLink -> "Открыть"
    IconName.Cross -> "Очистить"
    else -> icon.key
}

/**
 * Строка поля (Figma: `input` + `input-value`). Живёт внутри [InputGroup].
 * Три паттерна: ввод текста (`input`), «ключ — значение» с выбором в sheet (`value` + `ChevronUpDown`), пароль с глазом.
 *
 * @param label лейбл слева (grey). В режиме ввода — плейсхолдер и описание поля для TalkBack.
 * @param value выбранное значение справа (режим «ключ — значение»).
 * @param colorDot свотч цвета вещи перед значением.
 * @param trailingIcon `ChevronUpDown` — выбор, `Eye` — пароль, `ExternalLink` — ссылка.
 * @param trailingLabel описание кнопки справа для TalkBack (по умолчанию — по иконке: «Показать пароль»…).
 */
@Composable
fun Field(
    label: String,
    modifier: Modifier = Modifier,
    value: String? = null,
    colorDot: YeetItemColor? = null,
    trailingIcon: IconName? = null,
    onTrailingClick: (() -> Unit)? = null,
    trailingLabel: String? = null,
    input: FieldInput? = null,
    error: Boolean = false,
    onClick: (() -> Unit)? = null,
) {
    val c = YeetTheme.colors
    val body = YeetTheme.typography.body
    val rowHeight = LocalInputGroupSize.current.rowHeight
    val valueColor = if (error) c.textDanger else c.textPrimary
    Row(
        modifier
            .fillMaxWidth()
            .heightIn(min = rowHeight)
            .then(if (onClick != null) Modifier.clickable(role = Role.Button, onClick = onClick) else Modifier)
            .semantics { if (error) error("Ошибка") }
            .padding(horizontal = 20.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Row(Modifier.weight(1f), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            if (input != null) {
                BasicTextField(
                    value = input.value,
                    onValueChange = input.onValueChange,
                    modifier = Modifier.weight(1f).semantics { contentDescription = label },
                    enabled = input.enabled,
                    textStyle = body.merge(TextStyle(color = valueColor)),
                    keyboardOptions = input.keyboardOptions,
                    keyboardActions = input.keyboardActions,
                    visualTransformation = input.visualTransformation,
                    singleLine = true,
                    cursorBrush = SolidColor(c.accent),
                    decorationBox = { inner ->
                        Box(contentAlignment = Alignment.CenterStart) {
                            if (input.value.isEmpty()) Text(label, color = c.textSecondary, maxLines = 1)
                            inner()
                        }
                    },
                )
            } else {
                Text(label, color = c.textSecondary, modifier = if (value == null) Modifier.weight(1f) else Modifier)
            }
            if (value != null) {
                // значение прижато вправо (web: margin-left: auto): точка 16 → 12 → значение
                Row(
                    if (input == null) Modifier.weight(1f) else Modifier,
                    horizontalArrangement = Arrangement.spacedBy(12.dp, Alignment.End),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    if (colorDot != null) ColorDot(colorDot, size = 16.dp)
                    Text(value, color = valueColor, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
            }
        }
        if (trailingIcon != null) {
            val size = if (trailingIcon == IconName.ChevronUpDown) 20.dp else 24.dp
            if (onTrailingClick != null) {
                Box(
                    Modifier
                        .size(size)
                        .clickable(role = Role.Button, onClick = onTrailingClick)
                        .semantics { contentDescription = trailingLabel ?: defaultTrailingLabel(trailingIcon) },
                    contentAlignment = Alignment.Center,
                ) { Icon(trailingIcon, size = size) }
            } else {
                Icon(trailingIcon, size = size)
            }
        }
    }
}

/* ─── InputGroup ────────────────────────────────────────────────────── */

/** Группа полей на `inputBg`, радиус 20, строки разделены линией `divider`. Вход, детали вещи, настройки. */
@Composable
fun InputGroup(
    modifier: Modifier = Modifier,
    size: InputGroupSize = InputGroupSize.XL,
    content: @Composable () -> Unit,
) {
    val c = YeetTheme.colors
    CompositionLocalProvider(LocalInputGroupSize provides size) {
        DividedColumn(
            modifier = modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(YeetTheme.radius.lg))
                .background(c.inputBg),
            dividerColor = c.divider,
            content = content,
        )
    }
}

/* ─── InputBar ──────────────────────────────────────────────────────── */

/** Кнопка по краю [InputBar] (web: BarAction). */
data class BarAction(
    val icon: IconName,
    val label: String,
    val variant: ButtonStyle = ButtonStyle.Tertiary,
    val onClick: (() -> Unit)? = null,
)

/** Кнопка отправки внутри поля — чат со стилистом. */
data class SendAction(val label: String, val onClick: (() -> Unit)? = null)

/** L — 52 (поле поиска на экране), M — 48 (в шапке). */
enum class InputBarSize { M, L }

/**
 * Панель ввода: [кнопка] поле [кнопка].
 * **Контексты:** поиск («Назад» + поле + поиск по фото), чат со стилистом (поле + «Отправить» Primary), поиск по гардеробу.
 *
 * @param fieldIcon иконка внутри поля. Для поиска — `Search`, для чата — нет.
 * @param send чат: кнопка отправки 44 внутри поля (Primary, когда есть текст), поле 52 на подложке с тенью.
 */
@Composable
fun InputBar(
    placeholder: String,
    modifier: Modifier = Modifier,
    value: String = "",
    onChange: ((String) -> Unit)? = null,
    fieldIcon: IconName? = null,
    leading: BarAction? = null,
    trailing: BarAction? = null,
    send: SendAction? = null,
    size: InputBarSize = InputBarSize.M,
) {
    val c = YeetTheme.colors
    val shape = RoundedCornerShape(YeetTheme.radius.xl)
    val buttonSize = if (size == InputBarSize.L) ControlSize.L else ControlSize.M
    val chat = send != null
    val fieldHeight = if (chat || size == InputBarSize.L) 52.dp else 48.dp
    Row(modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
        if (leading != null) {
            IconButton(leading.icon, leading.label, onClick = { leading.onClick?.invoke() }, variant = leading.variant, size = buttonSize)
        }
        Row(
            Modifier
                .weight(1f)
                .heightIn(min = fieldHeight)
                .then(if (chat) Modifier.yeetFloatingShadow(shape) else Modifier)
                .background(if (chat) c.bgElevated else c.inputBg, shape)
                .padding(
                    start = if (size == InputBarSize.L && !chat) 16.dp else 20.dp,
                    end = if (chat) 4.dp else 20.dp,
                ),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (fieldIcon != null) Icon(fieldIcon, tint = c.textSecondary)
            BasicTextField(
                value = value,
                onValueChange = { onChange?.invoke(it) },
                modifier = Modifier.weight(1f).semantics { contentDescription = placeholder },
                readOnly = onChange == null,
                singleLine = true,
                textStyle = YeetTheme.typography.body.merge(TextStyle(color = c.textPrimary)),
                cursorBrush = SolidColor(c.accent),
                decorationBox = { inner ->
                    Box(contentAlignment = Alignment.CenterStart) {
                        if (value.isEmpty()) Text(placeholder, color = c.textSecondary, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        inner()
                    }
                },
            )
            // флоу Search / Text / Results: очистка «×» 20 серым, пока в поле есть текст
            if (value.isNotEmpty() && !chat) {
                Box(
                    Modifier
                        .size(20.dp)
                        .clickable(role = Role.Button) { onChange?.invoke("") }
                        .semantics { contentDescription = "Очистить" },
                ) { Icon(IconName.Cross, size = 20.dp, tint = c.textSecondary) }
            }
            if (send != null) {
                val hasText = value.isNotEmpty()
                IconButtonImpl(
                    icon = IconName.ArrowUp,
                    label = send.label,
                    onClick = { send.onClick?.invoke() },
                    variant = if (hasText) ButtonStyle.Primary else ButtonStyle.Tertiary,
                    size = ControlSize.S,
                    diameter = 44.dp,
                    iconSize = 24.dp,
                    enabled = hasText,
                    disabledAlpha = 1f,
                    contentColor = if (hasText) null else c.textSecondary,
                )
            }
        }
        if (trailing != null) {
            IconButton(trailing.icon, trailing.label, onClick = { trailing.onClick?.invoke() }, variant = trailing.variant, size = buttonSize)
        }
    }
}

@YeetPreviews
@Composable
private fun InputsPreview() = YeetPreviewSurface {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("secret") }
    var visible by remember { mutableStateOf(false) }
    InputGroup {
        Field(label = "Почта", input = FieldInput(email, { email = it }))
        Field(
            label = "Пароль",
            input = FieldInput(password, { password = it }, visualTransformation = if (visible) VisualTransformation.None else PasswordVisualTransformation()),
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
    InputBar(placeholder = "Спроси у стилиста", value = message, onChange = { message = it }, send = SendAction("Отправить"))
}
