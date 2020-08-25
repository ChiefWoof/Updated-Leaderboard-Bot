const packets = require("./Util/packets");
const achievements = require("./Util/achievements");
const netScore = require("./Util/netScore");
const syntax = require("./Discord/syntax");
const rates = require("./GD/rates");
const base64 = require("./Extensions/base64");
const data = require("./Util/data");

let flooring = new packets.statObject({}, 1, 1);
flooring.stars = 1000;
flooring.diamonds = 1000;
flooring.ucoins = 1000;
flooring.demons = 100;
flooring.net = 5000;

module.exports = {
    levels: require("./levels"),
    loadingMsg: require("./loadingmsg"),
    achievements: {
        check: achievements.achievements,
        flooring: achievements.flooring
    },
    netScore: netScore.netScore,
    netValues: netScore.netValues,
    emote: syntax.emote,
    tag: syntax.tag,
    tagClean: syntax.tagClean,
    getRate: rates.getRate,
    base64: base64,
    groups: data.groups,
    objectReverse: data.objectReverse,
    dataTranslate: data.dataTranslate,
    getItemsWithProperty: data.getItemsWithProperty,
    properties: require("./Util/properties"),
    packets: packets
};