import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 960,
  height: 540,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1200 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  input: {
    activePointers: 3
  },
  scene: [BootScene, TitleScene, GameScene]
});

// Landscape-only on phones: cover the game with a "rotate your phone"
// overlay while a touch device is held in portrait, and pause the game
// so nothing sneaks up on the player while they can't see.
const overlay = document.getElementById('rotate-overlay')!;
const portrait = window.matchMedia('(orientation: portrait)');
let sleptByOverlay = false;

function applyOrientation(): void {
  const isTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
  const block = isTouch && portrait.matches;
  overlay.classList.toggle('visible', block);
  if (block && !sleptByOverlay) {
    sleptByOverlay = true;
    game.loop.sleep();
  } else if (!block && sleptByOverlay) {
    sleptByOverlay = false;
    game.loop.wake();
  }
}

portrait.addEventListener('change', applyOrientation);
applyOrientation();
