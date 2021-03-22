import ModalWindow from './ModalWindow';

export default class InventoryWindow extends ModalWindow {
  constructor(scene, opts) {
    super(scene, opts);

    this.playerObject = {};
    this.mainPlayer = false;
    this.inventoryItems = {};
    // this will appear above the dialog window currently
    this.graphics.setDepth(3);
    this.createWindow();
    this.showWindow();
    this.hideWindow();
  }

  calculateWindowDimension() {
    let x = this.x + (this.scene.scale.width / 4);
    let y = this.y + (this.scene.scale.height * 0.1);

    if (this.scene.scale.width < 750) {
      x = this.x + 40;
      y = this.y + 40;
    }

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
      // update position of inventory container
      this.inventoryContainer.setPosition(x + 1, y + 1);
      this.inventoryContainer.setSize(rectWidth - 1, rectHeight - 1);
      // center title text
      this.titleText.setPosition(this.inventoryContainer.width / 2, 21);
      // update inventory container position
      this.updateInventoryContainerPositions();
    } else {
      this.rect = this.scene.add.rectangle(x + 1, y + 1, rectWidth - 1, rectHeight - 1);
      if (this.debug) this.rect.setFillStyle(0x6666ff);
      this.rect.setOrigin(0, 0);

      // create inventory container for positioning elements
      this.inventoryContainer = this.scene.add.container(x + 1, y + 1);
      this.inventoryContainer.setDepth(3);
      this.inventoryContainer.setAlpha(this.textAlpha);

      // create inventory title
      this.titleText = this.scene.add.text(
        this.inventoryContainer.width / 2,
        21,
        'This be yo info',
        { fontSize: '21px', fill: '#ffffff', align: 'center' },
      );
      this.titleText.setOrigin(0.5);
      this.inventoryContainer.add(this.titleText);
      // create inventory stats
      this.createInventoryStats();
      // create inventory slots
      this.createInventorySlots();
    }
  }

  createInventoryStats() {
    // this is going to be container-ception (containers within containers)
    this.statsContainer = this.scene.add.container(0, 80);
    this.inventoryContainer.add(this.statsContainer);

    const textOptions = {
      fontSize: '21px',
      fill: '#ffffff',
    };

    // create attack stats
    this.swordIcon = this.scene.add.image(0, 0, 'inventorySword').setScale(1.5);
    this.statsContainer.add(this.swordIcon);
    this.swordStatText = this.scene.add.text(0, 0, '100', textOptions);
    this.statsContainer.add(this.swordStatText);
    // create defense stats
    this.shieldIcon = this.scene.add.image(150, 0, 'inventoryShield').setScale(1.5);
    this.statsContainer.add(this.shieldIcon);
    this.shieldStatText = this.scene.add.text(150, 0, '100', textOptions);
    this.statsContainer.add(this.shieldStatText);
    // create bitcoin stats
    this.bitcoinIcon = this.scene.add.image(300, 0, 'btc').setScale(0.64);
    this.statsContainer.add(this.bitcoinIcon);
    this.bitcoinStatText = this.scene.add.text(300, 0, '100', textOptions);
    this.statsContainer.add(this.bitcoinStatText);
  }

  updateInventoryContainerPositions() {
    this.inventoryContainer.setSize(this.inventoryContainer.width - 40, 80);
    this.swordIcon.x = this.inventoryContainer.width * 0.1;
    this.swordStatText.x = this.inventoryContainer.width * 0.1 + 30;
    this.shieldIcon.x = this.inventoryContainer.width * 0.5;
    this.shieldStatText.x = this.inventoryContainer.width * 0.5 + 30;
    this.bitcoinIcon.x = this.inventoryContainer.width * 0.85;
    this.bitcoinStatText.x = this.inventoryContainer.width * 0.85 + 30;
  }

  createInventorySlots() {
    // TODO:
  }

  resize(gameSize) {
    if (gameSize.width < 750) {
      this.windowWidth = this.scene.scale.width - 80;
      this.windowHeight = this.scene.scale.height - 80;
    } else {
      this.windowWidth = this.scene.scale.width / 2;
      this.windowHeight = this.scene.scale.height * 0.8;
    }

    this.redrawWindow();
  }

  showWindow(playerObject, mainPlayer) {
    this.mainPlayer = mainPlayer;
    this.playerObject = playerObject;
    console.log(playerObject);
    this.rect.setInteractive();
    this.inventoryContainer.setAlpha(1);
    this.graphics.setAlpha(1);
  }

  hideWindow() {
    this.rect.disableInteractive();
    this.graphics.setAlpha(0);
    this.inventoryContainer.setAlpha(0);
  }
}
