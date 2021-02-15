import * as Phaser from 'phaser';
import UiButton from '../classes/UiButton';

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super('Login');
  }

  create() {
    this.titleText = this.add.text(this.scale.width / 2, 100, 'Hunt 4 BTC', {
      fontSize: '64px',
      fill: '#6f6f6f',
    });
    this.titleText.setOrigin(0.5);
    this.ForgotPasswordButton = new UiButton(
      this,
      this.scale.width / 2,
      this.scale.height * 0.65 - 200,
      'button1',
      'button2',
      'Forgot Password',
      this.startScene.bind(this, 'ForgotPassword'),
    );
    this.backButton = new UiButton(
      this,
      this.scale.width / 2,
      this.scale.height * 0.55,
      'button1',
      'button2',
      'Back',
      this.startScene.bind(this, 'Title'),
    );
    this.createInput();
  }

  createInput() {
    const div = document.createElement('div');
    div.className = 'input-div';
    this.div = div;

    // EMAIL
    const label = document.createElement('label');
    label.for = 'login';
    label.innerText = 'Email:';
    label.className = 'form-label';
    this.loginEmailLabel = label;

    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.name = 'login';
    inputField.id = 'login';
    inputField.className = 'login-input';
    inputField.placeHolder = 'Email Address';
    this.loginEmailInput = inputField;

    // PASSWORD
    const label2 = document.createElement('label');
    label2.for = 'password';
    label2.innerText = 'Password:';
    label2.className = 'form-label';
    this.loginPasswordLabel = label2;

    const inputField2 = document.createElement('input');
    inputField2.type = 'password';
    inputField2.name = 'password';
    inputField2.id = 'password';
    inputField2.className = 'login-input';
    this.loginPasswordInput = inputField2;

    this.div.append(this.loginEmailLabel);
    this.div.append(document.createElement('br'));
    this.div.append(this.loginEmailInput);
    this.div.append(document.createElement('br'));
    this.div.append(document.createElement('br'));
    this.div.append(this.loginPasswordLabel);
    this.div.append(document.createElement('br'));
    this.div.append(this.loginPasswordInput);

    document.body.appendChild(this.div);
  }

  startScene(targetScene) {
    this.div.parentNode.removeChild(this.div);
    this.scene.start(targetScene);
  }
}
