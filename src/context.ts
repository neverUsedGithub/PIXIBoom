import { GameObject } from "./object";
import { EventEmitter } from "./events";
import { Graphics, TilingSprite, Assets, Container, Ticker } from "pixi.js";

import type { Application } from "pixi.js";
import type { CompList, GameObj, CompListToComps } from "./object";

const LOADING_BAR_HEIGHT_RATIO = 0.2;
const LOADING_BAR_XPAD_RATIO = 0.1;
const LOADING_BAR_PADDING = 10;

function calculateOutline(width: number, height: number): { x: number; y: number; width: number; height: number } {
  const ySize = height * LOADING_BAR_HEIGHT_RATIO;

  return {
    x: width * LOADING_BAR_XPAD_RATIO,
    y: height / 2 - ySize / 2,
    width: width * (1 - LOADING_BAR_XPAD_RATIO * 2),
    height: ySize,
  };
}

function resizeLoader(barOutline: Graphics, bar: Graphics, outline: ReturnType<typeof calculateOutline>) {
  barOutline.x = outline.x;
  barOutline.y = outline.y;
  barOutline.width = outline.width;
  barOutline.height = outline.height;

  bar.x = outline.x + LOADING_BAR_PADDING;
  bar.y = outline.y + LOADING_BAR_PADDING;
  bar.height = outline.height - LOADING_BAR_PADDING * 2;
}

export interface LoaderContext {
  progress: number;
}

export class PIXIboomContext extends EventEmitter<{ ready: []; update: [] }> {
  private root: GameObject;
  private assetLoading: [Promise<void>, number][] = [];

  constructor(public pixiApp: Application) {
    super();

    this.root = new GameObject(this, null, []);
    this.waitForAssets();
  }

  private waitForAssets() {
    this.on("ready", async () => {
      if (this.assetLoading.length === 0) {
        this.initialize();
        return;
      }

      const loaderTicker = new Ticker();
      loaderTicker.start();

      const loaderContainer = new Container();
      const bg = new Graphics().rect(0, 0, this.width(), this.height()).fill(0x000000);
      loaderContainer.addChild(bg);

      this.pixiApp.renderer.on("resize", () => {
        bg.width = this.width();
        bg.height = this.height();
      });
      this.pixiApp.stage.addChild(loaderContainer);

      await Promise.race([
        Promise.all(this.assetLoading.map(([prom]) => prom)),
        new Promise(() => {
          const barOutline = new Graphics() //
            .rect(0, 0, 1, 1)
            .fill(0xffffff);

          const bar = new Graphics() //
            .rect(0, 0, 1, 1)
            .fill(0xffffff);

          resizeLoader(barOutline, bar, calculateOutline(this.width(), this.height()));

          this.pixiApp.renderer.on("resize", () => {
            if (loaderContainer.destroyed) return;

            resizeLoader(barOutline, bar, calculateOutline(this.width(), this.height()));
          });

          loaderContainer.addChild(barOutline, bar);

          loaderTicker.add(() => {
            if (loaderContainer.destroyed) return;
            let acc = 0;
            for (let i = 0; i < this.assetLoading.length; i++) acc += Math.min(this.assetLoading[i][1], 1);
            const percentage = acc / this.assetLoading.length;

            bar.tint = `hsl(${Math.floor(percentage * 360)}, 100%, 50%)`;
            bar.width = percentage * (barOutline.width - LOADING_BAR_PADDING * 2);
          });
        }),
      ]);

      loaderTicker.destroy();

      this.pixiApp.stage.removeChild(loaderContainer);
      loaderContainer.destroy({ children: true });

      this.pixiApp.renderer.removeListener("resize");
      this.initialize();
    });
  }

  private initialize() {
    window.addEventListener("unhandledrejection", (rej) => {
      console.log(rej);
    });

    const tileSize = 32;
    const checker = new Graphics()
      .rect(0, 0, tileSize, tileSize)
      .fill([0.5, 0.5, 0.5, 1])

      .rect(tileSize, 0, tileSize, tileSize)
      .fill([0.75, 0.75, 0.75, 1])

      .rect(0, tileSize, tileSize, tileSize)
      .fill([0.75, 0.75, 0.75, 1])

      .rect(tileSize, tileSize, tileSize, tileSize)
      .fill([0.5, 0.5, 0.5, 1]);

    const texture = this.pixiApp.renderer.generateTexture(checker);

    const tilingSprite = new TilingSprite({
      texture,
      width: this.pixiApp.renderer.width,
      height: this.pixiApp.renderer.height,
      zIndex: -1,
    });

    this.pixiApp.renderer.on("resize", () => {
      tilingSprite.width = this.pixiApp.renderer.width;
      tilingSprite.height = this.pixiApp.renderer.height;
    });

    this.on("update", () => this.root.update());

    this.pixiApp.stage.addChild(tilingSprite);
    this.pixiApp.stage.addChild(this.root.getContainer());
  }

  loadSprite(name: string, path: string) {
    Assets.add({ alias: `sprites/${name}`, src: path });

    const progress: [Promise<void>, number] = [Promise.resolve(), 0];
    progress[0] = Assets.load(`sprites/${name}`, (p) => (progress[1] = p));

    this.assetLoading.push(progress);
  }

  load(loader: (ctx: LoaderContext) => Promise<void>) {
    const progress: [Promise<void>, number] = [Promise.resolve(), 0];
    let _progress = 0;

    progress[0] = loader({
      get progress() {
        return _progress;
      },

      set progress(v: number) {
        _progress = v;
        progress[1] = v;
      },
    });
    this.assetLoading.push(progress);
  }

  add<const T extends CompList>(components: T): GameObj<CompListToComps<T>> {
    return new GameObject(this, this.root, components) as any;
  }

  width() {
    return this.pixiApp.renderer.width;
  }

  height() {
    return this.pixiApp.renderer.height;
  }
}
