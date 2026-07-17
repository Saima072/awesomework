import Phaser from 'phaser';
import { TouchControls } from '../ui/TouchControls';
import { FOOD_KEYS } from './BootScene';

const TILE = 48;
const WORLD_WIDTH = TILE * 90; // 4320 px
const WORLD_HEIGHT = 540;

// Level map: each entry is [tileX, tileY(from bottom), widthInTiles]
const GROUND_RUNS: Array<[number, number]> = [
  // [startTileX, widthInTiles] — gaps between runs are pits
  [0, 14],
  [17, 9],
  [29, 12],
  [44, 8],
  [55, 13],
  [71, 19]
];

const PLATFORMS: Array<[number, number, number]> = [
  [10, 3, 3],
  [15, 5, 2],
  [21, 4, 3],
  [26, 6, 2],
  [33, 3, 3],
  [38, 5, 3],
  [42, 7, 2],
  [48, 4, 3],
  [52, 6, 2],
  [59, 3, 3],
  [64, 5, 3],
  [68, 7, 2],
  [75, 4, 3],
  [80, 6, 3]
];

const FOOD_SPOTS: Array<[number, number]> = [
  [5, 2], [8, 2], [11, 5], [16, 7], [19, 2], [22, 6], [27, 8],
  [31, 2], [34, 5], [39, 7], [43, 9], [46, 2], [49, 6], [53, 8],
  [57, 2], [60, 5], [65, 7], [69, 9], [73, 2], [76, 6], [81, 8], [84, 2]
];

// [startTileX, endTileX] patrol range on the ground
const ENEMIES: Array<[number, number]> = [
  [6, 12],
  [30, 39],
  [57, 66],
  [73, 82]
];

const SPIKES: number[] = [20, 35, 61, 78];

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'a' | 'd' | 'w', Phaser.Input.Keyboard.Key>;
  private touch?: TouchControls;
  private food!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private score = 0;
  private lives = 3;
  private totalFood = 0;
  private jumpsLeft = 2;
  private invulnUntil = 0;
  private gameOver = false;

  constructor() {
    super('game');
  }

  create(): void {
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT + 200);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.buildBackground();
    const solids = this.buildLevel();
    this.buildPlayer();
    this.buildFood();
    this.buildEnemies(solids);
    this.buildSpikes();
    this.buildFlag();
    this.buildHud();

    this.physics.add.collider(this.player, solids, () => {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      if (body.blocked.down) this.jumpsLeft = 2;
    });

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(160, 400);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      a: this.input.keyboard!.addKey('A'),
      d: this.input.keyboard!.addKey('D'),
      w: this.input.keyboard!.addKey('W')
    };

    if (TouchControls.isTouchDevice(this)) {
      this.touch = new TouchControls(this);
    }
  }

  update(time: number): void {
    if (this.gameOver) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const left = this.cursors.left.isDown || this.wasd.a.isDown || this.touch?.left === true;
    const right = this.cursors.right.isDown || this.wasd.d.isDown || this.touch?.right === true;

    if (left) {
      this.player.setVelocityX(-260);
      this.player.setFlipX(true);
    } else if (right) {
      this.player.setVelocityX(260);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.w) ||
      this.touch?.consumeJump() === true;

    if (jumpPressed && (body.blocked.down || this.jumpsLeft > 0)) {
      if (!body.blocked.down) this.jumpsLeft--;
      else this.jumpsLeft = 1;
      this.player.setVelocityY(-560);
    }

    // fell into a pit
    if (this.player.y > WORLD_HEIGHT + 60) {
      this.hitPlayer(time, true);
    }

    // flicker while invulnerable
    this.player.setAlpha(time < this.invulnUntil ? 0.5 : 1);
  }

  private buildBackground(): void {
    const cam = this.cameras.main;
    // static sky gradient
    const sky = this.add.graphics().setScrollFactor(0).setDepth(-10);
    sky.fillGradientStyle(0x4fc3f7, 0x4fc3f7, 0xb3e5fc, 0xb3e5fc, 1);
    sky.fillRect(0, 0, cam.width, cam.height);

    // parallax clouds
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(0, WORLD_WIDTH);
      const y = Phaser.Math.Between(30, 220);
      this.add
        .image(x, y, 'cloud')
        .setScrollFactor(0.35)
        .setAlpha(0.75)
        .setScale(Phaser.Math.FloatBetween(0.6, 1.3))
        .setDepth(-5);
    }
  }

  private buildLevel(): Phaser.Physics.Arcade.StaticGroup {
    const solids = this.physics.add.staticGroup();

    for (const [startX, width] of GROUND_RUNS) {
      for (let i = 0; i < width; i++) {
        solids.create((startX + i) * TILE + TILE / 2, WORLD_HEIGHT - TILE / 2, 'ground');
      }
    }
    for (const [tx, fromBottom, width] of PLATFORMS) {
      for (let i = 0; i < width; i++) {
        solids.create(
          (tx + i) * TILE + TILE / 2,
          WORLD_HEIGHT - TILE / 2 - fromBottom * TILE,
          'platform'
        );
      }
    }
    return solids;
  }

  private buildPlayer(): void {
    const blobIndex = (this.registry.get('blobIndex') as number) ?? 0;
    this.player = this.physics.add.sprite(
      TILE * 2,
      WORLD_HEIGHT - TILE * 2,
      `blob-${blobIndex}`
    );
    this.player.setCollideWorldBounds(true);
    (this.player.body as Phaser.Physics.Arcade.Body).setSize(28, 32).setOffset(4, 5);
  }

  private buildFood(): void {
    this.food = this.physics.add.group({ allowGravity: false, immovable: true });
    for (const [tx, fromBottom] of FOOD_SPOTS) {
      const item = this.food.create(
        tx * TILE + TILE / 2,
        WORLD_HEIGHT - TILE / 2 - fromBottom * TILE,
        FOOD_KEYS[(tx + fromBottom) % FOOD_KEYS.length]
      ) as Phaser.Physics.Arcade.Sprite;
      // gentle bob so snacks feel alive without spinning like coins
      this.tweens.add({
        targets: item,
        y: item.y - 5,
        angle: 6,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: (tx % 5) * 120
      });
    }
    this.totalFood = FOOD_SPOTS.length;

    this.physics.add.overlap(this.player, this.food, (_p, f) => {
      const item = f as Phaser.Physics.Arcade.Sprite;
      this.tweens.killTweensOf(item);
      item.disableBody(true, true);
      this.score += 10;
      this.scoreText.setText(this.scoreLabel());
    });
  }

  private buildEnemies(solids: Phaser.Physics.Arcade.StaticGroup): void {
    this.enemies = this.physics.add.group();
    for (const [fromX, toX] of ENEMIES) {
      const enemy = this.enemies.create(
        fromX * TILE + TILE / 2,
        WORLD_HEIGHT - TILE - 18,
        'enemy'
      ) as Phaser.Physics.Arcade.Sprite;
      enemy.setVelocityX(90);
      enemy.setBounce(0);
      enemy.setData('minX', fromX * TILE + 20);
      enemy.setData('maxX', (toX + 1) * TILE - 20);
    }
    this.physics.add.collider(this.enemies, solids);

    this.physics.add.overlap(this.player, this.enemies, (_p, e) => {
      const enemy = e as Phaser.Physics.Arcade.Sprite;
      if (!enemy.active) return;
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
      // stomp: falling and above the enemy
      if (playerBody.velocity.y > 80 && this.player.y < enemy.y - 8) {
        enemy.disableBody(true, true);
        this.player.setVelocityY(-420);
        this.score += 25;
        this.scoreText.setText(this.scoreLabel());
      } else {
        this.hitPlayer(this.time.now, false);
      }
    });

    // patrol turnaround
    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        for (const obj of this.enemies.getChildren()) {
          const enemy = obj as Phaser.Physics.Arcade.Sprite;
          if (!enemy.active) continue;
          const min = enemy.getData('minX') as number;
          const max = enemy.getData('maxX') as number;
          const vx = (enemy.body as Phaser.Physics.Arcade.Body).velocity.x;
          if (enemy.x <= min && vx <= 0) {
            enemy.setVelocityX(90);
            enemy.setFlipX(true);
          } else if (enemy.x >= max && vx >= 0) {
            enemy.setVelocityX(-90);
            enemy.setFlipX(false);
          } else if (vx === 0) {
            enemy.setVelocityX(90);
          }
        }
      }
    });
  }

  private buildSpikes(): void {
    const spikes = this.physics.add.staticGroup();
    for (const tx of SPIKES) {
      spikes
        .create(tx * TILE + TILE / 2, WORLD_HEIGHT - TILE - 12, 'spike')
        .setSize(18, 16);
    }
    this.physics.add.overlap(this.player, spikes, () => {
      this.hitPlayer(this.time.now, false);
    });
  }

  private buildFlag(): void {
    const flag = this.physics.add.staticImage(
      TILE * 87 + TILE / 2,
      WORLD_HEIGHT - TILE - 48,
      'flag'
    );
    this.physics.add.overlap(this.player, flag, () => this.win());
  }

  private buildHud(): void {
    this.scoreText = this.add
      .text(16, 12, this.scoreLabel(), {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#37474f',
        strokeThickness: 5
      })
      .setScrollFactor(0)
      .setDepth(10);
    this.livesText = this.add
      .text(944, 12, this.livesLabel(), {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: '24px',
        color: '#ffcdd2',
        stroke: '#b71c1c',
        strokeThickness: 5
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(10);
  }

  private scoreLabel(): string {
    return `Score ${this.score}  ·  Snacks ${this.foodEaten()}/${this.totalFood}`;
  }

  private foodEaten(): number {
    if (!this.food) return 0;
    return this.totalFood - this.food.countActive(true);
  }

  private livesLabel(): string {
    return '♥'.repeat(Math.max(this.lives, 0));
  }

  private hitPlayer(now: number, fell: boolean): void {
    if (this.gameOver) return;
    if (!fell && now < this.invulnUntil) return;

    this.lives--;
    this.livesText.setText(this.livesLabel());

    if (this.lives <= 0) {
      this.endGame(false);
      return;
    }

    if (fell) {
      // respawn at start of the nearest ground run behind the player
      let respawnX = TILE * 2;
      for (const [startX] of GROUND_RUNS) {
        const x = (startX + 1) * TILE;
        if (x < this.player.x) respawnX = x;
      }
      this.player.setPosition(respawnX, WORLD_HEIGHT - TILE * 3);
      this.player.setVelocity(0, 0);
    } else {
      this.player.setVelocityY(-380);
      this.player.setVelocityX(this.player.flipX ? 220 : -220);
    }
    this.invulnUntil = now + 1500;
  }

  private win(): void {
    if (this.gameOver) return;
    const bonus = this.lives * 50;
    this.score += bonus;
    this.endGame(true);
  }

  private endGame(won: boolean): void {
    this.gameOver = true;
    this.physics.pause();
    this.player.setTint(won ? 0xffffff : 0x9e9e9e);

    const cam = this.cameras.main;
    this.add
      .rectangle(cam.width / 2, cam.height / 2, cam.width, cam.height, 0x000000, 0.55)
      .setScrollFactor(0)
      .setDepth(20);
    this.add
      .text(
        cam.width / 2,
        cam.height / 2 - 40,
        won ? 'YOU WIN!' : 'GAME OVER',
        {
          fontFamily: 'Arial Black, sans-serif',
          fontSize: '64px',
          color: won ? '#ffd54f' : '#ef9a9a',
          stroke: '#000000',
          strokeThickness: 8
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(21);
    this.add
      .text(
        cam.width / 2,
        cam.height / 2 + 30,
        `Final score: ${this.score}\n${this.touch ? 'Tap' : 'Press SPACE'} to play again`,
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '26px',
          color: '#ffffff',
          align: 'center',
          lineSpacing: 8
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(21);

    this.time.delayedCall(600, () => {
      let restarted = false;
      const restart = () => {
        if (restarted) return;
        restarted = true;
        this.scene.restart();
      };
      this.input.keyboard?.once('keydown-SPACE', restart);
      this.input.once('pointerdown', restart);
    });
  }
}
