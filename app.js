const { Client, GatewayIntentBits } = require("discord.js");
const { token, command_prefix, wol_mac, client_address} = require("./config.json");
const wol = require('wake_on_lan');
const WebSocket = require('ws');

let help_message = `
:white_check_mark: **RemoteControl Commands:**

:small_blue_diamond: ${command_prefix}help: display this help message
:small_blue_diamond: ${command_prefix}wakeup: wake up the client computer
:small_blue_diamond: ${command_prefix}shutdown: shut down the client computer

`

const client = new Client({
    intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent]
});

let ws;

function connectWebSocket() {
    const url = `ws://${client_address}`;
    ws = new WebSocket(url);

    ws.on('open', () => {
        console.log('WebSocket connection established');
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed, attempting to reconnect...');
        setTimeout(connectWebSocket, 5000); // Attempt to reconnect after 5 seconds
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        ws.close(); // Close the connection on error to trigger reconnection
    });
}

client.on("ready", () => {
  console.log("Discord Bot is ready! Logged in as " + client.user.tag);
  console.log("Connecting to WebSocket server...");
  connectWebSocket();
});

client.on("messageCreate", (message) => {
    if (message.content.startsWith(command_prefix)) {
        const args = message.content.slice(command_prefix.length).trim().split(/ +/g); // split arguments, command is ar args[0]

        switch(args[0]) {
            case "help":
                message.channel.send(help_message);
                break;
            case "wakeup":
                wol.wake(wol_mac, function (error) {
                    if (error) {
                        message.channel.send("An error occured while sending the WOL packet.")
                    } else {
                        message.channel.send("WOL packet sent successfully.");
                    }
                })
                break;
            case "shutdown":
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send('shutdown');

                    ws.on('error', () => {
                        message.channel.send('An error occured while sending the shutdown command.');
                    });

                    ws.once('message', (wsMessage) => {
                        wsMessage = wsMessage.toString();
                        console.log('Received from WebSocket server:', wsMessage);
                        message.channel.send(wsMessage);
                    });
                } else {
                    message.channel.send('An error occured while sending the shutdown command. Maybe, the client is already offline?');
                }
                break;
        }
    }
});

client.login(token);
