"use strict";

const Action = require("./Action");
const Level = require("../../lib/geometrydashAPI/source/foundation/Level");
const { Client: { events } } = require("../../util/Constants");

/**
 * @description Deletes a level from the gdLevels cache
 * @extends {Action}
 */

class gdLevelsDeleteAction extends Action {

    /**
     * @param {Level} entry
     */

    handle(entry) {
        if (!entry) return;
        if (this.client.gdLevels.hasLevelID(entry.levelID)) {
            let v = this.client.gdLevels.get(`${entry.levelID}`);
            this.client.gdLevels.delete(entry.levelID);
            this.client.emit(events.GD_LEVELS_DELETE, v);
        }
    }

}

module.exports = gdLevelsDeleteAction;