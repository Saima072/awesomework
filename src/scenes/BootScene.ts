import Phaser from 'phaser';

export const BLOB_COLORS: Array<{ base: number; light: number; name: string }> = [
  { base: 0xff7043, light: 0xffccbc, name: 'Tango' },
  { base: 0xf06292, light: 0xf8bbd0, name: 'Berry' },
  { base: 0x66bb6a, light: 0xc8e6c9, name: 'Pistachio' },
  { base: 0x4fc3f7, light: 0xb3e5fc, name: 'Sky' },
  { base: 0xb39ddb, light: 0xede7f6, name: 'Plum' }
];

export const FOOD_KEYS = ['food-apple', 'food-donut', 'food-cheese', 'food-cherry'] as const;

/**
 * Generates every texture at runtime with Graphics so the game ships
 * with zero binary assets.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    this.makeBlobs();
    this.makeTile('ground', 0x5d4037, 0x8d6e63, 0x66bb6a);
    this.makeTile('platform', 0x455a64, 0x607d8b, 0x90a4ae);
    this.makeFood();
    this.makeSelectRing();
    this.makeEnemy();
    this.makeFlag();
    this.makeSpike();
    this.makeCloud();
    this.makeTouchButtons();

    this.scene.start('title');
  }

  /** Tiny fluffy square blobs in different colors: blob-0 … blob-4. */
  private makeBlobs(): void {
    for (let i = 0; i < BLOB_COLORS.length; i++) {
      const { base, light } = BLOB_COLORS[i];
      const g = this.add.graphics();

      // fluff: little tufts poking out around the square body
      g.fillStyle(base);
      const tufts: Array<[number, number]> = [
        [9, 5], [18, 3], [27, 5],
        [4, 12], [32, 12],
        [3, 20], [33, 20],
        [4, 27], [32, 27],
        [9, 32], [18, 34], [27, 32]
      ];
      for (const [tx, ty] of tufts) g.fillCircle(tx, ty, 4);

      // square body over the tufts
      g.fillRoundedRect(4, 5, 28, 27, 9);
      g.fillStyle(light, 0.55);
      g.fillRoundedRect(8, 9, 20, 12, 7);

      // face
      g.fillStyle(0xffffff);
      g.fillCircle(13, 18, 4.5);
      g.fillCircle(23, 18, 4.5);
      g.fillStyle(0x263238);
      g.fillCircle(14, 18.5, 2.2);
      g.fillCircle(24, 18.5, 2.2);
      g.fillStyle(0xef9a9a, 0.85);
      g.fillCircle(9.5, 24, 2.6);
      g.fillCircle(26.5, 24, 2.6);

      g.generateTexture(`blob-${i}`, 36, 37);
      g.destroy();
    }
  }

  private makeSelectRing(): void {
    const g = this.add.graphics();
    g.lineStyle(4, 0xffd54f, 1);
    g.strokeRoundedRect(4, 4, 48, 48, 14);
    g.generateTexture('select-ring', 56, 56);
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

  private makeFood(): void {
    // apple
    let g = this.add.graphics();
    g.fillStyle(0x795548);
    g.fillRect(11, 3, 3, 6);
    g.fillStyle(0x66bb6a);
    g.fillEllipse(17, 5, 9, 5);
    g.fillStyle(0xe53935);
    g.fillCircle(12, 14, 9);
    g.fillStyle(0xffffff, 0.35);
    g.fillEllipse(9, 11, 5, 3);
    g.generateTexture('food-apple', 24, 24);
    g.destroy();

    // donut with frosting and sprinkles
    g = this.add.graphics();
    g.lineStyle(8, 0xd7a86e);
    g.strokeCircle(12, 12, 7);
    g.lineStyle(6, 0xf06292);
    g.beginPath();
    g.arc(12, 12, 7, Math.PI * 0.9, Math.PI * 2.1);
    g.strokePath();
    g.fillStyle(0xfff59d);
    g.fillCircle(7, 8, 1.2);
    g.fillCircle(16, 6, 1.2);
    g.fillStyle(0x81d4fa);
    g.fillCircle(12, 5, 1.2);
    g.fillCircle(19, 10, 1.2);
    g.generateTexture('food-donut', 24, 24);
    g.destroy();

    // cheese wedge
    g = this.add.graphics();
    g.fillStyle(0xffca28);
    g.fillTriangle(2, 20, 22, 20, 22, 4);
    g.fillStyle(0xffa000, 0.6);
    g.fillCircle(17, 15, 2.2);
    g.fillCircle(12, 18, 1.6);
    g.fillCircle(20, 10, 1.4);
    g.generateTexture('food-cheese', 24, 24);
    g.destroy();

    // cherries
    g = this.add.graphics();
    g.lineStyle(2, 0x66bb6a);
    g.beginPath();
    g.moveTo(8, 12);
    g.lineTo(12, 3);
    g.lineTo(17, 11);
    g.strokePath();
    g.fillStyle(0x66bb6a);
    g.fillEllipse(14, 4, 7, 4);
    g.fillStyle(0xd32f2f);
    g.fillCircle(7, 16, 6);
    g.fillCircle(17, 16, 6);
    g.fillStyle(0xffffff, 0.35);
    g.fillCircle(5, 14, 1.8);
    g.fillCircle(15, 14, 1.8);
    g.generateTexture('food-cherry', 24, 24);
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
