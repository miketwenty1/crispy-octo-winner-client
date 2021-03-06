import * as Phaser from 'phaser';
import { Scale } from '../utils/utils';

export default class HealingFountain extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, id) {
    super(scene, x, y);
    this.scene = scene;
    this.healing = 1;
    this.id = id;
    this.innerCollisionObj = this.scene.add.sprite(x, y);

    this.scene.physics.world.enable(this);
    this.scene.physics.world.enable(this.innerCollisionObj);

    this.body.setAllowGravity(false);
    this.setScale(Scale.FACTOR);
    this.createSpriteAnimations();
    this.setDisplayOrigin(0, 32);
    this.innerCollisionObj.body.setSize(32 * Scale.FACTOR, 32 * Scale.FACTOR);
    this.innerCollisionObj.setDisplayOrigin((32 / 2) - 32, (32) + 32 / 2);
    this.innerCollisionObj.body.setImmovable(true);
    // this.innerCollisionObj.moves = false;
    // this.setOffset(16, -16);
    // this.setDisplayOrigin(0.5);
    // this.body.setSize((Scale.FACTOR * 32 * 1), (Scale.FACTOR * 32 * 1));
    // this.setDisplayOrigin(32, 32);
    // this.innerCollisionObj.setCircle(40, ((32 / 2) - 40), ((32 / 2) - 40));
    this.setCircle(40, ((32 / 2) - 40), ((32 / 2) - 40));
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this.innerCollisionObj, true, true);
  }

  makeInactive() {
    this.setActive(false);
    this.setVisible(false);
    this.body.checkCollision.none = true;
  }

  makeActive() {
    this.setActive(true);
    this.setVisible(true);
    this.body.checkCollision.none = true;
  }

  createSpriteAnimations() {
    // healing fountain
    this.anims.create({
      key: 'sprinkle',
      frames: this.anims.generateFrameNumbers('bg_spritesheet', { frames: [82, 83] }),
      frameRate: 3,
      repeat: -1,
    });
    this.play('sprinkle');
  }
}
