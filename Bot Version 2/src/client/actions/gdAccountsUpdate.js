"use strict";

const Action = require("./Action");
const UserInfo = require("../../lib/geometrydashAPI/source/foundation/UserInfo");

/**
 * @description Updates an account on the gdAccounts cache
 * @extends {Action}
 */

class gdAccountsUpdateAction extends Action {

    /**
     * @param {UserInfo} entry
     */

    handle(entry) {
        if (!(entry instanceof UserInfo)) return;
        this.client.actions.gdAccountsDelete.handle(entry);
        this.client.actions.gdAccountsAdd.handle(entry);
    }

}

module.exports = gdAccountsUpdateAction;