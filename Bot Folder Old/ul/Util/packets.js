class notification {
    constructor(user){
        user = Object(user);
        this.text = typeof user.text === 'string' ? user.text : "";
        this.level = +user.level > 0 ? +user.level : 0;
        this.sg = typeof user.sg === 'boolean' || +user.sg > 0 ? user.sg === 'boolean' ? user.sg : +user.sg : false;
        this.disID = +user.disID > 0 ? user.disID : null;
    }
}

class statObject {
    constructor(user, includeNet, defaultInput, isArray){
        if (isArray && Array.isArray(user)) user = {stars: user[0], diamonds: user[1], scoins: user[2], ucoins: user[3], demons: user[4], cp: user[5]};
        user = Object(user);
        ["stars", "diamonds", "scoins", "ucoins", "demons", "cp", includeNet ? "net" : null].map(key => {
            if (key == null) return;
            this[key] = isNaN(+user[key]) ? defaultInput == null ? null : defaultInput : user[key];
        });
    }
}

module.exports = {
    notification: notification,
    statObject: statObject
}


