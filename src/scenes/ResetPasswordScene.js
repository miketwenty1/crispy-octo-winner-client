import {
  postData, createLabel, createInputField, createBrElement, getParam,
}
  from '../utils/utils';
import CredentialsBaseScene from './CredentialsBaseScene';

export default class ResetPasswordScene extends CredentialsBaseScene {
  constructor() {
    super('ResetPassword');
  }

  create() {
    this.titleText = this.add.text(this.scale.width / 2, 50, 'Hunt 4 BTC', {
      fontSize: '32px',
      fill: '#6f6f6f',
    });
    this.titleText.setOrigin(0.5);

    this.createUi(
      'Reset Password',
      this.updatePassword.bind(this),
    );

    this.loginEmailInput.parentNode.removeChild(this.loginEmailInput);
    this.loginEmailLabel.parentNode.removeChild(this.loginEmailLabel);

    // adding 2nd password field
    this.loginPasswordLabelRe = createLabel('passwordRe', 'Verify Password:', 'form-label');
    this.loginPasswordInputRe = createInputField('password', 'passwordRe', 'passwordRe', 'login-input');
    this.div.append(createBrElement());
    this.div.append(this.loginPasswordLabelRe);
    this.div.append(createBrElement());
    this.div.append(this.loginPasswordInputRe);
    this.div.append(createBrElement());
    this.div.append(createBrElement());
  }

  updatePassword() {
    const token = getParam('token');

    const passwordValue = this.loginPasswordInput.value;
    const passwordValueRe = this.loginPasswordInputRe.value;
    // this.createVerifyPasswordInput(passwordValue, passwordValueRe);

    if (passwordValue && passwordValueRe && passwordValue === passwordValueRe) {
      postData(`${SERVER_URL}/reset-password`, { token, password: passwordValue, verifiedPassword: passwordValueRe })
        .then((res) => {
          if (res.status === 200) {
            window.alert('password reset');
            console.log('reset password go back to title scene');
            this.startScene('Title');
          } else {
            console.log(res);
            console.log(`did not get a 200 response got ${res.status}, -> ${res.message}`);
            window.alert('something wrong');
            this.startScene('Title');
          }
        })
        .catch((err) => {
          console.log(`yo something up - ${err.message}`);
          window.alert('something really wrong');
          this.startScene('Title');
        });
    } else {
      window.alert('Need to fill out all fields and passwords must match');
    }
  }
}
