import * as Phaser from 'phaser';
import PlayerContainer from '../classes/player/PlayerContainer';
import Chest from '../classes/Chest';
import HealingFountain from '../classes/HealingFountain';
import Monster from '../classes/Monster';
import GameMap from '../classes/GameMap';
import { getCookie, AUDIO_LEVEL, Scale } from '../utils/utils';
import DialogWindow from '../classes/DialogWindow';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init(data) {
    this.scene.launch('Ui');
    // get a reference to the socket
    this.socket = this.sys.game.globals.socket;
    // listen for socket events
    this.listenForSocketEvents();
    if (data.selectedCharacter === 0) {
      // this is done because 0 is a logical false apparently
      this.selectedCharacter = 0;
    } else {
      this.selectedCharacter = data.selectedCharacter || 6;
    }
  }

  listenForSocketEvents() {
    // spawn player game objects
    this.socket.on('currentPlayers', (players) => {
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
      this.targetMonsters = monsters;
      // console.log(`movement when resetting is ${this.resettingLocation}`);
      // if (this.resettingLocation === true) {
      //   console.log('waiting for monster location reset to be done');
      // } else {
      //   this.monsterCollider.active = true;
      //   this.monsters.getChildren().forEach((monster) => {
      //     const sourceX = monster.x;
      //     const sourceY = monster.y;
      //     Object.keys(monsters).forEach((monsterId) => {
      //       if (monster.id === monsterId) {
      //         // better than setPosition() because it will use physics and is smoother
      //         // the 1st argument is for what is moving
      //         // 2nd argument must contain an x.y coordinate (monsters[monsterId]) has x,y properties
      //         // 3rd arg is velocity
      //         const distance = Phaser.Math.Distance.Between(sourceX, sourceY, monsters[monsterId].x, monsters[monsterId].y);
      //         this.physics.moveToObject(monster, monsters[monsterId], monster.mVelocity, monsters[monsterId].movementIntervalTime);
      //         // this.monsters[monsterId] = monster.setPosition(monsters[monsterId].x, monsters[monsterId].y);
      //         if (distance < 10) {
      //           monster.body.reset(monster.x, monster.y);
      //         }
      //       }
      //     });
      //   });
      //   // THIS IS EXCESSIVE
      //   this.monsters.getChildren().forEach((monster) => {
      //     monster.body.collideWorldBounds = true;
      //   });
      // }
    });
    // this.socket.on('resetLocationMovement', (monsters) => {
    //   this.resettingLocation = true;
    //   this.monsterCollider.active = false;
    //   this.monsters.getChildren().forEach((monster) => {
    //     const sourceX = monster.x;
    //     const sourceY = monster.y;
    //     Object.keys(monsters).forEach((monsterId) => {
    //       if (monster.id === monsterId) {
    //         // better than setPosition() because it will use physics and is smoother
    //         // the 1st argument is for what is moving
    //         // 2nd argument must contain an x.y coordinate (monsters[monsterId]) has x,y properties
    //         // 3rd arg is velocity
    //         const distance = Phaser.Math.Distance.Between(sourceX, sourceY, monsters[monsterId].x, monsters[monsterId].y);
    //         this.physics.moveToObject(monster, monsters[monsterId], monster.mVelocity, monsters[monsterId].movementIntervalTime / 3);
    //         // monster.setPosition(monsters[monsterId].x, monsters[monsterId].y);
    //         if (distance < 10) {
    //           monster.body.reset(monster.x, monster.y);
    //         }
    //       }
    //     });
    //   });
    //   // THIS IS EXCESSIVE
    //   // this.monsters.getChildren().forEach((monster) => {
    //   //   // monster.body.collideWorldBounds = true;
    //   // });
    //   this.resettingLocation = false;
    // });
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
          if (this.playerDamageAudio.isPlaying === false) {
            this.playerDamageAudio.play();
          }
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

    this.socket.on('playerDisconnect', (playerId) => {
      this.otherPlayers.getChildren().forEach((player) => {
        if (playerId === player.id) {
          player.cleanUp();
        }
      });
    });

    this.socket.on('newMessage', (messageObj) => {
      // console.log(messageObj);
      this.dialogWindow.addNewMessage(messageObj);
    });

    this.socket.on('invalidToken', () => {
      window.alert('invalid token log in again por FaVoR');
      window.location.reload();
    });
  }

  create() {
    this.createMap();
    this.createAudio();
    this.createInput();
    this.createGroups();
    this.createSpriteAnimations();

    this.dialogWindow = new DialogWindow(this, {
      x: this.scale.width,
      y: this.scale.height,
    });

    // emit event that a new player joined
    this.socket.emit('newPlayer', getCookie('jwt'), this.selectedCharacter);
    // NOT SURE HOW this is working with this code being commented out
    this.scale.on('resize', this.resize, this);
    this.resize({ width: this.scale.width, height: this.scale.height });

    // add keydown event listener
    this.keyDownEventListener();

    // remove focus from chat input field
    this.input.on('pointerdown', () => {
      document.getElementById('chatInput').blur();
      this.player.toggleMovement();
    });
  }

  keyDownEventListener() {
    this.inputMessageField = document.getElementById('chatInput');

    window.addEventListener('keydown', (event) => {
      // 13 is the enter key
      if (event.which === 13) {
        this.sendMessage();
      // 32 is the spacebar
      } else if (event.which === 32) {
        if (document.activeElement === this.inputMessageField) {
          this.inputMessageField.value = `${this.inputMessageField.value} `;
        }
      // 65 is the a key
      } else if (event.which === 65) {
        if (document.activeElement === this.inputMessageField) {
          this.inputMessageField.value = `${this.inputMessageField.value}a`;
        }
      // 83 is the s key
      } else if (event.which === 83) {
        if (document.activeElement === this.inputMessageField) {
          this.inputMessageField.value = `${this.inputMessageField.value}s`;
        }
      // 68 is the d key
      } else if (event.which === 68) {
        if (document.activeElement === this.inputMessageField) {
          this.inputMessageField.value = `${this.inputMessageField.value}d`;
        }
      // 87 is the w key
      } else if (event.which === 87) {
        if (document.activeElement === this.inputMessageField) {
          this.inputMessageField.value = `${this.inputMessageField.value}w`;
        }
      }
    });
  }

  sendMessage() {
    // console.log('send message');
    if (this.inputMessageField) {
      const message = this.inputMessageField.value;
      if (message) {
        this.inputMessageField.value = '';
        console.log(message);
        this.socket.emit('sendMessage', message, getCookie('jwt'));
      }
    }
    document.getElementById('chatInput').blur();
  }

  updateMonsterLocations() {
    if (this.targetMonsters) {
      this.monsters.getChildren().forEach((monster) => {
        const sourceX = monster.x;
        const sourceY = monster.y;
        Object.keys(this.targetMonsters).forEach((monsterId) => {
          if (monster.id === monsterId) {
            // better than setPosition() because it will use physics and is smoother
            // the 1st argument is for what is moving
            // 2nd argument must contain an x.y coordinate (monsters[monsterId]) has x,y properties
            // 3rd arg is velocity
            const distance = Phaser.Math.Distance.Between(sourceX, sourceY, this.targetMonsters[monsterId].x, this.targetMonsters[monsterId].y);
            // uses acceleration slow down speed up depending on how far away
            this.physics.moveToObject(monster, this.targetMonsters[monsterId], monster.mVelocity, this.targetMonsters[monsterId].movementIntervalTime);
            // good for constant speed coupled with reset logic can make cool charge like attacks
            // this.physics.moveToObject(monster, this.targetMonsters[monsterId], 100);
            // this.monsters[monsterId] = monster.setPosition(monsters[monsterId].x, monsters[monsterId].y);
            if (distance < 10) {
              // this.monsterCollider.active = true;
              monster.body.reset(this.targetMonsters[monsterId].x, this.targetMonsters[monsterId].y);
            }
            // else if (distance >= 100 && distance < 500 && this.monsterCollider.active === true) {
            //   this.monsterCollider.active = false;
            // } else if (distance >= 1000) {
            //   // monster.body.reset(this.targetMonsters[monsterId].x, this.targetMonsters[monsterId].y);
            //   // monster.setPosition(this.targetMonsters[monsterId].x, this.targetMonsters[monsterId].y);
            // }
          }
        });
      });
    }
  }

  update() {
    this.dialogWindow.update();
    if (this.player) {
      this.player.update(this.cursors, this.input.activePointer);
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
    // freeze monster if in right location
    this.updateMonsterLocations();
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
      playerObject.x,
      playerObject.y,
      'characters',
      playerObject.frame,
      playerObject.health,
      playerObject.maxHealth,
      playerObject.id,
      this.playerAttackAudio,
      mainPlayer, // true if main player
      playerObject.username,
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
    let chest = this.chests.getFirstDead();
    if (!chest) {
      chest = new Chest(
        this,
        chestObject.x,
        chestObject.y,
        'items',
        0,
        chestObject.bitcoin,
        chestObject.id,
      );
      this.chests.add(chest);
    } else {
      chest.coin = chestObject.bitcoin;
      chest.id = chestObject.id;
      chest.setPosition(chestObject.x, chestObject.y);
      chest.makeActive();
    }
  }

  spawnMonster(monsterObject) {
    let monster = this.monsters.getFirstDead();
    if (!monster) {
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
        monsterObject.mVelocity,
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
    this.input.setPollAlways();
  }

  addCollisions() {
    // block the player and everything in the blocked layer
    this.physics.add.collider(this.player, this.gameMap.blockedLayer);
    this.physics.add.overlap(this.player, this.chests, this.collectChest, null, this);
    this.physics.add.overlap(this.player, this.monsters, this.monsterOverlap, null, this);
    this.monsterCollider = this.physics.add.collider(this.monsters, this.gameMap.blockedLayer);
    // for now we leave this false until monsters synced on backend with collision logic.
    this.monsterCollider.active = false;
    this.physics.add.overlap(this.player.weapon, this.monsters, this.enemyOverlap, null, this);
    // add collisions for players to each other
    this.physics.add.collider(this.otherPlayers, this.player, this.pvpCollider, false, this);
    // check for overlap of weapon
    this.physics.add.overlap(this.player.weapon, this.otherPlayers, this.weaponOverlapEnemy, false, this);
    this.physics.add.collider(this.player, this.fountain.innerCollisionObj);
    this.physics.add.overlap(this.player, this.fountain, this.healOverlap, false, this);
  }

  pvpCollider(player, otherPlayer) {
    this.player.body.setVelocity(0);
    otherPlayer.body.setVelocity(0);
  }

  healOverlap() {
    if (this.player.health < this.player.maxHealth) {
      this.socket.emit('healPlayer');
    }
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
      this.socket.emit('monsterAttacked', enemy.id);
    }
  }

  collectChest(player, chest) {
    // chest.makeInactive();  this now done by chest event listener on chestRemoved
    // this.score += chest.coins commenting this out because now it exist in the player model
    // this.events.emit('updateBalance', this.score);  this also taken out and put game manager
    if (this.goldAudio.isPlaying === false) {
      this.goldAudio.play();
    }
    this.socket.emit('pickUpChest', chest.id);
  }

  monsterOverlap(player, monster) {
    if (this.playerDamageAudio.isPlaying === false) {
      this.playerDamageAudio.play();
    }
    this.socket.emit('monsterOverlap', monster.id);
  }

  createMap() {
    // create map
    this.gameMap = new GameMap(this, 'map', 'background', 'background', 'blocked', 'special_locations');
  }

  resize(gameSize) {
    const { width, height } = gameSize;
    this.cameras.resize(width, height);
    this.dialogWindow.resize(gameSize);
  }

  createSpriteAnimations() {
    // healing fountain

    // THIS IS GOOD for things that dont need to objects or use physics
    // this.fountainAnimation = this.anims.create({
    //   key: 'sprinkle',
    //   frames: this.anims.generateFrameNumbers('bg_spritesheet', { frames: [82, 83] }),
    //   frameRate: 3,
    // });
    // const sprite = this.add.sprite(2000, 2000, 'bg_spritesheet').setScale(2);
    // sprite.play({ key: 'sprinkle', repeat: -1 });
    this.fountain = new HealingFountain(
      this,
      this.gameMap.specialLayer.objects[0].x * Scale.FACTOR,
      this.gameMap.specialLayer.objects[0].y * Scale.FACTOR,
      23423,
    );
  }
}
