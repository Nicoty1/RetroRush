import { edgeTrigger, isElectron, checkGamepadIndex} from '../helper.js';
import { loadHighscores,  insertHighscore, isHighscore, getHighestScore } from '../highscoremanager.js';
import { TextStyles } from './styles/textStyles.js';
//  Direction consts
const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

const GRID_X = 50;
const GRID_Y = 30;
const GRID_SIZE = 16;

class InitGame extends Phaser.Scene {
    constructor ()
    {
        super({ key: 'InitGame' });
    }
    create () {
        const storedIndex = localStorage.getItem('selectedPadRetroRush');
        gamepadToUse = storedIndex !== null ? parseInt(storedIndex, 10) : 0;
        if (isElectron()) {
            this.input.setDefaultCursor('none')
        }
        this.scene.start('SplashScreen')
    }
}


class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.snake=null;
        this.food=null;
        this.cursors=null;
    }

    preload ()
    {
        this.load.setBaseURL('.');
        this.load.image('food', 'assets/food.png');
        this.load.image('body', 'assets/body.png');
        this.load.image('head', 'assets/head.png');
        this.load.image('grass', 'assets/grass03.png');
    }

    create ()
    {
        score = 0;  // globale variable
        highScore = getHighestScore('Snake');

        this.background = this.add.image(0, 0, 'grass').setOrigin(0);

        // Bildschirmbreite und -höhe ermitteln
        const { width, height } = this.sys.game.config;
    
        // Hintergrund skalieren
        this.background.setDisplaySize(width, height);

        this.scoreText=this.add.text(20,20,'Score: '+score,TextStyles.score);
        this.highScoreText=this.add.text(230,20,'Highscore: '+highScore,TextStyles.highscore);

        var Food = new Phaser.Class({

            Extends: Phaser.GameObjects.Image,

            initialize:

            function Food (scene, x, y)
            {
                Phaser.GameObjects.Image.call(this, scene)

                this.setTexture('food');
                this.setPosition(x * GRID_SIZE, y * GRID_SIZE);
                this.setOrigin(0);

                this.total = 0;

                scene.children.add(this);
            },

            eat: function ()
            {
                this.total++;
            }

        });

        var Snake = new Phaser.Class({

            initialize:

            function Snake (scene, x, y)
            {
                this.headPosition = new Phaser.Geom.Point(x, y);

                this.body = scene.add.group();

                this.head = this.body.create(x * GRID_SIZE, y * GRID_SIZE, 'head');
                this.head.setOrigin(0);

                this.alive = true;

                this.speed = 100;

                this.moveTime = 0;

                this.tail = new Phaser.Geom.Point(x, y);

                this.heading = RIGHT;
                this.direction = RIGHT;
            },

            update: function (time)
            {
                if (time >= this.moveTime)
                {
                    return this.move(time);
                }
            },

            faceLeft: function ()
            {
                if (this.direction === UP || this.direction === DOWN)
                {
                    this.heading = LEFT;
                }
            },

            faceRight: function ()
            {
                if (this.direction === UP || this.direction === DOWN)
                {
                    this.heading = RIGHT;
                }
            },

            faceUp: function ()
            {
                if (this.direction === LEFT || this.direction === RIGHT)
                {
                    this.heading = UP;
                }
            },

            faceDown: function ()
            {
                if (this.direction === LEFT || this.direction === RIGHT)
                {
                    this.heading = DOWN;
                }
            },

            move: function (time)
            {
                /**
                * Based on the heading property (which is the direction the pgroup pressed)
                * we update the headPosition value accordingly.
                * 
                * The Math.wrap call allow the snake to wrap around the screen, so when
                * it goes off any of the sides it re-appears on the other.
                */
                switch (this.heading)
                {
                    case LEFT:
                        this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x - 1, 0, GRID_X);
                        break;

                    case RIGHT:
                        this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x + 1, 0, GRID_X);
                        break;

                    case UP:
                        this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y - 1, 0, GRID_Y);
                        break;

                    case DOWN:
                        this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y + 1, 0, GRID_Y);
                        break;
                }

                this.direction = this.heading;

                //  Update the body segments and place the last coordinate into this.tail
                Phaser.Actions.ShiftPosition(this.body.getChildren(), this.headPosition.x * GRID_SIZE, this.headPosition.y * GRID_SIZE, 1, this.tail);

                //  Check to see if any of the body pieces have the same x/y as the head
                //  If they do, the head ran into the body

                var hitBody = Phaser.Actions.GetFirst(this.body.getChildren(), { x: this.head.x, y: this.head.y }, 1);

                if (hitBody)
                {
                    console.log('dead');

                    this.alive = false;

                    return false;
                }
                else
                {
                    //  Update the timer ready for the next movement
                    this.moveTime = time + this.speed;

                    return true;
                }
            },

            grow: function ()
            {
                var newPart = this.body.create(this.tail.x, this.tail.y, 'body');

                newPart.setOrigin(0);
            },

            collideWithFood: function (food)
            {
                if (this.head.x === food.x && this.head.y === food.y)
                {
                    this.grow();

                    food.eat();

                    //  For every 5 items of food eaten we'll increase the snake speed a little
                    if (this.speed > 20 && food.total % 5 === 0)
                    {
                        this.speed -= 5;
                    }

                    return true;
                }
                else
                {
                    return false;
                }
            },

            updateGrid: function (grid)
            {
                //  Remove all body pieces from valid positions list
                this.body.children.each(function (segment) {

                    var bx = segment.x / GRID_SIZE;
                    var by = segment.y / GRID_SIZE;

                    grid[by][bx] = false;

                });

                return grid;
            }

        });

        this.food = new Food(this, 3, 4);

        this.snake = new Snake(this, 8, 8);

        //  Create our keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    /**
    * We can place the food anywhere in our grid
    * *except* on-top of the snake, so we need
    * to filter those out of the possible food locations.
    * If there aren't any locations left, they've won!
    *
    * @method repositionFood
    * @return {boolean} true if the food was placed, otherwise false
    */
    repositionFood ()
    {
        score += 10;
        this.scoreText.setText('Score: '+score);
        if (score >30) {
            this.scene.start('GameOver');
        }


        //  First create an array that assumes all positions
        //  are valid for the new piece of food

        //  A Grid we'll use to reposition the food each time it's eaten
        var testGrid = [];

        for (var y = 0; y < GRID_Y; y++)
        {
            testGrid[y] = [];

            for (var x = 0; x < GRID_X; x++)
            {
                testGrid[y][x] = true;
            }
        }

        this.snake.updateGrid(testGrid);

        //  Purge out false positions
        var validLocations = [];

        for (var y = 0; y < GRID_Y; y++)
        {
            for (var x = 0; x < GRID_X; x++)
            {
                if (testGrid[y][x] === true)
                {
                    //  Is this position valid for food? If so, add it here ...
                    validLocations.push({ x: x, y: y });
                }
            }
        }

        if (validLocations.length > 0)
        {
            //  Use the RNG to pick a random food position
            var pos = Phaser.Math.RND.pick(validLocations);

            //  And place it
            this.food.setPosition(pos.x * GRID_SIZE, pos.y * GRID_SIZE);

            return true;
        }
        else
        {
            return false;
        }
    }

    update (time, delta)
    {
        if (!this.snake.alive)
        {
            console.log("Snake hat sich gegessen ;-)")
            // Switch to Gameove once its ready
            this.scene.start('GameOver');
            return;
        }
        /**
        * Check which key is pressed, and then change the direction the snake
        * is heading based on that. The checks ensure you don't double-back
        * on yourself, for example if you're moving to the right and you press
        * the LEFT cursor, it ignores it, because the only valid directions you
        * can move in at that time is up and down.
        */
        if (this.input.gamepad.total !== 0) {
            let pad;
            pad = this.input.gamepad.getPad(gamepadToUse);
            if (pad.left)
            {
                this.snake.faceLeft();
            }
            else if (pad.right)
            {
                this.snake.faceRight();
            }
            else if (pad.up)
            {
                this.snake.faceUp();
            }
            else if (pad.down)
            {
                this.snake.faceDown();
            }
            else if (pad.X) {
                console.log("Square pressed")
                //this.scene.start('GameOver');
                this.scene.start('QuitGame');
            }
        }

        if (this.cursors.left.isDown)
        {
            this.snake.faceLeft();
        }
        else if (this.cursors.right.isDown)
        {
            this.snake.faceRight();
        }
        else if (this.cursors.up.isDown)
        {
            this.snake.faceUp();
        }
        else if (this.cursors.down.isDown)
        {
            this.snake.faceDown();
        } 

        if (this.input.activePointer.rightButtonDown()) {
            console.log("Mouse right pressed")
            this.scene.start('QuitGame');
        }

        if (this.snake.update(time))
        {
            //  If the snake updated, we need to check for collision against food

            if (this.snake.collideWithFood(this.food))
            {
                this.repositionFood();
            }
        }

    }


}

class QuitGame extends Phaser.Scene {
    constructor ()
    {
        super({ key: 'QuitGame' });
    }
    create () {
        if (isHighscore('Snake',score)) {
            insertHighscore('Snake', 'SON', score);
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

    preload() {
        this.load.setBaseURL('.');
        this.load.image('gameover', 'assets/gameover.jpg'); // Pfad zum Bild
    }

    create() {
        this.background = this.add.image(0, 0, 'gameover').setOrigin(0);
        this.background.setAlpha(0.5); 

        // Bildschirmbreite und -höhe ermitteln
        const { width, height } = this.sys.game.config;
    
        // Hintergrund skalieren
        this.background.setDisplaySize(width, height);

        this.add.text(this.scale.width / 2,this.scale.height - 20,'Drücke <Start> oder die Maustaste um fortzufahren',  TextStyles.pressakey,).setOrigin(0.5, 1);                       // Ursprung: Mitte unten
        // Game Over Text erstellen
        this.add.text(width / 2, height / 2 - (height * 0.125), 'GAME', TextStyles.gameover(height)).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + (height * 0.125), 'OVER', TextStyles.gameover(height)).setOrigin(0.5);

        if (isHighscore('Snake',score)) {
            insertHighscore('Snake', 'SON', score);
        }
    }

    update() {
        console.log('update started');
        if (edgeTrigger(this.mousePressed,this.input.activePointer.isDown)) {
            this.scene.start('SplashScreen');  // Szene starten           
        }    
        if (edgeTrigger(this.spacePressed,this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).isDown)) {
            this.scene.start('SplashScreen');  // Szene starten           
        }    
        if (this.input.gamepad.total !== 0) {
            // return to launcher - square pressed    
            if (edgeTrigger(this.startPressed,this.input.gamepad.getPad(gamepadToUse).buttons[0].pressed)) {
                this.scene.start('SplashScreen');
            }
            if (edgeTrigger(this.quitPressed,this.input.gamepad.getPad(gamepadToUse).buttons[2].pressed)) {
                this.scene.start('SplashScreen');
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
        this.closeButton = this.add.text(this.scale.width - 30, 30, 'X', TextStyles.closebutton).setInteractive();
        // Zentrieren (damit das "X" nicht abgeschnitten ist)
        this.closeButton.setOrigin(0.5);
        // Klick-Ereignis hinzufügen
        this.closeButton.on('pointerdown', () => {this.scene.start('QuitGame')}, this); 
        this.input.keyboard.on('keydown-ESC', () => {this.scene.start('QuitGame')}, this);
    }
}

class SplashScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'SplashScreen' });
        this.mousePressed = { value: false };
        this.spacePressed = { value: false };
        this.startPressed = { value: false };
        this.quitPressed = { value: false };
    }

    preload() {
        this.load.setBaseURL('.');
        this.load.image('background', 'assets/splashscreen.jpg'); // Pfad zum Bild
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
            'Drücke <Start> oder die Maustaste um fortzufahren',TextStyles.pressakey).setOrigin(0.5, 1);                       // Ursprung: Mitte unten
    }

    update () {
        if (edgeTrigger(this.mousePressed,this.input.activePointer.isDown)) {
            this.scene.start('MainScene');  // Szene starten           
        }    
        if (edgeTrigger(this.spacePressed,this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).isDown)) {
            this.scene.start('MainScene');  // Szene starten           
        }    
        if (this.input.gamepad.total !== 0) {
            gamepadToUse=checkGamepadIndex(gamepadToUse,this.input.gamepad.total);
            if (edgeTrigger(this.startPressed,this.input.gamepad.getPad(gamepadToUse).A)) {
                this.scene.start('MainScene');
            }
            if (edgeTrigger(this.quitPressed,this.input.gamepad.getPad(gamepadToUse).X)) {
                this.scene.start('QuitGame');
            }
        }
    }
}



const xsize = 800  // 796
const ysize = 480  // 476
let score = 0;
let highScore = 0;
let gamepadToUse = 0;

var config = {
    type: Phaser.WEBGL,
    width: xsize,
    height: ysize,
    backgroundColor: '#000000',
    parent: 'phaser-example',
    scene: [InitGame, SplashScreen, MainScene, GameOver, UIScene, QuitGame],
    input: {
        gamepad: true
    }
};

var game = new Phaser.Game(config);