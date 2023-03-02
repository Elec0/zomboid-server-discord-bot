//@ts-check

import dedent from "dedent";
import { restartHandler } from "../../app.js";
import { sendRconCommand } from "../handlers/rconHandler.js";
import { RestartHandler } from "../handlers/restartHandler.js";
import { formatTime, getRandomEmoji, memberIsAdmin } from "../misc/utils.js";


/** @param {import('discord.js').MessageComponentInteraction} interaction */
export function handleServerStatus(interaction) {
   let responseData = {};
   console.log(typeof (interaction));

   sendRconCommand("players", (response) => {
      responseData["players"] = response;
      let toSend = dedent(`== Current Server Status (${new Date().toLocaleString()}) ==
      Time until next restart: ${formatTime(restartHandler.getTimeUntilRestart())}
      ${response}`);

      console.log(`\nSending: ${toSend}`);

      interaction.reply(toSend);
   });
}

/** @param {import('discord.js').MessageComponentInteraction} interaction */
export function handleTest(interaction) {
   interaction.reply("hello world " + getRandomEmoji());
}

/** @param {import('discord.js').MessageComponentInteraction} interaction */
export function handleServerStats(interaction) {
   sendRconCommand("stats all"), (response) => {
      console.log(response);
   }
}

/** @param {import('discord.js').MessageComponentInteraction} interaction */
export function handleRestartServer(interaction) {
   if (!memberIsAdmin(interaction)) {
      console.warn(`User ${interaction.user.username} attempted to restart the server, but doesn't have access.`);
      interaction.reply("You do not have sufficient access to restart the server.");
      return;
   }
   restartHandler.sendRestart();
   interaction.reply("Server shutdown command issued. Check back in a couple minutes");
}

/**
 * Big red message across the screen.
 * @param {String} message 
 */
export function sendServerMsg(message) {
   sendRconCommand(`servermsg "${message}"`);
   console.info(`Send server message: "${message}"`);
}