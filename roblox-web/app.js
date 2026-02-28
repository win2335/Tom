const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");
const resetBtn = document.getElementById("resetBtn");

const world = {
  gravity: 0.6,
  friction: 0.85,
  speed: 0.55,
  runBoost: 1.65,
  jump: 12,
  floorY: canvas.height - 76,
  platforms: [
    { x: 90, y: 415, w: 170, h: 16 },
    { x: 330, y: 355, w: 180, h: 16 },
    { x: 615, y: 300, w: 210, h: 16 },
    { x: 760, y: 440, w: 120, h: 16 },
  ],
};

const player = {
  x: 90,
  y: 120,
  w: 42,
  h: 60,
  vx: 0,
  vy: 0,
  onGround: false,
};

const keys = new Set();

window.addEventListener("keydown", (e) => keys.add(e.key.toLowerCase()));
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

resetBtn.addEventListener("click", () => {
  player.x = 90;
  player.y = 120;
  player.vx = 0;
  player.vy = 0;
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function intersects(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#1f325f");
  sky.addColorStop(1, "#0f1a33");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#1a704f";
  ctx.fillRect(0, world.floorY, canvas.width, canvas.height - world.floorY);

  ctx.fillStyle = "#3c8b68";
  for (let i = 0; i < canvas.width; i += 32) {
    ctx.fillRect(i, world.floorY, 20, 8);
  }
}

function drawPlatforms() {
  for (const p of world.platforms) {
    ctx.fillStyle = "#d19f59";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "#9d6e38";
    ctx.fillRect(p.x, p.y + p.h - 4, p.w, 4);
  }
}

function drawPlayer() {
  ctx.fillStyle = "#ffd75e";
  ctx.fillRect(player.x + 8, player.y, 26, 18);

  ctx.fillStyle = "#ff4f6f";
  ctx.fillRect(player.x, player.y + 18, player.w, 24);

  ctx.fillStyle = "#7da4ff";
  ctx.fillRect(player.x, player.y + 42, 18, 18);
  ctx.fillRect(player.x + 24, player.y + 42, 18, 18);
}

function update() {
  const moveLeft = keys.has("a");
  const moveRight = keys.has("d");
  const jump = keys.has(" ") || keys.has("space");
  const running = keys.has("shift");

  const accel = world.speed * (running ? world.runBoost : 1);

  if (moveLeft) player.vx -= accel;
  if (moveRight) player.vx += accel;

  player.vx *= world.friction;
  player.vx = clamp(player.vx, -7.5, 7.5);

  if (jump && player.onGround) {
    player.vy = -world.jump;
    player.onGround = false;
  }

  player.vy += world.gravity;

  player.x += player.vx;
  player.y += player.vy;

  player.x = clamp(player.x, 0, canvas.width - player.w);

  player.onGround = false;

  if (player.y + player.h >= world.floorY) {
    player.y = world.floorY - player.h;
    player.vy = 0;
    player.onGround = true;
  }

  for (const p of world.platforms) {
    if (intersects(player, p) && player.vy >= 0) {
      const playerBottom = player.y + player.h;
      const previousBottom = playerBottom - player.vy;
      if (previousBottom <= p.y + 4) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.onGround = true;
      }
    }
  }

  hud.textContent = `x: ${player.x.toFixed(0)} | y: ${player.y.toFixed(0)} | tốc độ: ${Math.abs(player.vx).toFixed(1)}`;
}

function loop() {
  update();
  drawBackground();
  drawPlatforms();
  drawPlayer();
  requestAnimationFrame(loop);
}

loop();
