import SwiftUI

/// Плашка погоды над нижним меню главной (Figma `weather-bar` `1585:15963`, React `WeatherBar`): плавающая пилюля
/// высотой 64, радиус `bar` 48, тень floating, фон `bgElevated`. Слева текст Caption в одну строку (с многоточием),
/// справа иконка погоды 32 и температура H2 — или маленькая кнопка, когда погоды нет. Крестик 20 в правом верхнем углу
/// (`onClose`; нет — нет крестика), зона нажатия расширена до 44 (ADR 0001).
public struct YeetWeatherBar: View {

    /// Содержимое плашки.
    public enum Content {
        /// `Type=Calm` `1585:15925`: одна строка состояния; `detail` — серая вторая строка (возраст данных), если есть.
        case calm(text: String, icon: YeetWeather, temperature: String, detail: String? = nil)
        /// `Type=Alert` `1585:15944`: строка предупреждения и серая строка состояния.
        case alert(title: String, text: String, icon: YeetWeather, temperature: String)
        /// Погоды нет: пояснение слева (`detail` — серая вторая строка) и маленькая кнопка справа вместо иконки
        /// и температуры.
        case unavailable(text: String, detail: String? = nil, actionTitle: String, action: () -> Void)
    }

    private let content: Content
    private let onClose: (() -> Void)?

    /// Высота по кадру.
    public static let height: CGFloat = 64

    public init(_ content: Content, onClose: (() -> Void)? = nil) {
        self.content = content
        self.onClose = onClose
    }

    public var body: some View {
        HStack(spacing: YeetSpace.s8) {
            VStack(alignment: .leading, spacing: 0) {
                switch content {
                case let .calm(text, _, _, detail):
                    строка(text, цвет: YeetColor.textPrimary)
                    if let detail { строка(detail, цвет: YeetColor.textSecondary) }
                case let .alert(title, text, _, _):
                    строка(title, цвет: YeetColor.textPrimary)
                    строка(text, цвет: YeetColor.textSecondary)
                case let .unavailable(text, detail, _, _):
                    строка(text, цвет: YeetColor.textPrimary)
                    if let detail { строка(detail, цвет: YeetColor.textSecondary) }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .accessibilityElement(children: .combine)
            .accessibilityLabel(Text("Погода, ") + Text(подписьДоступности))

            switch content {
            case let .calm(_, icon, temperature, _), let .alert(_, _, icon, temperature):
                HStack(spacing: YeetSpace.s8) {
                    YeetWeatherIcon(kind: icon, size: 32)
                    Text(temperature).yeetText(YeetType.h2).foregroundStyle(YeetColor.textPrimary).lineLimit(1)
                }
                .fixedSize()
                .accessibilityHidden(true)
            case let .unavailable(_, _, actionTitle, action):
                YeetButton(actionTitle, variant: .primary, size: .s, action: action)
                    .fixedSize()
            }
        }
        .padding(.horizontal, YeetSpace.s20)
        .padding(.vertical, YeetSpace.s16)
        .frame(maxWidth: .infinity)
        .frame(height: Self.height)
        .background(RoundedRectangle(cornerRadius: YeetRadius.bar, style: .continuous).fill(YeetColor.bgElevated))
        .yeetFloatingShadow()
        .overlay(alignment: .topTrailing) {
            if let onClose {
                Button(action: onClose) {
                    YeetIcon(name: .cross, size: 16)
                        .foregroundStyle(YeetColor.textInverse)
                        .frame(width: 20, height: 20)
                        .background(Circle().fill(YeetColor.bgInverse))
                }
                .buttonStyle(.plain)
                .yeetHitArea(width: 20, height: 20)
                .accessibilityLabel(Text("Закрыть погоду"))
            }
        }
        .accessibilityElement(children: .contain)
    }

    private func строка(_ s: String, цвет: Color) -> some View {
        Text(s).yeetText(YeetType.caption).foregroundStyle(цвет).lineLimit(1).truncationMode(.tail)
    }

    private var подписьДоступности: String {
        switch content {
        case let .calm(text, _, temperature, detail): return [temperature, text, detail].compactMap { $0 }.joined(separator: ", ")
        case let .alert(title, text, _, temperature): return [title, temperature, text].joined(separator: ", ")
        case let .unavailable(text, detail, _, _): return [text, detail].compactMap { $0 }.joined(separator: ", ")
        }
    }
}

#if DEBUG
private struct WeatherBarPreview: View {
    var body: some View {
        VStack(spacing: 32) {
            YeetWeatherBar(.calm(text: "Облачно, ветер 14 км/ч", icon: .sunny, temperature: "20°"), onClose: {})
            YeetWeatherBar(.alert(title: "Через 1 час дождь, захвати зонт", text: "Облачно, ветер 14 км/ч",
                                  icon: .sunny, temperature: "20°"), onClose: {})
            YeetWeatherBar(.unavailable(text: "Погода недоступна", detail: "Разрешите геолокацию",
                                        actionTitle: "Разрешить", action: {}), onClose: {})
            YeetWeatherBar(.calm(text: "Облачно, ветер 14 км/ч", icon: .rain, temperature: "+7°",
                                 detail: "обновлено 20 мин назад"))
        }
        .padding(20)
        .background(YeetColor.bgCanvas)
    }
}

#Preview("WeatherBar") { WeatherBarPreview() }
#Preview("WeatherBar · Dark") { WeatherBarPreview().preferredColorScheme(.dark) }
#endif
