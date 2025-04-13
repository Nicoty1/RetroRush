import { edgeTrigger, isElectron} from '../helper.js';

class InitGame extends Phaser.Scene {
    constructor ()
    {
        super({ key: 'InitGame' });
    }
    create () {
        const storedIndex = localStorage.getItem('selectedPadRetroRush');
        if (storedIndex!==null) {
            gamepadToUse=storedIndex;
        }
        if (isElectron()) {
            this.input.setDefaultCursor('none')
        }
        this.scene.start('MainScene')
    }
}

class GameOver extends Phaser.Scene {
    constructor ()
    {
        super({ key: 'GameOver' });
    }
    create () {
        // Zerstört das Spiel sofort
        localStorage.setItem('selectedPadRetroRush', gamepadToUse);
        console.log(`Gamepad-Index ${gamepadToUse} gespeichert.`);
        this.game.destroy(true);
        window.location.href = "../index.html";
    }
}

class MainScene extends Phaser.Scene
{
    text;

    constructor ()
    {
        super({ key: 'MainScene' });
    }

    preload ()
    {
        this.load.setBaseURL('.');
        this.load.image('sky', 'assets/lightblue.png');
        this.input.gamepad.once('connected', (pad) => {
            console.log(`Gamepad angeschlossen: ${pad.id}`);
            //this.activeGamepad = pad;
        });
        if (isElectron()) {
            this.input.setDefaultCursor('none')
        }
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
        this.input.keyboard.on('keydown-ESC', () => {this.scene.start('GameOver')}, this);
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {              
                this.scene.start('GameOver');
            }
        });
        console.log(`Verwendeter Gamepad-Index: ${gamepadToUse}`);
    }

    update ()
    {
        const debug = [];
        const pads = this.input.gamepad.gamepads;

        //console.log(this.input.gamepad.total);

        if (this.input.gamepad.total !== 0) {
            
            
            // const pads = this.input.gamepad.gamepads;

            // var pads = this.input.gamepad.getAll();
            // var pads = navigator.getGamepads();

            for (let i = 0; i < pads.length; i++)
            {
                const pad = pads[i];

                if (!pad)
                {
                    continue;
                }

                if (pad.index==gamepadToUse) {
                    debug.push(`Das ist das aktuell selektierte Gamepad`);
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
                    if (button.value!==0) {
                        gamepadToUse=pad.index;
                    }
                    // Zeilenumbruch nach 9 Buttons (0-8)
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
            let gamepad = pads[gamepadToUse];
            if (gamepad.left) {
                debug.push('<link> gedrückt');
            }
            else {
                debug.push('<link> nicht gedrückt');
            }
            if (gamepad.right) {
                debug.push('<right> gedrückt');
            }
            else {
                debug.push('<right> nicht gedrückt');
            }
            if (gamepad.up) {
                debug.push('<up> gedrückt');
            }
            else {
                debug.push('<up> nicht gedrückt');
            }
            if (gamepad.down) {
                debug.push('<down> gedrückt');
            }
            else {
                debug.push('<down> nicht gedrückt');
            }
            if (gamepad.A) {
                debug.push('<Start> gedrückt');
            }
            else {
                debug.push('<Start> nicht gedrückt');
            }
            if (gamepad.X) {
                debug.push('<Exit> gedrückt');
            }
            else {
                debug.push('<Exit> nicht gedrückt');
            }
        }
        //this.text.setVisible(false);
        debug.push(`Das aktuell selektierte Gamepad hat den Index ${gamepadToUse}`);
        this.text.setText(debug);
        //this.text.setVisible(true);
    }
}

let gamepadToUse = 0;

const config = {
    type: Phaser.WEBGL,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    scene: [InitGame, MainScene, GameOver],
    input: {
        gamepad: true
    }
};

const game = new Phaser.Game(config);

/**
 *
 * class GamepadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GamepadScene' });
        this.selectedGamepadIndex = null;
    }

    create() {
        // Gamepad-Verbindung überwachen
        this.input.gamepad.on('connected', (pad) => {
            console.log(`Gamepad ${pad.index} angeschlossen: ${pad.id}`);
            this.displayGamepadInfo();
        });

        // Vorhandene Gamepads anzeigen
        this.displayGamepadInfo();

        // Auf eine beliebige Taste eines Gamepads warten
        this.input.gamepad.on('down', (pad, button) => {
            console.log(`Taste ${button.index} auf Gamepad ${pad.index} gedrückt.`);
            this.selectedGamepadIndex = pad.index;

            // Index im Local Storage speichern
            localStorage.setItem('selectedGamepad', pad.index);
            console.log(`Gamepad-Index ${pad.index} gespeichert.`);
        });
    }

    // Zeigt die Informationen aller verbundenen Gamepads an
    displayGamepadInfo() {
        if (this.input.gamepad.total === 0) {
            console.log("Keine Gamepads angeschlossen.");
            return;
        }

        console.log("Angeschlossene Gamepads:");
        this.input.gamepad.gamepads.forEach((pad) => {
            if (pad) {
                console.log(`Index: ${pad.index}, ID: ${pad.id}, Tasten: ${pad.buttons.length}`);
            }
        });
    }
}


zugriff: 


 * 
 */