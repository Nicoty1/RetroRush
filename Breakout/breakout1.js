const { loadHighscores, insertHighscore, isHighscore, getHighestScore } = require('../highscoremanager');

class Breakout extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'Breakout' });

        this.bricks;
        this.paddle;
        this.ball;
   
    }

    preload ()
    {
        this.load.setBaseURL('.');
        this.load.atlas('assets', 'assets/breakout_atlas.png', 'assets/breakout_atlas.json');
        this.load.audio('hitpaddle', 'assets/tennis-ball-hit-151257.mp3'); // von pixabay
        this.load.audio('hitbrick', 'assets/8-bit-game-2-186976.mp3'); // von pixaba
        this.load.audio('gameover', 'assets/game-over-arcade-6435.mp3'); // von pixaba
        this.load.audio('gamestart', 'assets/retro-game-jingleaif-14638.mp3'); // von pixaba  
        this.input.setDefaultCursor('none') 
        highScore=getHighestScore('Breakout');
    }

    create ()
    {
        //  Enable world bounds, but disable the floor
        this.physics.world.setBoundsCollision(true, true, true, false);

        //  Create the bricks in a 10x6 grid
        this.bricks = this.physics.add.staticGroup({
            key: 'assets', frame: [ 'blue1', 'red1', 'green1', 'yellow1', 'silver1', 'purple1' ],
            frameQuantity: 10,
            gridAlign: { width: 10, height: 6, cellWidth: 64, cellHeight: 32, x: 112, y: 100 }
        });

        this.ball = this.physics.add.image(xsize/2, ysize-100, 'assets', 'ball1').setCollideWorldBounds(true).setBounce(1);
        this.ball.setData('onPaddle', true);

        this.paddle = this.physics.add.image(xsize/2, ysize-50, 'assets', 'paddle1').setImmovable();

        //  Our colliders
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);

        //  Input events
        this.input.on('pointermove', function (pointer)
        {

            //  Keep the paddle within the game
            this.paddle.x = Phaser.Math.Clamp(pointer.x, 52, 748);

            if (this.ball.getData('onPaddle'))
            {
                this.ball.x = this.paddle.x;
            }

        }, this);

        this.input.on('pointerup', function (pointer)
        {
            if (pointer.event.button === 2) {
                console.log('Rechte Maustaste gedrückt');
                this.scene.start('GameOver');
            }
            else {
                if (this.ball.getData('onPaddle')) {
                    this.ball.setVelocity(-75, -300);
                    this.ball.setData('onPaddle', false);
                }
            }
        }, this);
        // sound
        //this.music = this.sound.add('theme');
        this.soundhitpaddle = this.sound.add('hitpaddle');
        this.soundhitbrick = this.sound.add('hitbrick');
        this.gameover = this.sound.add('gameover');
        this.gamestart = this.sound.add('gamestart');

        this.scoreText=this.add.text(20,20,'Score: '+score,{
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        this.highScoreText=this.add.text(230,20,'Highscore: '+highScore,{
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        this.baelleText=this.add.text(550,20,'Bälle: '+baelle,{
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        });



        this.closeButton = this.add.text(this.scale.width - 30, 30, 'X', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setInteractive();
        // Zentrieren (damit das "X" nicht abgeschnitten ist)
        this.closeButton.setOrigin(0.5);
        // Klick-Ereignis hinzufügen
        this.closeButton.on('pointerdown', () => {this.scene.start('GameOver')}, this); 
        this.gamestart.play();
    }

    hitBrick (ball, brick)
    {
        brick.disableBody(true, true);
        this.soundhitbrick.play();
        if (this.bricks.countActive() === 0)
        {
            this.resetLevel();
        }
        //scoreIncrement++;
        score+=scoreIncrement;

    }

    resetBall ()
    {
        this.ball.setVelocity(0);
        this.ball.setPosition(this.paddle.x, ysize-100);
        this.ball.setData('onPaddle', true);
    }

    resetLevel ()
    {
        this.resetBall();

        this.bricks.children.each(brick =>
        {
            brick.enableBody(false, 0, 0, true, true);
        });
    }

    hitPaddle (ball, paddle)
    {
        let diff = 0;

        if (ball.x < paddle.x)
        {
            //  Ball is on the left-hand side of the paddle
            diff = paddle.x - ball.x;
            ball.setVelocityX(-10 * diff);
        }
        else if (ball.x > paddle.x)
        { 
            //  Ball is on the right-hand side of the paddle
            diff = ball.x - paddle.x;
            ball.setVelocityX(10 * diff);
        }
        else
        {
            //  Ball is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            ball.setVelocityX(2 + Math.random() * 8);
        }
        this.soundhitpaddle.play();
        //scoreIncrement=1;   // reset increment
    }

    update ()
    {
        if (this.ball.y > ysize)
        {
            baelle--;
            this.baelleText.setText('Bälle: '+baelle);
            if (baelle<=0) {
                this.scene.start('GameOver');               
            }
            this.gameover.play();
            this.resetBall();
        }
        if (this.input.gamepad.total !== 0) {
            const pad = this.input.gamepad.getPad(0);
            if (pad.left) {
                console.log("isleft")
            }
            if (pad.right) {
                console.log("isright")
            }
            if (pad.X) {
                console.log("Square pressed")
                this.scene.start('GameOver');
            }

        }
        this.scoreText.setText('Score: '+score);
    }
}

class GameOver extends Phaser.Scene {
    constructor ()
    {
        super({ key: 'GameOver' });
    }
    create () {
        if (isHighscore('Breakout',score)) {
            insertHighscore('Breakout', 'SON', score);
        }

        // Zerstört das Spiel sofort
        this.game.destroy(true);
        window.location.href = "../index.html";
    }
}

class SplashScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'Splashscreen' });
        this.score = 0;
        this.gameName = 'Breakout'; // Name des Spiels
    }

    create() {
        // Highscores laden und anzeigen
        const highscores = loadHighscores(this.gameName);

        this.add.text(10, 10, 'Highscores:', { fontSize: '20px', color: '#ffffff' });
        highscores.forEach((entry, index) => {
            this.add.text(10, 40 + index * 30, `${index + 1}. ${entry.name} - ${entry.score}`, {
                fontSize: '18px',
                color: '#00ff00'
            });
        });



        // Score Text
        this.scoreText = this.add.text(10, 200, 'Score: 0', {
            fontSize: '32px',
            color: '#ffffff'
        });

        // Beispiel: Klick erhöht den Score
        this.input.on('pointerdown', () => {
            this.score += Math.floor(Math.random() * 50) + 10; // Zufälliger Score
            this.scoreText.setText('Score: ' + this.score);
        });

        // Spielende nach 5 Sekunden
        this.time.delayedCall(5000, () => {this.scene.start('Breakout')});
        highScore=highscores
    }

    gameOver() {
        // Spielername simuliert
        const playerName = prompt("Name eingeben (3 Zeichen):") || "NNN";
        saveHighscore(this.gameName, playerName, this.score);
        console.log('Spiel vorbei!');
        this.scene.restart();
    }
}

const xsize = 800  // 796
const ysize = 480  // 476

let score = 0;
let highScore = 0;
let baelle = 3;
let scoreIncrement=1;

const config = {
    type: Phaser.WEBGL,
    width: xsize,
    height: ysize,
    parent: 'Breakout',
    scene: [ SplashScreen, Breakout, GameOver  ],
    physics: {
        default: 'arcade'
    },
    input: {
        gamepad: true
    }
};


const game = new Phaser.Game(config);




/**
 
const { loadHighscores, saveHighscore } = require('./highscoreManager');

class MyGame extends Phaser.Scene {
    constructor() {
        super({ key: 'MyGame' });
        this.score = 0;
        this.gameName = 'SuperGame'; // Name des Spiels
    }

    create() {
        // Highscores laden und anzeigen
        const highscores = loadHighscores(this.gameName);

        this.add.text(10, 10, 'Highscores:', { fontSize: '20px', color: '#ffffff' });
        highscores.forEach((entry, index) => {
            this.add.text(10, 40 + index * 30, `${index + 1}. ${entry.name} - ${entry.score}`, {
                fontSize: '18px',
                color: '#00ff00'
            });
        });

        // Score Text
        this.scoreText = this.add.text(10, 200, 'Score: 0', {
            fontSize: '32px',
            color: '#ffffff'
        });

        // Beispiel: Klick erhöht den Score
        this.input.on('pointerdown', () => {
            this.score += Math.floor(Math.random() * 50) + 10; // Zufälliger Score
            this.scoreText.setText('Score: ' + this.score);
        });

        // Spielende nach 5 Sekunden
        this.time.delayedCall(5000, () => this.gameOver());
    }

    gameOver() {
        // Spielername simuliert
        const playerName = prompt("Name eingeben (3 Zeichen):") || "NNN";
        saveHighscore(this.gameName, playerName, this.score);
        console.log('Spiel vorbei!');
        this.scene.restart();
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: MyGame
};

const game = new Phaser.Game(config);




 */