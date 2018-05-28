const CONSTANTS = require('./const.js');
const API_KEYS = require('./api_keys.js');
const rp = require('request-promise');

const returnMessage = (bot, channelID, message) => {
  bot.sendMessage({
    to: channelID,
    message
  });
};

const showHelp = () => {
  let helpString = `
  World of Warcraft: Discord Stalker Bot - HELP
  v1.0.0 <closed alpha>

  \`{ }\` signal OPTIONAL parameters whilst \`[ ]\` signal REQUIRED parameters`;

  const cmds = Object.keys(CONSTANTS.HELP);
  const cmdInfo = cmds.map(key => CONSTANTS.HELP[key]);

  for (let i = 0; i < cmds.length; i += 1) {
    helpString += `\n
    \`!${cmds[i]} `;

    const currentInfo = cmdInfo[i];

    for (let k = 0; k < currentInfo.params.length; k += 1) {
      helpString += `${currentInfo.params[k]} `;
    }

    helpString += `\`
    ex. \`${currentInfo.ex}\`
    *${currentInfo.desc}*
    `;
  }

  return helpString;
};

const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

const stalk = (character, region, realm) => [character, region, realm];

const validateRegion = region => {
  if (CONSTANTS.REGIONS.includes(region)) {
    return true;
  }
  return false;
};

const validateTokenRegion = region => {
  if (CONSTANTS.TOKEN_REGIONS.includes(region)) {
    return true;
  }

  return false;
};

const validateRealm = (region, realm) => {
  if (CONSTANTS.REGIONS[region].includes(realm)) {
    return true;
  }
  return false;
};

const normalize = {
  lowerCaseCapitalization: string => capitalize(string.toLowerCase()),
  upperCase: string => string.toUpperCase()
};

const azerite = (character, region, realm) => {
  let [normedRealm, normedRegion, normedCharacter] = ['', '', ''];

  if (realm) {
    normedRealm = normalize.lowerCaseCapitalization(realm);
  }

  if (region) {
    normedRegion = normalize.upperCase(region);
  }

  if (character) {
    normedCharacter = normalize.lowerCaseCapitalization(character);
  }

  if (character && region && realm) {
    if (validateRegion(normedRegion) && validateRealm(normedRegion, normedRealm)) {
      return CONSTANTS.ERROR_MSG.apiError;
    }
    return CONSTANTS.ERROR_MSG.invalidRealmOrRegion(normedRegion, normedRealm);
  } else if (region) {
    if (validateRegion(normedRegion)) {
      return CONSTANTS.ERROR_MSG.apiError;
    }
    return CONSTANTS.ERROR_MSG.invalidRealmOrRegion(normedRegion, normedRealm);
  } else if (!normedCharacter && !region && !realm) {
    return CONSTANTS.ERROR_MSG.apiError;
  }
  return CONSTANTS.ERROR_MSG.paramMissing;
};

const mplus = (character, region, realm) => [character, region, realm];

const logs = (character, region, realm) => [character, region, realm];

const progress = (character, region, realm) => [character, region, realm];

const affix = (region, schedule) => [region, schedule];

const createTokenString = (data, normedRegion, validatedTokenRegion) => {
  let overviewString = 'region | price | last updated\n';

  if (normedRegion !== '' && validatedTokenRegion) {
    overviewString += `${normedRegion} | ${data[normedRegion].formatted.buy} | ${data[normedRegion].raw.updatedISO8601}`;
  } else {
    CONSTANTS.TOKEN_REGIONS.forEach(tokenRegion => {
      overviewString += `${tokenRegion} | ${data[tokenRegion].formatted.buy} | ${data[tokenRegion].raw.updatedISO8601}\n`;
    });
  }

  return overviewString;
};

const token = (bot, channelID, region) => {
  let [normedRegion, jsonURL, validatedTokenRegion] = ['', '', false];

  if (region) {
    normedRegion = normalize.upperCase(region);
    validatedTokenRegion = validateTokenRegion(normedRegion);
    if (validatedTokenRegion) {
      jsonURL = CONSTANTS.WoWTokenURL;
    } else {
      return CONSTANTS.ERROR_MSG.invalidRegion(normedRegion);
    }
  } else {
    jsonURL = CONSTANTS.WoWTokenURL;
  }

  if (jsonURL !== '') {
    async function getTokenData() {
      const jsonResponse = await rp({ uri: jsonURL, json: true });
      const string = createTokenString(jsonResponse, normedRegion, validatedTokenRegion);
      return string;
    }
    getTokenData().then(string => {
      returnMessage(bot, channelID, string);
    });
  }
};

module.exports = {
  returnMessage,
  showHelp,
  capitalize,
  stalk,
  azerite,
  mplus,
  logs,
  progress,
  affix,
  token,
  CONSTANTS
};
