import { Assets, Sprite, Texture } from "pixi.js";

import type { Comp, GameObj } from "../../object";

export interface SpriteComp {
  sprite: string;

  readonly width: number;
  readonly height: number;
}

export function sprite(sprite: string) {
  let _sprite = sprite;
  let texture: Texture | null = null;

  async function setSprite(name: string): Promise<Sprite> {
    const tex = (await Assets.load(`sprites/${name}`)) as Texture | null;
    if (tex === null) throw new Error(`cannot find sprite '${name}'`);

    texture = tex;
    return Sprite.from(tex);
  }

  return {
    async add() {
      this.setShape(await setSprite(sprite));
    },
    get sprite() {
      return _sprite;
    },
    set sprite(name) {
      _sprite = name;
      setSprite(name).then((spr) => this.setShape(spr));
    },
    get width() {
      return texture?.width ?? 0;
    },
    get height() {
      return texture?.height ?? 0;
    },
  } satisfies Comp & SpriteComp & ThisType<GameObj<SpriteComp>>;
}
