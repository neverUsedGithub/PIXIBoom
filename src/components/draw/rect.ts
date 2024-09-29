import { Graphics } from "pixi.js";

import type { GameObj } from "../../object";

export interface RectComp {
  width: number;
  height: number;
}

export function rect(width: number, height: number) {
  const shape = new Graphics().rect(0, 0, width, height).fill(0xffffff);

  return {
    add() {
      this.setShape(shape);
    },

    update() {
      if (shape.destroyed) return;

      shape.width = this.width;
      shape.height = this.height;
    },

    width,
    height,
  } satisfies ThisType<GameObj<RectComp>>;
}
