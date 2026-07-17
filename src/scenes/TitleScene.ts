import Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x1a237e).setOrigin(0);
    this.add.image(180, 120, 'cloud').setScale(1.4).setAlpha(0.4);
    this.add.image(720, 90, 'cloud').setAlpha(0.3);
    this.add.image(500, 200, 'cloud').setScale(0.8).setAlpha(0.25);

    this.add
      .text(width / 2, height * 0.3, 'SKY RUNNER', {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: '72px',
        color: '#ffd54f',
        stroke: '#e65100',
        strokeThickness: 8
      })
      .setOrigin(0.5);

    const isTouch = this.sys.game.device.input.touch;
    this.add
      .text(
        width / 2,
        height * 0.55,
        isTouch
          ? 'On-screen buttons to move  ·  yellow button to jump (double jump!)\nGrab every coin, dodge the spikes, reach the flag.'
          : 'Arrows / WASD to move  ·  Space to jump (double jump!)\nGrab every coin, dodge the spikes, reach the flag.',
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '22px',
          color: '#e8eaf6',
          align: 'center',
          lineSpacing: 8
        }
      )
      .setOrigin(0.5);

    const prompt = this.add
      .text(width / 2, height * 0.78, isTouch ? 'Tap to start' : 'Press SPACE or click to start', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '26px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: 0.25,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('game'));
    this.input.once('pointerdown', () => this.scene.start('game'));
  }
}
