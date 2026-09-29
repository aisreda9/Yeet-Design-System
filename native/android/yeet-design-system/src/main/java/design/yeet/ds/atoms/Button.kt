package design.yeet.ds.atoms

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.sizeIn
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.minimumInteractiveComponentSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import design.yeet.ds.icons.IconName
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews
import design.yeet.ds.theme.YeetTheme
import design.yeet.ds.theme.yeetFloatingShadow
import design.yeet.tokens.YeetColorScheme
import design.yeet.tokens.YeetGesture
import design.yeet.tokens.buttonDestructiveBg
import design.yeet.tokens.buttonDestructiveFg
import design.yeet.tokens.buttonGhostBg
import design.yeet.tokens.buttonGhostFg
import design.yeet.tokens.buttonInverseBg
import design.yeet.tokens.buttonInverseFg
import design.yeet.tokens.buttonPrimaryBg
import design.yeet.tokens.buttonPrimaryFg
import design.yeet.tokens.buttonSecondaryBg
import design.yeet.tokens.buttonSecondaryFg
import design.yeet.tokens.buttonSoftBg
import design.yeet.tokens.buttonSoftFg
import design.yeet.tokens.buttonTertiaryBg
import design.yeet.tokens.buttonTertiaryFg

/** Семантический стиль кнопки (Figma: Style). Один `Primary` на экран; удаление — всегда `Destructive`. */
enum class ButtonStyle { Primary, Secondary, Tertiary, Inverse, Ghost, Soft, Destructive }

/** Шкала размеров кнопок, сегментов и иконок-кнопок (Figma: Size). */
enum class ControlSize(val height: Dp, val horizontalPadding: Dp, val gap: Dp) {
    S(40.dp, 12.dp, 8.dp),
    M(48.dp, 16.dp, 8.dp),
    L(52.dp, 20.dp, 12.dp),
    XL(56.dp, 24.dp, 12.dp),
}

/** Фон и цвет содержимого стиля (web: --button-*-bg / --button-*-fg). */
fun ButtonStyle.background(c: YeetColorScheme): Color = when (this) {
    ButtonStyle.Primary -> c.buttonPrimaryBg
    ButtonStyle.Secondary -> c.buttonSecondaryBg
    ButtonStyle.Tertiary -> c.buttonTertiaryBg
    ButtonStyle.Inverse -> c.buttonInverseBg
    ButtonStyle.Ghost -> c.buttonGhostBg
    ButtonStyle.Soft -> c.buttonSoftBg
    ButtonStyle.Destructive -> c.buttonDestructiveBg
}

fun ButtonStyle.content(c: YeetColorScheme): Color = when (this) {
    ButtonStyle.Primary -> c.buttonPrimaryFg
    ButtonStyle.Secondary -> c.buttonSecondaryFg
    ButtonStyle.Tertiary -> c.buttonTertiaryFg
    ButtonStyle.Inverse -> c.buttonInverseFg
    ButtonStyle.Ghost -> c.buttonGhostFg
    ButtonStyle.Soft -> c.buttonSoftFg
    ButtonStyle.Destructive -> c.buttonDestructiveFg
}

/**
 * Общая поверхность нажимаемых элементов: фон по стилю, сжатие при нажатии (press 0.97, 150 мс),
 * смена цвета (select), disabled 40 %, фокус-обводка accent, без ripple.
 * Семантика нажатия: `toggled` — переключатель (`toggleable`: чипс, в вебе `aria-pressed`), `selected` + роль `Tab` / `RadioButton` —
 * выбор в группе (`selectable`: сегмент), иначе — `clickable` (+ `selected` в семантике, если задан).
 * Элементы меньше 48 dp получают зону нажатия 48 модификатором [minimumInteractiveComponentSize] на месте вызова
 * (см. [IconButtonImpl], чипсы): рисуются прежнего размера, в раскладке занимают не меньше 48 — как компоненты Material 3.
 */
@Composable
internal fun ControlSurface(
    onClick: (() -> Unit)?,
    modifier: Modifier,
    shape: Shape,
    background: Color,
    contentColor: Color,
    enabled: Boolean = true,
    floating: Boolean = false,
    pressScale: Float = YeetGesture.pressScale,
    role: Role = Role.Button,
    selected: Boolean? = null,
    contentDescription: String? = null,
    onClickLabel: String? = null,
    contentAlignment: Alignment = Alignment.Center,
    disabledAlpha: Float = 0.4f,
    toggled: Boolean? = null,
    stateDescription: String? = null,
    content: @Composable BoxScope.() -> Unit,
) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val focused by interaction.collectIsFocusedAsState()
    val motion = YeetTheme.motion
    val scale by animateFloatAsState(if (pressed && enabled) pressScale else 1f, motion.press(), label = "press")
    val bg by animateColorAsState(background, motion.select(), label = "background")
    val fg by animateColorAsState(contentColor, motion.select(), label = "content")
    val accent = YeetTheme.colors.accent

    val inGroup = selected != null && (role == Role.Tab || role == Role.RadioButton)
    val a11y = Modifier.semantics {
        // selectable / toggleable сами пишут состояние в семантику
        if (selected != null && !inGroup && toggled == null) this.selected = selected
        if (contentDescription != null) this.contentDescription = contentDescription
        if (stateDescription != null) this.stateDescription = stateDescription
    }
    val click = when {
        onClick == null -> Modifier
        toggled != null -> Modifier.toggleable(
            value = toggled,
            interactionSource = interaction,
            indication = null,
            enabled = enabled,
            role = role,
            onValueChange = { onClick() },
        )
        inGroup -> Modifier.selectable(
            selected = selected == true,
            interactionSource = interaction,
            indication = null,
            enabled = enabled,
            role = role,
            onClick = onClick,
        )
        else -> Modifier.clickable(
            interactionSource = interaction,
            indication = null,
            enabled = enabled,
            onClickLabel = onClickLabel,
            role = role,
            onClick = onClick,
        )
    }
    Box(
        modifier
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
                alpha = if (enabled) 1f else disabledAlpha
            }
            .then(if (floating) Modifier.yeetFloatingShadow(shape) else Modifier)
            .then(if (focused) Modifier.border(2.dp, accent, shape) else Modifier)
            .clip(shape)
            .background(bg, shape)
            .then(a11y)
            .then(click),
        contentAlignment = contentAlignment,
    ) {
        CompositionLocalProvider(LocalContentColor provides fg) { content() }
    }
}

/**
 * Кнопка-капсула с текстом.
 *
 * **Контексты во флоу:** главный CTA онбординга и входа (Primary XL), пара действий в sheet (Tertiary + Primary L),
 * фильтры-дропдауны (Tertiary / Soft S + `ChevronUpDown`), теги (Tertiary S + `Cross`), «Пропустить» (Ghost M).
 *
 * **Загрузка:** `loading` — «Войти», пока идёт запрос, «Сохранить» вещь, «Удалить аккаунт».
 *
 * React: `<Button variant size leftIcon rightIcon fullWidth floating loading loadingLabel>text</Button>`.
 *
 * @param loading действие выполняется: вместо содержимого — спиннер, ширина кнопки та же (макет не прыгает),
 * повторные нажатия не проходят, нажатие не сжимает; кнопка остаётся в фокусе и озвучивается с состоянием [loadingLabel].
 * @param loadingLabel что озвучить во время загрузки (web: `aria-busy` + скрытый текст). По умолчанию «Загрузка».
 */
@Composable
fun Button(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: ButtonStyle = ButtonStyle.Primary,
    size: ControlSize = ControlSize.L,
    leftIcon: IconName? = null,
    rightIcon: IconName? = null,
    fullWidth: Boolean = false,
    floating: Boolean = false,
    enabled: Boolean = true,
    loading: Boolean = false,
    loadingLabel: String = DefaultLoadingLabel,
) {
    Button(
        onClick = onClick,
        modifier = modifier,
        variant = variant,
        size = size,
        leftIcon = leftIcon,
        rightIcon = rightIcon,
        fullWidth = fullWidth,
        floating = floating,
        enabled = enabled,
        loading = loading,
        loadingLabel = loadingLabel,
    ) {
        Text(text, maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}

/** Кнопка с произвольным содержимым (children в React): точка цвета + текст и т. п. `loading` — как у текстовой [Button]. */
@Composable
fun Button(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: ButtonStyle = ButtonStyle.Primary,
    size: ControlSize = ControlSize.L,
    leftIcon: IconName? = null,
    rightIcon: IconName? = null,
    fullWidth: Boolean = false,
    floating: Boolean = false,
    enabled: Boolean = true,
    loading: Boolean = false,
    loadingLabel: String = DefaultLoadingLabel,
    content: @Composable RowScope.() -> Unit,
) {
    val c = YeetTheme.colors
    ControlSurface(
        // во время загрузки нажатие гасится, но кнопка остаётся в фокусе и в дереве TalkBack
        onClick = { if (!loading) onClick() },
        modifier = modifier.then(if (fullWidth) Modifier.fillMaxWidth() else Modifier),
        shape = RoundedCornerShape(YeetTheme.radius.xl),
        background = variant.background(c),
        contentColor = variant.content(c),
        enabled = enabled,
        floating = floating,
        pressScale = if (loading) 1f else YeetGesture.pressScale,
        stateDescription = if (loading) loadingLabel else null,
    ) {
        // содержимое прозрачное, но меряется: ширина кнопки не меняется (web: color: transparent)
        Box(Modifier.graphicsLayer { alpha = if (loading) 0f else 1f }) {
            ButtonRow(size = size, fullWidth = fullWidth, leftIcon = leftIcon, rightIcon = rightIcon, content = content)
        }
        if (loading) ButtonSpinner(if (size == ControlSize.S) 20.dp else 24.dp)
    }
}

/** Что озвучивается у кнопки во время `loading` (web: `loadingLabel ?? 'Загрузка'`). */
const val DefaultLoadingLabel = "Загрузка"

/**
 * Спиннер загрузки кнопки: `Spin` цветом содержимого, оборот 1.2 с;
 * при «уменьшить движение» не крутится, а мерцает (прозрачность 1 → 0.4, 1.6 с — web: `y-pulse`).
 */
@Composable
internal fun ButtonSpinner(size: Dp) {
    val reduced = YeetTheme.motion.reduced
    val transition = rememberInfiniteTransition(label = "buttonSpinner")
    val rotation by transition.animateFloat(
        initialValue = 0f,
        targetValue = if (reduced) 0f else 360f,
        animationSpec = infiniteRepeatable(tween(1200, easing = LinearEasing), RepeatMode.Restart),
        label = "spinnerRotation",
    )
    val pulse by transition.animateFloat(
        initialValue = 1f,
        targetValue = if (reduced) 0.4f else 1f,
        animationSpec = infiniteRepeatable(tween(1600), RepeatMode.Reverse),
        label = "spinnerPulse",
    )
    Icon(
        IconName.Spin,
        modifier = Modifier.graphicsLayer {
            rotationZ = rotation
            alpha = pulse
        },
        size = size,
    )
}

@Composable
internal fun ButtonRow(
    size: ControlSize,
    fullWidth: Boolean,
    leftIcon: IconName?,
    rightIcon: IconName?,
    startPadding: Dp = size.horizontalPadding,
    endPadding: Dp = size.horizontalPadding,
    rightIconSize: Dp = 24.dp,
    rightIconTint: Color = Color.Unspecified,
    minHeight: Dp = size.height,
    content: @Composable RowScope.() -> Unit,
) {
    // Текст — body, цвет — из LocalContentColor; высота — минимум по размеру: при крупном шрифте кнопка растёт, а не обрезает текст
    androidx.compose.material3.ProvideTextStyle(YeetTheme.typography.body) {
        Row(
            modifier = Modifier
                .then(if (fullWidth) Modifier.fillMaxWidth() else Modifier)
                .heightIn(min = minHeight)
                .padding(start = startPadding, end = endPadding),
            horizontalArrangement = Arrangement.spacedBy(size.gap, Alignment.CenterHorizontally),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (leftIcon != null) Icon(leftIcon)
            content()
            if (rightIcon != null) Icon(rightIcon, size = rightIconSize, tint = if (rightIconTint == Color.Unspecified) LocalContentColor.current else rightIconTint)
        }
    }
}

/**
 * Круглая кнопка с иконкой. Те же стили и размеры, что у [Button] (56 / 52 / 48 / 40).
 *
 * **Контексты во флоу:** «Назад» и «Ещё» в шапке (Tertiary M), FAB «+» (Primary XL, floating),
 * «Отправить» в чате (Primary M), поделиться (Secondary XL), фильтры гардероба (Tertiary S).
 *
 * @param label обязательное описание действия для TalkBack: «Назад», «Ещё», «Добавить».
 * @param decorative только вид кнопки внутри другой кнопки (карточка «+», зона фото): без нажатия и без озвучки.
 * @param loading вместо иконки — спиннер («Отправить», пока сообщение уходит); нажатия гасятся, озвучивается [loadingLabel].
 *
 * Кнопка меньше 48 dp (S 40) занимает в раскладке 48 ([minimumInteractiveComponentSize]), круг рисуется прежнего размера.
 */
@Composable
fun IconButton(
    icon: IconName,
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: ButtonStyle = ButtonStyle.Tertiary,
    size: ControlSize = ControlSize.M,
    floating: Boolean = false,
    decorative: Boolean = false,
    enabled: Boolean = true,
    loading: Boolean = false,
    loadingLabel: String = DefaultLoadingLabel,
) {
    IconButtonImpl(
        icon = icon,
        label = label,
        onClick = if (decorative) null else onClick,
        modifier = modifier,
        variant = variant,
        size = size,
        floating = floating,
        enabled = enabled,
        loading = loading,
        loadingLabel = loadingLabel,
    )
}

@Composable
internal fun IconButtonImpl(
    icon: IconName,
    label: String,
    onClick: (() -> Unit)?,
    modifier: Modifier = Modifier,
    variant: ButtonStyle = ButtonStyle.Tertiary,
    size: ControlSize = ControlSize.M,
    floating: Boolean = false,
    enabled: Boolean = true,
    iconSize: Dp = if (size == ControlSize.S) 20.dp else 24.dp,
    diameter: Dp = size.height,
    contentColor: Color? = null,
    role: Role = Role.Button,
    selected: Boolean? = null,
    disabledAlpha: Float = 0.4f,
    loading: Boolean = false,
    loadingLabel: String = DefaultLoadingLabel,
) {
    val c = YeetTheme.colors
    // зона нажатия 48 у кнопок меньше 48 (S 40, «+» чипсов 36, «Отправить» 44); декоративной (без нажатия) не нужна
    val touchTarget = if (onClick != null && diameter < MinTouchTarget) Modifier.minimumInteractiveComponentSize() else Modifier
    val click: (() -> Unit)? = onClick?.let { action -> { if (!loading) action() } }
    ControlSurface(
        onClick = click,
        modifier = modifier
            .then(touchTarget)
            .sizeIn(minWidth = diameter, minHeight = diameter)
            .size(diameter),
        shape = CircleShape,
        background = variant.background(c),
        contentColor = contentColor ?: variant.content(c),
        enabled = enabled,
        floating = floating,
        role = role,
        selected = selected,
        disabledAlpha = disabledAlpha,
        // decorative (onClick == null): без описания — вид кнопки внутри другой кнопки не озвучивается отдельно
        contentDescription = if (onClick == null) null else label,
        pressScale = if (loading) 1f else YeetGesture.pressScale,
        stateDescription = if (loading && onClick != null) loadingLabel else null,
    ) {
        if (loading) ButtonSpinner(iconSize) else Icon(icon, size = iconSize)
    }
}

/** Минимальная зона нажатия (Material 3 на Android — 48 dp). */
internal val MinTouchTarget = 48.dp

@YeetPreviews
@Composable
private fun ButtonPreview() = YeetPreviewSurface {
    ButtonStyle.entries.forEach { style ->
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            Button(style.name, onClick = {}, variant = style, size = ControlSize.M)
            IconButton(IconName.Plus, label = "Добавить", onClick = {}, variant = style, size = ControlSize.M)
            IconButton(IconName.Plus, label = "Добавить", onClick = {}, variant = style, size = ControlSize.S)
        }
    }
    Button("Войти", onClick = {}, size = ControlSize.XL, fullWidth = true)
    Button("Сезон", onClick = {}, variant = ButtonStyle.Tertiary, size = ControlSize.S, rightIcon = IconName.ChevronUpDown)
    Button("Неактивна", onClick = {}, enabled = false)
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
        Button("Войти", onClick = {}, loading = true)
        Button("Сохранить", onClick = {}, variant = ButtonStyle.Tertiary, size = ControlSize.S, loading = true)
        IconButton(IconName.ArrowUp, label = "Отправить", onClick = {}, variant = ButtonStyle.Primary, loading = true)
    }
    Box(Modifier.padding(8.dp)) {
        IconButton(IconName.Plus, label = "Добавить", onClick = {}, variant = ButtonStyle.Primary, size = ControlSize.XL, floating = true)
    }
}
