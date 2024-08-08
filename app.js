const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const { token, command_prefix, wol_mac, client_address } = require("./config.json");
const wol = require('wake_on_lan');

// response to the !help command
let help_message = `
:white_check_mark: **RemoteControl Commands:**

:small_blue_diamond: ${command_prefix}help: display this help message
:small_blue_diamond: ${command_prefix}wakeup: wake up the client computer
:small_blue_diamond: ${command_prefix}ping: check if the client computer is online
:small_blue_diamond: ${command_prefix}shutdown: shut down the client computer
:small_blue_diamond: ${command_prefix}reboot: reboot the client computer

:computer: [View Source Code on GitHub](<https://github.com/manolol1/remotecontrol_discord>)
`

const client = new Client({
    intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent]
});

// sends a ping request to the client. Returns true if successful, false if an error occured
async function ping() {
    try {
        const response = await fetch(`http://${client_address}/ping`);
        return response.status == 200;
    } catch (error) {
        return false;
    }
}

// delays async function for a specified time
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// waits until client is online. Returns true if client is online, false if timeout is reached
async function waitUntilOnline(timeout = 60000, interval = 1000) {
    let ms = 0;
    while (ms < timeout) {
        if (await ping()) {
            return true;
        }
        await delay(interval);
        ms += interval;
    }
    return false;
}

client.on("ready", () => {
    console.log("Discord Bot is ready! Logged in as " + client.user.tag);

    // update activity depending on client status
    setInterval(async () => {
        if (await ping()) {
            client.user.setActivity("Client is online", { type: ActivityType.Watching });
        } else {
            client.user.setActivity("Client is offline", { type: ActivityType.Watching });
        }
    }, 1000);
});

// react to messages starting with the command prefix
client.on("messageCreate", async (message) => {
    if (message.content.startsWith(command_prefix)) {
        const args = message.content.slice(command_prefix.length).trim().split(/ +/g); // split arguments, command is ar args[0]

        switch (args[0]) {
            case "help": {
                message.channel.send(help_message);
                break;
            }

            case "wakeup": {
                // send WOL packet to client
                wol.wake(wol_mac, function (error) {
                    if (error) {
                        message.channel.send(":x: An error occured while sending the WOL packet.")
                    } else {
                        message.channel.send(":white_check_mark: WOL packet sent successfully.");
                    }
                })

                // wait until client is online
                if (await waitUntilOnline()) {
                    message.channel.send(":white_check_mark: Client is now online.");
                } else {
                    message.channel.send(":warning: Client is still offline. Maybe, the wakeup request failed?");
                }
                break;
            }

            case "shutdown": {
                message.channel.send(":clock2: Sending shutdown command to the client...");
                // send shutdown command and wait for response or timeout
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

            case "reboot": {
                message.channel.send(":clock2: Sending reboot command to the client...");
                // send reboot command and wait for response or timeout
                fetch(`http://${client_address}/reboot`)
                    .then(response => response.status)
                    .then(status => {
                        if (status == 200) {
                            message.channel.send(":white_check_mark: Client is rebooting...");
                        } else {
                            message.channel.send(":x: An error occured while sending the reboot command.");
                        }
                    })
                    .catch(error => message.channel.send(":x: An error occured while sending the reboot command. Maybe, the client is offline?"));

                await delay(5000); // give client some time to go offline...

                // ...and wait until client is online again
                if (await waitUntilOnline()) {
                    message.channel.send(":white_check_mark: Client is back online.");
                } else {
                    message.channel.send(":warning: Client is still offline. Maybe, the reboot failed?");
                }
                break;
            }

            case "ping": {
                message.channel.send(":clock2: Sending ping command to the client...");

                // send ping command and wait for response or timeout
                if (await ping()) {
                    message.channel.send(":white_check_mark: Client is online.");
                } else {
                    message.channel.send(":x: An error occured while sending the ping command. Maybe, the client is offline?")
                }
                break;
            }
        }
    }
});

client.login(token);
