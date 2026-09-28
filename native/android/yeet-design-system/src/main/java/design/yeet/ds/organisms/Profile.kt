package design.yeet.ds.organisms

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import design.yeet.ds.atoms.Button
import design.yeet.ds.atoms.ButtonStyle
import design.yeet.ds.atoms.ControlSize
import design.yeet.ds.molecules.Account
import design.yeet.ds.molecules.AccountCard
import design.yeet.ds.molecules.AccountCardKind
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews
import design.yeet.tokens.YeetItemColor

/**
 * Шторка «Аккаунты» (Figma: Profile / Accounts / Sheet / List): открывается по аватарам в шапке профиля.
 * Текущий аккаунт — «Редактировать профиль» и «Настройки», остальные — переключение, внизу «Добавить аккаунт» (Tertiary L).
 * Карточки и кнопка идут через 8. Показывается через [Overlay].
 *
 * @param accounts первый — текущий аккаунт. Один аккаунт — только он и «Добавить аккаунт».
 */
@Composable
fun AccountsSheet(
    accounts: List<Account>,
    modifier: Modifier = Modifier,
    onEdit: (() -> Unit)? = null,
    onSettings: (() -> Unit)? = null,
    onSwitch: ((String) -> Unit)? = null,
    onAdd: (() -> Unit)? = null,
) {
    val current = accounts.firstOrNull() ?: return
    Sheet(modifier = modifier, title = "Аккаунты") {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            AccountCard(current, kind = AccountCardKind.Current, onEdit = onEdit, onSettings = onSettings)
            accounts.drop(1).forEach { a ->
                AccountCard(a, kind = AccountCardKind.Other, onClick = { onSwitch?.invoke(a.id) })
            }
            Button("Добавить аккаунт", onClick = { onAdd?.invoke() }, variant = ButtonStyle.Tertiary, size = ControlSize.L, fullWidth = true)
        }
    }
}

@YeetPreviews
@Composable
private fun AccountsSheetPreview() = YeetPreviewSurface {
    AccountsSheet(
        accounts = listOf(
            Account("1", "Саша", "sasha@yeet.app"),
            Account("2", "Тимур", "timur@yeet.app", color = YeetItemColor.ORANGE),
        ),
    )
}
