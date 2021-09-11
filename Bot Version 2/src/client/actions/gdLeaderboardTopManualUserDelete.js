"use strict";

const Action = require("./Action");
const UserOnTop1000 = require("../../lib/geometrydashAPI/source/foundation/UserOnTop1000");
const { Client: { events } } = require("../../util/Constants");

/**
 * @description Deletes a user from the leaderboardTopManual cache
 * @extends {Action}
 */

class gdLeaderboardTopManualUserDeleteAction extends Action {

    /**
     * @param {UserOnTop1000} entry
     */

    handle(entry) {
        if (!entry) return;
        if (this.client.gdLeaderboardTopManual.hasRank(entry.rankGlobal)) {
            let v = this.client.gdLeaderboardTopManual.get(`${entry.rankGlobal}`);
            this.client.gdLeaderboardTopManual.delete(entry.rankGlobal);
            this.client.emit(events.GD_LEADERBOARD_TOP_MANUAL_USER_DELETE, v);
        }
    }

}

module.exports = gdLeaderboardTopManualUserDeleteAction;