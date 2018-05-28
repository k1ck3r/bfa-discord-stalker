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

const returnAnswer = async (cmd, args) => {
  let answer = '';

  switch (cmd) {
    case 'token':
      try {
        answer = await METHODS.token(args[0]);
      } catch (err) {
        answer = METHODS.CONSTANTS.ERROR_MSG.WoWTokenError(err);
      }
      break;
    default:
      answer = METHODS.CONSTANTS.ERROR_MSG.cmdNotFound;
      break;
  }

  return await answer;
};

bot.on('message', async (user, userID, channelID, message) => {
  if (message.substring(0, 1) === '!') {
    let args = message.substring(1).split(' ');
    const cmd = args[0];

    args = args.splice(1);

    const string = await returnAnswer(cmd, args);

    METHODS.returnMessage(bot, channelID, string);
  }
});
