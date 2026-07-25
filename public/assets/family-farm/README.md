# family-farm assets (BAL-2522)

Real assets for the `familyfarm` overlay variant (`FamilyFarmOverlayGate`),
sourced from the design reference (`DISENO-CARD.md`):

| File | Use |
|---|---|
| `fondo-campo.webp` | Full-screen background photo ("mesa con granadas"). |
| `logo-family-farms.webp` | Brand logo, pre-cropped to content (no transparent margins). |

**Do not replace `logo-family-farms.webp` with an uncropped version.** The
`§11` `clamp()` position formulas for the logo (`top`/`left`/`width`) are
calibrated against this exact crop; swapping the file invalidates those
coordinates.
