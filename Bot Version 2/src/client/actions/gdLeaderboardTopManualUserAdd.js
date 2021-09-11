"use strict";

const Action = require("./Action");
const UserOnTop1000 = require("../../lib/geometrydashAPI/source/foundation/UserOnTop1000");
const { Client: { events } } = require("../../util/Constants");

/**
 * @description Adds a user to the leaderboardTopManual cache
 * @extends {Action}
 */

class gdLeaderboardTopManualUserAddAction extends Action {

    /**
     * @param {UserOnTop1000} entry
     */

    handle(entry) {
        if (!this.client.gdLeaderboardTopManual.add(entry)) return;
        this.client.emit(events.GD_LEADERBOARD_TOP_MANUAL_USER_ADD, entry);
    }

}

module.exports = gdLeaderboardTopManualUserAddAction;