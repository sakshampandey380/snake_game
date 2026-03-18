const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;

const box = 20;

let snake, food, dx, dy, score;
let gameLoop;

/* 🔥 NEW: Dynamic Speed */
let speed = 150;

let highScore = localStorage.getItem("highScore") || 0;
document.getElementById("highScore").innerText = highScore;

/* SOUND */
const eatSound = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
const gameOverSound = new Audio("https://actions.google.com/sounds/v1/cartoon/concussive_hit_guitar_boing.ogg");

/* INIT */
function init() {
    snake = [{x: 200, y: 200}];
    dx = box;
    dy = 0;
    score = 0;
    food = randomFood();
    document.getElementById("score").innerText = 0;
}

function randomFood() {
    return {
        x: Math.floor(Math.random() * 20) * box,
        y: Math.floor(Math.random() * 20) * box
    };
}

/* 🔥 NEW: Start Loop Function */
function startLoop() {
    clearInterval(gameLoop);
    gameLoop = setInterval(draw, speed);
}

/* START */
function startGame() {
    document.getElementById("startScreen").style.display = "none";

    init();
    speed = 150;  // 🔥 reset speed
    startLoop();

    document.documentElement.requestFullscreen().catch(()=>{});
}

/* KEYBOARD */
document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -box; }
    if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = box; }
    if (e.key === "ArrowLeft" && dx === 0) { dx = -box; dy = 0; }
    if (e.key === "ArrowRight" && dx === 0) { dx = box; dy = 0; }
});

/* MOBILE BUTTON */
function setDir(dir) {
    if (dir === "up" && dy === 0) { dx = 0; dy = -box; }
    if (dir === "down" && dy === 0) { dx = 0; dy = box; }
    if (dir === "left" && dx === 0) { dx = -box; dy = 0; }
    if (dir === "right" && dx === 0) { dx = box; dy = 0; }
}

/* SWIPE */
let startX, startY;

canvas.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

canvas.addEventListener("touchmove", e => {
    let dxTouch = e.touches[0].clientX - startX;
    let dyTouch = e.touches[0].clientY - startY;

    if (Math.abs(dxTouch) > Math.abs(dyTouch)) {
        if (dxTouch > 0) setDir("right");
        else setDir("left");
    } else {
        if (dyTouch > 0) setDir("down");
        else setDir("up");
    }
});

/* VIBRATION */
function vibrate() {
    if (navigator.vibrate) navigator.vibrate(50);
}

/* DRAW */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Snake
    snake.forEach((part, i) => {
        ctx.fillStyle = i === 0 ? "#00ffcc" : "#00cc99";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00ffcc";
        ctx.fillRect(part.x, part.y, box, box);
    });

    // Food
    ctx.fillStyle = "#ff4444";
    ctx.shadowBlur = 25;
    ctx.shadowColor = "#ff4444";
    ctx.beginPath();
    ctx.arc(food.x + 10, food.y + 10, 10, 0, Math.PI * 2);
    ctx.fill();

    let head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };

    // Collision
    if (
        head.x < 0 || head.y < 0 ||
        head.x >= canvas.width || head.y >= canvas.height ||
        snake.some(s => s.x === head.x && s.y === head.y)
    ) {
        gameOver();
        return;
    }

    // Eat
    if (head.x === food.x && head.y === food.y) {
        score++;
        eatSound.play();
        vibrate();

        document.getElementById("score").innerText = score;

        /* 🔥 NEW: Speed Increase */
        if (speed > 70) {
            speed -= 5;
            startLoop();
        }

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
            document.getElementById("highScore").innerText = highScore;
        }

        if (score === 20) {
            showPopup("🎉 YOU ARE AMAZING!");
            return;
        }

        food = randomFood();
    } else {
        snake.pop();
    }

    snake.unshift(head);
}

/* GAME OVER */
function gameOver() {
    gameOverSound.play();
    vibrate();
    showPopup(`💀 Game Over<br>Score: ${score}`);
}

/* POPUP */
function showPopup(text) {
    document.getElementById("popupText").innerHTML = text;
    document.getElementById("popup").classList.add("show");
    clearInterval(gameLoop);
}

/* RESTART */
function restartGame() {
    document.getElementById("popup").classList.remove("show");
    init();
    speed = 150;  // 🔥 reset speed
    startLoop();
}