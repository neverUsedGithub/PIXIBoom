import type { Container } from "pixi.js";
import type { GameObj } from "../../object";
import { Vector2 } from "../../vector2";

export interface PosComp {
  pos: Vector2;
}

export function pos(x: number, y: number) {
  let container: Container | null = null;

  return {
    add() {
      container = this.getContainer();
    },

    update() {
      if (!container) return;

      container.x = this.pos.x;
      container.y = this.pos.y;
    },

    pos: new Vector2(x, y),
  } satisfies ThisType<GameObj<PosComp>>;
}
