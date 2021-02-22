import * as Phaser from 'phaser';
import UiButton from '../classes/UiButton';
import {
  createDiv, createLabel, createInputField, createBrElement,
} from '../utils/utils';

const titleRatio = { width: 0.5, height: 0.1 };
const Button1Ratio = { width: 0.5, height: 0.60 };
const Button2Ratio = { width: 0.5, height: 0.71 };
const Button3Ratio = { width: 0.5, height: 0.82 };

export default class CredentialsBaseScene extends Phaser.Scene {
  createUi(btn1Text, btn1Target, btn2Text, btn2Target, btn3Text, btn3Target) {
    this.titleText = this.add.text(this.scale.width * titleRatio.width, this.scale.height * titleRatio.height, 'Hunt 4 BTC', {
      fontSize: `${this.scale.width * 0.1}px`,
      fill: '#6f6f6f',
    });
    this.titleText.setOrigin(0.5);
    this.Button1 = new UiButton(
      this,
      this.scale.width * Button1Ratio.width,
      this.scale.height * Button1Ratio.height,
      'button1',
      'button2',
      btn1Text,
      btn1Target,
    );
    if (btn2Target && btn2Text) {
      this.Button2 = new UiButton(
        this,
        this.scale.width * Button2Ratio.width,
        this.scale.height * Button2Ratio.height,
        'button1',
        'button2',
        btn2Text,
        btn2Target,
      );
    }
    if (btn3Target && btn3Text) {
      this.Button3 = new UiButton(
        this,
        this.scale.width * Button3Ratio.width,
        this.scale.height * Button3Ratio.height,
        'button1',
        'button2',
        btn3Text,
        btn3Target,
      );
    }

    this.createInput();
    // handle game reize
    this.scale.on('resize', this.resize, this);
    this.resize({ width: this.scale.width, height: this.scale.height });
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
    this.scale.removeListener('resize', this.resize);
    window.history.pushState({}, document.title, '/');
    this.div.parentNode.removeChild(this.div);
    this.scene.start(targetScene);
  }

  resize(gameSize) {
    const { width, height } = gameSize;
    this.cameras.resize(width, height);
    this.titleText.setPosition(width * titleRatio.width, height * titleRatio.height);
    this.Button1.setPosition(width * Button1Ratio.width, height * Button1Ratio.height);
    if (this.Button2) this.Button2.setPosition(width * Button2Ratio.width, height * Button2Ratio.height);
    if (this.Button3) this.Button3.setPosition(width * Button3Ratio.width, height * Button3Ratio.height);
    // if (width >= 1200) {
    if (width >= 1200) {
      this.Button1.setScale(2.5);
      if (this.Button2) this.Button2.setScale(2.5);
      if (this.Button3) this.Button3.setScale(2.5);
    } else if (width < 1200 && width >= 800) {
      this.Button1.setScale(1.6);
      if (this.Button2) this.Button2.setScale(1.6);
      if (this.Button3) this.Button3.setScale(1.6);
    } else {
      this.Button1.setScale(1);
      if (this.Button2) this.Button2.setScale(1);
      if (this.Button3) this.Button3.setScale(1);
    }
    this.titleText.setFontSize(`${width * 0.1}px`);
  }
}
