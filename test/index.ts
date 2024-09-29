import { pixiboom, rotate, rect, circle, wait, clamp, sprite, pos, color, vec2 } from "../src";

const p = pixiboom();

p.loadSprite("player", "./p1_stand.png");

for (let i = 0; i < 10000000; i++) {
  const player = p.add([
    //
    sprite("player"),
    pos(50, 50),
    { vel: vec2(1, 1) },
  ]);

  player.on("update", () => {
    player.pos.add(player.vel);

    if (player.pos.x < 0 || player.pos.x + player.width > p.width()) player.vel.x *= -1;
    if (player.pos.y < 0 || player.pos.y + player.height > p.height()) player.vel.y *= -1;

    player.pos.x = clamp(player.pos.x, 0, p.width() - player.width);
    player.pos.y = clamp(player.pos.y, 0, p.height() - player.height);
  });

  await wait(0.01);
}
