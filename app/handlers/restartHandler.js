//@ts-check

import { sendServerMsg } from "../commands/commandHandlers.js";
import { formatTime } from "../misc/utils.js";
import { sendRconCommand } from "./rconHandler.js";

export class RestartHandler {
    /**
     * When time until restart equals one of these numbers, broadcast a message.
     * These times are in ms
     * @type {Array<number>}
     */
    ALERT_TIMES = [1, 2, 3, 4, 5, 10, 30, 60, 2*60, 5*60, 10*60, 15*60, 30*60, 1*60*60 ].map(x => x * 1000);
    /**
     * Keep track of which thresholds we have already broadcasted.
     * @see {@link ALERT_TIMES}
     */
    alertTimesBroadcasted = Object.fromEntries(this.ALERT_TIMES.map(x => [x, false]));

    // TODO: Have this write to the disk so it doesn't disappear when the script restarts
    /** @type {number} */
    startTime;
    /** @type {number} */
    restartInterval;
    /** @type {number} */
    tickTime;
    /** @type {boolean} */
    isTicking;
    /** @type {NodeJS.Timer} */
    timerIntervalObj;

    /**
     * Set up the object for managing restarts.
     * Does not start the timer, that must manually be started by {@link start()}.
     * @param {number} restartTime - How long, in seconds, the script should wait between restarts
     * @param {number} tickTime - How long, in seconds, between time checks
     */
    constructor(restartTime, tickTime) {
        console.log(this.alertTimesBroadcasted);
        this.startTime = Date.now();
        // Store times in ms
        this.restartInterval = restartTime * 1000;
        this.tickTime = tickTime * 1000;
        this.isTicking = false;
    }

    /** Start timer ticking. Will create the timer if it doesn't already exist, else it will restart it. */
    start() {
        console.log("Start restart timer");
        this.isTicking = true;
        if (!this.timerIntervalObj) {
            this.timerIntervalObj = setInterval(this.tick.bind(this), this.tickTime);
        }
    }
    /** Stop timer ticking */
    pause() {
        console.log("Pause restart timer");
        this.isTicking = false;
    }
    /** Terminate interval */
    stop() {
        console.log("Stop restart timer");
        this.isTicking = false;
        clearInterval(this.timerIntervalObj);
    }

    tick() {
        let timeSinceStart = Date.now() - this.startTime;

        if (timeSinceStart >= this.restartInterval) {
            // sendServerMsg("Server restarting");
            this.sendRestart();
        }
        else {
            this._checkAlerts();
        }
    }

    _checkAlerts() {
        for (let time of this.ALERT_TIMES) {
            
            if (this.getTimeUntilRestart() > time || this.alertTimesBroadcasted[time]) {
                continue;
            }
            // We should broadcast the message now
            sendServerMsg(`Sever will restart in ${formatTime(time)}`);
            this.alertTimesBroadcasted[time] = true;
            
            console.log(this.alertTimesBroadcasted);

            // Only send 1 message per loop in case of weirdness
            break;
        }
    }

    getTimeUntilRestart() {
        return this.restartInterval - (Date.now() - this.startTime);
    }

    /**
     * Reset startTime and re-enable timer.
     */
    serverStarted() {
        this.startTime = Date.now();
    }

    sendRestart() {
        console.log("Send quit command");
        // Hang out for a bit
        sendRconCommand("quit");
        this.stop();
    }
}
