//@ts-check
import 'dotenv/config';
import fetch from 'node-fetch';
import { verifyKey } from 'discord-interactions';
import { PermissionsBitField } from 'discord.js';


/** @param {import('discord.js').MessageComponentInteraction} interaction */
export function memberIsAdmin(interaction) {
   return interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator);
}

export function VerifyDiscordRequest(clientKey) {
   return function (req, res, buf, encoding) {
      const signature = req.get('X-Signature-Ed25519');
      const timestamp = req.get('X-Signature-Timestamp');

      const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
      if (!isValidRequest) {
         console.error()
         res.status(401).send('Bad request signature');
         throw new Error('Bad request signature');
      }
   };
}

export async function DiscordRequest(endpoint, options) {
   // append endpoint to root API URL
   const url = 'https://discord.com/api/v10/' + endpoint;
   // Stringify payloads
   if (options.body) options.body = JSON.stringify(options.body);
   // Use node-fetch to make requests
   const res = await fetch(url, {
      headers: {
         Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
         'Content-Type': 'application/json; charset=UTF-8',
         'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
      },
      ...options
   });
   // throw API errors
   if (!res.ok) {
      const data = await res.json();
      console.log(res.status);
      throw new Error(JSON.stringify(data));
   }
   // return original response
   return res;
}

// Simple method that returns a random emoji from list
export function getRandomEmoji() {
   const emojiList = ['😭', '😄', '😌', '🤓', '😎', '😤', '🤖', '😶‍🌫️', '🌏', '📸', '💿', '👋', '🌊', '✨'];
   return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function capitalize(str) {
   return str.charAt(0).toUpperCase() + str.slice(1);
}


/**
 * @param {number} time 
 * @returns {string} - time in hhmmss format
*/
export function formatTime(time) {
   let ms = time;

   let hour = Math.trunc(ms / (3600 * 1000));
   ms = ms % (3600 * 1000); // seconds remaining after extracting hours
   let min = Math.trunc(ms / (60 * 1000));
   ms = ms % (60 * 1000); // seconds remaining after extracting minutes
   let sec = Math.trunc(ms / 1000);
   ms = Math.round(ms % 1000); // ms remaining after extracting seconds
   return (hour != 0 ? `${hour}h` : "")
      + (min != 0 ? `${min}m` : "")
      + (sec != 0 ? `${sec}s` : "");
   //+ (`${ms}ms`);
}


export function noOP() { };