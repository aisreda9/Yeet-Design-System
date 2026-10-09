---
"yeet-design-system": minor
---

iOS (#14, #15): `YeetItemCard(…, showsName: true)` shows the item name under the card — Caption, `textSecondary`, 16 below, one line truncated at the tail (as the name in React `ProductCard`); hidden from VoiceOver, the card still reads `name`. Off by default — the card renders as before. `YeetHeader(type: .search(…))` gets `onSubmit` (keyboard «Search»), `onPhotoSearch` (the «Поиск по фото» button) and `onFilterToggle(id)` (filter chip tap, `id` = chip `value` or `label`); all optional, existing calls are unchanged. Filter chips now keep their `value`. React `ItemCard` / `Header` have no such props yet. Migration: code that pattern-matches `case let .search(query, placeholder, onBack, filters)` needs the three new bindings.
