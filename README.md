# RemoteControl-Discord
### The Discord Bot module of the [RemoteControl project](https://github.com/manolol1/RemoteControl).

The Discord Bot sends commands and WakeOnLan packets to the [client](https://github.com/manolol1/RemoteControl-Client). It must run on a different computer than the client (e.g. a low-power device like a Raspberry Pi) and should be in the same network.

## Requirements
* Git, Node.js and NPM

## Installation and Configuration
1. Install the [client program](https://github.com/manolol1/RemoteControl-Client) on another computer, if you haven't already done that.
2. Create a new application in the [Discord Developer Portal](https://discord.com/developers/applications).
3. On the installation tab, add the following scopes: applications.commands, bot; and the following permissions: Read Message History, Send Messages
4. On the Bot tab, enable the "Message Content Intent" under "Privileged Gateway Intents". Also copy the bot token. You will need it later.
5. Install the required programs (Git and Node.js) on the computer. This can usually be done with the default package manager of your operating system.
6. Clone the repository to your machine: `git clone https://github.com/manolol1/RemoteControl-Discord.git`
7. Copy the configuration file template: `cp config.yaml.template config.yaml`
8. Edit the configuration file with a text editor. Fill in the token, the client address and client mac. Optionally, make changes to the other values.
9. Install dependencies: `npm install`
10. Run the program: `node app.js`

Now, you can add the bot to your server. It should be online, as long as the app.js program is running.

The default help message contains a list and explanation of all available commands. By default, send `!help` in a channel to read it.

You should also make sure that the bot is always automatically started on boot. This can be achieved through a Cronjob or a Systemd service.

If the bot is not working, check the command like output of app.js and make sure that all required permissions and Gateway Intents are enabled in the Discord Developer Portal.

## Configuration file (config.yaml)
To create an initial configuration file, copy config.yaml.template into a new file with the name "config.yaml".
The config values should be self-explanatory.

The following values always need to be changed for the bot to work: token, client_address, client_mac

Make sure that the configuration file is always valid. If the configuration file can't be parsed, the program will crash. After making changes, the program needs to be restarted.

## Scripts
Script support can be enabled or disabled in the [client](https://github.com/manolol1/RemoteControl-Client)'s configuration file.

If scripts are disabled on the client, the bot will receive a "403 Forbidden" status code and respond with an error message.
