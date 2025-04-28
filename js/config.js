/**
 * Game configuration and constants
 */
const CONFIG = {
    canvas: {
        width: 800,
        height: 500
    },
    physics: {
        baseGravity: 0.46,
    },
    player: {
        width: 50,
        height: 70,
        baseSpeed: 3.45,
        baseJumpPower: -11.5,
        doubleJumpPower: -13
    },
    enemies: {
        strawberry: {
            width: 60,
            height: 60
        }
    },
    boss: {
        width: 120,
        height: 140,
        baseSpeed: 1.725,
        baseJumpPower: -6.9,
        hitsRequired: 5
    },
    tiles: {
        size: 40
    },
    levels: {
        baseEnemyCount: 30,
        level1: {
            speedMultiplier: 0.85,
            enemyCount: 8,
            platformEnemyChance: 0.1
        }
    },
    debug: false
};

export default CONFIG;
