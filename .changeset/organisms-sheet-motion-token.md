---
'yeet-design-system': patch
---

Overlay: пружина шторки берётся из токена `--motion-sheet` (`motion.spring.critical`) вместо локального литерала `linear()`. Кривая та же (k 300, ζ = 1, 540 мс), сетка плотнее; при «Уменьшении движения» по-прежнему 1ms.
