---
"yeet-design-system": minor
---

iOS (#19, #20, #23): `YeetListItem(…, tone: .destructive)` — label and icon in `textDanger` for «Удалить» (default `.default`, old render unchanged). `YeetField(…, swatch: Color?, …)` — a colour dot for an arbitrary colour (server palette), same look as `colorDot` (16, `borderSubtle` stroke); a separate label because a `colorDot: Color?` overload would make existing `colorDot: .red` and `colorDot: nil` calls ambiguous. `YeetPhotoTile(source: .camera)` placeholder now shows the `camera` icon; `.gallery` keeps `imageAdd`. None of the three has a React prop yet (parity issue filed). Web and Android are unchanged.
