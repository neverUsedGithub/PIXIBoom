import { Color as PIXIColor } from "pixi.js";

export type ColorArgs =
  | [color: Color]
  | [r: number, g: number, b: number]
  | [r: number, g: number, b: number, a: number];

export class Color {
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public a: number,
  ) {}

  static from(...args: ColorArgs): Color {
    const [r, g, b, a] = args;

    if (r instanceof Color) return r;
    if (args.length === 3) return new Color(r, g as number, b as number, 255);
    return new Color(r, g as number, b as number, a as number);
  }

  static fromCloned(...args: ColorArgs): Color {
    const [r, g, b, a] = args;

    if (r instanceof Color) return r.clone();
    if (args.length === 3) return new Color(r, g as number, b as number, 255);
    return new Color(r, g as number, b as number, a as number);
  }

  clone() {
    return new Color(this.r, this.g, this.b, this.a);
  }

  asPIXIColor(): PIXIColor {
    return new PIXIColor([this.r / 255, this.g / 255, this.b / 255, this.a / 255]);
  }
}

export function rgb(r: number, g: number, b: number) {
  return new Color(r, g, b, 255);
}

export function rgba(r: number, g: number, b: number, a: number) {
  return new Color(r, g, b, a);
}
