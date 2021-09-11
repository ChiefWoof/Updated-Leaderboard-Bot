"use strict";

const Action = require("./Action");
const Level = require("../../lib/geometrydashAPI/source/foundation/Level");

/**
 * @description Updates a level on the gdLevels cache
 * @extends {Action}
 */

class gdLevelsUpdateAction extends Action {

    /**
     * @param {Level} entry
     */

    handle(entry) {
        if (!(entry instanceof Level)) return;
        this.client.actions.gdLevelsDelete.handle(entry);
        this.client.actions.gdLevelsAdd.handle(entry);
    }

}

module.exports = gdLevelsUpdateAction;