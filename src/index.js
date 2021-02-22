import * as Phaser from 'phaser';
import io from 'socket.io-client';
import scenes from './scenes/scenes';
// import 'dotenv/config';

// const SERVER_URL = 'http://localhost:4000'; // why is dotenv not working?

const config = {
  type: Phaser.AUTO,
  // width: window.innerWidth, // 800,
  // height: window.innerHeight, // 600,
  scene: scenes,
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
      gravity: {
        y: 0,
      },
    },
  },
  scale: {
    width: '100%', // window.innerWidth,
    height: '100%', // window.innerHeight,
    mode: Phaser.Scale.RESIZE,
    parent: 'phaser-game',
  },
  // to get rid of grainy look when we scale up tiles
  pixelArt: true,
  // when using floating points phaser will round up to the nearest pixel to render clean
  roundPixels: true,
};

class Game extends Phaser.Game {
  constructor() {
    console.log(`this is the server url ${SERVER_URL}`); // process.env.SERVER_URL
    super(config);
    const socket = io(SERVER_URL); // process.env.SERVER_URL
    this.globals = { socket };
    this.scene.start('Boot');
  }
}

window.onload = () => {
  window.game = new Game();
};
