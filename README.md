# 蒼潮魔塔傳 · Spire of the Blue Tide

An original top-down RPG in the style of the 16-bit console era. It plays in the browser at the old 256×224 resolution, scaled up with crisp pixels and optional scanlines.

**Play:** https://ywchen0711.github.io/spire-tide/

## The story

A hundred years ago, the Abyss King Ordath raised a grey tower out of the eastern sea. Four heroes sealed it back under the waves with the Tide Key, and over the years people forgot their names.

One morning the tower rises again, and ships near it vanish into the mist. Ren is a young swordsman from the harbour town of Tidebell. The mayor sends him to fetch the Tide Key from the Northern Cape Grotto. Along the way three others join him: Mira, an apprentice mage; Garo, the town smith; and Lys, the last priestess of the sea temple.

The world, characters, story, art and music are all original.

## Languages

The game is fully playable in Traditional Chinese and in English, including the story, menus, battles and credits. The first time you play, it picks the language your browser uses. You can switch at any time: choose **Language** on the title screen, or open the menu and go to **Config → Language**. The choice is remembered.

## How it plays

- **Explore.**
  - Walk around the town and talk to everyone.
  - Rest at the inn, shop for weapons and armour, and save at the chapel or at a crystal.
  - On the world map, monsters attack at random as you walk.
  - Your party walks in a line behind the leader.
- **Dungeon puzzles.**
  - Push stone blocks onto floor switches to open gates.
  - Fill pits with blocks to make a path across.
  - Step on coloured switches to raise and lower red and blue posts.
  - Slide across an ice floor; you keep going until something stops you.
  - If a block gets stuck, a glowing stone in the room puts the blocks back where they started.
- **Visible monsters.** In dungeons you can see the monsters, and they move one step each time you do. Touching one starts a fight.
- **Turn-based battles.**
  - You give every party member a command, then the round plays out in speed order.
  - Commands are Attack, Magic, Special, Item, Defend and Run.
  - Taking hits and landing attacks fills each hero's gauge. When it is full, they can use their special move: Azure Slash, Starburst, Earthsplitter or Holy Prayer.
  - Some monsters are weak or resistant to fire, ice, lightning or holy damage.
  - Poison and sleep are status effects.
- **Enemies have fixed stats** and never scale with your level.

## Controls

| | Keyboard | Gamepad | Touch |
|---|---|---|---|
| Move | arrow keys / WASD | d-pad / stick | on-screen d-pad |
| Confirm, talk, check | Z / Enter / Space | A | A |
| Cancel, open the menu | X / Esc | B | B |
| Menu | C / Tab | Y / Start | MENU (選單) |

## How it looks and sounds

- Characters are hand-drawn 16×24 pixel sprites with four directions and walking frames.
- Monsters, trees and props are painted from shaded shapes on limited colour ramps, then dithered and outlined.
- Terrain tiles join up with their neighbours, and water is animated.
- The title screen flies over the island with a Mode 7-style rotating ground plane. Battles open with a mosaic transition.
- The music is played by a small synthesizer built in code: pulse, triangle, strings, noise drums and an echo. There are twelve original pieces.
- The Chinese text uses the Cubic 11 (俐方體11號) pixel font. It is free to use, and its license is in `fonts/`.

## Files

- `js/main.js` runs the main loop, title screen, transitions and ending, and connects the story scripts to the rest of the game.
- `js/field.js` handles walking, the trailing party, NPCs, chests, puzzles and visible monsters.
- `js/battle.js` contains battles, effects and backdrops.
- `js/rules.js` has the battle math. It has no drawing code, so it can be simulated in Node.
- `js/maps.js` holds every map, as rows of characters plus a legend.
- `js/story.js` holds all the dialogue and events.
- `js/data.js` holds heroes, items, spells, monsters and shops.
- `js/party.js` covers stats, levels, the inventory and saving.
- `js/menu.js` covers the field menu, equipment, status, shops and settings.
- `js/ui.js` has the dialogue boxes and list menus.
- `js/i18n.js` switches the language. Text is written as `L('中文', 'English')`, and the data tables get English names.
- `js/gfx.js` has the pixel helpers, sprite painter, font and windows.
- `js/sprites.js` holds the character sprites.
- `js/enemies.js` holds the monster art.
- `js/tiles.js` draws the terrain tiles and pre-renders each map.
- `js/audio.js` is the synthesizer, sequencer, soundtrack and sound effects.

There is no build step. Open `index.html` through any static web server.
