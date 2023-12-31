var gameStarted = false;

console.log("1", gameStarted);

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, 70 + i));
}

const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 70) {
  battleZonesMap.push(battleZonesData.slice(i, 70 + i));
}

const charactersMap = [];
for (let i = 0; i < charactersMapData.length; i += 70) {
  charactersMap.push(charactersMapData.slice(i, 70 + i));
}
console.log(charactersMap);

const boundaries = [];
const offset = {
  x: -1075,
  y: -500,
};

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        })
      );
  });
});

const battleZones = [];

battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      battleZones.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        })
      );
  });
});

const characters = [];
const villagerImg = new Image();
villagerImg.src = "./img/villager/Idle.png";

const oldManImg = new Image();
oldManImg.src = "./img/oldMan/Idle.png";

const priestImg = new Image();
priestImg.src = "./img/priest/Idle.png";

charactersMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    // 1026 === villager
    if (symbol === 1026) {
      characters.push(
        new Character({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
          image: villagerImg,
          frames: {
            max: 4,
            hold: 60,
          },
          scale: 3,
          animate: true,
          dialogue: ["...", "Hail Macbeth.", "Your castle awaits."],
        })
      );
    }
    // 1031 === oldMan
    else if (symbol === 1031) {
      characters.push(
        new Character({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
          image: oldManImg,
          frames: {
            max: 4,
            hold: 60,
          },
          scale: 3,
          dialogue: [
            "Hail Macbeth.",
            "The townsfolk are ecstatic for your return.",
          ],
        })
      );
    }
    // 1011 === priestEntity
    else if (symbol === 1011) {
      characters.push(
        new Character({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
          image: priestImg,
          frames: {
            max: 4,
            hold: 60,
          },
          scale: 3,
          dialogue: [
            "Hail Macbeth, Castle this way.",
            "THANKS FOR PLAYING.",
            "This is all thats in the current version. I was a tad bit ambitious with the whole, yk, making a game thing.",
            "Up here Macbeth would travel to his castle, where lady Macbeth would tell him to go to the forest in search of power, as it came to her in a dream.",
            "He would agree and begin to travel to the forest, meeting 3 witches on his way. You know what they say already.",
            "He would continute on, and you would need to fight against monsters on your way there. A short demo of the fight is included in the game, leftmost part of the map. Darker grass.",
            "Please note the sprites used there are placeholders only.",
            "Macbeth would eventually find the treasure, and returns to his castle with it, where he discoveres it belongs to the king.",
            "Not wanting to rid of his treasure, he attempts to kill the king.",
            "You know the rest.",
          ],
        })
      );
    }

    if (symbol !== 0) {
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        })
      );
    }
  });
});

const image = new Image();
image.src = "./img/map1.png";

const foregroundImage = new Image();
foregroundImage.src = "./img/foregroundObjects.png";

const playerDownImage = new Image();
playerDownImage.src = "./img/playerDown.png";

const playerUpImage = new Image();
playerUpImage.src = "./img/playerUp.png";

const playerLeftImage = new Image();
playerLeftImage.src = "./img/playerLeft.png";

const playerRightImage = new Image();
playerRightImage.src = "./img/playerRight.png";

const player = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 4 / 2,
    y: canvas.height / 2 - 68 / 2,
  },
  image: playerDownImage,
  frames: {
    max: 4,
    hold: 10,
  },
  sprites: {
    up: playerUpImage,
    left: playerLeftImage,
    right: playerRightImage,
    down: playerDownImage,
  },
});

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: image,
});

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: foregroundImage,
});

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

const movables = [
  background,
  ...boundaries,
  foreground,
  ...battleZones,
  ...characters,
];
const renderables = [
  background,
  ...boundaries,
  ...battleZones,
  ...characters,
  player,
  foreground,
];

const battle = {
  initiated: false,
};

let msPrev = window.performance.now();
const fps = 60;
const msPerFrame = 1000 / fps;
let frames = 0;

// Define the texts that will be displayed in the text box
const texts = [
  "All hail, Macbeth, that shalt be king hereafter..",
  "Blasphemy. Thou'st lies from thee toungue.",
  "So why do I choose to follow the lies you spread?",
  "I guess lady fate shall choose the outcome of my greed.",
  "WASD to move. Space to interact.",
];

let currentTextIndex = 0; // Index of the current text being displayed
let clickCount = 0; // Track the number of clicks

const popupBox = document.querySelector("#startPopupText");

// Function to update the text in the text box
function updateTextBox() {
  popupBox.textContent = texts[currentTextIndex];
}

canvas.addEventListener("click", () => {
  console.log("2", gameStarted);

  // Increment the click count
  clickCount++;

  // Check if the click count exceeds the number of texts
  if (clickCount >= texts.length) {
    popupBox.style.display = "none"; // Hide the text box after the last click
    gameStarted = true;
    return; // Exit the event listener to prevent further updates
  } else {
    // Update the text box with the current text
    updateTextBox();
    currentTextIndex++;
  }
});

console.log("3", gameStarted);

function animate() {
  const animationId = window.requestAnimationFrame(animate);
  const msNow = window.performance.now();
  const msPassed = msNow - msPrev;

  if (msPassed < msPerFrame) return;

  const excessTime = msPassed % msPerFrame;
  msPrev = msNow - excessTime;

  frames++;
  if (gameStarted === false) {
    // Render the pop-up text box
    const popupBox = document.querySelector("#startPopupText");
    popupBox.style.display = "block";
    updateTextBox(); // Set initial text
  }

  if (gameStarted === true) {
    // Check if the camera has reached the end of the canvas
    const reachedEndX =
      player.position.x < offset.x ||
      player.position.x > offset.x + canvas.width;
    const reachedEndY =
      player.position.y < offset.y ||
      player.position.y > offset.y + canvas.height;

    // Render the game elements
    if (reachedEndX || reachedEndY) {
      // Render black background
      c.fillStyle = "black";
      c.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      // Render the image background
      background.draw();
    }

    // Render the rest of the elements
    renderables.forEach((renderable) => {
      renderable.draw();
    });

    let moving = true;
    player.animate = false;

    if (battle.initiated) return;

    // activate a battle
    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
      for (let i = 0; i < battleZones.length; i++) {
        const battleZone = battleZones[i];
        const overlappingArea =
          (Math.min(
            player.position.x + player.width,
            battleZone.position.x + battleZone.width
          ) -
            Math.max(player.position.x, battleZone.position.x)) *
          (Math.min(
            player.position.y + player.height,
            battleZone.position.y + battleZone.height
          ) -
            Math.max(player.position.y, battleZone.position.y));
        if (
          rectangularCollision({
            rectangle1: player,
            rectangle2: battleZone,
          }) &&
          overlappingArea > (player.width * player.height) / 2 &&
          Math.random() < 0.01
        ) {
          // deactivate current animation loop
          window.cancelAnimationFrame(animationId);

          audio.Map.stop();
          audio.initBattle.play();
          audio.battle.play();

          battle.initiated = true;
          gsap.to("#overlappingDiv", {
            opacity: 1,
            repeat: 3,
            yoyo: true,
            duration: 0.4,
            onComplete() {
              gsap.to("#overlappingDiv", {
                opacity: 1,
                duration: 0.4,
                onComplete() {
                  // activate a new animation loop
                  initBattle();
                  animateBattle();
                  gsap.to("#overlappingDiv", {
                    opacity: 0,
                    duration: 0.4,
                  });
                },
              });
            },
          });
          break;
        }
      }
    }

    if (keys.w.pressed && lastKey === "w") {
      player.animate = true;
      player.image = player.sprites.up;

      checkForCharacterCollision({
        characters,
        player,
        characterOffset: { x: 0, y: 5 },
      });

      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
          rectangularCollision({
            rectangle1: player,
            rectangle2: {
              ...boundary,
              position: {
                x: boundary.position.x,
                y: boundary.position.y + 5,
              },
            },
          })
        ) {
          moving = false;
          break;
        }
      }

      if (moving)
        movables.forEach((movable) => {
          movable.position.y += 5;
        });
    } else if (keys.a.pressed && lastKey === "a") {
      player.animate = true;
      player.image = player.sprites.left;

      checkForCharacterCollision({
        characters,
        player,
        characterOffset: { x: 5, y: 0 },
      });

      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
          rectangularCollision({
            rectangle1: player,
            rectangle2: {
              ...boundary,
              position: {
                x: boundary.position.x + 5,
                y: boundary.position.y,
              },
            },
          })
        ) {
          moving = false;
          break;
        }
      }

      if (moving)
        movables.forEach((movable) => {
          movable.position.x += 5;
        });
    } else if (keys.s.pressed && lastKey === "s") {
      player.animate = true;
      player.image = player.sprites.down;

      checkForCharacterCollision({
        characters,
        player,
        characterOffset: { x: 0, y: -5 },
      });

      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
          rectangularCollision({
            rectangle1: player,
            rectangle2: {
              ...boundary,
              position: {
                x: boundary.position.x,
                y: boundary.position.y - 5,
              },
            },
          })
        ) {
          moving = false;
          break;
        }
      }

      if (moving)
        movables.forEach((movable) => {
          movable.position.y -= 5;
        });
    } else if (keys.d.pressed && lastKey === "d") {
      player.animate = true;
      player.image = player.sprites.right;

      checkForCharacterCollision({
        characters,
        player,
        characterOffset: { x: -5, y: 0 },
      });

      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
          rectangularCollision({
            rectangle1: player,
            rectangle2: {
              ...boundary,
              position: {
                x: boundary.position.x - 5,
                y: boundary.position.y,
              },
            },
          })
        ) {
          moving = false;
          break;
        }
      }

      if (moving)
        movables.forEach((movable) => {
          movable.position.x -= 5;
        });
    }
  }
}

console.log(gameStarted);

setInterval(() => {}, 1000);
// animate()

let lastKey = "";
window.addEventListener("keydown", (e) => {
  if (player.isInteracting) {
    switch (e.key) {
      case " ":
        player.interactionAsset.dialogueIndex++;

        const { dialogueIndex, dialogue } = player.interactionAsset;
        if (dialogueIndex <= dialogue.length - 1) {
          document.querySelector("#characterDialogueBox").innerHTML =
            player.interactionAsset.dialogue[dialogueIndex];
          return;
        }

        // finish conversation
        player.isInteracting = false;
        player.interactionAsset.dialogueIndex = 0;
        document.querySelector("#characterDialogueBox").style.display = "none";

        break;
    }
    return;
  }

  switch (e.key) {
    case " ":
      if (!player.interactionAsset) return;

      // beginning the conversation
      const firstMessage = player.interactionAsset.dialogue[0];
      document.querySelector("#characterDialogueBox").innerHTML = firstMessage;
      document.querySelector("#characterDialogueBox").style.display = "flex";
      player.isInteracting = true;
      break;
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      break;
    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      break;

    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      break;

    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
  }
});

let clicked = 0;
addEventListener("click", () => {
  clicked++;
  if (clicked === 4) {
    audio.Map.play();
  }
});
