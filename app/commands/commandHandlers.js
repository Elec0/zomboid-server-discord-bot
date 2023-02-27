//@ts-check

import dedent from "dedent";
import { restartHandler } from "../../app.js";
import { sendRconCommand } from "../handlers/rconHandler.js";
import { formatTime, getRandomEmoji } from "../misc/utils.js";


export function handleServerStats(res, type, id, data) {
   sendRconCommand("stats all"), (response) => {
      console.log(response);
   }
}
/**
 * Big red message across the screen.
 * @param {String} message 
 */
export function sendServerMsg(message) {
   sendRconCommand(`servermsg "${message}"`);
   // console.warn(`servermsg "${message}"`);
}