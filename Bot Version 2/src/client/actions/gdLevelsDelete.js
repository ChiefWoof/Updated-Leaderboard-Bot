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
        if (this.client.gdLevels.deleteEntry(entry))
            this.client.emit(events.GD_LEVELS_DELETE, entry);
    }

}

module.exports = gdLevelsDeleteAction;
