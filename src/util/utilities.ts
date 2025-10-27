export const toMillis = (timeString: string) => {
    // Example input: 1s, 500ms, 1m, 2h
    const timePattern = /^(\d+)(ms|s|m|h)$/;
    const match = timeString.match(timePattern);

    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case "ms":
            return value;
        case "s":
            return value * 1000;
        case "m":
            return value * 1000 * 60;
        case "h":
            return value * 1000 * 60 * 60;
        default:
            return 0;
    }
}