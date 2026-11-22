// input.js — keyboard and mouse, kept in one place so the game logic
// never touches the DOM directly. Movement keys, tool keys, and the
// click-to-throw-a-coin mouse aim all live here.

export function createInput(canvas) {
  const input = {
    up: false,
    down: false,
    left: false,
    right: false,
    mouseX: 640,
    mouseY: 360,
    mouseIn: false,
    // Edge-triggered actions, consumed once by the game loop:
    throwAt: null,     // {x, y} in canvas space, or null
    smokePressed: false,
    empPressed: false,
    enterPressed: false,
    retryPressed: false,
    helpPressed: false,
    mutePressed: false,
  };

  const KEYMAP = {
    KeyW: 'up', ArrowUp: 'up',
    KeyS: 'down', ArrowDown: 'down',
    KeyA: 'left', ArrowLeft: 'left',
    KeyD: 'right', ArrowRight: 'right',
  };

  function onKeyDown(e) {
    const dir = KEYMAP[e.code];
    if (dir) {
      input[dir] = true;
      e.preventDefault();
      return;
    }
    if (e.code === 'Space') { input.smokePressed = true; e.preventDefault(); }
    if (e.code === 'KeyQ') input.smokePressed = true;
    if (e.code === 'KeyE') input.empPressed = true;
    if (e.code === 'Enter') input.enterPressed = true;
    if (e.code === 'KeyR') input.retryPressed = true;
    if (e.code === 'KeyH') input.helpPressed = true;
    if (e.code === 'KeyM') input.mutePressed = true;
  }

  function onKeyUp(e) {
    const dir = KEYMAP[e.code];
    if (dir) input[dir] = false;
  }

  function canvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function onMouseMove(e) {
    const p = canvasPos(e);
    input.mouseX = p.x;
    input.mouseY = p.y;
    input.mouseIn = true;
  }

  function onMouseDown(e) {
    const p = canvasPos(e);
    input.mouseX = p.x;
    input.mouseY = p.y;
    input.throwAt = { x: p.x, y: p.y };
  }

  function onBlur() {
    input.up = false;
    input.down = false;
    input.left = false;
    input.right = false;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('blur', onBlur);

  // Clear the one-shot flags after the game loop has read them.
  input.consumeEdges = function consumeEdges() {
    input.throwAt = null;
    input.smokePressed = false;
    input.empPressed = false;
    input.enterPressed = false;
    input.retryPressed = false;
    input.helpPressed = false;
    input.mutePressed = false;
  };

  return input;
}
