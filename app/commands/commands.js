//@ts-check
import dedent from "dedent";
import { restartHandler } from "../../app.js";
import { sendRconCommand } from "../handlers/rconHandler.js";
import { capitalize, DiscordRequest, formatTime, getRandomEmoji } from "../misc/utils.js";

// ** Commands **
/** @type {Object} */
export var AllCommands = {};

export function loadCommands() {
   // Simple test command
   addCommand({
      name: "test",
      description: "Basic guild command",
      type: 1,
      callback: handleTest
   });

   addCommand({
      name: "serverstatus",
      description: "Get the server's basic status (online, # of players, etc)",
      type: 1,
      callback: handleServerStatus
   });

   return AllCommands;
}
export function handleTest(interaction) {
   interaction.reply("hello world " + getRandomEmoji());
}

 /**
 */
 export function handleServerStatus(interaction) {
   let responseData = {};
   console.log(typeof(interaction));

   sendRconCommand("players", (response) => {
      responseData["players"] = response;  
      let toSend = dedent(`== Current Server Status (${new Date().toLocaleString()}) ==
      Time until next restart: ${formatTime(restartHandler.getTimeUntilRestart())}
      ${response}`);
      
      console.log(`\nSending: ${toSend}`);
      
      interaction.reply(toSend);
      // res.send({
      //    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      //    data: { content: toSend, },
      // })
   });
}
// addCommand({
//    name: "serverstats",
//    description: "Get the server's full stats",
//    type: 1,
//    callback: handleServerStats
// });

// Command containing options
// addCommand({
//    name: "challenge",
//    description: "Challenge to a match of rock paper scissors",
//    options: [
//       {
//          type: 3,
//          name: "object",
//          description: "Pick your object",
//          required: true,
//          choices: createCommandChoices(),
//       },
//    ],
//    type: 1,
// });

// ** Methods **

export function addCommand({name, description, type = 1, options = [], callback = (res, type, id, data) => {}}) {
   AllCommands[name] = {
      name: name,
      description: description,
      options: options,
      type: type,
      callback: callback
   }
}

export async function HasGuildCommands(appId, guildId, commands) {
   if (guildId === "' || appId === '") return;

   commands.forEach((c) => HasGuildCommand(appId, guildId, c));
}

// Checks for a command
async function HasGuildCommand(appId, guildId, command) {
   // API endpoint to get and post guild commands
   const endpoint = `applications/${appId}/guilds/${guildId}/commands`;
   try {
      const res = await DiscordRequest(endpoint, { method: "GET" });
      /** @type {Object} */
      const data = await res.json();

      if (data) {
         const installedNames = data.map((c) => c["name"]);
         // This is just matching on the name, so it's not good for updates
         if (!installedNames.includes(command["name"])) {
            console.log(`Installing "${command["name"]}"`);
            InstallGuildCommand(appId, guildId, command);
         } else {
            console.log(`"${command["name"]}" command already installed`);
         }
      }
   } catch (err) {
      console.error(err);
   }
}

// Installs a command
export async function InstallGuildCommand(appId, guildId, command) {
   // API endpoint to get and post guild commands
   const endpoint = `applications/${appId}/guilds/${guildId}/commands`;
   // install command
   try {
      await DiscordRequest(endpoint, { method: "POST", body: command });
   } catch (err) {
      console.error(err);
   }
}
