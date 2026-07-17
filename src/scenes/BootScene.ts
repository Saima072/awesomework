import Phaser from 'phaser';

/**
 * Generates every texture at runtime with Graphics so the game ships
 * with zero binary assets.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    this.makePlayer();
    this.makeTile('ground', 0x5d4037, 0x8d6e63, 0x66bb6a);
    this.makeTile('platform', 0x455a64, 0x607d8b, 0x90a4ae);
    this.makeCoin();
    this.makeEnemy();
    this.makeFlag();
    this.makeSpike();
    this.makeCloud();
    this.makeTouchButtons();

    this.scene.start('title');
  }

  private makePlayer(): void {
    const g = this.add.graphics();
    // body
    g.fillStyle(0xff7043);
    g.fillRoundedRect(2, 2, 28, 36, 8);
    // belly
    g.fillStyle(0xffab91);
    g.fillRoundedRect(7, 16, 18, 18, 6);
    // eyes
    g.fillStyle(0xffffff);
    g.fillCircle(11, 13, 5);
    g.fillCircle(22, 13, 5);
    g.fillStyle(0x263238);
    g.fillCircle(12.5, 13, 2.5);
    g.fillCircle(23.5, 13, 2.5);
    g.generateTexture('player', 32, 40);
    g.destroy();
  }

  private makeTile(key: string, base: number, light: number, top: number): void {
    const g = this.add.graphics();
    g.fillStyle(base);
    g.fillRect(0, 0, 48, 48);
    g.fillStyle(light);
    g.fillRect(2, 2, 44, 44);
    g.fillStyle(top);
    g.fillRect(0, 0, 48, 10);
    g.generateTexture(key, 48, 48);
    g.destroy();
  }

  private makeCoin(): void {
    const g = this.add.graphics();
    g.fillStyle(0xffb300);
    g.fillCircle(12, 12, 11);
    g.fillStyle(0xffe082);
    g.fillCircle(12, 12, 7);
    g.fillStyle(0xffb300);
    g.fillRect(10, 6, 4, 12);
    g.generateTexture('coin', 24, 24);
    g.destroy();
  }

  private makeEnemy(): void {
    const g = this.add.graphics();
    g.fillStyle(0x7e57c2);
    g.fillRoundedRect(0, 6, 36, 26, { tl: 14, tr: 14, bl: 4, br: 4 });
    g.fillStyle(0xffffff);
    g.fillCircle(11, 16, 5);
    g.fillCircle(25, 16, 5);
    g.fillStyle(0x263238);
    g.fillCircle(11, 17, 2.5);
    g.fillCircle(25, 17, 2.5);
    // feet
    g.fillStyle(0x4527a0);
    g.fillCircle(8, 32, 4);
    g.fillCircle(28, 32, 4);
    g.generateTexture('enemy', 36, 36);
    g.destroy();
  }

  private makeFlag(): void {
    const g = this.add.graphics();
    g.fillStyle(0xcfd8dc);
    g.fillRect(2, 0, 4, 96);
    g.fillStyle(0x43a047);
    g.fillTriangle(6, 4, 6, 36, 44, 20);
    g.generateTexture('flag', 48, 96);
    g.destroy();
  }

  private makeSpike(): void {
    const g = this.add.graphics();
    g.fillStyle(0xb0bec5);
    g.fillTriangle(0, 24, 12, 0, 24, 24);
    g.fillStyle(0x78909c);
    g.fillTriangle(6, 24, 12, 5, 18, 24);
    g.generateTexture('spike', 24, 24);
    g.destroy();
  }

  private makeTouchButtons(): void {
    const drawBase = (g: Phaser.GameObjects.Graphics, accent: number) => {
      g.fillStyle(0x263238, 0.4);
      g.fillCircle(44, 44, 42);
      g.lineStyle(4, accent, 0.8);
      g.strokeCircle(44, 44, 42);
    };

    let g = this.add.graphics();
    drawBase(g, 0xffffff);
    g.fillStyle(0xffffff, 0.9);
    g.fillTriangle(58, 22, 58, 66, 24, 44);
    g.generateTexture('btn-left', 88, 88);
    g.destroy();

    g = this.add.graphics();
    drawBase(g, 0xffffff);
    g.fillStyle(0xffffff, 0.9);
    g.fillTriangle(30, 22, 30, 66, 64, 44);
    g.generateTexture('btn-right', 88, 88);
    g.destroy();

    g = this.add.graphics();
    drawBase(g, 0xffd54f);
    g.fillStyle(0xffd54f, 0.9);
    g.fillTriangle(22, 48, 66, 48, 44, 20);
    g.fillRect(36, 48, 16, 20);
    g.generateTexture('btn-jump', 88, 88);
    g.destroy();
  }

  private makeCloud(): void {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(20, 26, 14);
    g.fillCircle(40, 20, 18);
    g.fillCircle(62, 26, 13);
    g.fillRect(18, 24, 46, 14);
    g.generateTexture('cloud', 80, 44);
    g.destroy();
  }
}
