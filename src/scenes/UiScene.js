import * as Phaser from 'phaser';
import InventoryWindow from '../classes/InventoryWindow';

export default class UiScene extends Phaser.Scene {
  constructor() {
    super('Ui');
  }

  init() {
    this.gameScene = this.scene.get('Game');
    this.showInventory = false;
  }

  create() {
    this.setupUiElements();
    this.setupEvents();

    this.scale.on('resize', this.resize, this);
    this.resize({ width: this.scale.width, height: this.scale.height });
  }

  setupUiElements() {
    this.scoreText = this.add.text(35, 8, ': 0', {
      fontSize: '16px',
      fill: '#ffffff',
    });
    // bitcoin icon
    this.btcIcon = this.add.image(15, 14, 'btc').setScale(0.4);

    // create inventory modal
    this.inventoryWindow = new InventoryWindow(this, {
      windowWidth: this.scale.width / 2,
      windowHeight: this.scale.height * 0.8,
      borderAlpha: 1,
      windowAlpha: 0.8,
      debug: false,
      textAlpha: 1,
      windowColor: 0x000000, // black
    });

    // create inventory toggle button
    this.inventoryButton = this.add.image(50, this.scale.height - 50, 'inventoryButton').setInteractive();
    this.inventoryButton.setScale(2);
    this.inventoryButton.on('pointerdown', () => {
      this.toggleInventory(this.gameScene.player, true);
    });
    // this is a useful strategy for other things as well
    // one can easily detoggle other windows
    this.input.on('pointerdown', (pointer, gameObjects) => {
      if (!gameObjects.includes(this.inventoryWindow.rect)
        && !gameObjects.includes(this.inventoryButton)) {
        this.gameScene.dialogWindow.rect.setInteractive();
        this.inventoryWindow.hideWindow();
        this.showInventory = false;
      }
    });
  }

  setupEvents() {
    // listen for updateScore event from game scene
    this.gameScene.events.on('updateBalance', (score) => {
      this.scoreText.setText(`: ${score}`);
    });
  }

  resize(gameSize) {
    if (this.inventoryWindow) this.inventoryWindow.resize(gameSize);
    if (gameSize.width < 560) {
      this.inventoryButton.y = gameSize.height - 250;
    } else {
      this.inventoryButton.y = gameSize.height - 50;
    }
  }

  toggleInventory(playerObject, mainPlayer) {
    this.showInventory = !this.showInventory;
    if (this.showInventory) {
      this.gameScene.dialogWindow.rect.disableInteractive();
      this.inventoryWindow.showWindow(playerObject, mainPlayer);
    } else {
      this.gameScene.dialogWindow.rect.setInteractive();
      this.inventoryWindow.hideWindow();
    }
  }
}
