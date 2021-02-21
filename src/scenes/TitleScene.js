import * as Phaser from 'phaser';
import UiButton from '../classes/UiButton';
import { getParam, postData } from '../utils/utils';

const instructions = `  * ~ * ~ Instructions ~ * ~ *

Use arrow keys or WASD to move,
Spacebar to attack. Monsters drop
large amounts of gold, but beware
they do attack back. Gain heath
by killing monsters. Death from
monster results in 50% loss of
Bitcoins.Steal 100% of a player's
Bitcoins by killing them.`;

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    this.titleText = this.add.text(this.scale.width / 2, 50, 'Hunt 4 BTC', {
      fontSize: '32px',
      fill: '#6f6f6f',
    });
    this.instructionText = this.add.text(this.scale.width * 0.5, this.scale.height * 0.65, instructions,
      {
        fontSize: '15px',
        fill: '#6f6f6f',
      });
    this.titleText.setOrigin(0.5);
    this.instructionText.setOrigin(0.5);
    this.startGameButton = new UiButton(
      this,
      this.scale.width / 2,
      this.scale.height * 0.45,
      'button1',
      'button2',
      'Play as Guest',
      this.loginAsGuest.bind(this),
    );
    this.loginButton = new UiButton(
      this,
      this.scale.width * 0.32,
      this.scale.height * 0.35,
      'button1',
      'button2',
      'Login',
      this.startScene.bind(this, 'Login'),
    );
    // sign up button
    this.SignUpButton = new UiButton(
      this,
      this.scale.width * 0.68,
      this.scale.height * 0.35,
      'button1',
      'button2',
      'Sign Up',
      this.startScene.bind(this, 'SignUp'),
    );
    const resetPasswordSceneCheck = getParam('scene');
    // console.log(`hello there ${resetPasswordSceneCheck}`);
    if (resetPasswordSceneCheck && resetPasswordSceneCheck === 'resetPassword') {
      this.scene.start('ResetPassword');
    }
  }

  loginAsGuest() {
    postData(`${SERVER_URL}/login`, { email: 'guest', password: 'guest' })
      .then((res) => {
        if (res.status === 200) {
          this.startScene('Game');
        } else {
          console.log(res);
          console.log(`did not get a 200 response got ${res.status}, -> ${res.message}`);
          window.alert('something wrong happened with guest login contact admin');
        }
      })
      .catch((err) => {
        console.log(`yo there an err for login - ${err.message}`);
        window.alert('something bizarre happened with guest login ..like wtf');
      });
  }

  startScene(targetScene) {
    this.scene.start(targetScene);
  }
}
