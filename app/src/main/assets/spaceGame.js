var canvas;
var canvasContext;
var canvasX;
var canvasY;
var isMouseDown = 0;

var backgroundImg;
var playerImg;
var enemies = [];
var enemyArray;

var bulletImg;

var mainMusic;
var mainMusicPlaying = false;

var mainMenuScreen = true;
var mainGameScreen = false;
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

var bullets = [];


function load() {

    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');

    init();

    canvasX = canvas.width/2;
    canvasY = canvas.height-30;

    gameLoop();

}

function aSprite (x, y, imageSRC, velx, vely) {

    this.zindex = 0;
    this.x = x;
    this.y = y;
    this.vx = velx;
    this.vy = vely;
    this.sImage = new Image();
    this.sImage.src = imageSRC;
}

aSprite.prototype.renderF = function(width, height) {

    canvasContext.drawImage(this.sImage,this.x, this.y, width, height);
}

aSprite.prototype.render = function() {

    canvasContext.drawImage(this.sImage,this.x, this.y);
}

aSprite.prototype.update = function(deltaTime) {

    this.x += deltaTime * 1;
    this.y += deltaTime * this.vy;
}

aSprite.prototype.movePlayerHorizontal = function (x){

    this.x -= x;
    if (this.x <= 0) { // Keep player within screen
    this.x = 0;
    }
    if (this.x >= canvas.width) {
        this.x = canvas.width;
    }

}

aSprite.prototype.movePlayerVertical = function (y){

    this.y -= y;
    if (this.y <= 0) { // Keep player within screen
    this.y = 0;
    }
    if (this.y >= canvas.height - this.height) {
        this.y = canvas.height - this.height;
    }
}

aSprite.prototype.moveHorizontal = function (x){

    this.x -= x;

}

aSprite.prototype.moveVertical = function (y){

    this.y -= y;
    if (this.y >= canvas.height) {
        this.y = 0;
    }
}

aSprite.prototype.remove = function () {

    console.log("REMOVED");
    this.active = false;
}


function init() {

    if (canvas.getContext) {

        window.addEventListener('resize', resizeCanvas, false);
        window.addEventListener('orientationchange', resizeCanvas, false);

        canvas.addEventListener("touchstart", touchDown, false);
        canvas.addEventListener("touchmove", touchXY, true);
        canvas.addEventListener("touchend", touchUp, false);

        document.body.addEventListener("touchcancel", touchUp, false);

        document.addEventListener('keydown', keyDown, false);
        document.addEventListener('keyup', keyUp, false);

        resizeCanvas();

        backgroundImg = new aSprite(0, 0, "backgroundImage.png", 0, 0);
        playerImg = new aSprite(canvas.width/2, canvas.height - 60, "player.png", 0, 0);

        //var theRandImage = ["enemy1.png","enemy2.png","enemy3.png","enemy4.png","enemy5.png","enemy6.png"];

        spawnEnemie(45);

        bulletImg = new aSprite(canvas.width/2 - 100, canvas.height/2 + 200, "bullet.png", 0, 100);

        startTimeMS = Date.now();
        lastSpawn = Date.now();



    }

}

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function gameLoop() {

    //console.log ("Game Loop");
    if (mainMusicPlaying == false) {
        mainMusic = new Audio ("backgroundMusic.mp3");
        mainMusic.play();
        mainMusic.volume = 0.5;
        mainMusicPlaying = true;
    }

    var elapsed = (Date.now() - startTimeMS/1000);
    update(elapsed);
    render(elapsed);
    timer++;

    startTimeMS = Date.now();
    spawnTime = (startTimeMS - lastSpawn)/1000;

    if (lives <= 0) {
        mainGameScreen = false;
        gameOverScreen = true;
    }

    console.log(spawnTime);
    //collisionDetection(playerImg, enemies);
    collisionTest();

    startTimeMS = Date.now();
    requestAnimationFrame(gameLoop);


}

function render(delta) {

    backgroundImg.renderF(canvas.width, canvas.height);

    if (mainMenuScreen) {

        styleText('#ffffff', '35px Times New Roman', 'center', 'bottom');    //'#005A31'
        canvasContext.fillText("Space Shooter", canvas.width/2, canvas.height/4 - 150);

        styleText('#00FF7F', '20px Verona', 'center', 'hanging');    //'#005A31'
        canvasContext.fillText("Press 'e' to start", canvas.width/2 , canvas.height/2);

        styleText('#00FF7F', '20px Verona', 'center', 'hanging');    //'#005A31'
        canvasContext.fillText("Use W A S D or UP DOWN LEFT RIGHT to move",
        canvas.width/2 , canvas.height/2 + 100);

        styleText('#00FF7F', '20px Verona', 'center', 'hanging');    //'#005A31'
        canvasContext.fillText("Press SPACEBAR to shoot",
        canvas.width/2 , canvas.height/2 + 200);

    }

    if (mainGameScreen) {

        playerImg.render();

        for (var i = 0; i < enemies.length; i ++) {
            if (enemies[i] != null) {
                var enemy = enemies[i];
                enemy.render();
                }
        }

        bulletImg.render();

        styleText('rgb(0, 255, 0)', '20px Verona', 'left', 'hanging');    //'#005A31'
        canvasContext.fillText("Score: "+ score, canvas.width/2 - 250, 20);

        styleText('rgb(0, 255, 0)', '20px Verona', 'right', 'hanging');    //'#005A31'
        canvasContext.fillText("Lives: "+ lives, canvas.width/2 + 250 , 20);

    }

    if (gameOverScreen){

        styleText('00FF7F', '25px Times New Roman', 'center', 'hanging');    //'#005A31'
        canvasContext.fillText("Game Over", canvas.width/2, canvas.height/4 - 150);

    }


}

function update(delta) {

    var playerSpeed = 5;

    if (mainMenuScreen) {

    }

    if (mainGameScreen) {


        if (playerShooting) {
            console.log("Shoot");
            var playerShootSound = new Audio ("playerFire.wav");
            playerShootSound.volume = 0.1;
            playerShootSound.play();
        }

        if (spawnTime = 6){
            //spawnEnemie(4);
            //spawnTime = 0;
        }

        for (var i = 0; i < enemies.length; i ++) {
           if (enemies[i] != null) {
               var enemy = enemies[i];
                 enemy.moveVertical(-1);
           }
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

        bulletImg.moveVertical(1);
    }

    if (gameOverScreen) {

    }


}

function spawnEnemie(value) {

    for (var i = 0; i < value; i ++) {
        var randWidth = Math.random() * (canvas.width) + 5;
        enemyArray = new aSprite(randWidth, canvas.height/2 - 50 * i,"enemy1.png" ,0, 0);
        enemies.push(enemyArray);
        console.log(i + " spawned");
    }
}

function spawnEnemies(value) {

    var randWidth = Math.random() * (canvas.width - 50) + 5;
    enemyArray = new aSprite(randWidth, canvas.height/2 - 50 + (2 * i),"enemy1.png" ,0, 0);
    enemies.push(enemyArray);
    console.log(i + " spawned");
}

function bullet() {


}

function playerLoseLife() {

    lives -=1;
}

function collisionTest() {

    for (var i = 0; i < enemies.length; i++) {

        if (playerImg.x < enemies[i].x + enemies[i].sImage.width &&
            playerImg.x + playerImg.sImage.width > enemies[i].x &&
            playerImg.y < enemies[i].y + enemies[i].sImage.height &&
            playerImg.y + playerImg.sImage.height > enemies[i].y) {

                console.log("HIT!!!");
                var playerHitSound = new Audio ("enemyHit.wav");
                playerHitSound.volume = 0.03;
                playerHitSound.play();
                playerLoseLife();
                enemies.splice(i, 1);

            }
    }

}
function collisionDetection(col1, col2 ) {

    if (col1.x < col2.x + col2.sImage.width &&
        col1.x + col1.sImage.width > col2.x &&
        col1.y < col2.y + col2.sImage.height &&
        col1.y + col1.sImage.height > col2.y) {

            console.log("Hit");
            var playerHitSound = new Audio ("enemyHit.wav");
            playerHitSound.volume = 0.03;
            playerHitSound.play();

            if (col2 = enemies) {
                playerLoseLife();
                enemies.splice(col2, 1);
                //console.log("Player hit, lose a life at " + enemies[col2]);
            }
        }

}

function styleText(txtColour, txtFont, txtAlign, txtBaseline) {

    canvasContext.fillStyle = txtColour;
    canvasContext.font = txtFont;
    canvasContext.textAlign = txtAlign;
    canvasContext.textBaseline = txtBaseline;
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
        if (mainMenuScreen) {
            mainMenuScreen = false;
            mainGameScreen = true;
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

function touchUp(evt) {
    evt.preventDefault();
    // Terminate touch path
    lastPt=null;
}

function touchDown(evt) {
    evt.preventDefault();
    if(gameOverScreen) {
        return;
        }
    touchXY(evt);
}

function touchXY(evt) {
    evt.preventDefault();
    if(lastPt!=null) {
        var touchX = evt.touches[0].pageX - canvas.offsetLeft;
        var touchY = evt.touches[0].pageY - canvas.offsetTop;
        }
    lastPt = {x:evt.touches[0].pageX, y:evt.touches[0].pageY};
}












