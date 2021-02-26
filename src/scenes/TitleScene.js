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
Bitcoins. Steal 100% of a player's
Bitcoins by killing them.`;

const titleRatio = { width: 0.5, height: 0.1 };
const instructionsRatio = { width: 0.5, height: 0.65 };
const loginRatio = { width: 0.34, height: 0.27 };
const signUpRatio = { width: 0.66, height: 0.27 };
const loginAsGuestRatio = { width: 0.5, height: 0.40 };

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    this.titleText = this.add.text(this.scale.width * titleRatio.width, this.scale.height * titleRatio.height, 'Hunt 4 BTC', {
      fontSize: `${this.scale.width * 0.1}px`,
      fill: '#6f6f6f',
    });
    this.instructionText = this.add.text(this.scale.width * instructionsRatio.width, this.scale.height * instructionsRatio.height, instructions,
      {
        fontSize: '15px',
        fill: '#6f6f6f',
      });
    this.titleText.setOrigin(0.5);
    this.instructionText.setOrigin(0.5);
    this.startGuestButton = new UiButton(
      this,
      this.scale.width * loginAsGuestRatio.width,
      this.scale.height * loginAsGuestRatio.height,
      'button1',
      'button2',
      'Play as Guest',
      this.loginAsGuest.bind(this),
    );
    this.startGuestButton.setScale(this.scale.width * 0.1);
    this.loginButton = new UiButton(
      this,
      this.scale.width * loginRatio.width,
      this.scale.height * loginRatio.height,
      'button1',
      'button2',
      'Login',
      this.startScene.bind(this, 'Login'),
    );
    // sign up button
    this.SignUpButton = new UiButton(
      this,
      this.scale.width * signUpRatio.width,
      this.scale.height * signUpRatio.height,
      'button1',
      'button2',
      'Sign Up',
      this.startScene.bind(this, 'SignUp'),
    );
    const resetPasswordSceneCheck = getParam('scene');
    if (resetPasswordSceneCheck && resetPasswordSceneCheck === 'resetPassword') {
      this.scale.removeListener('resize', this.resize);
      this.scene.start('ResetPassword');
    }
    // handle game reize
    this.scale.on('resize', this.resize, this);
    this.resize({ width: this.scale.width, height: this.scale.height });
  }

  loginAsGuest() {
    postData(`${SERVER_URL}/login`, { email: 'guest', password: 'guest' })
      .then((res) => {
        if (res.status === 200) {
          this.scale.removeListener('resize', this.resize);
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
    this.scale.removeListener('resize', this.resize);
    this.scene.start(targetScene);
  }

  resize(gameSize) {
    const { width, height } = gameSize;
    this.cameras.resize(width, height);
    this.titleText.setPosition(width * titleRatio.width, height * titleRatio.height);
    this.loginButton.setPosition(width * loginRatio.width, height * loginRatio.height);
    this.SignUpButton.setPosition(width * signUpRatio.width, height * signUpRatio.height);
    this.startGuestButton.setPosition(width * loginAsGuestRatio.width, height * loginAsGuestRatio.height);
    this.instructionText.setPosition(width * instructionsRatio.width, height * instructionsRatio.height);

    if (width >= 1200) {
      this.instructionText.setFontSize('24px');
      this.loginButton.setScale(2.5);
      this.SignUpButton.setScale(2.5);
      this.startGuestButton.setScale(2.5);
    } else if (width < 1200 && width >= 800) {
      this.instructionText.setFontSize('20px');
      this.loginButton.setScale(1.6);
      this.SignUpButton.setScale(1.6);
      this.startGuestButton.setScale(1.6);
    } else {
      this.instructionText.setFontSize('16px');
      this.loginButton.setScale(1);
      this.SignUpButton.setScale(1);
      this.startGuestButton.setScale(1);
    }

    this.loginButton.setPosition(width * loginRatio.width, height * loginRatio.height);
    this.SignUpButton.setPosition(width * signUpRatio.width, height * signUpRatio.height);
    this.startGuestButton.setPosition(width * loginAsGuestRatio.width, height * loginAsGuestRatio.height);
    this.instructionText.setPosition(width * instructionsRatio.width, height * instructionsRatio.height);

    this.titleText.setFontSize(`${width * 0.1}px`);
  }
}
