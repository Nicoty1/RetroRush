// Hilfsfunktion zur Erkennung von Electron
function isElectron() {
    return typeof process !== 'undefined' && process.versions && !!process.versions.electron;
}

// Speicherfunktion (dynamisch)
export function saveHighscores(gameName, highscores) {
    if (isElectron()) {
        // Elektron: Lokale Datei speichern
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, 'highscores.json');

        try {
            let allHighscores = {};
            if (fs.existsSync(filePath)) {
                allHighscores = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            }
            allHighscores[gameName] = highscores;
            fs.writeFileSync(filePath, JSON.stringify(allHighscores, null, 2));
            console.log("Highscores (Electron) gespeichert!");
        } catch (error) {
            console.error("Fehler beim Speichern der Highscores in Electron:", error);
        }
    } else {
        // Browser: Local Storage nutzen
        try {
            localStorage.setItem(gameName, JSON.stringify(highscores));
            console.log("Highscores (Browser) gespeichert!");
        } catch (error) {
            console.error("Fehler beim Speichern der Highscores im Browser:", error);
        }
    }
}

// Ladefunktion (dynamisch)
export function loadHighscores(gameName) {
    if (isElectron()) {
        // Electron: Lokale Datei laden
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, 'highscores.json');

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
            console.error("Fehler beim Laden der Highscores in Electron:", error);
            return Array(5).fill({ name: "---", score: 0 });
        }
    } else {
        // Browser: Local Storage laden
        try {
            const data = localStorage.getItem(gameName);
            if (data) {
                return JSON.parse(data);
            }
            return Array(5).fill({ name: "---", score: 0 });
        } catch (error) {
            console.error("Fehler beim Laden der Highscores im Browser:", error);
            return Array(5).fill({ name: "---", score: 0 });
        }
    }
}
