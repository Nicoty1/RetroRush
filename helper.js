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


