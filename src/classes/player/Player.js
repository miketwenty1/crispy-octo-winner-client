import * as Phaser from 'phaser';
import { Scale } from '../../utils/utils';

export default class Player extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, key, frame) {
    super(scene, x, y, key, frame);
    this.scene = scene;

    this.scene.physics.world.enable(this);
    this.setImmovable(true);

    this.setScale(Scale.FACTOR);
    this.body.setAllowGravity(false);
    this.scene.add.existing(this);
  }
}
