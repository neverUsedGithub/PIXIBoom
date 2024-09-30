import type { PIXIboomContext } from "./context";
import { EventEmitter } from "./events";

import { Container } from "pixi.js";

export interface CompBuiltins {
  id: string;
  add(): void;
  update(): void;
}

export type CompListToComps<XS extends CompList> = XS extends []
  ? {}
  : XS extends [infer Y, ...infer YS extends CompList]
    ? Y extends Comp
      ? Resolve<Omit<Y, keyof CompBuiltins> & CompListToComps<YS>>
      : CompListToComps<YS>
    : {};

export type Tag = string;
export type Comp = Partial<CompBuiltins> & Record<string, any>;
export type GameObj<T = {}> = GameObject & T;
export type CompList<T = Comp> = (T | Tag)[];

type Const<T> = T;
type Resolve<T> = Const<{ [K in keyof T]: T[K] }>;

let gameObjectId = 0;

function replaceChild(parent: Container, replacee: Container | null, replacer: Container): void {
  if (replacee === null) {
    parent.addChild(replacer);
    return;
  }

  parent.addChildAt(replacer, parent.getChildIndex(replacee));
  replacee.destroy();
}

export class GameObject extends EventEmitter<{ shape: [container: Container]; update: [] }> {
  public id: number = gameObjectId++;
  public children: GameObject[] = [];

  private tags: Set<string> = new Set();
  private comps: Map<string, Comp> = new Map();
  private anonymousComps: Comp[] = [];

  private pixiContainer = new Container();
  private pixiShape: Container | null = null;

  constructor(
    private context: PIXIboomContext,
    public readonly parent: GameObject | null,
    comps: CompList,
    pixiShape: Container | null = null,
  ) {
    super();

    if (parent) {
      parent.children.push(this);
      parent.getContainer().addChild(this.pixiContainer);
    }

    if (pixiShape) this.setShape(pixiShape);
    for (const comp of comps) this.use(comp);
  }

  update() {
    this.emit("update");
    this.comps.forEach((comp) => comp.update && comp.update());

    for (
      let i = 0, comp: Comp = this.anonymousComps[0];
      i < this.anonymousComps.length;
      comp = this.anonymousComps[++i]
    )
      comp.update && comp.update();

    for (let i = 0; i < this.children.length; i++) this.children[i].update();
  }

  use(comp: Comp | Tag): void {
    if (typeof comp === "string") {
      this.tags.add(comp);
      return;
    }

    if (comp.id && this.comps.has(comp.id))
      throw new Error(`component '${comp.id}' has already been added to this game object.`);

    if (comp.id) this.comps.set(comp.id, comp);
    else this.anonymousComps.push(comp);

    const props = Object.getOwnPropertyDescriptors(comp);
    for (const prop in props) {
      if (prop === "update" || prop === "add" || prop === "id") continue;

      if (typeof props[prop].value === "function") props[prop].value = props[prop].value.bind(this);
      if (typeof props[prop].get === "function") props[prop].get = props[prop].get.bind(this);
      if (typeof props[prop].set === "function") props[prop].set = props[prop].set.bind(this);

      Object.defineProperty(this, prop, props[prop]);
    }

    if (comp.update) comp.update = comp.update.bind(this);

    if (comp.add) {
      comp.add = comp.add.bind(this);
      comp.add();
    }
  }

  unuse(id: string) {
    this.tags.delete(id);
    this.comps.delete(id);
  }

  add<const T extends CompList>(components: T): GameObj<CompListToComps<T>> {
    return new GameObject(this.context, this, components) as any;
  }

  is(id: string): boolean {
    return this.tags.has(id) || this.comps.has(id);
  }

  get<T extends Comp>(id: string): T | null {
    return (this.comps.get(id) as T | undefined) ?? null;
  }

  setShape(container: Container) {
    const last = this.pixiShape;

    this.pixiShape = container;
    this.emit("shape", container);

    replaceChild(this.pixiContainer, last, this.pixiShape);
  }

  getShape(): Container | null {
    return this.pixiShape;
  }

  getContainer(): Container {
    return this.pixiContainer;
  }

  getContext(): PIXIboomContext {
    return this.context;
  }
}
