import SwiftUI

/// Цветная иконка погоды из Figma (React: `WeatherIcon`).
public struct YeetWeatherIcon: View {
    private let kind: YeetWeather
    private let size: CGFloat

    public init(kind: YeetWeather, size: CGFloat = 24) {
        self.kind = kind
        self.size = size
    }

    public var body: some View {
        kind.image
            .renderingMode(.original)
            .resizable()
            .scaledToFit()
            .frame(width: size, height: size)
            .accessibilityLabel(Text(kind.title))
    }
}

/// Действие карточки погоды без данных: одна кнопка «Разрешить» / «Настройки» / «Повторить».
public struct YeetWeatherCardAction {
    public var title: String
    public var onClick: () -> Void

    public init(title: String, onClick: @escaping () -> Void) {
        self.title = title
        self.onClick = onClick
    }
}

/// Карточка погоды на экране «Сегодня» (React: `WeatherCard`): температура + описание, инвертированная,
/// радиус 20 / 20 / 20 / 8. Описание — Inter 460 12 / 16 `textInverseSecondary`, предупреждение — второй строкой `textInverse`.
/// `description` — свободная строка: туда же приложение кладёт «ощущается +9°» и возраст данных («обновлено 20 мин назад»).
///
/// Без данных (#34, React-аналога пока нет): `init(unavailable:…)` — заголовок вместо температуры, пояснение и одна кнопка
/// (`.inverse` S); `init(loading:)` — спиннер вместо температуры, карточка не нажимается.
public struct YeetWeatherCard: View {
    private enum State {
        case data
        case loading
        case unavailable(YeetWeatherCardAction?)
    }

    private let state: State
    private let temperature: String
    private let description: String
    private let weather: YeetWeather
    private let icon: YeetIconName?
    private let alert: String?
    private let tilt: Bool

    /// Температура: Roboto Slab 400 24 / 24, трекинг −0.4.
    private static let temperatureStyle = YeetTextStyle(family: YeetFonts.display, size: 24, lineHeight: 24, tracking: -0.4, weight: 400, textStyle: .title)

    /// - Parameters:
    ///   - weather: цветная иконка погоды (как во флоу).
    ///   - icon: линейная иконка вместо цветной.
    ///   - alert: предупреждение второй строкой: «Через 1 час дождь, захвати зонт».
    ///   - tilt: наклон 10° поверх коллажа (экран «Образы дня»).
    public init(temperature: String, description: String, weather: YeetWeather = .sunny, icon: YeetIconName? = nil, alert: String? = nil, tilt: Bool = false) {
        self.state = .data
        self.temperature = temperature
        self.description = description
        self.weather = weather
        self.icon = icon
        self.alert = alert
        self.tilt = tilt
    }

    /// Погоды нет: «Погода недоступна» / «Разрешите геолокацию» + «Разрешить»; «Не удалось получить погоду» + «Повторить».
    /// - Parameters:
    ///   - unavailable: заголовок на месте температуры (Inter 16, не Roboto Slab — это не число).
    ///   - description: пояснение второй строкой.
    ///   - icon: линейная иконка слева от заголовка; `nil` — без иконки.
    ///   - action: одна кнопка под пояснением; `nil` — без кнопки.
    public init(unavailable title: String, description: String, icon: YeetIconName? = nil, action: YeetWeatherCardAction? = nil, tilt: Bool = false) {
        self.state = .unavailable(action)
        self.temperature = title
        self.description = description
        self.weather = .sunny
        self.icon = icon
        self.alert = nil
        self.tilt = tilt
    }

    /// Погода загружается: спиннер вместо температуры и подпись («Определяем погоду…»); не нажимается.
    public init(loading description: String, tilt: Bool = false) {
        self.state = .loading
        self.temperature = ""
        self.description = description
        self.weather = .sunny
        self.icon = nil
        self.alert = nil
        self.tilt = tilt
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: YeetSpace.s8) {
            HStack(spacing: YeetSpace.s8) {
                switch state {
                case .data:
                    if let icon {
                        YeetIcon(name: icon)
                    } else {
                        YeetWeatherIcon(kind: weather)
                    }
                    Text(temperature).yeetText(Self.temperatureStyle)
                case .loading:
                    YeetSpinner(size: 24)
                        .frame(height: Self.temperatureStyle.lineHeight)
                        .accessibilityHidden(true)
                case .unavailable:
                    if let icon { YeetIcon(name: icon) }
                    Text(temperature).yeetText(YeetType.body)
                }
            }
            VStack(alignment: .leading, spacing: 0) {
                Text(description).foregroundStyle(YeetColor.textInverseSecondary)
                if let alert {
                    Text(alert).foregroundStyle(YeetColor.textInverse)
                }
            }
            .yeetText(YeetType.caption.withWeight(YeetType.body.weight))
            if case let .unavailable(action?) = state {
                YeetButton(action.title, variant: .inverse, size: .s, action: action.onClick)
                    .padding(.top, YeetSpace.s4)
            }
        }
        .padding(.horizontal, YeetSpace.s20)
        .padding(.vertical, YeetSpace.s16)
        .foregroundStyle(YeetColor.textInverse)
        .background(YeetRoundedCorners(topLeading: YeetRadius.lg, topTrailing: YeetRadius.lg, bottomTrailing: YeetRadius.lg, bottomLeading: YeetSpace.s8).fill(YeetColor.bgInverse))
        .rotationEffect(.degrees(tilt ? -10 : 0), anchor: .topLeading)
        // с кнопкой — отдельные элементы, чтобы VoiceOver дошёл до действия
        .accessibilityElement(children: hasAction ? .contain : .combine)
        .accessibilityAddTraits(isLoading ? .updatesFrequently : [])
    }

    private var hasAction: Bool {
        if case .unavailable(.some) = state { return true }
        return false
    }

    private var isLoading: Bool {
        if case .loading = state { return true }
        return false
    }
}

#if DEBUG
#Preview("WeatherCard · Dark") {
    VStack(alignment: .leading, spacing: 32) {
        YeetWeatherCard(temperature: "20°", description: "Солнечно, ветер 14 км/ч", tilt: true)
        YeetWeatherCard(unavailable: "Погода недоступна", description: "Разрешите геолокацию",
                        action: YeetWeatherCardAction(title: "Настройки", onClick: {}))
        YeetWeatherCard(loading: "Определяем погоду…")
    }
    .padding(20)
    .background(YeetColor.bgCanvas)
    .preferredColorScheme(.dark)
}

#Preview("WeatherCard") {
    VStack(alignment: .leading, spacing: 32) {
        YeetWeatherCard(temperature: "+18°", description: "Солнечно, без осадков")
        YeetWeatherCard(temperature: "+12°", description: "Облачно", weather: .rain, alert: "Через 1 час дождь, захвати зонт")
        YeetWeatherCard(temperature: "−3°", description: "Снег", icon: .snowflake, tilt: true)
        YeetWeatherCard(temperature: "+7°", description: "Облачно · ощущается +4°\nобновлено 20 мин назад", weather: .mcloudy)
        YeetWeatherCard(unavailable: "Погода недоступна", description: "Разрешите геолокацию",
                        action: YeetWeatherCardAction(title: "Разрешить", onClick: {}))
        YeetWeatherCard(unavailable: "Не удалось получить погоду", description: "Проверьте интернет",
                        action: YeetWeatherCardAction(title: "Повторить", onClick: {}), tilt: true)
        YeetWeatherCard(loading: "Определяем погоду…")
        HStack {
            ForEach(YeetWeather.allCases) { YeetWeatherIcon(kind: $0) }
        }
    }
    .padding(20)
    .background(YeetColor.bgCanvas)
}
#endif
