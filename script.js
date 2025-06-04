// Get canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 600;

// Get the restart button and developer credit element
const restartButton = document.getElementById("restartButton");
const developerCredit = document.getElementById("developerCredit");
restartButton.addEventListener("click", restartGame);

// Game state variables
let gameOver = false;
let score = 0;
let animationFrame;

// Load the car image (update the path as needed)
const carImage = new Image();
carImage.src = "car.png";

// Player car object
const car = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 80,
  width: 40,
  height: 60,
  speed: 5
};

// Key states for desktop control
const keys = { ArrowLeft: false, ArrowRight: false };
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    keys[e.key] = true;
  }
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    keys[e.key] = false;
  }
});

// Touch support for mobile control
let touchX = null;
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
});
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  touchX = touch.clientX - canvas.getBoundingClientRect().left;
});
canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  touchX = null;
});

// Road lines for scrolling effect (simulate lanes or road markers)
const roadLines = [];
for (let i = 0; i < 10; i++) {
  roadLines.push({
    x: canvas.width / 2 - 5,
    y: i * 70,
    width: 10,
    height: 40,
    speed: 5
  });
}

// Obstacles array
const obstacles = [];

// Create obstacles that appear from the top randomly
function createObstacle() {
  const obsWidth = 40 + Math.random() * 30;
  const obsX = Math.random() * (canvas.width - obsWidth);
  obstacles.push({
    x: obsX,
    y: -60,
    width: obsWidth,
    height: 60,
    speed: 3 + Math.random() * 2
  });
}

// Collision detection helper
function isColliding(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

// Update game state each frame
function update() {
  // --- Player movement ---
  // Desktop controls: use arrow keys
  if (keys.ArrowLeft && car.x > 0) {
    car.x -= car.speed;
  }
  if (keys.ArrowRight && car.x + car.width < canvas.width) {
    car.x += car.speed;
  }
  // Mobile controls: use touch coordinate relative to canvas
  if (touchX !== null) {
    let canvasMiddle = canvas.width / 2;
    if (touchX < canvasMiddle && car.x > 0) {
      car.x -= car.speed;
    } else if (touchX > canvasMiddle && car.x + car.width < canvas.width) {
      car.x += car.speed;
    }
  }
  
  // --- Scrolling road ---
  roadLines.forEach(line => {
    line.y += line.speed;
    if (line.y > canvas.height) {
      line.y = -line.height;
    }
  });
  
  // --- Obstacles ---
  // Add new obstacles with a small chance each frame
  if (Math.random() < 0.02) {
    createObstacle();
  }
  
  // Update obstacles positions; check for collision and update score
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].y += obstacles[i].speed;
    if (isColliding(car, obstacles[i])) {
      gameOver = true;
    }
    // Remove obstacles that have moved off-screen and increase score
    if (obstacles[i].y > canvas.height) {
      obstacles.splice(i, 1);
      score++;
    }
  }
}

// Draw the game on the canvas
function draw() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw road lines
  ctx.fillStyle = "white";
  roadLines.forEach(line => {
    ctx.fillRect(line.x, line.y, line.width, line.height);
  });
  
  // Draw player's car. If the image has loaded, use it; otherwise, use a placeholder.
  if (carImage.complete && carImage.naturalWidth !== 0) {
    ctx.drawImage(carImage, car.x, car.y, car.width, car.height);
  } else {
    ctx.fillStyle = "red";
    ctx.fillRect(car.x, car.y, car.width, car.height);
  }
  
  // Draw obstacles
  ctx.fillStyle = "blue";
  obstacles.forEach(obs => {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  });
  
  // Draw score text
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 25);
  
  // When game is over, draw overlay and display the restart button.
  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 75, canvas.height / 2);
    
    // Show the restart button if not already visible
    restartButton.style.display = "block";
    // Slide the developer credit in from off-screen (set bottom to 10px)
    developerCredit.style.bottom = "10px";
  }
}

// The main game loop
function gameLoop() {
  if (!gameOver) {
    update();
  }
  draw();
  if (!gameOver) {
    animationFrame = requestAnimationFrame(gameLoop);
  }
}

// Restart the game by resetting variables and starting the loop again
function restartGame() {
  gameOver = false;
  score = 0;
  car.x = canvas.width / 2 - car.width / 2;
  obstacles.length = 0; // Clear obstacles
  restartButton.style.display = "none";
  // Reset developer credit position off-screen
  developerCredit.style.bottom = "-50px";
  gameLoop();
}

// Begin the game
gameLoop();
