import SwiftUI
import UIKit

// MARK: - Snackbar

/// Тост-подтверждение над нижней навигацией (React: `Snackbar`): 52, радиус 12, инвертированный фон.
/// Появляется снизу (`.transition(.yeetSnackbar)` + `YeetMotion.appear`); показывать `YeetGesture.snackbar` (4 с, с действием — 6 с).
public struct YeetSnackbar<Content: View>: View {
    private let content: Content
    private let onClose: (() -> Void)?
    private let onUndo: (() -> Void)?
    private var announcement: String?

    /// - Parameter onUndo: «Отменить» — изогнутая стрелка справа (флоу: «Вещь перемещена в архив»).
    public init(onClose: (() -> Void)? = nil, onUndo: (() -> Void)? = nil, @ViewBuilder content: () -> Content) {
        self.content = content()
        self.onClose = onClose
        self.onUndo = onUndo
    }

    public var body: some View {
        HStack(spacing: YeetSpace.s12) {
            content
                .yeetText(YeetType.body)
                .frame(maxWidth: .infinity, alignment: .leading)
            if let onUndo {
                iconButton(.undo, label: "Отменить", action: onUndo)
            }
            if let onClose {
                iconButton(.cross, label: "Закрыть", action: onClose)
            }
        }
        .padding(.horizontal, YeetSpace.s20)
        .frame(minHeight: 52)
        .foregroundStyle(YeetColor.textInverse)
        .background(RoundedRectangle(cornerRadius: YeetRadius.sm, style: .continuous).fill(YeetColor.bgInverse))
        .accessibilityElement(children: .contain)
        .onAppear {
            guard let announcement else { return }
            DispatchQueue.main.async { UIAccessibility.post(notification: .announcement, argument: announcement) }
        }
    }

    private func iconButton(_ icon: YeetIconName, label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) { YeetIcon(name: icon) }
            .buttonStyle(YeetPressStyle())
            .yeetHitArea(height: 24)
            .accessibilityLabel(Text(label))
    }
}

public extension YeetSnackbar where Content == Text {
    /// Snackbar с текстом; текст озвучивается VoiceOver при появлении.
    init(_ text: String, onClose: (() -> Void)? = nil, onUndo: (() -> Void)? = nil) {
        self.init(onClose: onClose, onUndo: onUndo) { Text(text) }
        self.announcement = text
    }
}

public extension AnyTransition {
    /// Появление snackbar: сдвиг на 16 снизу и проявление, как в web (`y-appear`). Анимация — `YeetMotion.appear` / `exit`.
    static var yeetSnackbar: AnyTransition {
        .offset(y: 16).combined(with: .opacity)
    }
}

// MARK: - EmptyState

/// Кнопка пустого состояния (React: `EmptyState.action`).
public struct YeetEmptyStateAction {
    public var label: String
    /// «Добавить вещь» — `primary`, «Сбросить фильтры» — `tertiary` (по умолчанию).
    public var variant: YeetButtonStyle
    public var onClick: (() -> Void)?

    public init(label: String, variant: YeetButtonStyle = .tertiary, onClick: (() -> Void)? = nil) {
        self.label = label
        self.variant = variant
        self.onClick = onClick
    }
}

/// Пустое состояние и «ничего не найдено» (React: `EmptyState`): заголовок H1, текст через 16, кнопка L через 32.
/// Ставится по центру свободной области экрана.
public struct YeetEmptyState: View {
    private let title: String
    private let description: String
    private let action: YeetEmptyStateAction?

    public init(title: String, description: String, action: YeetEmptyStateAction? = nil) {
        self.title = title
        self.description = description
        self.action = action
    }

    public var body: some View {
        VStack(spacing: YeetSpace.s16) {
            Text(title)
                .yeetText(YeetType.h1)
                .foregroundStyle(YeetColor.textPrimary)
                .accessibilityAddTraits(.isHeader)
            Text(description)
                .yeetText(YeetType.body)
                .foregroundStyle(YeetColor.textSecondary)
            if let action {
                YeetButton(action.label, variant: action.variant, size: .l) { action.onClick?() }
                    .padding(.top, YeetSpace.s16)
            }
        }
        .multilineTextAlignment(.center)
        .frame(maxWidth: 353)
        .frame(maxWidth: .infinity)
    }
}

// MARK: - StatTile

/// Плитка статистики (React: `StatTile`): Caption серым + число H2. Ставится в `YeetStatRow` по 3.
public struct YeetStatTile: View {
    private let label: String
    private let value: String

    public init(label: String, value: String) {
        self.label = label
        self.value = value
    }

    public init(label: String, value: Int) {
        self.init(label: label, value: String(value))
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: YeetSpace.s4) {
            Text(label).yeetText(YeetType.caption).foregroundStyle(YeetColor.textSecondary)
            Text(value).yeetText(YeetType.h2).foregroundStyle(YeetColor.textPrimary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, YeetSpace.s20)
        .padding(.vertical, YeetSpace.s16)
        .background(RoundedRectangle(cornerRadius: YeetComponent.cardRadius, style: .continuous).fill(YeetComponent.cardBg))
        .accessibilityElement(children: .combine)
    }
}

/// Ряд плиток статистики через 8 (React: `StatRow`).
public struct YeetStatRow<Content: View>: View {
    private let content: Content

    public init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    public var body: some View {
        HStack(spacing: YeetSpace.s8) { content }
    }
}

#if DEBUG
#Preview("Feedback") {
    VStack(spacing: 32) {
        YeetSnackbar("Вещь перемещена в архив", onUndo: {})
        YeetSnackbar("Образ сохранён", onClose: {})
        YeetStatRow {
            YeetStatTile(label: "Вещей", value: 128)
            YeetStatTile(label: "Образов", value: 24)
            YeetStatTile(label: "Поездок", value: 3)
        }
        YeetEmptyState(
            title: "Ничего не нашлось",
            description: "Попробуйте изменить фильтры или поискать по фото",
            action: YeetEmptyStateAction(label: "Сбросить фильтры")
        )
    }
    .padding(20)
    .background(YeetColor.bgCanvas)
}
#endif
