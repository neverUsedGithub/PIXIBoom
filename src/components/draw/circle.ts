import { Graphics } from "pixi.js";

import type { GameObj } from "../../object";

export interface CircleComp {
  radius: number;
}

export function circle(radius: number) {
  let _radius = radius;

  return {
    add() {
      this.setShape(new Graphics().circle(0, 0, radius).fill(0xffffff));
    },

    get radius() {
      return _radius;
    },

    set radius(rad: number) {
      _radius = rad;
      this.setShape(new Graphics().circle(0, 0, rad).fill(0xffffff));
    },
  } satisfies ThisType<GameObj<CircleComp>>;
}
