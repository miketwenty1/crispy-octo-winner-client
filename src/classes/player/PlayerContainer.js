import * as Phaser from 'phaser';
import Player from './Player';
import Direction from '../../utils/direction';
import { Scale } from '../../utils/utils';

export default class PlayerContainer extends Phaser.GameObjects.Container {
  constructor(scene, x, y, key, frame, health, maxHealth, id, attackAudio, mainPlayer, username) {
    super(scene, x, y);
    this.scene = scene;
    // 32 for the pixels of the base sprites, 2.7 to get the scale with 2 to be about 360
    this.velocity = Scale.FACTOR * 32 * ((300 / Scale.FACTOR) / 32);
    this.currentDirection = Direction.RIGHT;
    this.playerAttacking = false;
    this.flipX = true;
    this.swordHit = false;
    this.health = health;
    this.maxHealth = maxHealth;
    this.id = id;
    this.attackAudio = attackAudio;
    this.mainPlayer = mainPlayer;
    this.username = username;
    this.frame = frame;

    this.setSize(32 * Scale.FACTOR, 32 * Scale.FACTOR);
    this.scene.physics.world.enable(this);
    this.body.setCollideWorldBounds(true);
    // true isn't working for some reason.
    // // i should be able to avoid offset and just use this.body.setSize(40, 55, true);
    this.body.setSize((Scale.FACTOR * 32 * 0.66), (Scale.FACTOR * 32 * 0.66));
    this.body.setOffset((((32 * Scale.FACTOR) - (Scale.FACTOR * 32 * 0.66)) / 2), (((32 * Scale.FACTOR) - (Scale.FACTOR * 32 * 0.66)) / 2));
    this.body.setAllowGravity(false);
    this.scene.add.existing(this);

    // have the camera follow the player.. but not other players
    if (this.mainPlayer) {
      this.scene.cameras.main.startFollow(this);
    }

    this.player = new Player(this.scene, 0, 0, key, frame);
    this.add(this.player);

    // weapon
    this.weapon = this.scene.add.image(32, -10, 'items', 4);
    this.scene.add.existing(this.weapon);
    this.weapon.setScale(Scale.FACTOR * 0.75);
    this.scene.physics.world.enable(this.weapon);
    this.add(this.weapon);
    this.weapon.alpha = 0;
    this.createHealthBar();
    this.createUsernameText();
  }

  createUsernameText() {
    this.usernameText = this.scene.make.text({
      x: this.x - 32,
      y: this.y - 60,
      text: this.username,
      style: {
        font: '14px monospace',
        fill: '#fff',
      },
    });
  }

  updateUsernameTextPosition() {
    this.usernameText.setPosition(this.x - 32, this.y - 60);
  }

  createHealthBar() {
    this.healthBar = this.scene.add.graphics();
    this.updateHealthBar();
  }

  updateHealthBar() {
    this.healthBar.clear();
    this.healthBar.fillStyle(0xffffff, 0.3);
    this.healthBar.fillRect(this.x - 32, this.y - 40, 32 * Scale.FACTOR, 5);
    this.healthBar.fillGradientStyle(0xff0000, 0xff00ff, 4);
    this.healthBar.fillRect(this.x - 32, this.y - 40, 32 * Scale.FACTOR * (this.health / this.maxHealth), 5);
  }

  updateHealth(health) {
    this.health = health;
    this.updateHealthBar();
  }

  respawn(playerObject) {
    this.health = playerObject.health;
    // this.setPosition(playerObject.x * Scale.FACTOR, playerObject.y * Scale.FACTOR);
    this.setPosition(playerObject.x, playerObject.y);
    this.updateHealthBar();
    this.updateUsernameTextPosition();
  }

  update(cursors) {
    if (this.mainPlayer) {
      // cursor
      this.body.setVelocity(0);
      if (cursors.up.isDown || cursors.w.isDown) {
        this.body.setVelocityY(-this.velocity);
        this.currentDirection = Direction.UP;
      } else if (cursors.down.isDown || cursors.s.isDown) {
        this.body.setVelocityY(this.velocity);
        this.currentDirection = Direction.DOWN;
      // eslint-disable-next-line no-empty
      } else {
      }
      if (cursors.left.isDown || cursors.a.isDown) {
        this.body.setVelocityX(-this.velocity);
        this.currentDirection = Direction.LEFT;
        this.player.flipX = false;
        this.flipX = false;
      } else if (cursors.right.isDown || cursors.d.isDown) {
        this.body.setVelocityX(this.velocity);
        this.currentDirection = Direction.RIGHT;
        this.player.flipX = true;
        this.flipX = true;
      // eslint-disable-next-line no-empty
      } else {
      }

      if (Phaser.Input.Keyboard.JustDown(cursors.space) && !this.playerAttacking) {
        this.attack();
      }
    }

    if (this.currentDirection === Direction.UP) {
      this.weapon.setPosition(0, -(Scale.FACTOR * 32) / 3);
    } else if (this.currentDirection === Direction.DOWN) {
      this.weapon.setPosition(0, (Scale.FACTOR * 32) / 3);
    } else if (this.currentDirection === Direction.LEFT) {
      this.weapon.setPosition(-(Scale.FACTOR * 32) / 3, 0);
    } else if (this.currentDirection === Direction.RIGHT) {
      this.weapon.setPosition((Scale.FACTOR * 32) / 3, 0);
    }

    if (this.playerAttacking) {
      if (this.weapon.flipX === true) {
        this.weapon.angle -= 10;
      } else {
        this.weapon.angle += 10;
      }
    } else {
      if (this.currentDirection === Direction.DOWN) {
        this.weapon.setAngle(-270);
      } else if (this.currentDirection === Direction.UP) {
        this.weapon.setAngle(-64);
      } else {
        this.weapon.setAngle(0);
      }
      this.weapon.flipX = false;
      if (this.currentDirection === Direction.LEFT) {
        this.weapon.flipX = true;
      }
    }
    this.updateHealthBar();
    this.updateUsernameTextPosition();
  }

  updateFlipX() {
    this.player.flipX = this.flipX;
  }

  attack() {
    if (this.mainPlayer) {
      this.attackAudio.play();
    }
    this.weapon.alpha = 1;
    this.playerAttacking = true;
    this.scene.time.delayedCall(150, () => {
      this.weapon.alpha = 0;
      this.playerAttacking = false;
      this.swordHit = false;
    }, [], this);
  }

  cleanUp() {
    this.healthBar.destroy();
    this.player.destroy();
    this.usernameText.destroy();
    this.destroy();
  }
}
