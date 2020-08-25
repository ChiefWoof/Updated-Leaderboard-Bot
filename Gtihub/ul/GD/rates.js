const emotes = require("../Discord/emotes.json");

function getRate(returnEmote, lvlRaw, stars, featured, epic, legendary, difficultyFace){
    let returnValue, selection;
    
    if (typeof lvlRaw === 'object' && lvlRaw != null) {
        stars = lvlRaw.stars;
        featured = lvlRaw.featureScore;
        epic = lvlRaw.epic;
        legendary = lvlRaw.legendary;
        difficultyFace = lvlRaw.difficultyFace;
    };

    if (+difficultyFace > 0 && +difficultyFace < 7) {
        returnValue = +difficultyFace == 6 ? emotes.rates[30][1][0] : emotes.rates[(+difficultyFace)*10][0][0];
    } else if (difficultyFace == null || +difficultyFace > 9) {
        selection = emotes.rates[+difficultyFace > 9 ? difficultyFace : +stars === 1 ? "auto" : +stars === 10 ? 30 : Math.ceil((+stars)/2)*10];
    };

    if (Array.isArray(selection) ? selection.length > 0 : false) {
        selection = selection.length > 1 ? Array.isArray(selection[1]) ? selection[+stars === 10 ? 1 : 0] : selection : selection;
        returnValue = selection[[featured, epic, legendary].filter(item => +item > 0).length];
    }else if (returnValue == null){
        returnValue = 0;
    };

    returnValue = +returnValue > 0 ? returnValue : emotes.rates[0][0];
    return returnEmote ? this.emote(returnValue) : returnValue;
}

module.exports = {
    getRate: getRate
}