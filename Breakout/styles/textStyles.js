export const TextStyles = {
    gameover: (height) => ({
        fontFamily: 'Arial',
        fontSize: `${height * 0.25}px`,  // ca. die Hälfte des Bildschirms
        color: '#ffffff',               // Textfarbe (Weiß)
        stroke: '#00008B',
        strokeThickness: 8,             // Dicke der Outline
        align: 'center'
    }),
    score: {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold'
    },
        baelle: {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold'
    },
    highscore: {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold'
    },
    closebutton: {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold'
    },
    pressakey: {
        fontSize: '18px',               // Schriftgröße
        fontFamily: 'Arial',            // Schriftart
        color: '#ffffff',               // Textfarbe (Weiß)
        align: 'center'                 // Zentrierte Ausrichtung
    }
};