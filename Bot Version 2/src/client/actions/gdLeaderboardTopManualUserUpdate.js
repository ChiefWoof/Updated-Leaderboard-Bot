"use strict";

const Action = require("./Action");
const UserOnTop1000 = require("../../lib/geometrydashAPI/source/foundation/UserOnTop1000");

/**
 * @description Adds a user to the leaderboardTopManual cache
 * @extends {Action}
 */

class gdLeaderboardTopManualUserUpdateAction extends Action {

    /**
     * @param {UserOnTop1000} entry
     */

    handle(entry) {
        if (!(entry instanceof UserOnTop1000)) return;
        this.client.actions.gdLeaderboardTopManualUserDelete.handle(entry);
        this.client.actions.gdLeaderboardTopManualUserAdd.handle(entry);
    }

}

module.exports = gdLeaderboardTopManualUserUpdateAction;