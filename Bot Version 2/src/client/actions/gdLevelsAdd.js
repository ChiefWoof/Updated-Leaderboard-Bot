"use strict";

const Action = require("./Action");
const Level = require("../../lib/geometrydashAPI/source/foundation/Level");
const { Client: { events } } = require("../../util/Constants");

/**
 * @description Adds a level to the gdLevels cache
 * @extends {Action}
 */

class gdLevelsAddAction extends Action {

    /**
     * @param {Level} entry
     */

    handle(entry) {
        if (!this.client.gdLevels.add(entry)) return;
        this.client.emit(events.GD_LEVELS_ADD, entry);
    }

}

module.exports = gdLevelsAddAction;