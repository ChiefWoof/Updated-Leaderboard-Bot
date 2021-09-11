"use strict";

const Action = require("./Action");
const UserProfile = require("../../lib/ul/source/foundation/UserProfile");

/**
 * @description Updates an account on the gdAccounts cache
 * @extends {Action}
 */

class ulAccountsUpdateAction extends Action {

    /**
     * @param {UserProfile} entry
     */

    handle(entry) {
        if (!(entry instanceof UserProfile)) return;
        this.client.actions.ulAccountsDelete.handle(entry);
        this.client.actions.ulAccountsAdd.handle(entry);
    }

}

module.exports = ulAccountsUpdateAction;