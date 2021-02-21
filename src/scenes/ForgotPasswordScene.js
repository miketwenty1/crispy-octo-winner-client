import { postData } from '../utils/utils';
import CredentialsBaseScene from './CredentialsBaseScene';

export default class ForgotPasswordScene extends CredentialsBaseScene {
  constructor() {
    super('ForgotPassword');
  }

  create() {
    this.titleText = this.add.text(this.scale.width / 2, 50, 'Hunt 4 BTC', {
      fontSize: '32px',
      fill: '#6f6f6f',
    });
    this.titleText.setOrigin(0.5);

    this.createUi(
      'Reset Password',
      this.resetPassword.bind(this),
      'Back',
      this.startScene.bind(this, 'Login'),
    );

    this.loginPasswordInput.parentNode.removeChild(this.loginPasswordInput);
    this.loginPasswordLabel.parentNode.removeChild(this.loginPasswordLabel);
  }

  resetPassword() {
    const emailValue = this.loginEmailInput.value;
    if (emailValue) {
      postData(`${SERVER_URL}/forgot-password`, { email: emailValue })
        .then((res) => {
          if (res.status === 200) {
            window.alert('If this email exists - instructions will be sent for password reset');
            this.startScene('Title');
          } else {
            console.log(res);
            console.log(`did not get a 200 response got ${res.status}, -> ${res.message}`);
            window.alert('If this email exists - instructions will be sent for password reset');
            this.startScene('Title');
          }
        })
        .catch((err) => {
          console.log(`yo something up - ${err.message}`);
          window.alert('If this email exists - instructions will be sent for password reset');
          this.startScene('Title');
        });
    } else {
      window.alert('Need to fill out all fields');
    }
  }
}
