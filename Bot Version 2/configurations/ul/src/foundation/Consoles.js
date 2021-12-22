"use strict";

const Base = require("./BaseIndexes");
const Util = require("../util/Util");

const ConsolesMobile = require("./ConsolesMobile");
const ConsolesPC = require("./ConsolesPC");

const properties = require("../properties/ul/users/Consoles");
const {

    MOBILE,
    PC

} = properties;

/**
 * @description The various devices a user could use
 * @extends {Base}
 */

class Consoles extends Base {

    build() {

        this._indexes = {

            [MOBILE]: new ConsolesMobile(),
            [PC]: new ConsolesPC()

        };

        return this;

    }

    /**
     * @description The mobile consoles
     * @type {ConsolesMobile}
     * @defaultvalue 0
     * @param {number|string|BigInt|ConsolesMobile} value
     */

    get mobile() { return this._indexes[MOBILE]; }
    set mobile(value) { this._indexes[MOBILE].resolve(value); }

    /**
     * @description The pc consoles
     * @type {ConsolesPC}
     * @defaultvalue 0
     * @param {number|string|BigInt|ConsolesPC} value
     */

    get pc() { return this._indexes[PC]; }
    set pc(value) { this._indexes[PC].resolve(value); }


    parse(data, {
        separatorValue = undefined,
        separator = undefined,
    }={}) {

        if (data instanceof Consoles || !Util.isObjectNormal(data)) {
            super.parse(data, { separatorValue, separator });
        } else {
            Object.entries(data).forEach(([k, v]) => {

                if (new RegExp(`^(${MOBILE}|mobile|phone)$`, "i").test(k)) this.mobile = v;
                else if (new RegExp(`^(${PC}|pc|laptop|computer)$`, "i").test(k)) this.pc = v;
                
            });
        }

        return this;

    }

}

module.exports = Consoles;