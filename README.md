# VOOO's Adventure Game

A 2D side-scrolling platformer game featuring VOOO the superhero who must overcome obstacles, defeat enemies, and conquer bosses across multiple levels with increasing difficulty.

## Game Features

- Multiple levels with increasing difficulty
- Full player control with WASD or Arrow keys
- Double jump ability with visual effects
- Different enemy types across levels (strawberries, cherries)
- Epic boss battle at the end of each level
- Score points by progressing through levels and defeating enemies
- Lives system with health tracking
- Detailed character, enemy, and environment graphics
- Parallax scrolling background for depth effect
- Level selection system
- Speed scaling based on level progression

## How to Play

1. Open `index.html` in a web browser
2. Select a level to begin (Level 1 recommended for beginners)
3. Use WASD or Arrow keys to move
4. Press Space, W, or Up arrow key to jump
5. Press jump again while in the air to perform a double jump
6. Avoid falling off platforms and watch out for lava gaps in higher levels
7. Defeat enemies by jumping on them from above
8. Find and defeat the boss at the end of the level by jumping on its head 5 times
9. Reach the flag after defeating the boss to win and advance to the next level

## Level System

- **Level 1: Beginner** - Slower game speed (15% slower), fewer enemies, no lava gaps
- **Level 2: Lava Challenge** - Normal game speed, more enemies, includes dangerous lava gaps
- **Level 3: Cherry Chaos** - Faster game speed (10% faster), cherry enemies, increased difficulty

Each subsequent level increases the game speed, making movement, jumping, and enemy interactions more challenging.

## Controls

- **W / Up Arrow**: Jump (press again in mid-air for double jump)
- **A / Left Arrow**: Move left
- **D / Right Arrow**: Move right
- **Space**: Jump/Double jump
- **1, 2, 3 Keys**: Select level
- **Click on level buttons**: Alternative level selection

## Special Abilities

- **Double Jump**: Perform a second jump while in the air
  - Visual indicator shows when double jump is available (white glow)
  - Particle effect appears when double jump is used
  - Double jump resets when player lands on a platform

## Enemy Types

- **Strawberry Enemies**: Basic enemies in Level 1 and 2
- **Cherry Enemies**: More challenging enemies in Level 3
- **Boss**: Appears at the end of each level, requires 5 hits to defeat

## Technical Details

The game is built using vanilla JavaScript, HTML5 Canvas, and CSS. No external libraries or frameworks are required.

Key technical features:
- Dynamic speed scaling system using a speedMultiplier variable
- Adaptive difficulty based on level selection
- Particle effects system for visual feedback
- Collision detection system for platforms, enemies, and hazards
- Responsive UI that adapts to different screen sizes

## License

This project is open source and available for personal and educational use.
