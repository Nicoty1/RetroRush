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

class MainScene extends Phaser.Scene
{
    text;

    preload ()
    {
        this.load.setBaseURL('.');
        this.load.image('sky', 'assets/lightblue.png');
        this.input.setDefaultCursor('none')
    }

    create ()
    {
        this.add.image(0, 0, 'sky').setOrigin(0);
        this.text = this.add.text(10, 30, '', { font: '16px Courier', fill: '#ffffff' });

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

    update ()
    {
        const debug = [];
        if (this.input.gamepad.total === 0)
        {
            return;
        }


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
        this.text.setVisible(false);
        this.text.setText(debug);
        this.text.setVisible(true);
    }
}

const config = {
    type: Phaser.WEBGL,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    scene: [MainScene, GameOver],
    input: {
        gamepad: true
    }
};

const game = new Phaser.Game(config);