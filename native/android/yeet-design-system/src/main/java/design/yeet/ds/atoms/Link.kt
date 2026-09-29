package design.yeet.ds.atoms

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.text.BasicText
import androidx.compose.material3.LocalContentColor
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews
import design.yeet.ds.theme.YeetTheme

/**
 * Ссылка внутри текста (React: `<Link href external>`): шрифт и цвет окружающего текста, подчёркивание.
 * Не кнопка: действие без адреса в интерфейсе — `Button(variant = ButtonStyle.Ghost)`.
 *
 * **Контексты:** юридическая подпись на входе («условиями» · «политикой конфиденциальности»), диалог удаления аккаунта, e-mail в Legal.
 *
 * Зона нажатия: ссылка стоит в строке текста, поэтому раскладку не раздвигает — касание рядом с короткой ссылкой
 * Compose доводит до 48 dp сам (`ViewConfiguration.minimumTouchTargetSize`). Отдельно стоящей ссылке можно передать
 * `Modifier.minimumInteractiveComponentSize()`.
 *
 * @param href адрес: открывается системным обработчиком (`LocalUriHandler`: браузер, почта, звонок). Внешние ссылки
 * на Android всегда уходят в другое приложение, поэтому `external` из веба не нужен.
 * @param onClick вместо `href` — своя навигация внутри приложения (экран «Условия»).
 * @param variant стиль окружающего текста: Body или Caption.
 * @param color `Unspecified` — цвет окружающего текста (LocalContentColor), как `color: inherit` в вебе.
 */
@Composable
fun Link(
    text: String,
    modifier: Modifier = Modifier,
    href: String? = null,
    onClick: (() -> Unit)? = null,
    variant: TextVariant = TextVariant.Body,
    color: Color = Color.Unspecified,
) {
    val uriHandler = LocalUriHandler.current
    val t = YeetTheme.typography
    val style = if (variant == TextVariant.Caption) t.caption else t.body
    val resolved = if (color != Color.Unspecified) color else LocalContentColor.current
    val action: (() -> Unit)? = onClick ?: href?.let { uri -> { uriHandler.openUri(uri) } }
    BasicText(
        text = text,
        modifier = if (action != null) {
            modifier.clickable(onClickLabel = LinkClickLabel, onClick = action)
        } else {
            modifier
        },
        style = style.merge(TextStyle(color = resolved, textDecoration = TextDecoration.Underline)),
    )
}

/** Что TalkBack говорит о действии ссылки: «Дважды нажмите, чтобы открыть ссылку». */
private const val LinkClickLabel = "открыть ссылку"

@YeetPreviews
@Composable
private fun LinkPreview() = YeetPreviewSurface {
    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        Text("Продолжая, ты принимаешь", variant = TextVariant.Caption, tone = TextTone.Secondary)
        Link("условия", href = "https://yeet.app/terms", variant = TextVariant.Caption, color = YeetTheme.colors.textSecondary)
    }
    Link("support@yeet.app", href = "mailto:support@yeet.app")
    Link("Политика конфиденциальности", onClick = {}, color = YeetTheme.colors.textAccent)
}
