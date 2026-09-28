package design.yeet.ds.theme

import android.content.Context
import android.database.ContentObserver
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.provider.Settings
import android.view.View
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
 * Константы, которых нет на старых API (CONFIRM / REJECT — 30, GESTURE_THRESHOLD_ACTIVATE — 34),
 * заменяются на androidFallback из токенов — см. [YeetHapticEvent.feedbackConstant].
 * `performHapticFeedback` сам уважает системную настройку «Виброотклик».
 */
@Stable
class YeetHaptics internal constructor(private val view: View?) {
    private var lastTick = 0L

    /** Вызывать при смене состояния, не на каждое касание. */
    fun perform(event: YeetHapticEvent): Boolean {
        val v = view ?: return false
        if (event == YeetHapticEvent.Select || event == YeetHapticEvent.Target) {
            // токены: «каждый шаг — один тик, не чаще 1 раза в 50 мс»
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
