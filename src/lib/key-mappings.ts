export const keyMappings : { [key: string]: number } = {
    "*": 42,
    "+": 43,
    "@": 64,
    "ArrowDown": 17,
    "ArrowLeft": 157,
    "ArrowRight": 29,
    "ArrowUp": 145,
    "Clear": 19,
    "Control+0": 146,
    "Control+1": 144,
    "Control+2": 5,
    "Control+3": 28,
    "Control+4": 159,
    "Control+5": 156,
    "Control+6": 30,
    "Control+7": 31,
    "Control+8": 158,
    "Control+9": 18,
    "Control+:": 27,
    "Control+;": 29,
    "Control+=": 31,
    "Control+@": 0,
    "Control+a": 1,
    "Control+b": 2,
    "Control+c": 3,
    "Control+d": 4,
    "Control+e": 5,
    "Control+f": 6,
    "Control+g": 7,
    "Control+h": 8,
    "Control+i": 9,
    "Control+j": 10,
    "Control+k": 11,
    "Control+l": 12,
    "Control+m": 13,
    "Control+n": 14,
    "Control+o": 15,
    "Control+p": 16,
    "Control+q": 17,
    "Control+r": 18,
    "Control+s": 19,
    "Control+t": 20,
    "Control+u": 21,
    "Control+v": 22,
    "Control+w": 23,
    "Control+x": 24,
    "Control+y": 25,
    "Control+z": 26,
    "Control+£": 28,
    "Enter": 13,
    "F1": 133,
    "F3": 134,
    "F5": 135,
    "F7": 136,
    "Backspace": 20,
    "Shift+": 63,
    "Shift+*": 192,
    "Shift++": 219,
    "Shift+-": 221,
    "Shift+.": 62,
    "Shift+1": 33,
    "Shift+2": 34,
    "Shift+3": 35,
    "Shift+4": 36,
    "Shift+5": 37,
    "Shift+6": 38,
    "Shift+7": 39,
    "Shift+8": 40,
    "Shift+9": 41,
    "Shift+:": 91,
    "Shift+;": 93,
    //"Shift+Clear": 147,
    "Shift+Enter": 141,
    "F2": 137,
    "F4": 138,
    "F6": 139,
    "F8": 140,
    "Shift+Backspace": 148,
    "Shift+ ": 160,
    "Space": 32,
    "Tab++": 166,
    "Tab+-": 220,
    "Tab+1": 129,
    "Tab+2": 149,
    "Tab+3": 150,
    "Tab+4": 151,
    "Tab+5": 152,
    "Tab+6": 153,
    "Tab+7": 154,
    "Tab+8": 155,
    "Tab+@": 164,
    "Tab+a": 176,
    "Tab+b": 191,
    "Tab+c": 188,
    "Tab+d": 172,
    "Tab+e": 177,
    "Tab+f": 187,
    "Tab+g": 165,
    "Tab+h": 180,
    "Tab+i": 162,
    "Tab+j": 181,
    "Tab+k": 161,
    "Tab+l": 182,
    "Tab+m": 167,
    "Tab+n": 170,
    "Tab+o": 185,
    "Tab+p": 175,
    "Tab+q": 171,
    "Tab+r": 178,
    "Tab+s": 174,
    "Tab+t": 163,
    "Tab+u": 184,
    "Tab+v": 190,
    "Tab+w": 179,
    "Tab+x": 189,
    "Tab+y": 183,
    "Tab+z": 173,
    "Tab+£": 168,
    "£": 92,
    //"Control+↑ (up arrow)": 30,
    //"← (left arrow)": 95
    //"↑ (up arrow)": 94,
};

export const enum joyportBits {
    UP =     0x01,
    DOWN =   0x02,
    LEFT =   0x04,
    RIGHT =  0x08,
    FIRE =   0x10,
    ALL =    0x1f,
}

export const controllerMappings : { [key: string]: number } = {
    "2": joyportBits.DOWN,
    "4": joyportBits.LEFT,
    "6": joyportBits.RIGHT,
    "8": joyportBits.UP,

    "1": joyportBits.DOWN | joyportBits.LEFT,
    "3": joyportBits.DOWN | joyportBits.RIGHT,
    "7": joyportBits.UP   | joyportBits.LEFT,
    "9": joyportBits.UP   | joyportBits.RIGHT,

    "Enter": joyportBits.FIRE,
}