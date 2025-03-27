//  Direction consts
const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

const GRID_X = 40;
const GRID_Y = 30;

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

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.snake=null;
        this.food=null;
        this.cursors=null;
    }

    preload ()
    {
        this.load.setBaseURL('https://cdn.phaserfiles.com/v385');
        this.load.image('food', 'assets/games/snake/food.png');
        this.load.image('body', 'assets/games/snake/body.png');
    }

    create ()
    {
        var Food = new Phaser.Class({

            Extends: Phaser.GameObjects.Image,

            initialize:

            function Food (scene, x, y)
            {
                Phaser.GameObjects.Image.call(this, scene)

                this.setTexture('food');
                this.setPosition(x * 16, y * 16);
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

                this.head = this.body.create(x * 16, y * 16, 'body');
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
                Phaser.Actions.ShiftPosition(this.body.getChildren(), this.headPosition.x * 16, this.headPosition.y * 16, 1, this.tail);

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

                    var bx = segment.x / 16;
                    var by = segment.y / 16;

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
    * We can place the food anywhere in our GRID_Xx30 grid
    * *except* on-top of the snake, so we need
    * to filter those out of the possible food locations.
    * If there aren't any locations left, they've won!
    *
    * @method repositionFood
    * @return {boolean} true if the food was placed, otherwise false
    */
    repositionFood ()
    {
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
            this.food.setPosition(pos.x * 16, pos.y * 16);

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
            pad = this.input.gamepad.getPad(0);
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
                this.scene.start('GameOver');
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
            this.scene.start('GameOver');
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

var config = {
    type: Phaser.WEBGL,
    width: 640,
    height: 480,
    backgroundColor: '#bfcc00',
    parent: 'phaser-example',
    scene: [MainScene, GameOver],
    input: {
        gamepad: true
    }
};

var game = new Phaser.Game(config);