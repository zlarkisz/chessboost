---
paths: ["apps/web/**"]
---

# web design taste

The owner's visual preferences for chessboost. Read before proposing or changing any UI;
treat "Rejected" as already tried and declined.

## Direction

- Familiar chess where chess is familiar (board, clocks, move list look like lichess),
  boosts are the only new visual layer.
- Calm and light: the board is the hero, everything around it is quiet.
- Dark theme by default; the light theme must keep working.

## Likes

- Cool slate surfaces (graphite palette at hue ~255), not warm.
- Classic wooden board: light and dark wood squares.
- Saturated colours for boosts. Each boost type gets its own colour and its own icon;
  the icon must still tell the type apart without colour. The boost colours form one family:
  similar lightness and saturation. Chosen palette (P1): invulnerability — blue (hue 255),
  extra move — green (hue 145), teleport — magenta (hue 330), each in three shades:
  `-360` deep (numbers, light-theme text), `-560` mid (icons on the board),
  `-680` glow (glow under pieces, dark-theme text).
- Boost visuals on the board: a boost lying on a square = vivid icon with a crisp 1 px light
  outline over a flat translucent shadow ellipse (the "floor shadow"); a piece with an active
  effect = a round coloured glow under the piece, plus a small outlined corner icon. Only
  invulnerability shows a moves-left number (extra move and teleport apply immediately).
- The floor shadow under boost icons, and the coloured glow under affected pieces.
- Boost colours must not collide with what is already taken: wood and the last-move
  highlight (yellow/amber), resign and low time (red). No purple gradients.
- Archivo: condensed width for clocks, normal width for the interface.
- Action buttons visible but quiet: "Offer draw" secondary (tonal), "Resign" destructive
  (soft red); full red only in the confirmation dialog.

## Rejected

- Warm/brown graphite backgrounds and buttons.
- Amber as an accent: it blends with the wood.
- Outline-only buttons on the dark background: they disappear.
- Dark or black plates behind boost icons and numbers.
- Thick rings or dark outlines around pieces.
- A large dark disc for a boost on a square.
- Tinting whole squares with colour.
- Deep, unhaloed boost icons (T1): contrast on dark wood forces dark, dull colours.
- Thin circles around boosts and pieces (T3): read as lichess legal-move / capture markers.

## How to work on visuals

- Describe the problem, then propose 3–4 different treatments side by side with
  screenshots and a recommendation; don't change the real screen until one is picked.
- Colours only through the token layers in `app/assets/css/tailwind.css` (palette below,
  roles above); no raw colour values in components.
- Check contrast in both themes: text ≥ 4.5:1, icons and other meaningful graphics ≥ 3:1.
