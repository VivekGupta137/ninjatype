export enum KBSTATE {
    LOADING, // the keyboard is not mounted yet
    NOT_FOCUSSED, // the keyboard is mounted but not focused
    FOCUSSED, // the keyboard is focused
}

export enum KBTYPINGSTATE {
    IDLE, // the User has not typed yet
    TYPING, // the User has started typing
    COMPLETED, // the User has completed typing
}