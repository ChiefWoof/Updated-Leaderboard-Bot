const packets = require("./packets");
const netScore = require("./netScore");
const emotes = require("../Discord/emotes.json");
const syntax = require("../Discord/syntax");
const data = require("./data");
const properties = require("./properties");
const levels = require("../levels");

let flooring = new packets.statObject({}, 1, 1);
flooring.stars = 1000;
flooring.diamonds = 1000;
flooring.ucoins = 1000;
flooring.demons = 100;
flooring.net = 5000;

function achievements(statsOld, statsNew){
    let notifications = [], gd = require("../../libraries/GeometryDash/api");
    
    Object.keys(new packets.statObject({}, 1)).map(key => {
        statsOld[key] = statsOld[key] == null ? 0 : statsOld[key];
        statsNew[key] = statsNew[key] == null ? 0 : statsNew[key];
    });

    function newPacket(input){
        let packet = new packets.notification(statsNew);
        packet.net = netScore.netScore(statsNew);

        if (typeof input === 'string') {
            packet.text = input;
        }else if (typeof input === 'object' && input != null) {
            Object.keys(input).map(key => {
                packet[key] = input[key];
            });
        };

        let emotesBeginning = [statsNew.level == null ? null : +statsNew.level >= levels.Helper ? emotes.badges.helpers[(+statsNew.level)-levels.Helper] : null, +packet.sg > 0 ? emotes.badges.sg : null+packet.mod > 0 ? emotes.badges.mod.find(item => item[0] === +packet.mod) : null].filter(item => item != null).map(item => { return syntax.emote(Array.isArray(item) ? item[1] : item); }).join(" ");
        packet.text = `${emotesBeginning.length > 0 ? `${emotesBeginning} ` : ``}${packet.text}${packet.stat == null  ? '' : ` ${syntax.emote(emotes.stats[packet.stat])}`}`;

        notifications.push(packet);
    };

    if ([statsOld, statsNew, flooring].every(item => !Array.isArray(item) && item != null && typeof item === 'object')) {
        ["stars", "diamonds", "ucoins", "demons", "cp"].map(key => {
            if (Math.floor(statsNew[key]/flooring[key]) > Math.floor(statsOld[key]/flooring[key])) newPacket({stat: key, text: `**${statsNew.username}** reached **${flooring[key]*Math.floor(statsNew[key]/flooring[key])} ${key}!**`});
        });

        ["diamonds", "scoins"].map(key => {
            if (+statsNew[key] >= gd.settings.stats.caps[key] && +statsOld[key] < gd.settings.stats.caps[key]) newPacket({stat: key, text: `**${statsNew.username}** reached the **max ${key} (${gd.settings.stats.caps[key]})!**`});
        });

        if (statsNew.username != statsOld.username) newPacket(`**${statsNew.username}** has changed their username from *${statsOld.username}*`);

        if (+statsNew.mod != +statsOld.mod) newPacket({mod: +statsNew.mod > 1 ? +statsNew.mod : 1, text: `**${statsNew.username}** has ${+statsOld.mod > +statsNew.mod ? 'lost' : `become a${+statsNew.mod > 1 ? 'n' : ''}`} **${+statsNew.mod > 1 || (+statsNew.mod === 1 && +statsOld.mod > 1) ? 'Elder ' : ''}Mod**`});
    };

    return notifications;
};

module.exports = {
    flooring: flooring,
    achievements: achievements
}
