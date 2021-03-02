const closeBtn = document.querySelector('.close')
const showBtn = document.querySelector('.show-rules')
const rules = document.getElementById('rules');
const resetBtn = document.querySelector('#reset');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


let score = 0;
let highScore;
let lives = 3
let level = 1;
const brickRowCount = 6
const brickColumnCount = 14



if(localStorage.getItem('Highscore') === null )
    highScore = 0
else
    highScore = JSON.parse(localStorage.getItem('Highscore'));

// Ball properties

const ball = {
    x: 200,
    y: canvas.height - 180,
    size: 10,
    speed: 4,
    dx: 4,
    dy: -4
}

// Paddle properties

const paddle = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 20,
    width: 80,
    height: 10,
    speed: 8,
    dx: 0
}

// Brick Properties

const brickInfo = {
    offsetX: 45,
    offsetY: 60,
    width: 56,
    height: 15,
    padding: 10,
    visible: true
}

// Create arrays with objects
const bricks = [];
for(let i = 0; i < brickColumnCount; i++) {
    bricks[i] = [];
    for(let j = 0; j < brickRowCount; j++) {
        const x = i * (brickInfo.width + brickInfo.padding) + brickInfo.offsetX;
        const y = j * (brickInfo.height + brickInfo.padding) + brickInfo.offsetY;
        bricks[i][j] = { x, y, ...brickInfo}
    }
}

// Draw ball 

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2)
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.closePath()
}

// Draw paddle

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.closePath();
}

// Draw score

function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width - 120, 30)
}

// Draw High Score

function drawHighScore() {
    ctx.font = '20px Arial'
    ctx.fillText(`High Score: ${highScore}`, 50, 30)
}

// Draw Lives
function drawLives() {
    ctx.font = "20px Arial";
    ctx.fillText(`Lives: ${lives}`, 250, 30)
}

function drawLevel() {
    ctx.font = '20px Arial';
    ctx.fillText(`Level: ${level}`, 740, 30)
}

// Draw bricks using the bricks array
function drawBricks() {
    bricks.forEach(column => {
        column.forEach(brick => {
            ctx.beginPath();
            ctx.rect(brick.x, brick.y, brick.width, brick.height);
            ctx.fillStyle = brick.visible ? 'green' : 'transparent';
            ctx.fill();
            ctx.closePath();
        })
    })
}

// Move padle on canvas

function movePaddle() {

    paddle.x += paddle.dx

    if(paddle.x < 0)
        paddle.x = 0
    if(paddle.x + paddle.width > canvas.width)
        paddle.x = canvas.width - paddle.width
}

// Move ball on canvas

function moveBall() {

    ball.x += ball.dx
    ball.y += ball.dy

    // Ball collisions

        // Walls colision

    if(
        // left wall
        ball.x - ball.size < 0 || 
        // right wall
        ball.x + ball.size > canvas.width
    ) 
        ball.dx *= -1

    if(
        // top wall
        ball.y - ball.size < 0 ||
        // bottom wall
        ball.y + ball.size > canvas.height
    )
        ball.dy *= -1;

        // Paddle colision
    
    if(
        ball.x + ball.size > paddle.x &&
        ball.x - ball.size < paddle.x + paddle.width &&
        ball.y + ball.size > paddle.y 

    )
        ball.dy = -ball.speed;

        // Bricks colision

    bricks.forEach(column => {
        column.forEach(brick => {
            if(brick.visible) {
                if(
                    // Left side
                    ball.x + ball.size > brick.x &&
                    // Right side
                    ball.x - ball.size < brick.x + brick.width&&
                    // Top side
                    ball.y + ball.size > brick.y &&
                    // Bottom side
                    ball.y - ball.size < brick.y + brick.height
                ) {
                    ball.dy *= -1

                    brick.visible = false;

                    score++

                    if(highScore < score) {
                        highScore = score;
                        localStorage.setItem('Highscore', JSON.stringify(highScore))
                    }
                    
                    // Show all bricks and put the paddle higher to increase level
                    if (score % (brickColumnCount * brickRowCount) === 0) {
                        resetAllBricks();
                        ball.speed += 3;
                        level++
                        ball.x = 200
                        ball.y = canvas.height - 180
                        ball.dx = 4;
                        ball.dy = -4;
                        paddle.x = canvas.width / 2 - 40

                    }
                        
                }       
            }

        })
    })

    // Hit bottom - loose
    if(ball.y + ball.size > canvas.height) {

        if(lives > 0)
            lives --;

        if(lives === 0) {
            hideAllBricks();
            lives = 'GAME OVER - RESET THE GAME'
        }
        // if(lives <0 && ball.y + ball.size > canvas.height)
        //     lives

    }
        



}

function resetAllBricks() {

    bricks.forEach(column => {
    column.forEach(brick => {
        brick.visible = true;
        })
    })
}

function hideAllBricks() {
    bricks.forEach(column => {
        column.forEach(brick => {
            brick.visible = false;
        })
    })
}


function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    drawBall();
    drawPaddle();
    drawScore();
    drawHighScore();
    drawLives();
    drawLevel();
    drawBricks();

}

function drawEverything() {

    movePaddle();
    moveBall();

    draw();

    requestAnimationFrame(drawEverything)

}

drawEverything();


document.addEventListener('keydown', keyDown)
document.addEventListener('keyup', keyUp)
resetBtn.addEventListener('click', resetGame)


function keyDown(e) {
    if(e.key === 'Right' || e.key === "ArrowRight")
        paddle.dx = paddle.speed;
    if(e.key === 'Left' || e.key === "ArrowLeft")
        paddle.dx = -paddle.speed;
};

function keyUp(e) {
    if(
        e.key === 'Left' ||
        e.key === 'ArrowLeft' ||
        e.key === 'Right' ||
        e.key === 'ArrowRight'
    )

    paddle.dx = 0;
}

function resetGame() {
    resetAllBricks();
    score = 0;
    lives = 3;
    ball.x = 200;
    ball.y = canvas.height - 180;
    ball.dy = -4
    ball.dx = 4
    paddle.x = canvas.width / 2 - 40
    paddle.y = canvas.height - 20
    level = 1;
    ball.speed = 4;
}


closeBtn.addEventListener('click', () => rules.classList.remove('show'))

showBtn.addEventListener('click', () => rules.classList.add('show'))