import * as Phaser from 'phaser';

const titleRatio = { width: 0.5, height: 0.1 };
export default class CharacterSelectionScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelection');
  }

  create() {
    this.titleText = this.add.text(this.scale.width * titleRatio.width, this.scale.height * titleRatio.height, 'Hunt 4 BTC', {
      fontSize: `${this.scale.width * 0.1}px`,
      fill: '#6f6f6f',
    });
    this.titleText.setOrigin(0.5);

    // call characters selection create sprites
    this.createCharacters();

    // handle game reize
    this.scale.on('resize', this.resize, this);
    // this.resize({ width: this.scale.width, height: this.scale.height });
  }

  createCharacters() {
    this.group = this.add.group();

    for (let j = 0; j < 3; j += 1) {
      let x = this.scale.width * 0.24;
      const y = (this.scale.height / 6) * (j + 2);

      for (let i = 0 + (8 * j); i < 8 + (8 * j); i += 1) {
        const character = this.add.image(x, y, 'characters', i).setInteractive();
        character.setScale(3);
        character.setAlpha(0.4);
        character.on('pointerover', this.pointerover);
        character.on('pointerout', this.pointerout);
        character.on('pointerdown', this.pointerdown.bind(this, character));
        this.group.add(character);
        x += 100;
      }
    }
  }

  pointerover() {
    this.setAlpha(1);
  }

  pointerout() {
    this.setAlpha(0.4);
  }

  pointerdown() {
    this.scale.removeListener('resize', this.resize);
    this.scene.start('Game');
  }

  resize(gameSize) {
    const { width, height } = gameSize;
    this.cameras.resize(width, height);
    this.titleText.setPosition(width * titleRatio.width, height * titleRatio.height);
    this.titleText.setFontSize(`${width * 0.1}px`);

    let yDiff = 0;
    let xDiff = 0;
    let charactersPerRow = 8;
    let heightDiff = 6;

    if (width < 1200) {
      charactersPerRow = 6;
      heightDiff = 8;
    }
    if (width < 780) {
      charactersPerRow = 4;
      heightDiff = 8;
    }

    this.group.getChildren().forEach((child, index) => {
      if (index !== 0) {
        yDiff = parseInt(index / charactersPerRow, 10);
        xDiff = index % charactersPerRow;
      }
      // const x = (width * 0.24) + (100 + xDiff);
      const x = width / 3.5 + (96 * xDiff);
      const y = (height / heightDiff) * (yDiff + 2);
      child.setPosition(x, y);

      if (height < 600) {
        child.setScale(1.5);
      } else {
        child.setScale(3);
      }
    });
  }
}
