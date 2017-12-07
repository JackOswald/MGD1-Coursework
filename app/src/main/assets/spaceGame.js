var canvas;
var canvasContext;
var canvasX;
var canvasY;
var isMouseDown = 0;

var backgroundImg;
var playerImg;
var enemies = [];
var enemyArray;

var bullets = [];
var bulletArray;

var mainMusic;
var mainMusicPlaying = false;

var lastPt = null;
var gameStates = {MainMenu: 0, MainGame: 1, GameOver: 2};
var currentGameState;
var gameOverScreen = false;

var timer = 0;
var score = 0;
var lives = 3;

var startTimeMS;

var lastSpawn;
var spawnTime;

var moveRight = false;
var moveLeft = false;
var moveUp = false;
var moveDown = false;

var playerShooting = false;

var playButton;
var replayButton;

function load() {
    // Canvas loading
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');

    //Set the current game state to the main menu
    currentGameState = gameStates.MainMenu;

    // Run init function
    init();

    // Set the dimensions of the canvas
    canvasX = canvas.width/2;
    canvasY = canvas.height-30;

    // Run the game loop
    gameLoop();

}

// Creating a new object called 'aSprite' along with its constructor functions
function aSprite (x, y, imageSRC, velx, vely) {

    this.zindex = 0;
    this.x = x;
    this.y = y;
    this.vx = velx;
    this.vy = vely;
    this.sImage = new Image();
    this.sImage.src = imageSRC;
}

// Render the object based on width and height
aSprite.prototype.renderF = function(width, height) {

    canvasContext.drawImage(this.sImage,this.x, this.y, width, height);
}

// Render the object in the scene
aSprite.prototype.render = function() {

    canvasContext.drawImage(this.sImage,this.x, this.y);
}

// Update the objects position
aSprite.prototype.update = function(deltaTime) {

    this.x += deltaTime * this.vx;
    //this.x += deltaTime * 1;
    this.y += deltaTime * this.vy;
}

// Move the player horizontally by the value of x
aSprite.prototype.movePlayerHorizontal = function (x){

    this.x -= x;
    if (this.x <= 0) { // Ensure that the player is kept within the screen
    this.x = 0;
    }
    else if (this.x >= canvas.width - playerImg.width) {
        this.x = canvas.width - playerImg.width;
    }

}

// Move the player vertically by the value of y
aSprite.prototype.movePlayerVertical = function (y){

    this.y -= y;
    if (this.y <= 0) { // Ensure that the player is kept within the screen
    this.y = 0;
    }
    if (this.y >= canvas.height - playerImg.height) {
        this.y = canvas.height - playerImg.height;
    }
}

// Move the current object horizontally by the value of x
aSprite.prototype.moveHorizontal = function (x){

    this.x -= x;
}

// Move the current object vertically by the value of y
aSprite.prototype.moveVertical = function (y){

    this.y -= y;
    if (this.object = enemies) {    // Ensure that the current object (enemies) reappear if not destroyed
        if (this.y >= canvas.height) {
            this.y = 0;
        }
    }
}

// Get the x position of the current object
aSprite.prototype.xPos = function () {

    return this.x;
}

// Get the y position of the current object
aSprite.prototype.yPos = function () {

    return this.y;
}

aSprite.prototype.setXPos = function (x) {

    this.x = x;
}

aSprite.prototype.setYPos = function (y) {

    this.y = y;
}

// Init function
function init() {

    if (canvas.getContext) {

        // Call event listeners
        window.addEventListener('resize', resizeCanvas, false);
        window.addEventListener('orientationchange', resizeCanvas, false);

        canvas.addEventListener("touchstart", touchDown, false);
        canvas.addEventListener("touchmove", touchXY, true);
        canvas.addEventListener("touchend", touchUp, false);

        document.body.addEventListener("touchcancel", touchUp, false);

        document.addEventListener('keydown', keyDown, false);
        document.addEventListener('keyup', keyUp, false);

        resizeCanvas();

        // Init sprites
        backgroundImg = new aSprite(0, 0, "backgroundImage.png", 0, 0);
        playerImg = new aSprite(canvas.width/2, canvas.height - 60, "player.png", 0, 0);

        // Init button
        playButton = new aSprite(canvas.width/2 - 40, canvas.height/4 - 50, "playButton.png",0 ,0);
        replayButton = new aSprite (canvas.width/2 - 50, canvas.height/4 - 50, "replayButton.png", 0, 0);

        //spawnEnemy(50);

        lives = 3;

        //bulletImg = new aSprite(canvas.width/2 - 100, canvas.height/2 + 200, "bullet.png", 0, 100);

        startTimeMS = Date.now();
        lastSpawn = Date.now();



    }

}

// Resize the canvas to the current window
function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function gameLoop() {

    // Play game theme/music
    if (mainMusicPlaying == false) {
        mainMusic = new Audio ("backgroundMusic.mp3");
        mainMusic.play();
        mainMusic.volume = 0.5;
        mainMusicPlaying = true;
    }

    var elapsed = (Date.now() - startTimeMS/1000);
    update(elapsed);
    render(elapsed);

    startTimeMS = Date.now();
    spawnTime = (startTimeMS - lastSpawn)/1000;

    if (lives <= 0) {
        currentGameState = gameStates.GameOver;
    }


    collision1();
    collision2();

    startTimeMS = Date.now();
    requestAnimationFrame(gameLoop);


}

// Render function
function render(delta) {

    backgroundImg.renderF(canvas.width, canvas.height);

    switch (currentGameState) {

        case 0:
        styleText('#ffffff', '35px Times New Roman', 'center', 'bottom');    //'#005A31'
        canvasContext.fillText("Space Shooter", canvas.width/2, canvas.height/4 - 150);

        //styleText('#00FF7F', '20px Verona', 'center', 'hanging');    //'#005A31'
        //canvasContext.fillText("Press 'e' to start", canvas.width/2 , canvas.height/2);

        styleText('#00FF7F', '20px Verona', 'center', 'hanging');    //'#005A31'
        canvasContext.fillText("Use W A S D or UP DOWN LEFT RIGHT to move",
        canvas.width/2 , canvas.height/2 + 100);

        styleText('#00FF7F', '20px Verona', 'center', 'hanging');    //'#005A31'
        canvasContext.fillText("Press SPACEBAR to shoot",
        canvas.width/2 , canvas.height/2 + 200);

        playButton.render();

    break;

        case 1:
        enemiesSpawned = true;
        playerImg.render();

        for (var i = 0; i < enemies.length; i ++) {
            if (enemies[i] != null) {
                var enemy = enemies[i];
                enemy.render();
                }
        }

        for (var i = 0; i < bullets.length; i ++) {
           if (bullets[i] != null) {
               var bullet = bullets[i];
                 bullet.render();
           }
        }

        styleText('rgb(0, 255, 0)', '20px Verona', 'left', 'hanging');    //'#005A31'
        canvasContext.fillText("Score: "+ score, canvas.width/2 - 250, 20);

        styleText('rgb(0, 255, 0)', '20px Verona', 'right', 'hanging');    //'#005A31'
        canvasContext.fillText("Lives: "+ lives, canvas.width/2 + 250 , 20);

        break;


        case 2:

        styleText('00FF7F', '25px Times New Roman', 'center', 'hanging');    //'#005A31'
        canvasContext.fillText("Game Over", canvas.width/2, canvas.height/4 - 150);

        styleText('00FF7F', '25px Times New Roman', 'center', 'hanging');    //'#005A31'
        canvasContext.fillText("Score is " + score, canvas.width/2, canvas.height/4 - 50);

        replayButton.render();

        break;

    }


}

function update(delta) {

    var playerSpeed = 5;

    switch (currentGameState) {

    case 0:

    playButton.update(delta);

    break;


    case 1:

        if (playerShooting) {
            var playerShootSound = new Audio ("playerFire.wav");
            playerShootSound.volume = 0.1;
            playerShootSound.play();
            spawnBullet(1);
        }

        for (var i = 0; i < enemies.length; i ++) {
           if (enemies[i] != null) {
               var enemy = enemies[i];
                 enemy.moveVertical(-3);
           }
        }

        for (var i = 0; i < bullets.length; i ++) {
           if (bullets[i] != null) {
               var bullet = bullets[i];
                 bullet.moveVertical(2);
                 if (bullet.y <= 0) {
                    console.log("Bullet removed");
                    bullets.splice(i,1);
                 }
           }
        }
        if (lives <= 0) {
           console.log ("SWITCH THE GAME STATE");
        }

        if (moveLeft) {
            playerImg.movePlayerHorizontal(playerSpeed);
        }
        else if (moveRight) {
            playerImg.movePlayerHorizontal(-playerSpeed);
        }
        if (moveUp) {
            playerImg.movePlayerVertical(playerSpeed);
        }
        else if (moveDown) {
            playerImg.movePlayerVertical(-playerSpeed);
        }


   break;

    case 2:

    replayButton.update(delta);
    lives = 3;
    score = 0;

    break;

    }

}

// Spawn and enemy based on the value
function spawnEnemy(value) {

    for (var i = 0; i < value; i ++) {
        var randWidth = Math.random() * (canvas.width) + 5;
        enemyArray = new aSprite(randWidth, canvas.height/2 - 50 * i,"enemy1.png" ,0, 0);
        enemies.push(enemyArray);
        console.log(i + " spawned");
    }
}

// Spawn a bullet based on the value
function spawnBullet(value) {

    for (var i = 0; i < value; i ++) {

        bulletArray = new aSprite(playerImg.xPos() + 30, playerImg.yPos() + 1,
        "bullet.png", 0, 100);
        bullets.push(bulletArray);

    }
}

// Take away 1 life
function playerLoseLife() {

    lives -=1;
}

// Add score
function addScore () {

    score += 10;
}

// Collision between player and enemy
function collision1() {

    // Iterate through enemy array
    for (var i = 0; i < enemies.length; i++) {

        // If the player image collides with any enemy image in the array
        if (playerImg.x < enemies[i].x + enemies[i].sImage.width &&
            playerImg.x + playerImg.sImage.width > enemies[i].x &&
            playerImg.y < enemies[i].y + enemies[i].sImage.height &&
            playerImg.y + playerImg.sImage.height > enemies[i].y) {

                // Play hit sound
                var playerHitSound = new Audio ("shipHit.wav");
                playerHitSound.volume = 0.3;
                playerHitSound.play();

                // Remove specific enemy from array
                enemies.splice(i, 1);

                // Player loses a life
                playerLoseLife();
            }
    }

}

// Collision between bullets and enemies
function collision2 () {

    // Iterate through enemy array
    for (var i = 0; i < enemies.length; i ++) {

        // Iterate through bullet array
        for (var j = 0; j < bullets.length; j ++) {

            // If an enemy from the enemies array collides with a bullet from the bullet array
            if (bullets[j].x < enemies[i].x + enemies[i].sImage.width &&
                bullets[j].x + bullets[j].sImage.width > enemies[i].x &&
                bullets[j].y < enemies[i].y + enemies[i].sImage.height &&
                bullets[j].y + bullets[j].sImage.height > enemies[i].y) {

                    // Play hit sound
                    var enemyHitSound = new Audio ("enemyHit.wav");
                    enemyHitSound.volume = 0.085;
                    enemyHitSound.play();

                    // Remove the specific bullet and enemy from their relevant arrays
                    enemies.splice(i,1);
                    bullets.splice(j,1);

                    // Score is added to the player
                    addScore();
                }
        }
    }
}

function buttonCollision(button) {

    if (lastPt.x <= button.x + button.sImage.width &&
        lastPt.x >= button.x && lastPt.y <= button.y + button.sImage.height &&
        lastPt.y >= button.y) {
            if (button == playButton) {
                currentGameState = gameStates.MainGame;
                spawnEnemy (5);

            }

            else if (button == replayButton) {
                currentGameState = gameStates.MainGame;
                playerImg.setXPos(canvas.width/2 - 40);
                playerImg.setYPos(canvas.height/4 - 50);
            }

        }


}

function styleText(txtColour, txtFont, txtAlign, txtBaseline) {

    canvasContext.fillStyle = txtColour;
    canvasContext.font = txtFont;
    canvasContext.textAlign = txtAlign;
    canvasContext.textBaseline = txtBaseline;
}

function touchUp(evt) {
    evt.preventDefault();
    // Terminate touch path
    lastPt=null;
}

function touchDown(evt) {
    evt.preventDefault();
    touchXY(evt);
    console.log(evt);
    //buttonCollision(playButton);
}

function touchXY(evt) {
    evt.preventDefault();
    if(lastPt!=null) {
        var touchX = evt.touches[0].pageX - canvas.offsetLeft;
        var touchY = evt.touches[0].pageY - canvas.offsetTop;
        }
    lastPt = {x:evt.touches[0].pageX, y:evt.touches[0].pageY};
    buttonCollision(playButton);
    buttonCollision (replayButton);
}


function keyDown(e) {

    if (e.keyCode == 39 || e.keyCode == 68) {
        moveRight = true;
    }
    else if (e.keyCode == 37 || e.keyCode == 65) {
        moveLeft = true;
    }
    if (e.keyCode == 38 || e.keyCode == 87) {
        moveUp = true;
    }
    else if (e.keyCode == 40 || e.keyCode == 83) {
        moveDown = true;
    }

    if (e.keyCode == 32){
        playerShooting = true;
    }

    if (e.keyCode == 69) {
        if (currentGameState == gameStates.MainMenu) {
           currentGameState = gameStates.MainGame;
        }
    }
}

function keyUp(e) {

    if (e.keyCode == 39 || e.keyCode == 68) {
        moveRight = false;
    }
    else if (e.keyCode == 37 || e.keyCode == 65) {
        moveLeft = false;
    }
    if (e.keyCode == 38 || e.keyCode == 87) {
        moveUp = false;
    }
    else if (e.keyCode == 40 || e.keyCode == 83) {
        moveDown = false;
    }

     if (e.keyCode == 32){
            playerShooting = false;
        }
}












