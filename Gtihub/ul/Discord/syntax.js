class Tag {
    constructor(input) {
        this.user = +input > 0 ? `@${input}` : null;
        this.role = +input > 0 ? `@&${input}` : null;
        this.channel = +input > 0 ? `#${input}` : null;

        Object.keys(this).map(key => {
            if (this[key] == null) return;
            this[key] = `<${this[key]}>`;
        })
    }
}

function tag(input) {
    return new Tag(input);
}

function tagClean(input) {
    return typeof input === "string" ? input.split("").filter(item => !(item === " ") && Number(item) >= 0).join("") : undefined;
}

function emote(input, animated, inputName, link) {
    return +input > 0 ? `${link ? `https://cdn.discordapp.com/emojis/${input}.png` : `<${animated ? `a`: ``}:${typeof inputName === "string" ? inputName : "woof"}:${input}>`}` : input;
}


module.exports = {
    tag: tag,
    tagClean: tagClean,
    emote: emote
}