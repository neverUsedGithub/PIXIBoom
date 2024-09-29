import type { Container } from "pixi.js";
import type { Comp, GameObj } from "../../object";
import { deg2rad } from "../../utils";

export interface RotateComp {
  rotation: number;
}

export function rotate(degrees: number) {
  let _degrees = degrees;

  function applyRotation(shape: Container) {
    shape.rotation = deg2rad(_degrees);
  }

  return {
    add() {
      const shape = this.getShape();
      if (shape) applyRotation(shape);

      this.on("shape", applyRotation);
    },

    get rotation() {
      return _degrees;
    },

    set rotation(v: number) {
      _degrees = v;

      const shape = this.getShape();
      if (shape) applyRotation(shape);
    },
  } satisfies Comp & RotateComp & ThisType<GameObj<RotateComp>>;
}
