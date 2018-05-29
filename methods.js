const CONSTANTS = require('./const.js');
const Discord = require('discord.io');
//const API_KEYS = require('./api_keys.js');
const rp = require('request-promise');

const returnMessage = (bot, channelID, message) => {
  if (!message.to) {
    message.to = channelID;
  }

  console.log(message);

  bot.sendMessage(message);
};

const showHelp = () => {
  let obj = { message: '' };

  obj.message += `World of Warcraft: Discord Stalker Bot - HELP
  v1.0.0 <closed alpha>

  \`{ }\` signal OPTIONAL parameters whilst \`[ ]\` signal REQUIRED parameters`;

  const cmds = Object.keys(CONSTANTS.HELP);
  const cmdInfo = cmds.map(key => CONSTANTS.HELP[key]);

  for (let i = 0; i < cmds.length; i += 1) {
    obj.message += `\n
    \`!${cmds[i]} `;

    const currentInfo = cmdInfo[i];

    for (let k = 0; k < currentInfo.params.length; k += 1) {
      obj.message += `${currentInfo.params[k]} `;
    }

    obj.message += `\`
    ex. \`${currentInfo.ex}\`
    *${currentInfo.desc}*
    `;
  }

  return obj;
};

const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

const stalk = (character, region, realm) => [character, region, realm];

const validateRegion = region => (CONSTANTS.REGIONS.includes(region) ? true : false);

const validateTokenRegion = region => (CONSTANTS.TOKEN_REGIONS.includes(region) ? true : false);

const validateRealm = (region, realm) => {
  const [sanitizedRealm, realmContainer] = [realm.toLowerCase().replace(/[áéíóú\- ']/g, ''), CONSTANTS.REALMS[region]];

  return Object.values(realmContainer).some(realmObj => realmObj.sanitized === sanitizedRealm);
};

const normalize = {
  lowerCaseCapitalization: string => capitalize(string.toLowerCase()),
  upperCase: string => string.toUpperCase()
};

const normCharacterInformation = (character, region, realm) => [
  normalize.lowerCaseCapitalization(realm),
  normalize.upperCase(region),
  normalize.lowerCaseCapitalization(character).slice(0, 12)
];

/*
const azerite = (character, region, realm) => {
  const [normedRealm, normedRegion, normedCharacter] = normCharacterInformation(character, region, realm);

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

*/

const returnSpecAgnosticMPlusScores = (className, mplusScores) => {
  const result = [
    {
      name: 'All',
      value: mplusScores.all
    },
    {
      name: 'DPS',
      value: mplusScores.dps,
      inline: true
    }
  ];

  const canHeal = ['Paladin', 'Druid', 'Priest', 'Monk', 'Shaman'];
  const canTank = ['Demon Hunter', 'Death Knight', 'Warrior', 'Monk', 'Druid'];

  if (canHeal.includes(className)) {
    result.push({
      name: 'Healer',
      value: mplusScores.healer,
      inline: true
    });
  }

  if (canTank.includes(className)) {
    result.push({
      name: 'Tank',
      value: mplusScores.tank,
      inline: true
    });
  }

  return result;
};

const createMPlusString = data => {
  const obj = {
    embed: {
      description: `${data.race} ${data.class}`,
      timestamp: new Date(),
      thumbnail: {
        url: data.thumbnail_url
      },
      author: {
        name: `${data.name} @ ${normalize.upperCase(data.region)}-${data.realm}`,
        url: data.profile_url,
        icon_url: data.thumbnail_url
      },
      fields: returnSpecAgnosticMPlusScores(data.class, data.mythic_plus_scores)
    }
  };

  return obj;
};

const mplus = async (character, region, realm) => {
  if (character && region && realm) {
    const [normedRealm, normedRegion, normedCharacter] = normCharacterInformation(character, region, realm);

    if (validateRegion(normedRegion) && validateRealm(normedRegion, normedRealm)) {
      const jsonURL = CONSTANTS.RaiderIoURL(normedCharacter, normedRegion, normedRealm);
      const jsonResponse = await rp({ uri: jsonURL, json: true });

      return createMPlusString(jsonResponse);
    }
    return CONSTANTS.ERROR_MSG.invalidRealmOrRegion(normedRegion, normedRealm);
  }

  return CONSTANTS.ERROR_MSG.paramMissing;
};

/*

const logs = (character, region, realm) => [character, region, realm];

const progress = (character, region, realm) => [character, region, realm];

const affix = (region, schedule) => [region, schedule];

*/

const prettyPrintSeconds = s => {
  s = parseInt(s, 10);

  if (s <= 1) {
    return 'Immediately';
  }
  if (s <= 90) {
    return '' + s + ' seconds';
  }
  let m = Math.round(s / 60);
  if (m <= 90) {
    return '' + m + ' minute' + (m == 1 ? '' : 's');
  }
  let h = Math.floor(m / 60);
  m = m % 60;
  if (h <= 36) {
    return '' + h + ' hour' + (h == 1 ? '' : 's') + ', ' + m + ' minute' + (m == 1 ? '' : 's');
  }
  let d = Math.floor(h / 24);
  h = h % 24;
  return '' + d + ' day' + (d == 1 ? '' : 's') + ', ' + h + ' hour' + (h == 1 ? '' : 's');
};

const returnDataAge = (now, then) => prettyPrintSeconds(now / 1000 - then / 1000);

const createTokenMessage = (data, normedRegion, validatedTokenRegion) => {
  const now = Date.now();
  let obj = { message: '' };

  obj.message += '```region | price    | last updated\n';

  if (normedRegion !== '' && validatedTokenRegion) {
    const age = returnDataAge(now, Date.parse(data[normedRegion].raw.updatedISO8601));

    obj.message += `    ${normedRegion} | ${data[normedRegion].formatted.buy} | ${age} ago`;
  } else {
    CONSTANTS.TOKEN_REGIONS.forEach(tokenRegion => {
      const age = returnDataAge(now, Date.parse(data[tokenRegion].raw.updatedISO8601));

      obj.message += `    ${tokenRegion} | ${data[tokenRegion].formatted.buy} | ${age} ago\n`;
    });
  }

  obj.message += '```';

  return obj;
};

const token = async region => {
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
      const message = createTokenMessage(jsonResponse, normedRegion, validatedTokenRegion);
      return message;
    }
    return getTokenData();
  }
};

module.exports = {
  returnMessage,
  showHelp,
  capitalize,
  stalk,
  mplus,
  token,
  CONSTANTS
  /*azerite,
  logs,
  progress,
  affix, */
};
