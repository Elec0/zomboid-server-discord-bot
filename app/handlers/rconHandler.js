//@ts-check
import "dotenv/config";
import Rcon from "rcon";
import { noOP } from "../misc/utils.js";


let connectionInfo = {
   isConnected: false,
   isAuthed: false,
}
const OPTIONS = {
   tcp: true,
   challenge: true,
};

/** @type {Array<Function>} */
let rconResponseQueue = [];
/** @type {Rcon} */
let conn;

let noOpRconCallback = (_) => { };

export function initRcon(authCallback = noOpRconCallback, endCallback = noOpRconCallback,
   responseCallback = noOpRconCallback, errorCallback = noOpRconCallback) {
   conn = new Rcon(process.env.rcon_host, process.env.rcon_port,
      process.env.rcon_pass, OPTIONS);

   // @ts-ignore
   conn.on('auth', function () {
      connectionInfo.isConnected = true;
      connectionInfo.isAuthed = true;
      // You must wait until this event is fired before sending any commands,
      // otherwise those commands will fail.
      console.log("Authenticated");
      authCallback();
   })
      .on('response', function (str) {
         // We've got some new info, let whoever's next on the queue know
         if (str) {
            console.log("Response: " + str);
         }
         // If the queue is empty then just noop
         (rconResponseQueue.pop() ?? noOP)(str);
         responseCallback(str);
      })
      .on('error', function (err) {
         console.error("Error: " + err);
         errorCallback(err);
      })
      .on('end', function () {
         connectionInfo.isAuthed = false;
         connectionInfo.isConnected = false;
         console.log("Connection closed");
         endCallback();
      });

   conn.connect();
}
// connect() will return immediately.
//
// If you try to send a command here, it will fail since the connection isn't
// authenticated yet. Wait for the 'auth' event.

/**
 * 
 * @param {String} command - What string to send to the server
 * @param {Function} responseCallback - What function to call when the response is finished
 */
export function sendRconCommand(command, responseCallback = noOP) {
   if (isRconAuthed()) {
      conn.send(command);
      rconResponseQueue.push(responseCallback);
      console.debug(`Rcon response queue length: ${rconResponseQueue.length}`);
   }
}

/**
 * @returns {boolean} True if there is an active RCON connection, false otherwise
 */
export function isRconConnected() {
   return connectionInfo.isConnected;
}
/**
 * @returns {boolean} True if there is an active and usable RCON connection.
 */
export function isRconAuthed() {
   return connectionInfo.isConnected && connectionInfo.isAuthed;
}

export function getRconConnection() {
   return conn;
}