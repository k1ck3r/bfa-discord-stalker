const CONSTANTS = require('./const.js');
const Discord = require('discord.io');
const rp = require('request-promise');

const returnMessage = (bot, channelID, message) => {
  if (!message.to) {
    message.to = channelID;
  }

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
      value: mplusScores.all.toString()
    },
    {
      name: 'DPS',
      value: mplusScores.dps.toString(),
      inline: true
    }
  ];

  if (CONSTANTS.CAN_HEAL.includes(className)) {
    result.push({
      name: 'Healer',
      value: mplusScores.healer.toString(),
      inline: true
    });
  }

  if (CONSTANTS.CAN_TANK.includes(className)) {
    result.push({
      name: 'Tank',
      value: mplusScores.tank.toString(),
      inline: true
    });
  }

  return result;
};

const createMPlusString = data => {
  return {
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
};

const mplus = async (character, region, realm) => {
  if (character && region && realm) {
    const [normedRealm, normedRegion, normedCharacter] = normCharacterInformation(character, region, realm);

    if (validateRegion(normedRegion) && validateRealm(normedRegion, normedRealm)) {
      const jsonURL = CONSTANTS.URLS.MPlus(normedCharacter, normedRegion, normedRealm);
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

*/

const createAffixMessage = data => {
  const fields = [];

  for (let i = 0; i < data.affix_details.length; i += 1) {
    fields.push({
      name: data.affix_details[i].name,
      value: data.affix_details[i].description
    });
  }

  return {
    embed: {
      description: data.title,
      timestamp: new Date(),
      author: {
        name: `Current affixes of ${normalize.upperCase(data.region)}`,
        url: data.leaderboard_url
      },
      fields: fields
    }
  };
};

const affix = async region => {
  let [normedRegion, jsonURL] = ['', ''];

  if (region) {
    normedRegion = normalize.upperCase(region);

    if (validateRegion(normedRegion)) {
      jsonURL = CONSTANTS.URLS.Affixes(normedRegion);
      const jsonResponse = await rp({ uri: jsonURL, json: true });

      const message = createAffixMessage(jsonResponse);

      return message;
    }
    return CONSTANTS.ERROR_MSG.invalidRegion(normedRegion);
  }

  return CONSTANTS.ERROR_MSG.invalidRegion(region);
};

const prettyPrintSeconds = s => {
  s = parseInt(s, 10);

  if (s <= 1) {
    return 'Immediately';
  }
  if (s <= 90) {
    return `${s} seconds`;
  }
  let m = Math.round(s / 60);
  if (m <= 90) {
    return '' + m + ' minute' + (m === 1 ? '' : 's');
  }
  let h = Math.floor(m / 60);
  m = m % 60;
  if (h <= 36) {
    return '' + h + ' hour' + (h === 1 ? '' : 's') + ', ' + m + ' minute' + (m === 1 ? '' : 's');
  }
  let d = Math.floor(h / 24);
  h = h % 24;
  return '' + d + ' day' + (d === 1 ? '' : 's') + ', ' + h + ' hour' + (h === 1 ? '' : 's');
};

const returnDataAge = (now, then) => prettyPrintSeconds(now / 1000 - then / 1000);

const createTokenMessage = (data, normedRegion, validatedTokenRegion) => {
  const now = Date.now();
  const obj = {
    message: '```region | price    | last updated\n'
  };

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
      jsonURL = CONSTANTS.URLS.WoWToken;
    } else {
      return CONSTANTS.ERROR_MSG.invalidRegion(normedRegion);
    }
  } else {
    jsonURL = CONSTANTS.URLS.WoWToken;
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

const returnClassByID = id => CONSTANTS.CLASSES[id];

const returnRaceById = id => {
  let race;
  switch (id) {
    case 1:
      race = 'Human';
      break;
    case 3:
      race = 'Dwarf';
      break;
    case 4:
      race = 'Night Elf';
      break;
    case 7:
      race = 'Gnome';
      break;
    case 11:
      race = 'Draenei';
      break;
    case 22:
      race = 'Worgen';
      break;
    case 25:
      race = 'Pandaren';
      break;
    case 2:
      race = 'Orc';
      break;
    case 5:
      race = 'Undead';
      break;
    case 6:
      race = 'Tauren';
      break;
    case 8:
      race = 'Troll';
      break;
    case 9:
      race = 'Goblin';
      break;
    case 10:
      race = 'Blood Elf';
      break;
    case 26:
      race = 'Pandaren';
      break;
  }

  return race;
};

const createProgressString = (data, region) => {
  const dataAge = returnDataAge(Date.now(), data.lastModified);

  console.log(dataAge);

  return {
    embed: {
      description: `${returnRaceById(data.race)} ${returnClassByID(data.class)}`,
      timestamp: new Date(),
      thumbnail: {
        url: `https://render-eu.worldofwarcraft.com/character/${data.thumbnail}`
      },
      author: {
        name: `${data.name} @ ${region}-${data.realm}`,
        icon_url: `https://render-eu.worldofwarcraft.com/character/${data.thumbnail}`
      },
      fields: []
    }
  };
};

const progress = async (character, region, realm) => {
  if (character && region && realm) {
    const [normedRealm, normedRegion, normedCharacter] = normCharacterInformation(character, region, realm);

    if (validateRegion(normedRegion) && validateRealm(normedRegion, normedRealm)) {
      const jsonURL = CONSTANTS.URLS.Progress(normedCharacter, normedRegion, normedRealm);
      const jsonResponse = await rp({ uri: jsonURL, json: true });

      return createProgressString(jsonResponse, normedRegion);
    }
    return CONSTANTS.ERROR_MSG.invalidRealmOrRegion(normedRegion, normedRealm);
  }

  return CONSTANTS.ERROR_MSG.paramMissing;
};

const returnAnswer = async (cmd, args) => {
  let answer = '';

  switch (cmd) {
    case 'token':
      try {
        answer = await token(args[0]);
      } catch (e) {
        answer = CONSTANTS.ERROR_MSG.WoWTokenError(e);
      }
      break;
    case 'help':
      answer = showHelp();
      break;
    case 'mplus':
      try {
        answer = await mplus(args[0], args[1], args[2]);
      } catch (e) {
        answer = CONSTANTS.ERROR_MSG.LookupError(e);
      }
      break;
    case 'affix':
      try {
        answer = await affix(args[0]);
      } catch (e) {
        answer = CONSTANTS.ERROR_MSG.AffixError(e);
      }
      break;
    case 'progress':
      try {
        answer = await progress(args[0], args[1], args[2]);
      } catch (e) {
        answer = CONSTANTS.ERROR_MSG.LookupError(e);
      }
      break;
    default:
      answer = CONSTANTS.ERROR_MSG.cmdNotFound;
      break;
  }

  return await answer;
};

module.exports = {
  returnMessage,
  returnAnswer
};
