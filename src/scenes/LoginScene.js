import { postData, refreshTokenInterval } from '../utils/utils';
import CredentialsBaseScene from './CredentialsBaseScene';

export default class LoginScene extends CredentialsBaseScene {
  constructor() {
    super('Login');
  }

  create() {
    this.createUi(
      'Login',
      this.login.bind(this),
      'Forgot Password',
      this.startScene.bind(this, 'ForgotPassword'),
      'Back',
      this.startScene.bind(this, 'Title'),
    );
  }

  login() {
    const emailValue = this.loginEmailInput.value;
    const passwordValue = this.loginPasswordInput.value;
    if (emailValue && passwordValue) {
      postData(`${SERVER_URL}/login`, { email: emailValue, password: passwordValue })
        .then((res) => {
          if (res.status === 200) {
            refreshTokenInterval();
            this.startScene('CharacterSelection');
          } else {
            console.log(res);
            console.log(`did not get a 200 response got ${res.status}, -> ${res.message}`);
            window.alert('Invalid username or password');
          }
        })
        .catch((err) => {
          console.log(`yo there an err for login - ${err.message}`);
          window.alert('Invalid username or password');
        });
    } else {
      window.alert('Need to fill out all fields');
    }
  }
}
