import * as Phaser from 'phaser';
import PlayerContainer from '../classes/player/PlayerContainer';
import Chest from '../classes/Chest';
import Monster from '../classes/Monster';
import GameMap from '../classes/GameMap';
import { Scale, AUDIO_LEVEL } from '../game_manager/utils';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init() {
    this.scene.launch('Ui');
    // get a reference to the socket
    this.socket = this.sys.game.globals.socket;
    // listen for socket events
    this.listenForSocketEvents();
  }

  listenForSocketEvents() {
    // spawn player game objects
    this.socket.on('currentPlayers', (players) => {
      console.log('currentPlayers');
      console.log(players);
      Object.keys(players).forEach((id) => {
        if (players[id].id === this.socket.id) {
          this.createPlayer(players[id], true);
          this.addCollisions();
        } else {
          this.createPlayer(players[id], false);
        }
      });
    });

    this.socket.on('currentMonsters', (monsters) => {
      Object.keys(monsters).forEach((id) => {
        this.spawnMonster(monsters[id]);
      });
    });
    this.socket.on('currentChests', (chests) => {
      Object.keys(chests).forEach((id) => {
        this.spawnChest(chests[id]);
      });
    });
    this.socket.on('spawnPlayer', (player) => {
      this.createPlayer(player, false);
    });
    // when any player moves
    this.socket.on('playerMoved', (player) => {
      this.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (player.id === otherPlayer.id) {
          otherPlayer.flipX = player.flipX;
          otherPlayer.setPosition(player.x, player.y);
          otherPlayer.updateHealthBar();
          otherPlayer.updateFlipX();
          otherPlayer.playerAttacking = player.Attacking;
          otherPlayer.currentDirection = player.currentDirection;
          if (player.playerAttacking) {
            otherPlayer.attack();
          }
        }
      });
    });
    this.socket.on('chestSpawned', (chest) => {
      this.spawnChest(chest);
    });
    this.socket.on('monsterSpawned', (monster) => {
      // console.log('spawned:'+monster);
      this.spawnMonster(monster);
    });
    this.socket.on('monsterRemoved', (monsterId) => {
      this.monsters.getChildren().forEach((monster) => {
        if (monster.id === monsterId) {
          monster.makeInactive();
          this.enemyDeathAudio.play();
        }
      });
    });
    this.socket.on('monsterMovement', (monsters) => {
      this.monsters.getChildren().forEach((monster) => {
        Object.keys(monsters).forEach((monsterId) => {
          if (monster.id === monsterId) {
            // better than setPosition() because it will use physics and is smoother
            // the 1st argument is for what is moving
            // 2nd argument must contain an x.y coordinate
            // 3rd arg is velocity
            this.physics.moveToObject(monster, monsters[monsterId], 40);
          }
        });
      });
    });
    this.socket.on('chestRemoved', (chestId) => {
      this.chests.getChildren().forEach((chest) => {
        if (chest.id === chestId) {
          chest.makeInactive();
        }
      });
    });
    this.socket.on('updateBalance', (bitcoinAmount) => {
      this.events.emit('updateBalance', bitcoinAmount);
    });
    this.socket.on('updateMonsterHealth', (monsterId, health) => {
      this.monsters.getChildren().forEach((monster) => {
        if (monster.id === monsterId) {
          monster.updateHealth(health);
        }
      });
    });

    this.socket.on('updatePlayerHealth', (playerId, health) => {
      if (this.player.id === playerId) {
        if (health < this.player.health) {
          this.playerDamageAudio.play();
        }
        this.player.updateHealth(health);
      } else {
        this.otherPlayers.getChildren().forEach((player) => {
          if (player.id === playerId) {
            player.updateHealth(health);
          }
        });
      }
    });

    this.socket.on('respawnPlayer', (playerObject) => {
      if (this.player.id === playerObject.id) {
        this.playerDeathAudio.play();
        this.player.respawn(playerObject);
      } else {
        this.otherPlayers.getChildren().forEach((player) => {
          if (player.id === playerObject.id) {
            player.respawn(playerObject);
          }
        });
      }
    });
    // TODO fix this disconnect event currently doesn't work!
    this.socket.on('playerDisconnect', (playerId) => {
      this.otherPlayers.getChildren().forEach((player) => {
        if (playerId === player.id) {
          player.cleanUp();
        }
      });
    });
  }

  create() {
    this.createMap();
    this.createAudio();
    this.createInput();
    this.createGroups();
    // emit event that a new player joined
    this.socket.emit('newPlayer', { test: '1234' });
  }

  update() {
    if (this.player) {
      this.player.update(this.cursors);
    }
    // if no change then don't emit event only emit on change so server doesn't get flooded with b.s.
    if (this.player) {
      const {
        x, y, flipX, playerAttacking, currentDirection,
      } = this.player;
      if (this.player.oldPosition
        && (x !== this.player.oldPosition.x
          || y !== this.player.oldPosition.y
          || flipX !== this.player.oldPosition.flipX
          || playerAttacking !== this.player.oldPosition.playerAttacking)) {
        this.socket.emit('playerMovement', {
          x, y, flipX, playerAttacking, currentDirection,
        });
      }
      // save old position data
      this.player.oldPosition = {
        x: this.player.x,
        y: this.player.y,
        flipX: this.player.flipX,
        playerAttacking: this.player.playerAttacking,
      };
    }
  }

  createAudio() {
    this.goldAudio = this.sound.add('goldAudio', {
      loop: false,
      volume: AUDIO_LEVEL * 0.6, // value between 0 and 1ß
    });
    this.enemyDeathAudio = this.sound.add('enemyDeathAudio', {
      loop: false,
      volume: AUDIO_LEVEL, // value between 0 and 1
    });
    this.playerAttackAudio = this.sound.add('playerAttackAudio', {
      loop: false,
      volume: AUDIO_LEVEL * 0.05, // value between 0 and 1
    });
    this.playerDamageAudio = this.sound.add('playerDamageAudio', {
      loop: false,
      volume: AUDIO_LEVEL * 0.5, // value between 0 and 1
    });
    this.playerDeathAudio = this.sound.add('playerDeathAudio', {
      loop: false,
      volume: AUDIO_LEVEL, // value between 0 and 1
    });
  }

  createPlayer(playerObject, mainPlayer) {
    const playerGameObject = new PlayerContainer(
      this,
      playerObject.x * Scale.FACTOR,
      playerObject.y * Scale.FACTOR,
      'characters',
      5,
      playerObject.health,
      playerObject.maxHealth,
      playerObject.id,
      this.playerAttackAudio,
      mainPlayer, // true if main player
    );
    if (!mainPlayer) {
      this.otherPlayers.add(playerGameObject);
    } else {
      this.player = playerGameObject;
    }
  }

  createGroups() {
    this.chests = this.physics.add.group();
    this.monsters = this.physics.add.group();
    // this will auto run if this group has an update method
    this.monsters.runChildUpdate = true;
    // create an other players group
    this.otherPlayers = this.physics.add.group();
    this.otherPlayers.runChildUpdate = true;
  }

  spawnChest(chestObject) {
    // console.log(location);
    let chest = this.chests.getFirstDead();
    if (!chest) {
      // console.log('create new chest');
      chest = new Chest(
        this,
        chestObject.x * Scale.FACTOR,
        chestObject.y * Scale.FACTOR,
        'items',
        0,
        chestObject.bitcoin,
        chestObject.id,
      );
      this.chests.add(chest);
    } else {
      // console.log('reposition dead chest');
      chest.coin = chestObject.bitcoin;
      chest.id = chestObject.id;
      chest.setPosition(chestObject.x * Scale.FACTOR, chestObject.y * Scale.FACTOR);
      chest.makeActive();
    }
  }

  spawnMonster(monsterObject) {
    let monster = this.monsters.getFirstDead();
    if (!monster) {
      // console.log(monsterObject);
      monster = new Monster(
        this,
        monsterObject.x,
        monsterObject.y,
        'monsters',
        monsterObject.frame,
        monsterObject.id,
        monsterObject.health,
        monsterObject.attack,
        monsterObject.maxHealth,
      );
      this.monsters.add(monster);
    } else {
      monster.id = monsterObject.id;
      monster.health = monsterObject.health;
      monster.maxHealth = monsterObject.maxHealth;
      monster.setTexture('monsters', monsterObject.frame);
      monster.setPosition(monsterObject.x, monsterObject.y);
      monster.makeActive();
    }
  }

  createInput() {
    // this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors = this.input.keyboard.addKeys({
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      up: 'up',
      down: 'down',
      left: 'left',
      right: 'right',
      space: 'space',
    });
  }

  addCollisions() {
    // block the player and everything in the blocked layer
    this.physics.add.collider(this.player, this.gameMap.blockedLayer);
    this.physics.add.overlap(this.player, this.chests, this.collectChest, null, this);
    this.physics.add.collider(this.monsters, this.gameMap.blockedLayer);
    this.physics.add.overlap(this.player.weapon, this.monsters, this.enemyOverlap, null, this);
    // add collisions for players to each other
    this.physics.add.collider(this.otherPlayers, this.player, this.pvpCollider, false, this);
    // check for overlap of weapon
    this.physics.add.overlap(this.player.weapon, this.otherPlayers, this.weaponOverlapEnemy, false, this);
  }

  pvpCollider(player, otherPlayer) {
    this.player.body.setVelocity(0);
    otherPlayer.body.setVelocity(0);
  }

  weaponOverlapEnemy(player, enemyPlayer) {
    if (this.player.playerAttacking && !this.player.swordHit) {
      this.player.swordHit = true;
      this.socket.emit('attackedPlayer', enemyPlayer.id);
    }
  }

  enemyOverlap(weapon, enemy) {
    if (this.player.playerAttacking && !this.player.swordHit) {
      this.player.swordHit = true;
      // enemy.makeInactive();
      this.socket.emit('monsterAtttacked', enemy.id);
    }
  }

  collectChest(player, chest) {
    // console.log('collected chest');
    // chest.makeInactive();  this now done by chest event listener on chestRemoved
    // this.score += chest.coins commenting this out because now it exist in the player model
    // this.events.emit('updateBalance', this.score);  this also taken out and put game manager
    if (this.goldAudio.isPlaying === false) {
      this.goldAudio.play();
    }
    this.socket.emit('pickUpChest', chest.id);
  }

  createMap() {
    // create map
    this.gameMap = new GameMap(this, 'map', 'background', 'background', 'blocked');
  }
}