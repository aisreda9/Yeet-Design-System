// Сгенерировано scripts/build-tokens.mjs из tokens/tokens.json — не редактировать вручную.
// Цветные иконки погоды из Figma (Design System → weather-icons), src/icons/weather → Resources/Weather.xcassets.

import SwiftUI

public enum YeetWeather: String, CaseIterable, Identifiable {
    case sunny = "sunny"
    case clearDay = "clear-day"
    case clearNight = "clear-night"
    case pcloudyDay = "pcloudy-day"
    case pcloudyNight = "pcloudy-night"
    case mcloudy = "mcloudy"
    case fog = "fog"
    case rain = "rain"
    case shower = "shower"
    case tstorm = "tstorm"
    case snow = "snow"
    case windy = "windy"

    public var id: String { rawValue }

    /// Описание для VoiceOver.
    public var title: String {
        switch self {
        case .sunny: return "Солнечно, облачка (главная)"
        case .clearDay: return "Ясно"
        case .clearNight: return "Ясно, ночь"
        case .pcloudyDay: return "Переменная облачность"
        case .pcloudyNight: return "Переменная облачность, ночь"
        case .mcloudy: return "Облачно"
        case .fog: return "Туман"
        case .rain: return "Дождь"
        case .shower: return "Ливень"
        case .tstorm: return "Гроза"
        case .snow: return "Снег"
        case .windy: return "Ветрено"
        }
    }

    public var image: Image { Image("weather-\(rawValue)", bundle: .module) }
}
