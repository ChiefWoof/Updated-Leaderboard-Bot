"use strict";

const EventEmitter = require("events");
const UserInputOptions = require("../util/UserInputs");

const {
    Discord: {
        users: {
            inputManagerEvents: INPUT_EVENTS
        }
    }
} = require("../util/Constants");

/**
 * @description A manager to handle the different types of inputs a Discord user could use
 * to interact with the Client
 * @extends {EventEmitter}
 */

class InputManager extends EventEmitter {

    /**
     * @constructor
     * @param {UserInputOptions|number|string|Object<string, boolean>} settings 
     * @param {Object} [options]
     * @param {?() => boolean} [options.sentMessageCondition=null]
     * @param {?() => boolean} [options.sentReactionCondition=null]
     * @param {?() => boolean} [options.sentButtonCondition=null]
     */

    constructor(settings, {
        sentMessageCondition = null,
        sentReactionCondition = null,
        sentButtonCondition = null
    }={}) {
        super();

        /**
         * @description The settings for the manager
         * @type {UserInputOptions}
         */
        
        this.settings = settings instanceof UserInputOptions ? settings : new UserInputOptions(settings);

        /**
         * @description The optional condition to apply to sent messages
         * @type {?() => boolean}
         */

        this.sentMessageCondition = sentMessageCondition;

        /**
         * @description The optional condition to apply to sent reactions
         * @type {?() => boolean}
         */

        this.sentReactionCondition = sentReactionCondition;

        /**
         * @description The optional condition to apply to sent buttons
         * @type {?() => boolean}
         */

        this.sentButtonCondition = sentButtonCondition;

        this.on(INPUT_EVENTS.SENT_MESSAGE, this.sentMessageHandler);
        this.on(INPUT_EVENTS.SENT_REACTION, this.sentReactionHandler);
        this.on(INPUT_EVENTS.SENT_BUTTON, this.sentButtonHandler);

    }

    sentHandler({
        accepting = this.settings.ACCEPTING,
        toggle = false,
        condition = null,
        eventRejected = null,
        eventAccepted = null
    }={}, ...args) {

        function reject(reason=InputManager.REJECTION_REASONS.UNSPECIFIED) {
            if (eventRejected)
                this.emit(eventRejected, reason, ...args);
        }

        if (!accepting)
            reject(InputManager.REJECTION_REASONS.NOT_ACCEPTING);
        else if (!toggle)
            reject(InputManager.REJECTION_REASONS.DISABLED);
        else if (typeof conditoin === "function" && !condition(...args))
            reject(InputManager.REJECTION_REASONS.FAILED_CONDITION);
        else {
            if (eventAccepted) this.emit(eventAccepted, ...args);
            return true;
        }

        return false;
    }

    sentMessageHandler(...args) {
        return this.sentHandler({
            toggle: this.settings.CHAT,
            condition: this.sentMessageCondition,
            eventRejected: INPUT_EVENTS.REJECTED_MESSAGE,
            eventAccepted: INPUT_EVENTS.ACCEPTED_MESSAGE
        }, ...args);
    }

    sentReactionHandler(...args) {
        return this.sentHandler({
            toggle: this.settings.REACTIONS,
            condition: this.sentReactionCondition,
            eventRejected: INPUT_EVENTS.REJECTED_REACTION,
            eventAccepted: INPUT_EVENTS.ACCEPTED_REACTION
        }, ...args);
    }

    sentButtonHandler(...args) {
        return this.sentHandler({
            toggle: this.settings.BUTTONS,
            condition: this.sentButtonCondition,
            eventRejected: INPUT_EVENTS.REJECTED_BUTTON,
            eventAccepted: INPUT_EVENTS.ACCEPTED_BUTTON
        }, ...args);
    }

}

InputManager.EVENTS = INPUT_EVENTS;

/**
 * @description ID-based reasons an input may be rejected
 */

InputManager.REJECTION_REASONS = {
    UNSPECIFIED: 0,
    NOT_ACCEPTING: 1,
    DISABLED: 2,
    FAILED_CONDITION: 3
};

module.exports = InputManager;