# STACK UNO — Game Rules Specification

## 1. Deck Composition (108 Cards)
- **Number Cards (76):**
  - Red, Blue, Green, Yellow: 1x `0`, 2x `1-9` per color (19 cards per color).
- **Action Cards (24):**
  - Red, Blue, Green, Yellow: 2x `Skip`, 2x `Reverse`, 2x `Draw Two` per color (6 cards per color).
- **Wild Cards (8):**
  - 4x `Wild`
  - 4x `Wild Draw Four`

---

## 2. Mode A: Classic UNO

### Setup
- 2 to 10 players.
- 7 cards dealt to each player.
- Draw pile shuffled; top card flipped to start the Discard pile.
- Opening card resolution:
  - If Number: normal play starts with player left of dealer.
  - If Skip: first player is skipped.
  - If Reverse: play direction reverses (in 2-player, acts as Skip).
  - If Draw Two: first player draws 2 and loses turn.
  - If Wild: first player chooses initial color and plays.
  - If Wild Draw Four: returned to deck, reshuffled, new card flipped.

### Turn Mechanics
- A player must play a card matching the active color, matching number/symbol, or a Wild card.
- If no card can be played (or player chooses not to play), the player draws 1 card.
- If the drawn card is playable, the player may play it immediately or pass.
- **Skip:** Next player is skipped.
- **Reverse:** Play direction reverses. With 2 players, Reverse acts as a Skip.
- **Draw Two:** Next player draws 2 cards and their turn is skipped.
- **Wild:** Current player chooses new active color.
- **Wild Draw Four:** Player chooses new color; next player draws 4 cards and loses turn. Can be challenged if house challenge rules are enabled.

### UNO Declaration & Penalties
- When a player has 1 card remaining in hand, they must call "UNO" before the next player takes a turn.
- If caught with 1 card without calling UNO, the player draws a 2-card penalty.

### Victory
- First player to discard their last card wins the round/game.

---

## 3. Mode B: UNO Reverse

### Concept
A high-energy, fast-paced variant centered around momentum reversals and directional chaos.

### Mechanics & Differences from Classic:
1. **Dynamic Directional Momentum:**
   - Any player matching the exact card value/number of the top discard can trigger a **Reverse Surge**, instantly flipping the direction of play.
2. **Reverse Card Double Action:**
   - In addition to reversing turn direction, playing a `Reverse` card reflects any pending draw penalty back to the previous player.
3. **2-Player Reverse Strike:**
   - With 2 players, a `Reverse` card reverses the turn back to the player who played it (granting an extra turn).
4. **Wild Reverse Color Shift:**
   - Wild cards in UNO Reverse force a color choice AND a directional shift, keeping players on their toes.
5. **Reverse Challenge on Draw Cards:**
   - If a player is targeted by a Draw Two or Wild Draw Four, they can play a matching Reverse card of the same color (or Wild) to deflect the penalty in the opposite direction.
