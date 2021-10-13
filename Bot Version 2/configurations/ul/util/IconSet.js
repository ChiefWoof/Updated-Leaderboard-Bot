"use strict";

/**
 * @description Class to simplify collected data about a GD player's icon set
 */

class IconSet {

    constructor(data) {
        this.build();
        this.parse(data);
    }

    build() {

        /**
         * @description The identification number of the cube
         * @type {BigInt}
         */

        this.cubeID = 0n;

        /**
         * @description The identification number of the ship
         * @type {BigInt}
         */

        this.shipID = 0n;

        /**
         * @description The identification number of the ball
         * @type {BigInt}
         */

        this.ballID = 0n;

        /**
         * @description The identification number of the ufo
         * @type {BigInt}
         */

        this.ufoID = 0n;

        /**
         * @description The identification number of the dart
         * @type {BigInt}
         */

        this.dartID = 0n;

        /**
         * @description The identification number of the robot
         * @type {BigInt}
         */

        this.robotID = 0n;

        /**
         * @description The identification number of the spider
         * @type {BigInt}
         */

        this.spiderID = 0n;

        /**
         * @description The identification number of icons' base color
         * @type {BigInt}
         */

        this.color1ID = 0n;

        /**
         * @description The identification number of icons' secondary color
         * @type {BigInt}
         */

        this.color2ID = 0n;

        /**
         * @description The identification number of the icons' trail
         * @type {BigInt}
         */

        this.trailID = 0n;

        /**
         * @description The identification number of the icons' death/crash effect
         * @type {BigInt}
         */

        this.deathEffectID = 0n;

        /**
         * @description Whether icon glow is enabled
         * @type {boolean}
         */

        this.glowStatus = false;

    }

    /**
     * @description The identification number of the cube or the default cube
     * @param {BigInt|number|string} value
     * @type {BigInt}
     */

    get cube() { return this.cubeID || 1n; }
    set cube(value) { this.cubeID = /^[0-9]$/.test(value) ? BigInt(value) : 0n; }

    /**
     * @description The identification number of the ship or the default ship
     * @param {BigInt|number|string} value
     * @type {BigInt}
     */

    get ship() { return this.shipID || 1n; }
    set ship(value) { this.shipID = /^[0-9]$/.test(value) ? BigInt(value) : 0n; }

    /**
     * @description The identification number of the ball or the default ball
     * @param {BigInt|number|string} value
     * @type {BigInt}
     */

    get ball() { return this.ballID || 1n; }
    set ball(value) { this.ballID = /^[0-9]$/.test(value) ? BigInt(value) : 0n; }

    /**
     * @description The identification number of the ufo or the default ufo
     * @param {BigInt|number|string} value
     * @type {BigInt}
     */

    get ufo() { return this.ufoID || 1n; }
    set ufo(value) { this.ufoID = /^[0-9]$/.test(value) ? BigInt(value) : 0n; }

    /**
     * @description The identification number of the dart or the default dart
     * @param {BigInt|number|string} value
     * @type {BigInt}
     */

    get dart() { return this.dartID || 1n; }
    set dart(value) { this.dartID = /^[0-9]$/.test(value) ? BigInt(value) : 0n; }

    /**
     * @description (Another index for "dart") The identification number of the dart or the default dart
     * @param {BigInt|number|string} value
     * @type {BigInt}
     */

    get wave() { return this.dart; }
    set wave(value) { this.dart = value; }

    /**
     * @description The identification number of the robot or the default robot
     * @param {BigInt|number|string} value
     * @type {BigInt}
     */

    get robot() { return this.robotID || 1n; }
    set robot(value) { this.robotID = /^[0-9]$/.test(value) ? BigInt(value) : 0n; }

    /**
     * @description The identification number of the spider or the default spider
     * @param {BigInt|number|string} value
     * @type {BigInt}
     */

    get spider() { return this.spiderID || 1n; }
    set spider(value) { this.spiderID = /^[0-9]$/.test(value) ? BigInt(value) : 0n; }

    /**
     * @description The identification number of the primary icon color or the default primary color
     * @param {BigInt|number|string} value
     * @type {BigInt}
     */

    get color1() { return this.color1ID || 1n; }
    set color1(value) { this.color1ID = /^[0-9]$/.test(value) ? BigInt(value) : 0n; }

    /**
     * @description The identification number of the secondary icon color or the default secondary color
     * @param {BigInt|number|string} value
     * @type {BigInt}
     */

    get color2() { return this.color2ID || 1n; }
    set color2(value) { this.color2ID = /^[0-9]$/.test(value) ? BigInt(value) : 0n; }

    /**
     * @description The identification number of the icon trail or the default icon trail
     * @param {BigInt|number|string} value
     * @type {BigInt}
     */

    get trail() { return this.trailID || 1n; }
    set trail(value) { this.trailID = /^[0-9]$/.test(value) ? BigInt(value) : 0n; }

    /**
     * @description The identification number of the icon death effect or the default death effect
     * @param {BigInt|number|string} value
     * @type {BigInt}
     */

    get deathEffect() { return this.deathEffectID || 1n; }
    set deathEffect(value) { this.deathEffectID = /^[0-9]$/.test(value) ? BigInt(value) : 0n; }

    /**
     * @description Whether the icon glow is enabled
     * @param {boolean|BigInt|number|string} value
     * @type {boolean}
     */

    get glow() { return this.glowStatus; }
    set glow(value) { this.glowStatus = value > 0 || /true/i.test(value); }

    stringfy() {
        return [

            // Icons 1 - 19
            1, this.cubeID,
            2, this.shipID,
            3, this.ballID,
            4, this.ufoID,
            5, this.dartID,
            6, this.robotID,
            7, this.spiderID,

            // Colors 20 - 29
            20, this.color1ID,
            21, this.color2ID,

            // Details 30 - 39
            30, this.trailID,
            31, this.deathEffectID,
            32, this.glowStatus ? 1 : 0,

        ].join(":");
    }

    parse(data) {
        if (typeof data === "string") {
            data = data.split(":").reduce((v, a, i) => {
                if (i % 2 === 0) v.key = a;
                else v.data[v.key] = a;
                return v;
            }, {
                key: null,
                data: {}
            }).data;
        }
        if (Object.prototype.toString.call(data) !== "[object Object]")
            data = {};
        Object.entries(data).forEach(([k, v]) => {
            if (/^(1|cube(ID)?)$/i.test(k)) this.cube = v;
            else if (/^(2|ship(ID)?)$/i.test(k)) this.ship = v;
            else if (/^(3|ball(ID)?)$/i.test(k)) this.ball = v;
            else if (/^(4|ufo(ID)?)$/i.test(k)) this.ufo = v;
            else if (/^(5|dart(ID)?|wave(ID)?)$/i.test(k)) this.dart = v;
            else if (/^(6|robot(ID)?)$/i.test(k)) this.robot = v;
            else if (/^(7|spider(ID)?)$/i.test(k)) this.spider = v;
            else if (/^(20|color1(ID)?)$/i.test(k)) this.color1 = v;
            else if (/^(21|color2(ID)?)$/i.test(k)) this.color2 = v;
            else if (/^(30|trail(ID)?)$/i.test(k)) this.trail = v;
            else if (/^(31|deathEffect(ID)?)$/i.test(k)) this.deathEffect = v;
            else if (/^(32|glowStatus(ID)?)$/i.test(k)) this.glow = v;
        });
        return this;
    }

}

module.exports = IconSet;