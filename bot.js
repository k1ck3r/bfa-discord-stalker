require('babel-core/register');
require('babel-polyfill');

const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
const METHODS = require('./methods.js');

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

bot.on('message', (user, userID, channelID, message) => {
  if (message.substring(0, 1) === '!') {
    let args = message.substring(1).split(' ');
    const cmd = args[0];

    args = args.splice(1);
    switch (cmd) {
      case 'help':
        METHODS.returnMessage(bot, channelID, METHODS.showHelp());
        break;
      case 'stalk':
        METHODS.returnMessage(bot, channelID, METHODS.stalk(args[0], args[1], args[2]));
        break;
      case 'azerite':
        METHODS.returnMessage(bot, channelID, METHODS.azerite(args[0], args[1], args[2]));
        break;
      case 'mplus':
        METHODS.returnMessage(bot, channelID, METHODS.mplus(args[0], args[1], args[2]));
        break;
      case 'logs':
        METHODS.returnMessage(bot, channelID, METHODS.logs(args[0], args[1], args[2]));
        break;
      case 'progress':
        METHODS.returnMessage(bot, channelID, METHODS.progress(args[0], args[1], args[2]));
        break;
      case 'affix':
        METHODS.returnMessage(bot, channelID, METHODS.affix(args[0], args[1], args[2]));
        break;
      case 'token':
        METHODS.token(bot, channelID, args[0]);
        break;
      default:
        METHODS.returnMessage(bot, channelID, METHODS.CONSTANTS.ERROR_MSG.cmdNotFound);
        break;
    }
  }
});
