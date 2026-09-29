package design.yeet.ds.molecules

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.minimumInteractiveComponentSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.layout.Layout
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import design.yeet.ds.atoms.Avatar
import design.yeet.ds.atoms.AvatarSize
import design.yeet.ds.atoms.ButtonStyle
import design.yeet.ds.atoms.ControlSize
import design.yeet.ds.atoms.ControlSurface
import design.yeet.ds.atoms.MinTouchTarget
import design.yeet.ds.atoms.Icon
import design.yeet.ds.atoms.IconButtonImpl
import design.yeet.ds.atoms.Text
import design.yeet.ds.atoms.TextTone
import design.yeet.ds.atoms.TextVariant
import design.yeet.ds.icons.IconName
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews
import design.yeet.ds.theme.YeetTheme
import design.yeet.tokens.YeetGesture
import design.yeet.tokens.YeetItemColor
import design.yeet.tokens.cardBg

/** Аккаунт пользователя (мультиаккаунт). `photo` — Painter (загрузку картинок делает приложение). */
@Immutable
data class Account(
    val id: String,
    val name: String,
    val email: String,
    val initial: String? = null,
    val photo: Painter? = null,
    val color: YeetItemColor? = null,
)

@Composable
private fun AccountAvatar(a: Account, modifier: Modifier = Modifier) {
    Avatar(modifier = modifier, size = AvatarSize.M, src = a.photo, initial = a.initial ?: a.name.take(1), color = a.color, alt = a.name)
}

/** Figma account-card · Kind. */
enum class AccountCardKind {
    /** Текущий аккаунт в шторке «Аккаунты»: «Редактировать профиль» и «Настройки». */
    Current,

    /** Другой аккаунт: вся карточка — переход (chevron). */
    Other,

    /** Строка аккаунта в Настройках с «Выйти». */
    Settings,
}

/** Карточка аккаунта 72: `cardBg`, радиус 20, паддинг 16 / 20, аватар 40 + имя Body и почта Caption. */
@Composable
fun AccountCard(
    account: Account,
    modifier: Modifier = Modifier,
    kind: AccountCardKind = AccountCardKind.Current,
    onClick: (() -> Unit)? = null,
    onEdit: (() -> Unit)? = null,
    onSettings: (() -> Unit)? = null,
    onSignOut: (() -> Unit)? = null,
) {
    val c = YeetTheme.colors
    val shape = RoundedCornerShape(YeetTheme.radius.lg)
    val body: @Composable () -> Unit = {
        Row(
            Modifier
                .fillMaxWidth()
                .heightIn(min = 72.dp)
                // кнопки S 40 справа занимают 48 (зона нажатия): поля меньше на 4 — карточка 72 и иконки на местах из макета
                .padding(start = 20.dp, end = if (kind == AccountCardKind.Other) 20.dp else 16.dp, top = 12.dp, bottom = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            AccountAvatar(account)
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(account.name, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(account.email, variant = TextVariant.Caption, tone = TextTone.Secondary, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            when (kind) {
                AccountCardKind.Other -> Icon(IconName.ChevronRight)
                AccountCardKind.Current -> Row(horizontalArrangement = Arrangement.spacedBy((-4).dp)) {
                    IconButtonImpl(IconName.Edit, "Редактировать профиль", { onEdit?.invoke() }, variant = ButtonStyle.Ghost, size = ControlSize.S, iconSize = 24.dp)
                    IconButtonImpl(IconName.Settings, "Настройки", { onSettings?.invoke() }, variant = ButtonStyle.Ghost, size = ControlSize.S, iconSize = 24.dp)
                }
                AccountCardKind.Settings ->
                    IconButtonImpl(IconName.LogOut, "Выйти", { onSignOut?.invoke() }, variant = ButtonStyle.Ghost, size = ControlSize.S, iconSize = 24.dp)
            }
        }
    }
    if (kind == AccountCardKind.Other) {
        ControlSurface(
            onClick = { onClick?.invoke() },
            modifier = modifier.fillMaxWidth(),
            shape = shape,
            background = c.cardBg,
            contentColor = c.textPrimary,
            pressScale = YeetGesture.pressScaleCard,
            contentDescription = "Переключиться на ${account.name}",
        ) { Box(Modifier.clearAndSetSemantics { }) { body() } }
    } else {
        ControlSurface(onClick = null, modifier = modifier.fillMaxWidth(), shape = shape, background = c.cardBg, contentColor = c.textPrimary) { body() }
    }
}

/**
 * Аккаунты в шапке профиля (Figma: avatar-stack): аватары 40 с кольцом цвета фона 2, внахлёст −8, в конце «+» Tertiary S.
 * Нажатие на аватары открывает шторку «Аккаунты», «+» — добавление аккаунта.
 */
@Composable
fun AvatarStack(
    accounts: List<Account>,
    modifier: Modifier = Modifier,
    onOpen: (() -> Unit)? = null,
    onAdd: (() -> Unit)? = null,
) {
    val canvas = YeetTheme.colors.bgCanvas
    val overlap = 8.dp
    // «+» S 40 стоит в зоне нажатия 48 (по 4 с каждой стороны): нахлёст больше на 4 — видимый нахлёст круга те же 8
    Overlapping(modifier, overlap + (MinTouchTarget - ControlSize.S.height) / 2) {
        Overlapping(
            Modifier
                // аватары 40 — зона нажатия 48 по высоте (web: невидимый ::after 44)
                .minimumInteractiveComponentSize()
                .clickable(role = Role.Button, enabled = onOpen != null) { onOpen?.invoke() }
                .semantics { contentDescription = "Аккаунты: ${accounts.joinToString { it.name }}" },
            overlap,
        ) {
            accounts.forEach { a ->
                Box(Modifier.clearAndSetSemantics { }) {
                    AccountAvatar(a)
                    // Figma: кольцо 2 цвета фона внутри аватара 40
                    Box(Modifier.matchParentSize().border(2.dp, canvas, CircleShape))
                }
            }
        }
        IconButtonImpl(IconName.Plus, "Добавить аккаунт", { onAdd?.invoke() }, variant = ButtonStyle.Tertiary, size = ControlSize.S)
    }
}

/** Ряд с нахлёстом: каждый следующий элемент заходит на предыдущий на `overlap` и рисуется поверх. */
@Composable
private fun Overlapping(modifier: Modifier, overlap: androidx.compose.ui.unit.Dp, content: @Composable () -> Unit) {
    Layout(content, modifier) { measurables, constraints ->
        val o = overlap.roundToPx()
        val loose = constraints.copy(minWidth = 0, minHeight = 0)
        val placeables = measurables.map { it.measure(loose) }
        val width = placeables.sumOf { it.width } - o * (placeables.size - 1).coerceAtLeast(0)
        val height = placeables.maxOfOrNull { it.height } ?: 0
        layout(width.coerceAtLeast(0), height) {
            var x = 0
            placeables.forEach { p ->
                p.place(x, (height - p.height) / 2)
                x += p.width - o
            }
        }
    }
}

@YeetPreviews
@Composable
private fun AccountPreview() = YeetPreviewSurface {
    val me = Account("1", "Саша", "sasha@yeet.app")
    val other = Account("2", "Тимур", "timur@yeet.app", color = YeetItemColor.ORANGE)
    AvatarStack(accounts = listOf(me, other), onOpen = {}, onAdd = {})
    AccountCard(me, kind = AccountCardKind.Current)
    AccountCard(other, kind = AccountCardKind.Other, onClick = {})
    AccountCard(me, kind = AccountCardKind.Settings)
}
