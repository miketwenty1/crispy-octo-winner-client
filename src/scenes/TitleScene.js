import * as Phaser from 'phaser';
import UiButton from '../classes/UiButton';

const instructions = `  * ~ * ~ * ~ * ~ * Instructions * ~ * ~ * ~ * ~ *

Use arrow keys or WASD to move, Spacebar to attack.
Monsters drop large amounts of gold, but beware they
do attack back. Gain heath by killing monsters.
Death from monster results in 50% loss of Bitcoins.
Steal 100% of a player's Bitcoins by killing them.`;

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    this.titleText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 300, 'Hunt 4 BTC', {
      fontSize: '64px',
      fill: '#6f6f6f',
    });
    this.instructionText = this.add.text(this.scale.width / 2, this.scale.height * 0.80 - 200, instructions,
      {
        fontSize: '24px',
        fill: '#6f6f6f',
      });
    this.titleText.setOrigin(0.5);
    this.instructionText.setOrigin(0.5);
    this.startGameButton = new UiButton(
      this,
      this.scale.width / 2,
      this.scale.height * 0.65 - 200,
      'button1',
      'button2',
      'Play as Guest',
      this.startScene.bind(this, 'Game'),
    );
    this.loginButton = new UiButton(
      this,
      this.scale.width / 2 - 150,
      this.scale.height * 0.35,
      'button1',
      'button2',
      'Login',
      this.startScene.bind(this, 'Login'),
    );
    // sign up button
    this.SignUpButton = new UiButton(
      this,
      this.scale.width / 2 + 150,
      this.scale.height * 0.35,
      'button1',
      'button2',
      'Sign Up',
      this.startScene.bind(this, 'SignUp'),
    );
  }

  startScene(targetScene) {
    this.scene.start(targetScene);
  }
}
