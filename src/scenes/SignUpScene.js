import CredentialsBaseScene from './CredentialsBaseScene';
import {
  postData, createLabel, createInputField, createBrElement,
} from '../utils/utils';

export default class SignUpScene extends CredentialsBaseScene {
  constructor() {
    super('SignUp');
  }

  create() {
    this.createUi(
      'Create User',
      this.signUp.bind(this),
      'Back',
      this.startScene.bind(this, 'Title'),
    );
    this.createSignupSpecificInput();
  }

  createSignupSpecificInput() {
    this.loginUsernameLabel = createLabel('username', 'Username:', 'form-label');
    this.loginUsernameInput = createInputField('text', 'username', 'username', 'login-input', 'Username');
    this.loginPasswordLabelRe = createLabel('passwordRe', 'Verify Password:', 'form-label');
    this.loginPasswordInputRe = createInputField('password', 'passwordRe', 'passwordRe', 'login-input');
    this.div.append(createBrElement());
    this.div.append(this.loginPasswordLabelRe);
    this.div.append(createBrElement());
    this.div.append(this.loginPasswordInputRe);
    this.div.append(createBrElement());
    this.div.append(createBrElement());
    this.div.append(this.loginUsernameLabel);
    this.div.append(createBrElement());
    this.div.append(this.loginUsernameInput);
  }

  signUp() {
    const emailValue = this.loginEmailInput.value;
    const passwordValue = this.loginPasswordInput.value;
    const passwordValueRe = this.loginPasswordInputRe.value;
    const usernameValue = this.loginUsernameInput.value;

    console.log(usernameValue);

    if (emailValue && passwordValue && passwordValueRe && usernameValue) {
      if (passwordValueRe !== passwordValue) {
        window.alert('Passwords do not match');
      } else {
        postData(`${SERVER_URL}/signup`, {
          email: emailValue,
          username: usernameValue,
          password: passwordValue,
        })
          .then((res) => {
            if (res.status === 200) {
              this.startScene('Login');
            } else {
              console.log(res);
              console.log(`did not get a 200 response got ${res.status}, -> ${res.message}`);
              window.alert('Invalid username or password');
            }
          })
          .catch((err) => {
            console.log(`yo there an err for signup - ${err.message}`);
            window.alert('Invalid username or password');
          });
      }
    } else {
      window.alert('Need to fill out all fields');
    }
  }
}
