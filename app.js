//@ts-check
import "dotenv/config";
import { AllCommands, loadCommands } from "./app/commands/commands.js";
import { initRcon } from "./app/handlers/rconHandler.js";
import { RestartHandler } from "./app/handlers/restartHandler.js";
import { noOP } from "./app/misc/utils.js";
import "dotenv/config";
// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from 'discord.js';

const token = process.env.DISCORD_TOKEN
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });


client["commands"] = loadCommands();

/** Wait for this many minutes after initial shutdown message */
const SERVER_TIME_TO_RESTART = 1 * 60 * 1000;
/** Attempt to reconnect to RCON every x seconds after the initial time. */
const SERVER_POST_TIME_INTERVAL = 15 * 1000;

// Restart every 3 hours, tick 1/s
export let restartHandler = new RestartHandler(3 * 60 * 60, 1);

// Start up the rcon connection
function manageRcon(initialRun = true) {
   let connectionEnded = () => {
      if (initialRun) {
         setTimeout(() => manageRcon(false), SERVER_TIME_TO_RESTART);
      }
      else {
         setTimeout(() => manageRcon(false), SERVER_POST_TIME_INTERVAL);
      }
   }
   initRcon(
      // Auth callback
      (_) => { // We're connected, start the timer
         restartHandler.start();
      },
      // End callback - Happens when the server shuts down
      // Wait for some amount of time to try connecting again, then try again every so often
      (_) => connectionEnded(),
      noOP, // Response callback
      // Error callback - Happens when server is down and connection is refused
      (_) => connectionEnded()
   );
}
manageRcon();

// ======
// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
   console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
   if (!interaction.isChatInputCommand()) return;
   const command = AllCommands[interaction.commandName];

   console.log(`Received command "${command.name}"`);
   try {
      await command.callback(interaction);
   } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
         await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
      } else {
         await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
   }

});

// Log in to Discord with your client's token
client.login(token);