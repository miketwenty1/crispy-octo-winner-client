import * as Phaser from 'phaser';
import Player from './Player';
import { Scale } from '../../utils/utils';

export default class PlayerContainer extends Phaser.GameObjects.Container {
  constructor(
    scene,
    x,
    y,
    key,
    frame,
    attack,
    health,
    maxHealth,
    defense,
    id,
    attackAudio,
    mainPlayer,
    username,
    bitcoin,
    defenseValue,
    attackValue,
    items,

  ) {
    super(scene, x, y);
    this.scene = scene;
    // 32 for the pixels of the base sprites, 2.7 to get the scale with 2 to be about 360
    this.velocity = Scale.FACTOR * 32 * ((300 / Scale.FACTOR) / 32);
    this.weaponDirection = {
      x: 0,
      y: 0,
      angle: 0,
      flipY: false,
    };
    this.playerAttacking = false;
    this.flipX = true;
    this.swordHit = false;
    this.attack = attack;
    this.health = health;
    this.maxHealth = maxHealth;
    this.defense = defense;
    this.id = id;
    this.attackAudio = attackAudio;
    this.mainPlayer = mainPlayer;
    this.username = username;
    this.frame = frame;
    this.movementEnabled = false;
    this.bitcoin = bitcoin;
    this.defenseValue = defenseValue;
    this.attackValue = attackValue;
    this.items = items;

    // this.setSize(32 * Scale.FACTOR, 32 * Scale.FACTOR);
    this.setSize((Scale.FACTOR * 32 * 0.66), (Scale.FACTOR * 32 * 0.66));
    this.scene.physics.world.enable(this);
    this.body.setCollideWorldBounds(true);
    // THIS ISN't NEed but staying for reference
    // true isn't working for some reason.
    // // i should be able to avoid offset and just use this.body.setSize(40, 55, true);
    // this.body.setSize((Scale.FACTOR * 32 * 0.66), (Scale.FACTOR * 32 * 0.66));
    // this.body.setOffset((((32 * Scale.FACTOR) - (Scale.FACTOR * 32 * 0.66)) / 2), (((32 * Scale.FACTOR) - (Scale.FACTOR * 32 * 0.66)) / 2));
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
    // this.weapon = this.scene.add.image(32, -10, 'tools', 0);
    this.scene.add.existing(this.weapon);
    this.weapon.setScale(Scale.FACTOR * 0.75);
    this.scene.physics.world.enable(this.weapon);
    this.add(this.weapon);
    this.weapon.alpha = 1;
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

  // for angular velocity
  // x = r(cos(degrees‎°)), y = r(sin(degrees‎°))
  update(cursors, pointer) {
    if (this.mainPlayer && this.body) {
      // cursor
      this.body.setVelocity(0);
      this.movePlayer(cursors, pointer);

      if (Phaser.Input.Keyboard.JustDown(cursors.space) && !this.playerAttacking) {
        this.attackAction();
      }
    }
    this.updateHealthBar();
    this.updateUsernameTextPosition();
  }

  movePlayer(cursors, pointer) {
    // get hypotenuse/distance for velocity > than pixelThresholdForMaxVelocity pixels = full velocity otherwise percentage
    if (this.movementEnabled) {
      if (pointer.position === pointer.prevPosition) {
        // do nothing for now everything is the same
      } else {
        // calculate new projection of character
        const pixelThresholdForMaxVelocity = 150;
        let intensity = 0;
        const distance = Phaser.Math.Distance.Between(pointer.worldX, pointer.worldY, this.x, this.y);
        if (distance > 15) {
          if (distance >= pixelThresholdForMaxVelocity) {
            intensity = 1;
          } else {
            intensity = distance / pixelThresholdForMaxVelocity;
          }
          const pVelocity = this.velocity * intensity;
          const weaponLengthFromPlayer = 32;

          // get angle from pointer to player
          const pointerAngle = Math.trunc((Math.atan2(pointer.worldY - this.y, pointer.worldX - this.x) * 180) / Math.PI);
          const radian = (pointerAngle * Math.PI) / 180;
          const yVelocity = Math.trunc(Math.sin(radian) * pVelocity);
          const xVelocity = Math.trunc(Math.cos(radian) * pVelocity);
          const yWeapon = Math.sin(radian) * weaponLengthFromPlayer;
          const xWeapon = Math.cos(radian) * weaponLengthFromPlayer;
          this.body.setVelocityY(yVelocity);
          this.body.setVelocityX(xVelocity);
          this.weapon.setPosition(xWeapon, yWeapon);

          if (pointerAngle >= -90 && pointerAngle < 90) {
            this.player.flipX = true;
            this.flipX = true;
            this.weapon.flipY = false;
          } else {
            this.player.flipX = false;
            this.flipX = false;
            this.weapon.flipY = true;
          }
          // this is set so other players can pick it up. Otherwise players won't see updates.
          // this doesn't effect main player
          this.weaponDirection.x = xWeapon;
          this.weaponDirection.y = yWeapon;
          this.weaponDirection.flipY = this.weapon.flipY;
          if (!this.playerAttacking) {
            this.weapon.setAngle(pointerAngle);
            this.weaponDirection.angle = pointerAngle;
          }
        }
      }
    }
  }

  attackAction() {
    if (this.playerAttacking === false) {
      this.playerAttacking = true;
      if (this.mainPlayer) {
        this.attackAudio.play();
      }
      // this.weapon.alpha = 1;
      // could be a sweet animation here
      if (this.weapon.flipY === true) {
        this.weapon.angle -= 70;
        this.weaponDirection.angle = this.weapon.angle;
      } else {
        this.weapon.angle += 70;
        this.weaponDirection.angle = this.weapon.angle;
      }
      this.scene.time.delayedCall(300, () => {
        // this.weapon.alpha = 0;
        this.playerAttacking = false;
        this.swordHit = false;
        if (this.weapon.flipY === true) {
          this.weapon.angle += 70;
          this.weaponDirection.angle = this.weapon.angle;
        } else {
          this.weapon.angle -= 70;
          this.weaponDirection.angle = this.weapon.angle;
        }
      }, [], this);
    }
  }

  updateWeaponDirection() {
    this.player.weaponDirection = this.weaponDirection;
    this.weapon.setPosition(this.player.weaponDirection.x, this.player.weaponDirection.y);
    this.weapon.flipY = this.player.weaponDirection.flipY;
    this.weapon.setAngle(this.player.weaponDirection.angle);
  }

  updateFlipX() {
    this.player.flipX = this.flipX;
  }

  toggleMovement() {
    this.movementEnabled = !this.movementEnabled;
  }

  cleanUp() {
    this.healthBar.destroy();
    this.player.destroy();
    this.usernameText.destroy();
    this.destroy();
  }
}
