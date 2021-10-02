"use strict";

const Stats = require("../Stats");
const LevelsStats = require("../../../foundation/LevelsStats");

/**
 * @description Manager for Client's GD Stats
 * @extends {Stats}
 */

class GDStats extends Stats {

    constructor(client) {
        super(client);

        /**
         * @type {LevelsStats}
         */

        this.levels = new LevelsStats();

    }

    /**
     * @description Refreshes all stats
     * @async
     */

    async handle() {
        this.levels.build(this.client.gdLevels.stats);
        return this;
    }

}

module.exports = GDStats;