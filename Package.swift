// swift-tools-version: 5.9
// Манифест для подключения по URL репозитория через Swift Package Manager (SPM ищет Package.swift в корне).
// Исходники и описание — native/ios (там же свой Package.swift для локальной разработки и CI).

import PackageDescription

let package = Package(
    name: "YeetDesignSystem",
    platforms: [.iOS(.v16)],
    products: [
        .library(name: "YeetDesignSystem", targets: ["YeetDesignSystem"]),
    ],
    targets: [
        .target(
            name: "YeetDesignSystem",
            path: "native/ios/Sources/YeetDesignSystem",
            resources: [.process("Resources")]
        ),
    ]
)
