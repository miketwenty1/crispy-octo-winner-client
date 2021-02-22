import * as Phaser from 'phaser';
import Player from './Player';
import Direction from '../../utils/direction';

const Scale = {
  FACTOR: 2,
};

export default class PlayerContainer extends Phaser.GameObjects.Container {
  constructor(scene, x, y, key, frame, health, maxHealth, id, attackAudio, mainPlayer, username) {
    super(scene, x, y);
    this.scene = scene;
    this.velocity = 360;
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

    this.setSize(32 * Scale.FACTOR, 32 * Scale.FACTOR);
    this.scene.physics.world.enable(this);
    this.body.setCollideWorldBounds(true);
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
    // console.log(`health: ${this.health} max health: ${this.maxHealth}`);
    this.healthBar.fillRect(this.x - 32, this.y - 40, 32 * Scale.FACTOR * (this.health / this.maxHealth), 5);
  }

  updateHealth(health) {
    this.health = health;
    this.updateHealthBar();
  }

  respawn(playerObject) {
    this.health = playerObject.health;
    this.setPosition(playerObject.x * Scale.FACTOR, playerObject.y * Scale.FACTOR);
    this.updateHealthBar();
    this.updateUsernameTextPosition();
  }

  update(cursors) {
    if (this.mainPlayer) {
      // cursor
      this.body.setVelocity(0);
      if (cursors.up.isDown || cursors.w.isDown) {
        // console.log(cursors);
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
      this.weapon.setPosition(-30, -13);
    } else if (this.currentDirection === Direction.DOWN) {
      this.weapon.setPosition(20, 20);
    } else if (this.currentDirection === Direction.LEFT) {
      this.weapon.setPosition(-32, -10);
    } else if (this.currentDirection === Direction.RIGHT) {
      this.weapon.setPosition(32, -10);
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
