export type Vector2Args = [x: number, y: number] | [vec: Vector2];

export function vec2(...args: Vector2Args) {
  return Vector2.fromCloned(...args);
}

export class Vector2 {
  constructor(
    public x: number,
    public y: number,
  ) {}

  static from(...args: Vector2Args): Vector2 {
    const [fs, sc] = args;

    if (fs instanceof Vector2) {
      return fs;
    }

    return new Vector2(fs, sc!);
  }

  static fromCloned(...args: Vector2Args): Vector2 {
    const [fs, sc] = args;

    if (fs instanceof Vector2) {
      return fs.clone();
    }

    return new Vector2(fs, sc!);
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  add(...args: Vector2Args) {
    const other = Vector2.from(...args);

    this.x += other.x;
    this.y += other.y;
  }

  sub(...args: Vector2Args) {
    const other = Vector2.from(...args);

    this.x -= other.x;
    this.y -= other.y;
  }

  mul(...args: Vector2Args) {
    const other = Vector2.from(...args);

    this.x *= other.x;
    this.y *= other.y;
  }

  div(...args: Vector2Args) {
    const other = Vector2.from(...args);

    this.x /= other.x;
    this.y /= other.y;
  }
}
