// config.js - Game configuration and constants

const CONFIG = {
    // Canvas dimensions
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 500,
    
    // Game physics
    BASE_GRAVITY: 0.46,
    BASE_PLAYER_SPEED: 3.45,
    BASE_PLAYER_JUMP_POWER: -11.5,
    BASE_PLAYER_DOUBLE_JUMP_POWER: -13,
    BASE_BOSS_VELOCITY: 1.725,
    BASE_BOSS_JUMP_POWER: -6.9,
    
    // Level configuration
    LEVEL_1_SPEED_MULTIPLIER: 0.85, // 15% slower
    LEVEL_SPEED_INCREMENT: 0.1,     // 10% faster per level
    MAX_LEVEL: 4,
    
    // Enemy configuration
    LEVEL_1_ENEMY_COUNT: 8,
    BASE_ENEMY_COUNT: 30,
    LEVEL_4_ENEMY_COUNT: 45,
    LEVEL_1_PLATFORM_ENEMY_CHANCE: 0.1,
    LEVEL_2_PLATFORM_ENEMY_CHANCE: 0.4,
    LEVEL_3_PLATFORM_ENEMY_CHANCE: 0.5,
    LEVEL_4_PLATFORM_ENEMY_CHANCE: 0.6,
    
    // Player configuration
    STARTING_LIVES: 3,
    INVULNERABILITY_FRAMES: 60,
    
    // Boss configuration
    BOSS_HITS_REQUIRED: 5,
    BOSS_INVULNERABILITY_FRAMES: 30,
    BOSS_AREA_START: 7400,
    
    // Scoring
    ENEMY_DEFEAT_SCORE: 100,
    BOSS_HIT_SCORE: 200,
    BOSS_DEFEAT_SCORE: 1000,
    
    // Asset dimensions
    TILE_SIZE: 40,
    PLAYER_WIDTH: 50,
    PLAYER_HEIGHT: 70,
    ENEMY_WIDTH: 60,
    ENEMY_HEIGHT: 60,
    BOSS_WIDTH: 120,
    BOSS_HEIGHT: 140,
    
    // Debug
    DEBUG_MODE: false
};

// Export the configuration
if (typeof module !== 'undefined') {
    module.exports = CONFIG;
}
