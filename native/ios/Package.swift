// swift-tools-version: 5.9
// Нативная библиотека компонентов Yeet Design System для iOS (SwiftUI).
// Generated/ и Resources/ создаёт `npm run tokens` (scripts/build-tokens.mjs → scripts/build-ios.mjs) — руками не править.

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
            path: "Sources/YeetDesignSystem",
            resources: [.process("Resources")]
        ),
    ]
)
