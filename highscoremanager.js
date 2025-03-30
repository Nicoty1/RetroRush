const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'highscores.json');

// Hilfsfunktion zum Laden der Highscores
function loadHighscores(gameName) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const highscores = JSON.parse(data);

            if (highscores[gameName] && highscores[gameName].length > 0) {
                return highscores[gameName];
            }
        }
        return Array(5).fill({ name: "---", score: 0 });
    } catch (error) {
        console.error("Fehler beim Laden der Highscores:", error);
        return Array(5).fill({ name: "---", score: 0 });
    }
}

// Hilfsfunktion zum Speichern der Highscores
function saveHighscores(gameName, highscores) {
    try {
        let allHighscores = {};
        if (fs.existsSync(filePath)) {
            allHighscores = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        allHighscores[gameName] = highscores;
        fs.writeFileSync(filePath, JSON.stringify(allHighscores, null, 2));
    } catch (error) {
        console.error("Fehler beim Speichern der Highscores:", error);
    }
}

// Überprüfen, ob ein Score unter die Top 5 kommt
function isHighscore(gameName, score) {
    const highscores = loadHighscores(gameName);
    // Prüfen, ob der Score größer als der schlechteste in der Liste ist
    return score > highscores[4].score;
}

// Score einfügen und sortieren
function insertHighscore(gameName, playerName, score) {
    // Highscores laden
    let highscores = loadHighscores(gameName);

    // Neuen Score einfügen
    highscores.push({ name: playerName.substring(0, 3), score: score });

    // Nach Score absteigend sortieren
    highscores.sort((a, b) => b.score - a.score);

    // Nur die Top 5 behalten
    highscores = highscores.slice(0, 5);

    // Gespeicherte Highscores aktualisieren
    saveHighscores(gameName, highscores);
    console.log(`Neuer Highscore hinzugefügt: ${playerName} - ${score}`);
}

// Höchsten Highscore für ein Spiel zurückgeben
function getHighestScore(gameName) {
    const highscores = loadHighscores(gameName);
    // Der höchste Highscore ist der erste in der sortierten Liste
    return highscores[0]?.score || 0;
}

// Korrekte Exporte
module.exports = { loadHighscores, isHighscore, insertHighscore, getHighestScore };
