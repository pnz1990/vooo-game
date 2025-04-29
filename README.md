# VOOO's Adventure Game

A 2D side-scrolling platformer game featuring VOOO the superhero who must overcome obstacles, defeat strawberry enemies, and conquer the final boss.

## Game Features

- Full player control with WASD or Arrow keys
- Jump over obstacles and onto platforms
- Defeat strawberry enemies by jumping on them
- Epic boss battle at the end of the level
- Score points by progressing through the level and defeating enemies
- Multiple lives system
- Detailed character, enemy, and environment graphics
- Parallax scrolling background for depth effect

## How to Play

1. Open `index.html` in a web browser
2. Click "Start Game" to begin
3. Use WASD or Arrow keys to move
4. Press Space, W, or Up arrow key to jump
5. Alternatively, use the on-screen Jump button
6. Avoid falling off platforms
7. Defeat strawberry enemies by jumping on them from above
8. Find and defeat the boss at the end of the level by jumping on its head 5 times
9. Reach the flag after defeating the boss to win

## Controls

- **W / Up Arrow**: Jump
- **A / Left Arrow**: Move left
- **D / Right Arrow**: Move right
- **S / Down Arrow**: Duck (not implemented yet)
- **Space**: Jump
- **Start Button**: Start or restart the game
- **Jump Button**: Alternative jump control for touch devices

## Testing

The game includes a comprehensive test suite to prevent regressions and ensure code quality:

1. **Run tests manually**: `./run-tests.sh` or `npm test` (requires Node.js)
2. **Automatic testing**: Tests run automatically before each git push via a pre-push hook
3. **Test coverage**: Tests cover player mechanics, enemy behavior, collisions, level progression, and more

If tests fail, the push will be aborted, ensuring only working code reaches the repository.

## Future Enhancements

- Additional levels with increasing difficulty
- Power-ups and special abilities
- More enemy types
- Improved graphics and animations
- Sound effects and background music
- High score system

## Technical Details

The game is built using vanilla JavaScript, HTML5 Canvas, and CSS. No external libraries or frameworks are required.

## License

This project is open source and available for personal and educational use.
