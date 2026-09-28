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

/// Карточка погоды на экране «Сегодня» (React: `WeatherCard`): температура + описание, инвертированная,
/// радиус 20 / 20 / 20 / 8. Описание — Inter 460 12 / 16 `textInverseSecondary`, предупреждение — второй строкой `textInverse`.
public struct YeetWeatherCard: View {
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
        self.temperature = temperature
        self.description = description
        self.weather = weather
        self.icon = icon
        self.alert = alert
        self.tilt = tilt
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: YeetSpace.s8) {
            HStack(spacing: YeetSpace.s8) {
                if let icon {
                    YeetIcon(name: icon)
                } else {
                    YeetWeatherIcon(kind: weather)
                }
                Text(temperature).yeetText(Self.temperatureStyle)
            }
            VStack(alignment: .leading, spacing: 0) {
                Text(description).foregroundStyle(YeetColor.textInverseSecondary)
                if let alert {
                    Text(alert).foregroundStyle(YeetColor.textInverse)
                }
            }
            .yeetText(YeetType.caption.withWeight(YeetType.body.weight))
        }
        .padding(.horizontal, YeetSpace.s20)
        .padding(.vertical, YeetSpace.s16)
        .foregroundStyle(YeetColor.textInverse)
        .background(YeetRoundedCorners(topLeading: YeetRadius.lg, topTrailing: YeetRadius.lg, bottomTrailing: YeetRadius.lg, bottomLeading: YeetSpace.s8).fill(YeetColor.bgInverse))
        .rotationEffect(.degrees(tilt ? -10 : 0), anchor: .topLeading)
        .accessibilityElement(children: .combine)
    }
}

#if DEBUG
#Preview("WeatherCard") {
    VStack(alignment: .leading, spacing: 32) {
        YeetWeatherCard(temperature: "+18°", description: "Солнечно, без осадков")
        YeetWeatherCard(temperature: "+12°", description: "Облачно", weather: .rain, alert: "Через 1 час дождь, захвати зонт")
        YeetWeatherCard(temperature: "−3°", description: "Снег", icon: .snowflake, tilt: true)
        HStack {
            ForEach(YeetWeather.allCases) { YeetWeatherIcon(kind: $0) }
        }
    }
    .padding(20)
    .background(YeetColor.bgCanvas)
}
#endif
