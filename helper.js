// helper.js

export function edgeTrigger(stateObj, currentValue) {
    // Wenn der Wert einmal true war und jetzt false ist
    if (stateObj.value && !currentValue) {
        stateObj.value = false;  // Zurücksetzen
        return true;  // Bedingung erfüllt
    }
    // Wenn der aktuelle Wert true ist, merken
    if (currentValue) {
        stateObj.value = true;
    }
    return false;  // Noch nicht erfüllt
}

export function isElectron() {
    return !!(typeof process !== 'undefined' && process.versions && process.versions.electron);
}

export function checkGamepadIndex(actualIndex,numPads) {
    if (actualIndex>numPads) {      // prüfen, ob der aktuelle Index größer als Pads -> Pad offenbar abgesteckt
        return 0;   // 
    }
    else {
        return actualIndex;     // ja, pad gibt es
    }
}




