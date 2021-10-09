"use strict";

const EventEmitter = require("events");
const UserInteractionOptions = require("../util/UserInteractions");

const {
    Discord: {
        users: {
            interactionManagerEvents: INTERACTION_EVENTS
        }
    }
} = require("../util/Constants");

/**
 * @description A manager to handle the different types of interactions a Discord user could use
 * to interact with the Client
 * @extends {EventEmitter}
 */

class InteractionManager extends EventEmitter {

    /**
     * @constructor
     * @param {UserInteractionOptions|number|string|Object<string, boolean>} settings 
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
         * @type {UserInteractionOptions}
         */
        
        this.settings = settings instanceof UserInteractionOptions ? settings : new UserInteractionOptions(settings);

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

        this.on(this.events.SENT_MESSAGE, this.sentMessageHandler);
        this.on(this.events.SENT_REACTION, this.sentReactionHandler);
        this.on(this.events.SENT_BUTTON, this.sentButtonHandler);

    }

    /**
     * @returns {INTERACTION_EVENTS}
     */

    get events() { return InteractionManager.EVENTS; }

    /**
     * @returns {InteractionManager.REJECTION_REASONS}
     */

    get rejections() { return InteractionManager.REJECTION_REASONS; }

    sentHandler({
        accepting = this.settings.ACCEPTING,
        toggle = false,
        condition = null,
        eventRejected = null,
        eventAccepted = null
    }={}, ...args) {

        if (!accepting)
            this.reject(eventRejected, InteractionManager.REJECTION_REASONS.NOT_ACCEPTING);
        else if (!toggle)
            this.reject(eventRejected, InteractionManager.REJECTION_REASONS.DISABLED);
        else if (typeof condition === "function" && condition(...args) !== true)
            this.reject(eventRejected, InteractionManager.REJECTION_REASONS.FAILED_CONDITION);
        else {
            if (eventAccepted) this.emit(eventAccepted, ...args);
            return true;
        }

        return false;
    }

    reject(eventName, reason=InteractionManager.REJECTION_REASONS.UNSPECIFIED, ...args) {
        if (eventName)
            this.emit(eventName, reason, ...args);
        return this;
    }

    sentMessageHandler(...args) {
        return this.sentHandler({
            toggle: this.settings.CHAT,
            condition: this.sentMessageCondition,
            eventRejected: this.events.REJECTED_MESSAGE,
            eventAccepted: this.events.ACCEPTED_MESSAGE
        }, ...args);
    }

    sentReactionHandler(...args) {
        return this.sentHandler({
            toggle: this.settings.REACTIONS,
            condition: this.sentReactionCondition,
            eventRejected: this.events.REJECTED_REACTION,
            eventAccepted: this.events.ACCEPTED_REACTION
        }, ...args);
    }

    sentButtonHandler(...args) {
        return this.sentHandler({
            toggle: this.settings.BUTTONS,
            condition: this.sentButtonCondition,
            eventRejected: this.events.REJECTED_BUTTON,
            eventAccepted: this.events.ACCEPTED_BUTTON
        }, ...args);
    }

}

InteractionManager.EVENTS = INTERACTION_EVENTS;

/**
 * @description ID-based reasons an interaction may be rejected
 */

InteractionManager.REJECTION_REASONS = {
    UNSPECIFIED: 0,
    NOT_ACCEPTING: 1,
    DISABLED: 2,
    FAILED_CONDITION: 3
};

module.exports = InteractionManager;
