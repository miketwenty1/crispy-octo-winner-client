import * as Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // load images
    this.loadImages();
    // load spritesheet
    this.loadSpriteSheets();
    // you can provide multiple audio clips for this sound depending
    // on whether or not they support the type

    this.loadAudio();
    // load in Tiled map
    this.loadTimeMap();
  }

  loadImages() {
    this.load.image('button1', 'assets/images/ui/blue_button01.png');
    this.load.image('button2', 'assets/images/ui/blue_button02.png');
    this.load.image('btc', 'assets/images/btc.png');
    this.load.image('background', 'assets/level/background-extruded.png');
    this.load.image('inventoryShield', 'assets/images/ui/condensation_shield_new.png');
    this.load.image('inventoryBitcoin', 'assets/images/ui/gold_pile_16.png');
    this.load.image('inventoryButton', 'assets/images/ui/instructions.png');
    this.load.image('inventorySword', 'assets/images/ui/infusion.png');
    this.load.image('inventoryRemove', 'assets/images/ui/prompt_no.png');
    this.load.image('inventoryHeart', 'assets/images/ui/regeneration_new.png');
  }

  loadSpriteSheets() {
    this.load.spritesheet('items', 'assets/images/items.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('tools', 'assets/images/tools.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('characters', 'assets/images/characters.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('monsters', 'assets/images/monsters.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('bg_spritesheet', 'assets/level/background.png', { frameWidth: 32, frameHeight: 32 });
  }

  loadAudio() {
    this.load.audio('itemAudio', ['assets/audio/Pickup.wav']);
    this.load.audio('goldAudio', ['assets/audio/coin1.wav']);
    this.load.audio('enemyDeathAudio', ['assets/audio/EnemyDeath.wav']);
    this.load.audio('playerAttackAudio', ['assets/audio/PlayerAttack.wav']);
    this.load.audio('playerDamageAudio', ['assets/audio/PlayerDamage.wav']);
    this.load.audio('playerDeathAudio', ['assets/audio/PlayerDeath.wav']);
  }

  loadTimeMap() {
    // load tiled json
    this.load.tilemapTiledJSON('map', 'assets/level/large_level.json');
  }

  create() {
    // this.scene.start('Game');
    this.scene.start('Title');
    // this.scene.start('CharacterSelection');
  }
}
