import { Color } from "../../color";

import type { Container } from "pixi.js";
import type { ColorArgs } from "../../color";
import type { Comp, GameObj } from "../../object";

export interface ColorComp {
  color: Color;
}

export function color(...args: ColorArgs) {
  const color = Color.fromCloned(...args);

  let lastColor: Color = color;
  let shape: Container | null;

  return {
    add() {
      shape = this.getShape();
      if (shape) shape.tint = color.asPIXIColor();

      this.on("shape", (sh) => {
        shape = sh;
        shape.tint = this.color.asPIXIColor();
      });
    },

    update() {
      if (!shape) return;
      if (
        lastColor.r !== this.color.r ||
        lastColor.g !== this.color.g ||
        lastColor.b !== this.color.b ||
        lastColor.a !== this.color.a
      )
        return;

      lastColor = this.color;
      shape.tint = this.color.asPIXIColor();
    },

    color,
  } satisfies Comp & ColorComp & ThisType<GameObj<ColorComp>>;
}
