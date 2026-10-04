package design.yeet.sample

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import design.yeet.ds.theme.YeetTheme

/** Режим темы в витрине: как в системе, светлая, тёмная. */
enum class ThemeMode(val title: String) { System("Система"), Light("Светлая"), Dark("Тёмная") }

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            var mode by rememberSaveable { mutableStateOf(ThemeMode.System) }
            val dark = when (mode) {
                ThemeMode.System -> isSystemInDarkTheme()
                ThemeMode.Light -> false
                ThemeMode.Dark -> true
            }
            YeetTheme(darkTheme = dark) {
                Gallery(
                    mode = mode,
                    onModeChange = { mode = it },
                )
            }
        }
    }
}
