import { createInputField } from '../utils/utils';
import ModalWindow from './ModalWindow';

export default class DialogWindow extends ModalWindow {
  constructor(scene, opts) {
    super(scene, opts);
    if (!opts) opts = {};

    this.messages = [];
    this.messageCount = 0;
    this.messagesHeight = 0;
    this.messageGroup = this.scene.add.group();

    this.graphics.setDepth(2);
    this.createInput();
    this.createWindow();
    this.makeInteractive();
    // setInterval(() => {
    //   this.addNewMessage({
    //     username: 'New Bitcoin Block Found',
    //     message: `0000000000000${Date.now()}`,
    //   });
    // }, 60000);
    setInterval(() => {
      this.addNewMessage({
        username: '',
        message: '',
      });
    }, 30000);
  }

  calculateWindowDimension() {
    const x = this.x - this.windowWidth - 2 + this.scene.cameras.main.worldView.x;
    const y = this.y + 2 + this.scene.cameras.main.worldView.y;
    const rectHeight = this.windowHeight - 5;
    const rectWidth = this.windowWidth;
    return {
      x, y, rectWidth, rectHeight,
    };
  }

  createInnerWindowRectangle({
    x, y, rectWidth, rectHeight,
  }) {
    if (this.rect) {
      this.rect.setPosition(x + 1, y + 1);
      this.rect.setSize(rectWidth - 1, rectHeight - 1);

      // update position of dialog container
      this.dialogContainer.setPosition(x + 1, y + 1);
      this.dialogContainer.setAlpha(this.textAlpha);
    } else {
      this.rect = this.scene.add.rectangle(x + 1, y + 1, rectWidth - 1, rectHeight - 1);
      if (this.debug) this.rect.setFillStyle(0x6666ff);
      this.rect.setOrigin(0, 0);

      // create dialog container for the chat messages
      this.dialogContainer = this.scene.add.container(x + 1, y + 1);
      this.dialogContainer.setDepth(3);
      this.dialogContainer.setAlpha(this.textAlpha);
    }
  }

  makeInteractive() {
    this.rect.setInteractive();
    // this.rect.on('pointerover', () => {
    //   this.chatVisible();
    // });

    this.rect.on('pointerout', () => {
      this.chatInvisible();
    });
  }

  addNewMessage(messageObject) {
    this.messages.push(messageObject);

    const windowDimensions = this.calculateWindowDimension();
    let message = '';
    if (!messageObject.username) {
      message = '';
    } else {
      message = `${messageObject.username}: ${messageObject.message}`;
    }

    let messageText = this.messageGroup.getFirstDead();
    if (!messageText) {
      messageText = this.scene.add.text(0, this.messagesHeight, message, {
        fontSize: '18px',
        fill: '#fff',
        wordWrap: {
          width: windowDimensions.rectWidth,
        },
      });
      this.messageGroup.add(messageText);
    } else {
      messageText.setText(message);
      messageText.setY(this.messagesHeight);
      messageText.setActive(true);
      messageText.setVisible(true);
    }
    this.dialogContainer.add(messageText);
    this.messageCount += 1;
    this.messagesHeight += messageText.height;

    // stop the message list from going off screen
    if (this.messagesHeight > (windowDimensions.rectHeight - windowDimensions.rectHeight * 0.1)) {
      // reset messages height
      this.messagesHeight = 0;
      // remove the first dialog item from our array
      this.messages.shift();
      // loop through the message group and update the text of each item
      this.messageGroup.getChildren().forEach((child, index) => {
        if (index > this.messages.length - 1) {
          child.setActive(false);
          child.setVisible(false);
        } else {
          if (!this.messages[index].username) {
            child.setText('');
          } else {
            child.setText(`${this.messages[index].username}: ${this.messages[index].message}`);
          }
          child.setY(this.messagesHeight);
          child.setActive(true);
          child.setVisible(true);
          this.messagesHeight += child.height;
        }
      });
    }
  }

  resize(gameSize) {
    this.x = gameSize.width;

    if (gameSize.width < 666) {
      this.input.classList.remove('chat-sidebar');
      this.input.classList.add('chat-bottom');

      this.windowWidth = gameSize.width;
      this.windowHeight = 100;
      this.y = gameSize.height - this.windowHeight;
    } else {
      this.input.classList.add('chat-sidebar');
      this.input.classList.remove('chat-bottom');

      this.windowWidth = 305;
      this.windowHeight = gameSize.height;
      this.y = 0;
    }

    this.redrawWindow();
  }

  createInput() {
    this.input = createInputField('text', 'chatInput', 'chatInput', 'chat-input chat-invisible');

    if (this.x < 560) {
      this.input.classList.add('chat-bottom');
    } else {
      this.input.classList.add('chat-sidebar');
    }

    document.body.appendChild(this.input);
  }

  chatInvisible() {
    this.input.classList.remove('chat-visible');
    this.input.classList.add('chat-invisible');

    this.windowAlpha = 0;
    this.borderAlpha = 0;
    this.textAlpha = 0.75;
    this.redrawWindow();
    document.getElementById('chatInput').blur();
  }

  chatVisible() {
    this.input.classList.add('chat-visible');
    this.input.classList.remove('chat-invisible');

    this.windowAlpha = 0.5;
    this.borderAlpha = 0.6;
    this.textAlpha = 1;
    this.redrawWindow();
  }
}
