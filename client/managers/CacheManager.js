"use strict";

const fs = require("fs");
const path = require("path");

class CacheManager {

    static ORDER = "ASCENDING";
    static LOCAL_FILE_PATH = null;

    constructor() {
        this.metadata = {};
        this.entries = [];
    }

    fetchLocalFileJSON() { return require(path.resolve(__dirname, this.constructor.LOCAL_FILE_PATH)); }
    fromJSON(json) {
        this.metadata = json.metadata || {};
        this.entries = json.entries || [];
    }

    async saveToFile() {
        await fs.writeFileSync(
            path.resolve(__dirname, this.constructor.LOCAL_FILE_PATH),
            JSON.stringify(this, null, 1),
            "utf-8"
        );
    }

}

module.exports = CacheManager;