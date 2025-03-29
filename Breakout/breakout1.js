class Breakout extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'breakout' });

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

        this.closeButton = this.add.text(this.scale.width - 30, 30, 'X', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setInteractive();
        // Zentrieren (damit das "X" nicht abgeschnitten ist)
        this.closeButton.setOrigin(0.5);
        // Klick-Ereignis hinzufügen
        this.closeButton.on('pointerdown', () => {this.scene.start('GameOver')}, this);       

    }

    hitBrick (ball, brick)
    {
        brick.disableBody(true, true);
        this.soundhitbrick.play();
        if (this.bricks.countActive() === 0)
        {
            this.resetLevel();
        }

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
    }

    update ()
    {
        if (this.ball.y > ysize)
        {
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



    }
}

class GameOver extends Phaser.Scene {
    constructor ()
    {
        super({ key: 'GameOver' });
    }
    create () {
      // Zerstört das Spiel sofort
      this.game.destroy(true);
      window.location.href = "../index.html";
    }
}

const xsize = 800  // 796
const ysize = 480  // 476

const config = {
    type: Phaser.WEBGL,
    width: xsize,
    height: ysize,
    parent: 'phaser-example',
    scene: [ Breakout, GameOver  ],
    physics: {
        default: 'arcade'
    },
    input: {
        gamepad: true
    }
};


const game = new Phaser.Game(config);


/*
function endGameAndRedirect() {
    // Phaser Spiel beenden und Ressourcen freigeben
    if (game && game.destroy) {
      game.destroy(true);
    }
    
    // Weiterleitung auf eine andere Webseite
    window.location.href = 'https://www.deine-neue-seite.de';
  }
  
  // Beispiel: Funktion aufrufen, wenn das Spiel vorbei ist
  // (z.B. im Game Over-Event oder einem Button-Klick)
  endGameAndRedirect();



  class Example extends Phaser.Scene
{
    preload ()
    {
        this.load.setBaseURL('https://cdn.phaserfiles.com/v385');
        this.load.audio('theme', [
            'assets/audio/oedipus_wizball_highscore.ogg',
            'assets/audio/oedipus_wizball_highscore.mp3'
        ]);

        this.load.image('wizball', 'assets/sprites/wizball.png');
    }

    create ()
    {
        this.add.image(400, 300, 'wizball').setScale(4);

        const music = this.sound.add('theme');

        music.play();

        this.sound.pauseOnBlur = true;
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    pixelArt: true,
    scene: Example
};

const game = new Phaser.Game(config);





https://labs.phaser.io/view.html?src=src%5Cinput%5Cgamepad%5Cgamepad%20debug.js





class Example extends Phaser.Scene
{
    text;

    preload ()
    {
        this.load.setBaseURL('https://cdn.phaserfiles.com/v385');
        this.load.image('sky', 'assets/skies/lightblue.png');
    }

    create ()
    {
        this.add.image(0, 0, 'sky').setOrigin(0);

        this.text = this.add.text(10, 30, '', { font: '16px Courier', fill: '#ffffff' });
    }

    update ()
    {
        if (this.input.gamepad.total === 0)
        {
            return;
        }

        const debug = [];
        const pads = this.input.gamepad.gamepads;

        // var pads = this.input.gamepad.getAll();
        // var pads = navigator.getGamepads();

        for (let i = 0; i < pads.length; i++)
        {
            const pad = pads[i];

            if (!pad)
            {
                continue;
            }

            //  Timestamp, index. ID
            debug.push(pad.id);
            debug.push(`Index: ${pad.index} Timestamp: ${pad.timestamp}`);

            //  Buttons

            let buttons = '';

            for (let b = 0; b < pad.buttons.length; b++)
            {
                const button = pad.buttons[b];

                buttons = buttons.concat(`B${button.index}: ${button.value}  `);

                // buttons = buttons.concat('B' + b + ': ' + button.value + '  ');

                if (b === 8)
                {
                    debug.push(buttons);
                    buttons = '';
                }
            }
            
            debug.push(buttons);

            //  Axis

            let axes = '';

            for (let a = 0; a < pad.axes.length; a++)
            {
                const axis = pad.axes[a];

                axes = axes.concat(`A${axis.index}: ${axis.getValue()}  `);

                // axes = axes.concat('A' + a + ': ' + axis + '  ');

                if (a === 1)
                {
                    debug.push(axes);
                    axes = '';
                }
            }
            
            debug.push(axes);
            debug.push('');
        }
        
        this.text.setText(debug);
    }
}

const config = {
    type: Phaser.WEBGL,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    input: {
        gamepad: true
    },
    scene: Example
};

const game = new Phaser.Game(config);

*/  