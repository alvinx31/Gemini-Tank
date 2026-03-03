import { GameState, Tank, Bullet } from './types';
import { Direction, TileType, TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

export class Renderer {
  ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  render(state: GameState) {
    // Clear
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.renderMap(state.map);
    
    for (const enemy of state.enemies) {
      this.renderTank(enemy, '#ff0000');
    }

    if (state.player) {
      this.renderTank(state.player, '#eab308'); // Yellow
    }

    for (const bullet of state.bullets) {
      this.renderBullet(bullet);
    }
  }

  renderMap(map: TileType[][]) {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const tile = map[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        if (tile === TileType.BRICK) {
          this.ctx.fillStyle = '#b91c1c'; // Red-700
          this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          this.ctx.strokeStyle = '#fca5a5';
          this.ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
        } else if (tile === TileType.STEEL) {
          this.ctx.fillStyle = '#9ca3af'; // Gray-400
          this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        } else if (tile === TileType.WATER) {
          this.ctx.fillStyle = '#3b82f6'; // Blue-500
          this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        } else if (tile === TileType.GRASS) {
          this.ctx.fillStyle = '#22c55e'; // Green-500
          this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        } else if (tile === TileType.BASE) {
          this.ctx.fillStyle = '#1e3a8a'; // Blue-900
          this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          this.ctx.fillStyle = '#fbbf24'; // Amber-400
          this.ctx.beginPath();
          this.ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2, TILE_SIZE/2 - 2, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }
  }

  renderTank(tank: Tank, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(tank.x, tank.y, tank.width, tank.height);

    // Draw gun barrel
    this.ctx.fillStyle = '#ffffff';
    const barrelLength = 10;
    const barrelWidth = 4;
    
    let bx = tank.x + tank.width / 2 - barrelWidth / 2;
    let by = tank.y + tank.height / 2 - barrelWidth / 2;
    let bw = barrelWidth;
    let bh = barrelWidth;

    if (tank.direction === Direction.UP) {
      by = tank.y - 4;
      bh = barrelLength;
    } else if (tank.direction === Direction.DOWN) {
      by = tank.y + tank.height - barrelLength + 4;
      bh = barrelLength;
    } else if (tank.direction === Direction.LEFT) {
      bx = tank.x - 4;
      bw = barrelLength;
    } else if (tank.direction === Direction.RIGHT) {
      bx = tank.x + tank.width - barrelLength + 4;
      bw = barrelLength;
    }

    this.ctx.fillRect(bx, by, bw, bh);
  }

  renderBullet(bullet: Bullet) {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
}
