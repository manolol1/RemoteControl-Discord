const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const { token, command_prefix, wol_mac, client_address } = require("./config.json");
const wol = require('wake_on_lan');

let help_message = `
:white_check_mark: **RemoteControl Commands:**

:small_blue_diamond: ${command_prefix}help: display this help message
:small_blue_diamond: ${command_prefix}wakeup: wake up the client computer
:small_blue_diamond: ${command_prefix}ping: check if the client computer is online
:small_blue_diamond: ${command_prefix}shutdown: shut down the client computer
`

const client = new Client({
    intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent]
});

client.on("ready", () => {
    console.log("Discord Bot is ready! Logged in as " + client.user.tag);

    // update activity depending on client status
    setInterval(() => {
        fetch(`http://${client_address}/ping`)
            .then(response => response.status)
            .then(status => {
                if (status == 200) {
                    client.user.setActivity("Client is online", { type: ActivityType.Watching });
                } else {
                    client.user.setActivity("Client is offline", { type: ActivityType.Watching });
                }
            })
            .catch(error => client.user.setActivity("Client is offline"), { type: ActivityType.Watching });
    }, 1000);
});

client.on("messageCreate", (message) => {
    if (message.content.startsWith(command_prefix)) {
        const args = message.content.slice(command_prefix.length).trim().split(/ +/g); // split arguments, command is ar args[0]

        switch (args[0]) {
            case "help": {
                message.channel.send(help_message);
                break;
            }

            case "wakeup": {
                wol.wake(wol_mac, function (error) {
                    if (error) {
                        message.channel.send(":x: An error occured while sending the WOL packet.")
                    } else {
                        message.channel.send(":white_check_mark: WOL packet sent successfully.");
                    }
                })
                break;
            }

            case "shutdown": {
                message.channel.send(":clock2: Sending shutdown command to the client...");
                fetch(`http://${client_address}/shutdown`)
                    .then(response => response.status)
                    .then(status => {
                        if (status == 200) {
                            message.channel.send(":white_check_mark: Client is shutting down...");
                        } else {
                            message.channel.send(":x: An error occured while sending the shutdown command.");
                        }
                    })
                    .catch(error => message.channel.send(":x: An error occured while sending the shutdown command. Maybe, the client is already offline?"));
                break;
            }

            case "ping": {
                message.channel.send(":clock2: Sending ping command to the client...");
                fetch(`http://${client_address}/ping`)
                    .then(response => response.status)
                    .then(status => {
                        if (status == 200) {
                            message.channel.send(":white_check_mark: Client is online.");
                        } else {
                            message.channel.send(":x: An error occured while sending the ping command.");
                        }
                    })
                    .catch(error => message.channel.send(":x: An error occured while sending the ping command. Maybe, the client is offline?"));
                break;
            }
        }
    }
});

client.login(token);
