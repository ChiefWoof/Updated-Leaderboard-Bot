const packets = require("./packets");
const netValues = {
    stars: 1,
    diamonds: 0.5,
    scoins: 100,
    ucoins: 2,
    demons: 20,
    cp: 50
};

function netScore(user, makeString){
    let returnValue = 0, statCaps = require("../../libraries/GeometryDash/api").settings.stats.caps;

    Object.keys(new packets.statObject()).map(key => {
        if (isNaN(Number(user[key])) == null) return;
        if (netValues[key] == null) return;
        returnValue += (Number(user[key]) > statCaps[key] && !(statCaps[key] == null) ? statCaps[key] : Number(user[key]))*netValues[key];
    });

    returnValue = Math.floor(returnValue);
    return makeString ? returnValue.toString() : returnValue;
};

module.exports = {
    netScore: netScore,
    netValues : netValues
};
