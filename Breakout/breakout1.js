
import { edgeTrigger} from '../helper.js';

import { loadHighscores, insertHighscore, isHighscore, getHighestScore } from '../highscoremanager.js';



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
        // baelle auf 3 setzen
        baelle = 3;
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
                this.scene.start('QuitGame');
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
                this.scene.start('QuitGame');
            }

        }
        this.scoreText.setText('Score: '+score);
    }
}

class QuitGame extends Phaser.Scene {
    constructor ()
    {
        super({ key: 'QuitGame' });
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

class GameOver extends Phaser.Scene {
    constructor ()
    {
        super({ key: 'GameOver' });
        this.mousePressed = { value: false };
        this.spacePressed = { value: false };
        this.startPressed = { value: false };
        this.quitPressed = { value: false };
    }

    create() {
        const { width, height } = this.scale;

        // Textstil definieren
        const textStyle = {
            fontFamily: 'Arial',
            fontSize: `${height * 0.25}px`,  // ca. die Hälfte des Bildschirms
            color: '#ff0000',
            align: 'center'
        };

        // Game Over Text erstellen
        this.add.text(width / 2, height / 2 - (height * 0.125), 'GAME', textStyle).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + (height * 0.125), 'OVER', textStyle).setOrigin(0.5);
        this.add.text(
            this.scale.width / 2,                  // X-Koordinate (zentriert)
            this.scale.height - 20,                // Y-Koordinate (20px vom unteren Rand)
            'Drücke <Start> oder die Maustaste um forzufahren',                      // Beliebiger Text
            {
                fontSize: '18px',                   // Schriftgröße
                color: '#ffffff',                  // Dunkelblau (Hex-Farbe)
                align: 'center'                    // Zentrierte Ausrichtung
            }
        ).setOrigin(0.5, 1);                       // Ursprung: Mitte unten
        if (isHighscore('Breakout',score)) {
            insertHighscore('Breakout', 'SON', score);
        }
    }

    update() {
        if (edgeTrigger(this.mousePressed,this.input.activePointer.isDown)) {
            this.scene.start('Splashscreen');  // Szene starten           
        }    
        if (edgeTrigger(this.spacePressed,this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).isDown)) {
            this.scene.start('Splashscreen');  // Szene starten           
        }    
        if (this.input.gamepad.total !== 0) {
            // return to launcher - square pressed    
            if (edgeTrigger(this.startPressed,this.input.gamepad.getPad(0).buttons[0].pressed)) {
                this.scene.start('Splashscreen');
            }
            if (edgeTrigger(this.quitPressed,this.input.gamepad.getPad(0).buttons[2].pressed)) {
                this.scene.start('Splashscreen');
            }
        }
    }
}

class UIScene extends Phaser.Scene {
    constructor ()
    {
        super({ key: 'UIScene', active: true }); // Immer aktiv
    }
    create () {
        this.closeButton = this.add.text(this.scale.width - 30, 30, 'X', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setInteractive();
        // Zentrieren (damit das "X" nicht abgeschnitten ist)
        this.closeButton.setOrigin(0.5);
        // Klick-Ereignis hinzufügen
        this.closeButton.on('pointerdown', () => {this.scene.start('QuitGame')}, this); 
    }
}

class SplashScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'Splashscreen' });
        score = 0;  // globale variable
        this.mousePressed = { value: false };
        this.spacePressed = { value: false };
        this.startPressed = { value: false };
        this.quitPressed = { value: false };
    }

    preload() {
        this.load.setBaseURL('.');
        this.load.image('background', 'assets/ChatGPT Image 30. März 2025, 00_41_42.png'); // Pfad zum Bild
    }

    create() {
        this.background = this.add.image(0, 0, 'background').setOrigin(0);

        // Bildschirmbreite und -höhe ermitteln
        const { width, height } = this.sys.game.config;
    
        // Hintergrund skalieren
        this.background.setDisplaySize(width, height);

        this.add.text(
            this.scale.width / 2,                  // X-Koordinate (zentriert)
            this.scale.height - 20,                // Y-Koordinate (20px vom unteren Rand)
            'Drücke <Start> oder die Maustaste um forzufahren',                      // Beliebiger Text
            {
                fontSize: '18px',                   // Schriftgröße
                color: '#ffffff',                  // Dunkelblau (Hex-Farbe)
                align: 'center'                    // Zentrierte Ausrichtung
            }
        ).setOrigin(0.5, 1);                       // Ursprung: Mitte unten

        // Spielende nach 5 Sekunden
        // this.time.delayedCall(5000, () => {this.scene.start('Breakout')});

    }

    update () {
        if (edgeTrigger(this.mousePressed,this.input.activePointer.isDown)) {
            this.scene.start('Breakout');  // Szene starten           
        }    
        if (edgeTrigger(this.spacePressed,this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).isDown)) {
            this.scene.start('Breakout');  // Szene starten           
        }    
        if (this.input.gamepad.total !== 0) {
            // return to launcher - square pressed    
            if (edgeTrigger(this.startPressed,this.input.gamepad.getPad(0).buttons[0].pressed)) {
                this.scene.start('Breakout');
            }
            if (edgeTrigger(this.quitPressed,this.input.gamepad.getPad(0).buttons[2].pressed)) {
                this.scene.start('QuitGame');
            }
        }
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
    scene: [ SplashScreen, Breakout, QuitGame, GameOver, UIScene ],
    physics: {
        default: 'arcade'
    },
    input: {
        gamepad: true
    }
};

const game = new Phaser.Game(config);

/**
 
https://phaser.io/examples/v3.85.0/fx/glow/view/glow-text


firework
https://codepen.io/samme/pen/ZEdpMBv



class Starfield extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'Starfield', active: true });

        this.stars;

        this.distance = 300;
        this.speed = 250;

        this.max = 500;
        this.xx = [];
        this.yy = [];
        this.zz = [];
    }

    preload ()
    {
        this.load.setBaseURL('https://cdn.phaserfiles.com/v355');
        this.load.image('star', 'assets/demoscene/star4.png');
    }

    create ()
    {
        //  Do this, otherwise this Scene will steal all keyboard input
        this.input.keyboard.enabled = false;

        this.stars = this.add.blitter(0, 0, 'star');

        for (let i = 0; i < this.max; i++)
        {
            this.xx[i] = Math.floor(Math.random() * 800) - 400;
            this.yy[i] = Math.floor(Math.random() * 600) - 300;
            this.zz[i] = Math.floor(Math.random() * 1700) - 100;

            let perspective = this.distance / (this.distance - this.zz[i]);
            let x = 400 + this.xx[i] * perspective;
            let y = 300 + this.yy[i] * perspective;

            this.stars.create(x, y);
        }
    }

    update (time, delta)
    {
        for (let i = 0; i < this.max; i++)
        {
            let perspective = this.distance / (this.distance - this.zz[i]);
            let x = 400 + this.xx[i] * perspective;
            let y = 300 + this.yy[i] * perspective;

            this.zz[i] += this.speed * (delta / 1000);

            if (this.zz[i] > 300)
            {
                this.zz[i] -= 600;
            }

            let bob = this.stars.children.list[i];

            bob.x = x;
            bob.y = y;
        }
    }

}









Shine .... https://phaser.io/examples/v3.85.0/fx/shine/view/tilemap-layer-shine
https://phaser.io/examples/v3.85.0/fx/shine/view/blitter-shine




 */