plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    `maven-publish`
}

group = "design.yeet"
version = "0.3.0"

android {
    namespace = "design.yeet.ds"
    compileSdk = 35

    defaultConfig {
        minSdk = 26
        consumerProguardFiles("consumer-rules.pro")
    }

    buildFeatures {
        compose = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    publishing {
        singleVariant("release") {
            withSourcesJar()
        }
    }
}

dependencies {
    // Только Compose: ui + foundation + Material3 как база. Никаких других зависимостей.
    val composeBom = platform(libs.compose.bom)
    api(composeBom)
    api(libs.compose.ui)
    api(libs.compose.foundation)
    api(libs.compose.material3)
    // @Preview-аннотации (только аннотации) и рендер превью в Android Studio (только debug)
    implementation(libs.compose.ui.tooling.preview)
    debugImplementation(libs.compose.ui.tooling)
}

// ./gradlew :yeet-design-system:publishToMavenLocal → design.yeet:yeet-design-system:0.3.0
publishing {
    publications {
        register<MavenPublication>("release") {
            groupId = "design.yeet"
            artifactId = "yeet-design-system"
            version = project.version.toString()
            afterEvaluate {
                from(components["release"])
            }
        }
    }
}
