import * as Phaser from 'phaser';
import { Scale } from '../utils/utils';

export default class HealingFountain extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, key, frame, id) {
    super(scene, x, y, key, frame);
    this.scene = scene;
    this.healing = 1;
    this.id = id;

    this.scene.physics.world.enable(this);
    this.body.setAllowGravity(false);
    this.scene.add.existing(this);
    this.setScale(Scale.FACTOR);
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
}
