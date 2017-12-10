// Canvas
var canvas;
var canvasContext;
var canvasX;
var canvasY;
var isMouseDown = 0;

// Images
var backgroundImg;
var playerImg;

// Arrays
var enemies = [];
var enemyArray;
var bullets = [];
var bulletArray;

// Music
var mainMusic;
var mainMusicPlaying = false;

// Mouse handler
var lastPt = null;

// Game states
var gameStates = {MainMenu: 0, MainGame: 1, GameOver: 2};
var currentGameState;
var gameOverScreen = false;

// Random game/player variables
var timer = 0;
var score = 0;
var lives = 3;
var playerSpeed = 5;

// Timers
var startTimeMS;
var fireRate = 0;

// Player controls
var moveRight = false;
var moveLeft = false;
var moveUp = false;
var moveDown = false;
var playerShooting = false;

// Buttons
var playButton;
var replayButton;

// Local Storage
var localStorage;
var isStorageAvailable;
var highScore = 0;

function load() {

    // Canvas loading
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');

    // Check if local storage is available
    if (storageAvailable('localStorage')) {

        console.log("Local storage is available");
        // Initialise local storage
        showScore();
        localStorage = window.localStorage;
    }
    else {
        // Storage isnt available, so nothing to do
        console.log("Storage not available")
    }

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
    // Ensure that the player is kept within the screen
    if (this.x <= 0) {
    this.x = 0;
    }
    if (this.x >= canvas.width - 65) {
        this.x = canvas.width - 65;
    }

}

// Move the player vertically by the value of y
aSprite.prototype.movePlayerVertical = function (y){

    this.y -= y;
    // Restrict the player to the bottom section of the screen
    if (this.y <= canvas.height/4 * 3) {
    this.y = canvas.height/4 * 3;
    }
    if (this.y >= canvas.height - 35) {
        this.y = canvas.height - 35;
    }
}

// Move the current object horizontally by the value of x
aSprite.prototype.moveHorizontal = function (x){

    this.x -= x;
}

// Move the current object vertically by the value of y
aSprite.prototype.moveVertical = function (y){

    this.y -= y;
    // Ensure that the current object (enemies) reappear if not destroyed
    if (this.object = enemies) {
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

// Set the position of the x value of the current object
aSprite.prototype.setXPos = function (x) {

    this.x = x;
}

// Set the current y value of the current object
aSprite.prototype.setYPos = function (y) {

    this.y = y;
}

// Init function
function init() {

    if (canvas.getContext) {

        // Call event listeners for the window
        window.addEventListener('resize', resizeCanvas, false);
        window.addEventListener('orientationchange', resizeCanvas, false);

        // Call event listeners for the touch control
        canvas.addEventListener("touchstart", touchDown, false);
        canvas.addEventListener("touchmove", touchXY, true);
        canvas.addEventListener("touchend", touchUp, false);

        document.body.addEventListener("touchcancel", touchUp, false);

        // Call event listeners for keyboard/keypad control
        document.addEventListener('keydown', keyDown, false);
        document.addEventListener('keyup', keyUp, false);

        // Call resize canvas function
        resizeCanvas();

        // Init sprites
        backgroundImg = new aSprite(0, 0, "backgroundImage.png", 0, 0);
        playerImg = new aSprite(canvas.width/2, canvas.height/4 - 60, "player.png", 0, 0);

        // Init button
        playButton = new aSprite(canvas.width/2 - 40, canvas.height/4 - 50, "playButton.png",0 ,0);
        replayButton = new aSprite (canvas.width/2 - 50, canvas.height/4 - 50, "replayButton.png", 0, 0);

        // Set the initial number of lives
        lives = 3;

        // Set the start time
        startTimeMS = Date.now();
    }

}

// Resize the canvas to the current window dimensions
function resizeCanvas() {

    // Set width to current window width
    canvas.width = window.innerWidth;
    //  Set height to current window height
    canvas.height = window.innerHeight;
}

// Main game loop function
function gameLoop() {

    // If game music is not playing then play game theme/music
    if (mainMusicPlaying == false) {
        mainMusic = new Audio ("backgroundMusic.mp3");
        mainMusic.play();
        mainMusic.volume = 0.5;
        mainMusicPlaying = true;
    }

    // Update and render based on the elapsed time
    var elapsed = (Date.now() - startTimeMS/1000);
    update(elapsed);
    render(elapsed);

    // Set the current game state to the game over screen if lives are 0 or less than 0
    if (lives <= 0) {
        currentGameState = gameStates.GameOver;
    }

    // Handle the collision detection in the scene
    collision1();
    collision2();

    startTimeMS = Date.now();
    requestAnimationFrame(gameLoop);

}

// Render function
function render(delta) {

    // Render the background image
    backgroundImg.renderF(canvas.width, canvas.height);

    // Switch the current game state
    switch (currentGameState) {

        // Main menu state
        case 0:
        styleText('#ffffff', '35px Times New Roman', 'center', 'bottom');
        canvasContext.fillText("Space Shooter", canvas.width/2, canvas.height/4 - 150);

        styleText('#00FF7F', '20px Verona', 'center', 'hanging');
        canvasContext.fillText("Use W A S D or UP DOWN LEFT RIGHT to move",
        canvas.width/2 , canvas.height/2 + 100);

        styleText('#00FF7F', '20px Verona', 'center', 'hanging');
        canvasContext.fillText("Press SPACEBAR to shoot",
        canvas.width/2 , canvas.height/2 + 200);

        // Render play button
        playButton.render();

    break;

        // Main game state
        case 1:
        // Render the players image
        playerImg.render();

        // Iterate through all of the enemies in the scene and render them
        for (var i = 0; i < enemies.length; i ++) {
            if (enemies[i] != null) {
                var enemy = enemies[i];
                // Render all enemies
                enemy.render();
             }
        }

        // Iterate through all of the bullets in the scene and render them
        for (var i = 0; i < bullets.length; i ++) {
           if (bullets[i] != null) {
               var bullet = bullets[i];
               // Render all bullets
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

        styleText('00FF7F', '25px Verona', 'center', 'hanging');    //'#005A31'
        canvasContext.fillText("Score is " + score, canvas.width/2, canvas.height/4 - 50);

        styleText('00FF7F', '25px Verona', 'center', 'hanging');    //'#005A31'
        canvasContext.fillText("High score is " + localStorage.getItem('highScore'), canvas.width/2, canvas.height/4);

        // Render the replay button
        replayButton.render();

        break;

    }


}

// Update the game state and the sprites within it
function update(delta) {

    switch (currentGameState) {

    case 0:

    // Update the position of the play button
    playButton.update(delta);

    break;


    case 1:

         fireRate++;

        // Check if the player is shooting
        if (playerShooting && fireRate >= 15) {
            // Play shooting sound
            fireRate = 0;
            var playerShootSound = new Audio ("playerFire.wav");
            playerShootSound.volume = 0.1;
            playerShootSound.play();

            // Spawn 1 bullet
            spawnBullet(1);
        }

        // Iterate through all of the enemies in the scene and move them vertically
        for (var i = 0; i < enemies.length; i ++) {
           if (enemies[i] != null) {
               var enemy = enemies[i];
                 enemy.moveVertical(getRandomNumber(-3, -5));
           }
        }

        // Iterate through all of the enemies in the scene and move them vertically
        for (var i = 0; i < bullets.length; i ++) {
           if (bullets[i] != null) {
               var bullet = bullets[i];
                 bullet.moveVertical(5);
                 // Check if current bullet position is less than or equal to 0
                 if (bullet.y <= 0) {
                    // Remove the specific bullet from the array
                    bullets.splice(i,1);
                 }
           }
        }

        // Player movement
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

    // Update the replay buttons position
    replayButton.update(delta);
    // Set the current number of lives to 3
    lives = 3;

    break;

    }

}

// Spawn and enemy based on the value
function spawnEnemy(value) {

    for (var i = 0; i < value; i ++) {
        var randWidth = Math.random() * (canvas.width) + 5;
        enemyArray = new aSprite(randWidth, canvas.height/2 - 50 * i,"enemy1.png" ,0, 0);
        enemies.push(enemyArray);
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

// Despawn all enemies in the scene that were spawned
function despawnEnemies() {

    for (var i = enemies.length; i > 0; i --) {

        enemies.pop();
    }
}

// Despawn all bullets in the scene that were spawned
function despawnBullets() {

    for (var i = bullets.length; i > 0; i --) {

        bullets.pop();
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
            if (enemies[i].x < bullets[j].x + bullets[j].sImage.width &&
                enemies[i].x + enemies[i].sImage.width > bullets[j].x &&
                enemies[i].y < bullets[j].y + bullets[j].sImage.height &&
                enemies[i].y + enemies[i].sImage.height > bullets[j].y) {

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

// Collision between button and touch
function buttonCollision(button) {

    // If the mouse position collides with the buttons position
    if (lastPt.x <= button.x + button.sImage.width &&
        lastPt.x >= button.x && lastPt.y <= button.y + button.sImage.height &&
        lastPt.y >= button.y) {

            switch (currentGameState) {
            case 0:
            // If the button clicked is the play button
            if (button == playButton) {
                // Update the current game state to the main game scene
                currentGameState = gameStates.MainGame;
                // Set the player image to the original position as set in init()
                playerImg.setXPos(canvas.width/2);
                playerImg.setYPos(canvas.height - 35);
                // Spawn enemies
                spawnEnemy (125);
            }

            break;

            case 1:

            break;

            case 2:
            // If the button clicked is the play button
            if (button == replayButton) {
                // Update the current state to the main game scene
                currentGameState = gameStates.MainGame;
                // Set the player image to the original position as set in init()
                playerImg.setXPos(canvas.width/2);
                playerImg.setYPos(canvas.height - 35);
                // Despawn the enemies
                despawnEnemies();
                // Despawn the bullets
                despawnBullets();
                // Spawn enemies
                spawnEnemy(125);
                // Set the score to 0
                score = 0;
            }
            break;
            }
        }
}

// Get a random number between two min and max values
function getRandomNumber(min, max) {

    return Math.random() * (max - min) + min;
}

// Check the storage availability
function storageAvailable(type) {

    try {
        var storage = window [type], x = '____storage test____';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
    }

    catch (e) {
        return e instanceof DOMException && (
            // Everything expect Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // Test name field, since code might not be present
            // Everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // Acknowledge QuotaExceededError only if there is something already stored
            storage.length !== 0;
    }
}

// Checks if score is more than the stored high score
function showScore() {

    theScore = localStorage.getItem('highScore');
    if (score > theScore ) {
        localStorage.setItem('highScore', score);
    }
}

// Set the text components
function styleText(txtColour, txtFont, txtAlign, txtBaseline) {

    canvasContext.fillStyle = txtColour;
    canvasContext.font = txtFont;
    canvasContext.textAlign = txtAlign;
    canvasContext.textBaseline = txtBaseline;
}

// Handle touch up events
function touchUp(evt) {
    evt.preventDefault();
    // Terminate touch path
    lastPt=null;
}

// Handle touch down events
function touchDown(evt) {
    evt.preventDefault();
    touchXY(evt);
    // Button collision check with play and replay button
    buttonCollision(playButton);
    buttonCollision (replayButton);
}

function touchXY(evt) {
    evt.preventDefault();
    if(lastPt!=null) {
        var touchX = evt.touches[0].pageX - canvas.offsetLeft;
        var touchY = evt.touches[0].pageY - canvas.offsetTop;
        }
    lastPt = {x:evt.touches[0].pageX, y:evt.touches[0].pageY};
}

// Handle keydown events
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
}

// Handle keyup events
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