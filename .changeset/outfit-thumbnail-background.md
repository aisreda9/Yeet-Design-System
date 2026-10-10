---
"yeet-design-system": minor
---

iOS (#27): `YeetOutfitThumbnail(…, background: Color? = nil, …)` in both initialisers (`items:` and `media:`). When set, the colour fills the square instead of `cardBg` with the dot pattern (the app's white outfit canvas); `nil` keeps the current look. React `OutfitThumbnail` has no such prop yet (parity issue #29). Web and Android are unchanged.
