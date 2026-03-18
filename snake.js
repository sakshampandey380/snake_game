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
    snake = [{x: 200, y: 200, px: 200, py: 200}];
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

/* START */
function startGame() {
    document.getElementById("startScreen").style.display = "none";

    init();
    speed = 180;  // 🔥 reset speed
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
let startX = 0, startY = 0;

canvas.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

canvas.addEventListener("touchend", e => {
    let endX = e.changedTouches[0].clientX;
    let endY = e.changedTouches[0].clientY;

    let dxTouch = endX - startX;
    let dyTouch = endY - startY;

    /* 🔥 VERY FAST RESPONSE (LOW THRESHOLD) */
    if (Math.abs(dxTouch) > Math.abs(dyTouch)) {
        if (dxTouch > 10) setDir("right");
        else if (dxTouch < -10) setDir("left");
    } else {
        if (dyTouch > 10) setDir("down");
        else if (dyTouch < -10) setDir("up");
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

    // Interpolation for smooth motion
    part.px += (part.x - part.px) * 0.4;
    part.py += (part.y - part.py) * 0.4;

        let gradient = ctx.createLinearGradient(part.px, part.py, part.px + box, part.py + box);
        gradient.addColorStop(0, "#00ffcc");
        gradient.addColorStop(1, "#007766");
        
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00ffcc";

    ctx.beginPath();
    ctx.roundRect(part.px, part.py, box, box, 6);
    ctx.fill();
});;

    // Food
    ctx.fillStyle = "#ff4444";
    ctx.shadowBlur = 25;
    ctx.shadowColor = "#ff4444";
    ctx.beginPath();
    ctx.arc(food.x + 10, food.y + 10, 10, 0, Math.PI * 2);
    ctx.fill();

    let head = {
    x: snake[0].x + dx,
    y: snake[0].y + dy,
    px: snake[0].x,
    py: snake[0].y
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
        if (speed > 120) {  // stop getting too fast
    speed -= 3;     // slower increase
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
