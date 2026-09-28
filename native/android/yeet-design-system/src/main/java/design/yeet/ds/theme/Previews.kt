package design.yeet.ds.theme

import android.content.res.Configuration
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

/** Превью в светлой и тёмной теме на ширине базового экрана 393 (как фреймы Figma). */
@Preview(name = "Light", group = "Yeet", showBackground = true, backgroundColor = 0xFFFFFFFF, widthDp = 393)
@Preview(name = "Dark", group = "Yeet", showBackground = true, backgroundColor = 0xFF0F0F11, widthDp = 393, uiMode = Configuration.UI_MODE_NIGHT_YES)
annotation class YeetPreviews

/** Поле превью: YeetTheme, фон bg-canvas, отступы экрана 20, промежуток 12. */
@Composable
fun YeetPreviewSurface(content: @Composable ColumnScope.() -> Unit) {
    YeetTheme {
        Column(
            Modifier.background(YeetTheme.colors.bgCanvas).padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            content = content,
        )
    }
}
