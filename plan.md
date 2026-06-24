# Character Overhaul & New Mechanics

We are going to implement unique physics abilities for the alternate characters and give them the same high-quality 3D/animated visual treatment as the main hero. We will also redesign the main hero to have a unique visual identity (Grey hoodie).

## Proposed Changes

### 1. State Management (`js/state.js`)
- Add physics-tracking variables to the `player` object: `jumpCount`, `jetpackFuel`, `isFlipping`, and `jetpackActive`.
- We will dynamically set `state.lives` when the game starts based on the chosen character (Hero: 10, Ninja/Robot: 6).

### 2. Player Physics & Input (`js/player.js`)
- **Key Tracking:** Implement logic to detect distinct key presses vs. holds (necessary for double jumps vs jetpack thrusts).
- **Ninja Logic:**
  - Base jump power reduced from `-11` to `-9`.
  - Add double jump: if the jump key is pressed again mid-air, apply a second jump impulse and trigger the `isFlipping` animation flag.
- **Robot Logic:**
  - When reaching the apex of the jump (when `dy` approaches `0`), holding jump will consume `jetpackFuel` to provide a small upward thrust, extending hangtime. 
  - Spawn exhaust/fire particles under the player while active.

### 3. UI Initialization (`js/ui.js` & `js/main.js`)
- Modify `startGame()` to assign `state.lives = 6` if Ninja or Robot is selected.

### 4. Visual Overhauls (`js/render.js`)
- **Hero Revamp:**
  - Redesign colors: Change red/blue to shades of grey (Grey hoodie, grey pants).
  - Modify the hat to resemble a hoodie/hood, keep the moustache.
- **Ninja Remake:**
  - Rebuild using the articulated limb system (moving arms/legs).
  - Dark ninja garb with cyan accents.
  - Implement canvas rotation logic to handle the mid-air double jump flip animation (`player.isFlipping`).
- **Robot Remake:**
  - Rebuild using the articulated limb system.
  - Industrial metallic look, glowing cyan/green antenna.
  - Draw a jetpack on the back. When `jetpackActive` is true, render a jet engine flame.

## Verification Plan
### Manual Verification
- Start the game with the Hero: Check visual design and 10 lives.
- Start the game with the Ninja: Check 6 lives, test shorter jump, test double jump, observe flip animation.
- Start the game with the Robot: Check 6 lives, jump and hold space to see the jetpack thrust at the apex, observe jet flames.
