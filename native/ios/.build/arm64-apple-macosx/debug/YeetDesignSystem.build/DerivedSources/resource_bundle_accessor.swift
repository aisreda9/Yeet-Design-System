import Foundation

extension Foundation.Bundle {
    static let module: Bundle = {
        let mainPath = Bundle.main.bundleURL.appendingPathComponent("YeetDesignSystem_YeetDesignSystem.bundle").path
        let buildPath = "/Users/annabakajkina/Projects/Yeet-Design-System/native/ios/.build/arm64-apple-macosx/debug/YeetDesignSystem_YeetDesignSystem.bundle"

        let preferredBundle = Bundle(path: mainPath)

        guard let bundle = preferredBundle ?? Bundle(path: buildPath) else {
            // Users can write a function called fatalError themselves, we should be resilient against that.
            Swift.fatalError("could not load resource bundle: from \(mainPath) or \(buildPath)")
        }

        return bundle
    }()
}