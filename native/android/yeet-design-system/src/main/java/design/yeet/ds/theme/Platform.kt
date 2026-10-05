package design.yeet.ds.theme

import android.app.UiModeManager
import android.content.Context
import android.database.ContentObserver
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.provider.Settings
import android.view.View
import androidx.annotation.RequiresApi
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalInspectionMode
import design.yeet.tokens.YeetHapticEvent

/**
 * Хаптика дизайн-системы (tokens.motion.haptic → HapticFeedbackConstants).
 * В Android 5 событий (select, toggle, threshold, stamp, skip); lift, drop, target, delete, success — только веб, error — веб и iOS (#130).
 * Константы, которых нет на старых API (CONFIRM — 30, GESTURE_THRESHOLD_ACTIVATE — 34),
 * заменяются на androidFallback из токенов — см. [YeetHapticEvent.feedbackConstant].
 * `performHapticFeedback` сам уважает системную настройку «Виброотклик».
 */
@Stable
class YeetHaptics internal constructor(private val view: View?) {
    private var lastTick = 0L

    /** Вызывать при смене состояния, не на каждое касание. */
    fun perform(event: YeetHapticEvent): Boolean {
        val v = view ?: return false
        if (event == YeetHapticEvent.Select) {
            // токены: «каждый шаг — один тик, не чаще 1 раза в 50 мс»; остальные события редкие — не прореживаются
            val now = SystemClock.uptimeMillis()
            if (now - lastTick < SELECT_THROTTLE_MS) return false
            lastTick = now
        }
        return v.performHapticFeedback(event.feedbackConstant)
    }

    companion object {
        private const val SELECT_THROTTLE_MS = 50L

        /** Без хаптики (превью, тесты, `YeetTheme(hapticsEnabled = false)`). */
        val None = YeetHaptics(null)
    }
}

/**
 * «Уменьшить движение»: системная настройка «Убрать анимацию» (Спец. возможности) и
 * «Масштаб длительности анимации = 0» (Для разработчиков) ставят ANIMATOR_DURATION_SCALE = 0.
 * Значение отслеживается на лету.
 */
@Composable
fun rememberReduceMotion(): Boolean {
    val context = LocalContext.current
    val inspection = LocalInspectionMode.current
    var reduced by remember(context) { mutableStateOf(!inspection && animatorScale(context) == 0f) }
    DisposableEffect(context, inspection) {
        if (inspection) return@DisposableEffect onDispose { }
        val resolver = context.contentResolver
        val observer = object : ContentObserver(Handler(Looper.getMainLooper())) {
            override fun onChange(selfChange: Boolean) {
                reduced = animatorScale(context) == 0f
            }
        }
        resolver.registerContentObserver(Settings.Global.getUriFor(Settings.Global.ANIMATOR_DURATION_SCALE), false, observer)
        onDispose { resolver.unregisterContentObserver(observer) }
    }
    return reduced
}

private fun animatorScale(context: Context): Float =
    Settings.Global.getFloat(context.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f)

/**
 * Повышенный контраст (#117): системный уровень контраста Android 14+ (Настройки → Экран → «Контрастность»),
 * `UiModeManager.getContrast()` от -1 до 1; «средний» (0.5) и «высокий» (1) включают контрастные цвета токенов.
 * До API 34 системной настройки контраста нет — всегда `false` (тема передаёт `highContrast` явно, если нужно).
 * Значение отслеживается на лету.
 */
@Composable
fun rememberHighContrast(): Boolean {
    val context = LocalContext.current
    val inspection = LocalInspectionMode.current
    var high by remember(context) { mutableStateOf(!inspection && contrastLevel(context) >= HIGH_CONTRAST_LEVEL) }
    DisposableEffect(context, inspection) {
        if (inspection || Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) return@DisposableEffect onDispose { }
        val stop = watchContrast(context) { high = it >= HIGH_CONTRAST_LEVEL }
        onDispose { stop() }
    }
    return high
}

private const val HIGH_CONTRAST_LEVEL = 0.5f

private fun contrastLevel(context: Context): Float =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) systemContrast(context) else 0f

@RequiresApi(Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
private fun systemContrast(context: Context): Float =
    context.getSystemService(UiModeManager::class.java)?.contrast ?: 0f

/** Подписка на смену уровня контраста; возвращает отписку. */
@RequiresApi(Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
private fun watchContrast(context: Context, onChange: (Float) -> Unit): () -> Unit {
    val ui = context.getSystemService(UiModeManager::class.java) ?: return {}
    val listener = UiModeManager.ContrastChangeListener { onChange(it) }
    ui.addContrastChangeListener(context.mainExecutor, listener)
    return { ui.removeContrastChangeListener(listener) }
}
