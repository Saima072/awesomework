import Phaser from 'phaser';

/**
 * On-screen controls for touch devices: hold left/right to move,
 * tap the jump button (taps queue so a mid-air tap still double-jumps).
 * Buttons are camera-fixed and support multitouch, so you can hold a
 * direction and jump at the same time.
 */
export class TouchControls {
  left = false;
  right = false;
  private jumpQueued = false;

  constructor(scene: Phaser.Scene) {
    const cam = scene.cameras.main;
    const y = cam.height - 70;

    this.addButton(scene, 74, y, 'btn-left', (down) => (this.left = down));
    this.addButton(scene, 188, y, 'btn-right', (down) => (this.right = down));
    this.addButton(scene, cam.width - 74, y, 'btn-jump', (down) => {
      if (down) this.jumpQueued = true;
    });
  }

  /** Returns true once per jump-button press. */
  consumeJump(): boolean {
    const queued = this.jumpQueued;
    this.jumpQueued = false;
    return queued;
  }

  static isTouchDevice(scene: Phaser.Scene): boolean {
    return scene.sys.game.device.input.touch;
  }

  private addButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    onChange: (down: boolean) => void
  ): void {
    const btn = scene.add
      .image(x, y, texture)
      .setScrollFactor(0)
      .setDepth(15)
      .setAlpha(0.75)
      .setInteractive({
        hitArea: new Phaser.Geom.Circle(44, 44, 58),
        hitAreaCallback: Phaser.Geom.Circle.Contains
      });

    const press = () => {
      btn.setAlpha(1);
      onChange(true);
    };
    const release = () => {
      btn.setAlpha(0.75);
      onChange(false);
    };

    btn.on('pointerdown', press);
    btn.on('pointerup', release);
    btn.on('pointerout', release);
  }
}
