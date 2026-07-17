import Phaser from 'phaser';
import { BLOB_COLORS } from './BootScene';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create(): void {
    const { width, height } = this.scale;
    const isTouch = this.sys.game.device.input.touch;

    this.add.rectangle(0, 0, width, height, 0x1a237e).setOrigin(0);
    this.add.image(180, 100, 'cloud').setScale(1.4).setAlpha(0.4);
    this.add.image(720, 70, 'cloud').setAlpha(0.3);
    this.add.image(500, 160, 'cloud').setScale(0.8).setAlpha(0.25);

    this.add
      .text(width / 2, height * 0.18, 'SKY RUNNER', {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: '64px',
        color: '#ffd54f',
        stroke: '#e65100',
        strokeThickness: 8
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height * 0.38,
        isTouch
          ? 'On-screen buttons to move  ·  yellow button to jump (double jump!)\nEat all the snacks, dodge the spikes, reach the flag.'
          : 'Arrows / WASD to move  ·  Space to jump (double jump!)\nEat all the snacks, dodge the spikes, reach the flag.',
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '20px',
          color: '#e8eaf6',
          align: 'center',
          lineSpacing: 8
        }
      )
      .setOrigin(0.5);

    this.buildBlobPicker(width, height);

    const prompt = this.add
      .text(width / 2, height * 0.86, isTouch ? 'Tap to start' : 'Press SPACE or click to start', {
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

    const start = () => this.scene.start('game');
    this.input.keyboard?.once('keydown-SPACE', start);
    // start on any tap/click that is NOT on a blob swatch
    this.input.on(
      'pointerdown',
      (_p: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
        if (over.length === 0) start();
      }
    );
  }

  private buildBlobPicker(width: number, height: number): void {
    if (this.registry.get('blobIndex') === undefined) {
      this.registry.set('blobIndex', Phaser.Math.Between(0, BLOB_COLORS.length - 1));
    }

    this.add
      .text(width / 2, height * 0.53, 'Pick your blob', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#9fa8da'
      })
      .setOrigin(0.5);

    const spacing = 96;
    const startX = width / 2 - ((BLOB_COLORS.length - 1) * spacing) / 2;
    const y = height * 0.67;

    const ring = this.add.image(0, y, 'select-ring');
    const nameLabel = this.add
      .text(width / 2, y + 52, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#ffd54f'
      })
      .setOrigin(0.5);

    const select = (i: number) => {
      this.registry.set('blobIndex', i);
      ring.setPosition(startX + i * spacing, y);
      nameLabel.setText(BLOB_COLORS[i].name);
    };

    for (let i = 0; i < BLOB_COLORS.length; i++) {
      const blob = this.add
        .image(startX + i * spacing, y, `blob-${i}`)
        .setScale(1.5)
        .setInteractive({ useHandCursor: true });
      blob.on('pointerdown', () => select(i));
      this.tweens.add({
        targets: blob,
        y: y - 6,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 120
      });
    }

    select(this.registry.get('blobIndex') as number);
  }
}
