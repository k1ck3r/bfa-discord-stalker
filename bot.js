const Discord = require('discord.io');
const logger = require('winston');

const auth = require('./auth.json');
const METHODS = require('./methods.js');
const CONSTANTS = require('./const.js');

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';

const bot = new Discord.Client({
  token: auth.token,
  autorun: true
});

bot.on('ready', () => {
  logger.info(`Connected - logged in as: ${bot.username} @ ${bot.id}`);
});

bot.on('message', async (user, userID, channelID, message) => {
  if (message.substring(0, 1) === '!') {
    let args = message.substring(1).split(' ');

    const cmd = args[0];
    args = args.splice(1);

    const answer = await METHODS.returnAnswer(cmd, args);

    METHODS.returnMessage(bot, channelID, answer);
  }
});
