//@ts-check
import { DiscordRequest } from "../misc/utils.js";
import { handleRestartServer, handleServerStatus, handleTest } from "./commandHandlers.js";

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

   addCommand({
      name: "restartserver",
      description: "Restart the Zomboid server immediately",
      type: 1,
      callback: handleRestartServer
   });

   return AllCommands;
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

   Object.entries(commands).forEach((arr) => HasGuildCommand(appId, guildId, arr[1]));
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
