import { Application } from "pixi.js";
import { PIXIboomContext } from "./context";

export function pixiboom() {
  const app = new Application();
  const ctx = new PIXIboomContext(app);

  app.init({ resizeTo: document.body }).then(() => {
    document.body.appendChild(app.canvas);
    ctx.emit("ready");

    app.ticker.add(() => ctx.emit("update"));
  });

  return ctx;
}
