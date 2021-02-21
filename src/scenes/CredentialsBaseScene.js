import * as Phaser from 'phaser';
import UiButton from '../classes/UiButton';
import {
  createDiv, createLabel, createInputField, createBrElement,
} from '../utils/utils';

export default class CredentialsBaseScene extends Phaser.Scene {
  createUi(btn1Text, btn1Target, btn2Text, btn2Target, btn3Text, btn3Target) {
    this.titleText = this.add.text(this.scale.width / 2, 50, 'Hunt 4 BTC', {
      fontSize: '32px',
      fill: '#6f6f6f',
    });
    this.titleText.setOrigin(0.5);
    this.Button1 = new UiButton(
      this,
      this.scale.width / 2,
      this.scale.height * 0.6,
      'button1',
      'button2',
      btn1Text,
      btn1Target,
    );
    if (btn2Target && btn2Text) {
      this.Button2 = new UiButton(
        this,
        this.scale.width / 2,
        this.scale.height * 0.7,
        'button1',
        'button2',
        btn2Text,
        btn2Target,
      );
    }
    if (btn3Target && btn3Text) {
      this.Button3 = new UiButton(
        this,
        this.scale.width / 2,
        this.scale.height * 0.8,
        'button1',
        'button2',
        btn3Text,
        btn3Target,
      );
    }

    this.createInput();
  }

  createInput() {
    // EMAIL
    this.div = createDiv('input-div');
    this.loginEmailLabel = createLabel('login', 'Email:', 'form-label');
    this.loginEmailInput = createInputField('text', 'login', 'login', 'login-input', 'Email Address');

    // PASSWORD
    this.div = createDiv('input-div');
    this.loginPasswordLabel = createLabel('password', 'Password:', 'form-label');
    this.loginPasswordInput = createInputField('password', 'password', 'password', 'login-input');

    this.div.append(this.loginEmailLabel);
    this.div.append(createBrElement());
    this.div.append(this.loginEmailInput);
    this.div.append(createBrElement());
    this.div.append(createBrElement());
    this.div.append(this.loginPasswordLabel);
    this.div.append(createBrElement());
    this.div.append(this.loginPasswordInput);

    document.body.appendChild(this.div);
  }

  startScene(targetScene) {
    window.history.pushState({}, document.title, '/');
    this.div.parentNode.removeChild(this.div);
    this.scene.start(targetScene);
  }
}
