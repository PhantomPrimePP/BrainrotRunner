// Get the canvas and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 400;

const catImage = new Image();
catImage.src = 'assets/Images/SpinCatIdle.png'; // Path to the cat image

const dogImage = new Image();
dogImage.src = 'assets/Images/CheemsEnemy.png'; // Path to the dog image

const dogGameOverImage = new Image();
dogGameOverImage.src = 'assets/Images/GameOverDog.png';  // A different image for game over state

const Bonk = new Audio('assets/SoundEffects/bonk.mp3')


const spinFrames = [];
for (let i = 1; i <= 16; i++) {
  const img = new Image();
   img.src = `assets/Images/SpinCatFrame${i}.png`; // Ensure your frame images are named SpinCatFrame1.png, SpinCatFrame2.png, etc.
  spinFrames.push(img);
}

const backgroundImage = new Image();
backgroundImage.src = 'assets/Images/Background.jpg'; // Your background image

const restartButton = document.getElementById('restartButton');
restartButton.addEventListener('click', restartGame);

const jumpSound = new Audio('assets/SoundEffects/JumpSoundEffect.mp3');
// Game variables
let gameRunning = true;
let player, obstacles = [];
let score = 0;
let gameOver = false;
let backgroundX = 0; // X position of the background
let highscore = localStorage.getItem('highscore') ? parseInt(localStorage.getItem('highscore')) : 0;

// Game loop
function gameLoop() {
  if (!gameRunning) return;
  
  update(); // Update game logic
  draw();   // Render the game

  requestAnimationFrame(gameLoop); // Call gameLoop again
}

// Start the game
initializeGame();
gameLoop();

function initializeGame() {
  player = {
    x: 50,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    dy: 0,
    jumpPower: 8,
    gravity: 0.2,
    isSpinning: false, // Track whether the cat is spinning
    spinFrame: 0        // Track the current frame of the spinning animation
     // Hide the restart button initially
  };
  obstacles = [];
  score = 0;
  gameRunning = true;
  gameOver = false;
  restartButton.style.display = 'none'; // Hide the restart button initially
  
}

function update() {
  // Update player's position
  if (player.y < canvas.height - 100 || player.dy < 0) {
    // Allow movement upwards (jump) and downwards (fall)
    player.dy += player.gravity; // Apply gravity
    player.y += player.dy;       // Update position
  } else {
    // Player is on the ground
    player.y = canvas.height - 100; // Snap to the ground
    player.dy = 0;    
    player.isSpinning = false;                         // Reset vertical speed
  }

  console.log(`Player Y: ${player.y}, Player DY: ${player.dy}`); // Debugging info

  updateObstacles();
  detectCollisions();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  // Scroll the background
  ctx.drawImage(backgroundImage, backgroundX, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, backgroundX + canvas.width, 0, canvas.width, canvas.height); // Draw the second image to create a looping effect

  backgroundX -= 2; // Speed of scrolling (adjust as needed)
  if (backgroundX <= -canvas.width) {
    backgroundX = 0; // Reset to start when the background moves off-screen
  }
  // Draw player (cat)
  if (player.isSpinning) {
    const frame = spinFrames[Math.floor(player.spinFrame)];
    if (frame) {
      ctx.drawImage(frame, player.x, player.y, player.width, player.height);
    }
    // Update spin frame
    player.spinFrame += 0.5; // Adjust speed of animation
    if (player.spinFrame >= spinFrames.length) {
      player.spinFrame = 0; // Loop the spinning animation if needed
    }
  } else {
    ctx.drawImage(catImage, player.x, player.y, player.width, player.height); // Idle image
  }

  drawObstacles(); // Draw all obstacles
  drawScore();     // Draw the score

  if (gameOver) {
    // Display score and highscore
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2 - 60, canvas.height / 2);
    ctx.fillText(`Highscore: ${highscore}`, canvas.width / 2 - 90, canvas.height / 2 + 40);
  
    // Check if the score is a new highscore
    if (score > highscore) {
      ctx.fillStyle = 'red';
      ctx.font = '40px Arial';
      ctx.fillText('New Highscore!', canvas.width / 2 - 120, canvas.height / 2 + 80);
    }
  }
}


// Listen for key presses
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && player.y === canvas.height - 100) {
    player.dy = -player.jumpPower; // Jump
    player.isSpinning = true;     // Start spinning
    player.spinFrame = 0;         // Reset spin frame to the first one
    
    jumpSound.play();             // Play jump sound
  }
});



  
  
  function spawnObstacle() {
    const width = 20 + Math.random() * 30; // Random width
    obstacles.push({ x: canvas.width, y: canvas.height - 100, width: width, height: 40, speed: 5 });
  }
  
  function updateObstacles() {
    obstacles.forEach(obstacle => obstacle.x -= obstacle.speed);
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0); // Remove off-screen obstacles
  }
  
  function drawObstacles() {
    obstacles.forEach(obstacle => {
      // If the game is over, use the new "game over" image for obstacles
      if (gameOver) {
        ctx.drawImage(obstacle.image || dogGameOverImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      } else {
        ctx.drawImage(dogImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      }
    });
  }
  
  
  // Spawn obstacles every 2 seconds
  setInterval(spawnObstacle, 2000);
  
  function detectCollisions() {
    obstacles.forEach(obstacle => {
      if (
        player.x < obstacle.x + obstacle.width &&
        player.x + player.width > obstacle.x &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.height > obstacle.y
      ) {
        if (!gameOver) {
          // Immediately change the obstacle image to game over version
          obstacle.image = dogGameOverImage;
          Bonk.play(); 
          
          // Set game over flag
          gameOver = true;
          
          // Stop the game loop
          gameRunning = false;
          restartButton.style.display = 'block'; // Show restart button
          updateHighscore(); // Update highscore when game is over
          
          // Show the game over message
          setTimeout(() => {
          
          }, 100); // Delay alert to ensure the obstacle image change is seen before the alert
        }
      }
    });
  }
  
  



function updateScore() {
  score++;
}

function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);
}

// Update the score every second
setInterval(updateScore, 1000);

function restartGame() {
  // Reset all variables and game state
  initializeGame();
  gameLoop(); // Restart the game loop
  restartButton.style.display = 'none'; // Hide restart button after clicking
}

// Update highscore if current score beats the previous highscore
function updateHighscore() {
  if (score > highscore) {
    highscore = score; // Update the highscore in memory
    localStorage.setItem('highscore', score); // Save the new highscore in localStorage
  }
}
