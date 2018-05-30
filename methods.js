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

const returnSpecAgnosticMPlusScores = (className, mplusScores, header) => {
  const result = [];

  if (header) {
    result.push({
      name: '--------------------------------------------------------------------------------Mythic+ Scores',
      value: '_via raider.io_'
    });
  }

  result.push(
    {
      name: 'All',
      value: mplusScores.all.toString()
    },
    {
      name: 'DPS',
      value: mplusScores.dps.toString(),
      inline: true
    }
  );

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
      jsonURL = CONSTANTS.URLS.RaiderIOAffixes(normedRegion);
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
    return 'just now';
  }
  if (s <= 90) {
    return `${s} seconds`;
  }

  let m = Math.floor(s / 60);
  if (m <= 90) {
    let result = `${m} minute`;
    if (m !== 1) {
      result += 's';
    }

    s = Math.round((s / 60 - m) * 60);
    if (s > 0) {
      result += `, ${s} second`;
    }
    if (s > 1) {
      result += 's';
    }
    return result;
  }

  let h = Math.floor(m / 60);
  m = m % 60;
  if (h <= 36) {
    let result = `${h} hour`;
    if (h !== 1) {
      result += 's';
    }
    result += `, ${m} minute`;
    if (m !== 1) {
      result += 's';
    }

    return result;
  }

  let d = Math.floor(h / 24);
  h = h % 24;
  let result = `${d} day`;
  if (d !== 1) {
    result += 's';
  }
  result += `, ${h} hour`;
  if (h !== 1) {
    result += 's';
  }
  return result;
};

const returnDataAge = then => prettyPrintSeconds(Date.now() / 1000 - then / 1000);

const createTokenMessage = (data, normedRegion, validatedTokenRegion) => {
  const obj = {
    message: '```region | price    | last updated\n'
  };

  if (normedRegion !== '' && validatedTokenRegion) {
    const age = returnDataAge(Date.parse(data[normedRegion].raw.updatedISO8601));

    obj.message += `    ${normedRegion} | ${data[normedRegion].formatted.buy} | ${age} ago`;
  } else {
    CONSTANTS.TOKEN_REGIONS.forEach(tokenRegion => {
      const age = returnDataAge(Date.parse(data[tokenRegion].raw.updatedISO8601));

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

const getMPlusRunData = (data, type) => {
  const result = [];

  let headerObj = {
    name: '--------------------------------------------------------------------------------',
    value: '_via raider.io_'
  };

  type === 'highest' ? (headerObj.name += 'Mythic+ Highest Runs') : void 0;
  type === 'recent' ? (headerObj.name += 'Mythic+ Recent Runs') : void 0;

  data.length === 0 ? (headerObj.value += '\nnone within this season') : void 0;

  result.push(headerObj);

  for (let i = 0; i < data.length; i += 1) {
    result.push({
      name: `${data[i].dungeon} - ${data[i].mythic_level} +${data[i].num_keystone_upgrades}`,
      value: `[${prettyPrintSeconds(data[i].clear_time_ms / 1000)} - ${returnDataAge(Date.parse(data[i].completed_at))} ago](${data[i].url})`
    });
  }

  return result;
};

const getRaidAchievement = (raidName, achievementContainer) => {
  let achievementInfoString = '';

  const [achievementsCompleted, achievementsCompletedTimestamp] = [
    achievementContainer.achievements.achievementsCompleted,
    achievementContainer.achievements.achievementsCompletedTimestamp
  ];

  if (CONSTANTS.RAID_NAMES.includes(raidName)) {
    const index = CONSTANTS.RAID_NAMES.indexOf(raidName);
    const [aotcID, ceID] = [CONSTANTS.AHEAD_OF_THE_CURVE_ACHIEVEMENTS[index], CONSTANTS.CUTTING_EDGE_ACHIEVEMENTS[index]];

    if (achievementsCompleted.includes(ceID)) {
      achievementInfoString = ' | AOTC & CE';
    } else if (achievementsCompleted.includes(aotcID)) {
      achievementInfoString = ' | AOTC';
    }
  }

  return achievementInfoString;
};

const sanitizeRaidName = (raidName, achievementContainer) => {
  let correctName = '';

  raidName
    .replace(/-/g, ' ')
    .split(' ')
    .forEach(part => {
      // capitalize in general
      part !== 'of' ? (part = capitalize(part)) : void 0;
      // if a 'the' got capizalized within the string, tolowerCase() it again
      part === 'The' && raidName.indexOf(part.toLowerCase()) > 0 ? (part = part.toLowerCase()) : void 0;
      // add , for Antorus, the Burning Throne
      part === 'Antorus' ? (part += ', ') : void 0;

      correctName += `${part} `;
    });

  correctName += getRaidAchievement(raidName, achievementContainer);

  return correctName;
};

const getKeystoneProgress = (achievementsCompleted, achievementsCompletedTimestamp, type) => {
  const obj = {
    maxLevelCompleted: 0,
    completedIndex: 0,
    completedTimestamp: 0
  };

  let [achievementContainer, achievementLevels, result] = [, ,];

  if (type === 'General') {
    achievementContainer = CONSTANTS.MPLUS_ACHIEVEMENTS;
    achievementLevels = CONSTANTS.MPLUS_ACHIEVEMENT_LEVELS;
  } else if (type === 'BfA Season One') {
    achievementContainer = CONSTANTS.BFA_MPLUS_ACHIEVEMENTS_SEASON_ONE;
    achievementLevels = CONSTANTS.BFA_MPLUS_LEVELS;
  } /* else if(type === 'BfA Season Two') {
    achievementContainer = CONSTANTS.BFA_MPLUS_ACHIEVEMENTS_SEASON_TWO;
    achievementLevels = CONSTANTS.BFA_MPLUS_LEVELS
  }*/

  achievementContainer.forEach(id => {
    if (achievementsCompleted.includes(id)) {
      obj.maxLevelCompleted = achievementLevels[achievementContainer.indexOf(id)];
      obj.completedIndex = achievementsCompleted.indexOf(id);
    }
  });

  obj.maxLevelCompleted > 0 ? (obj.completedTimestamp = achievementsCompletedTimestamp[obj.completedIndex]) : void 0;

  result = `${type}: ${obj.maxLevelCompleted}`;

  obj.completedTimestamp > 0 ? (result += ` - ${returnDataAge(obj.completedTimestamp)} ago`) : void 0;

  return result;
};

const getHighestKeystoneAchievement = achievementContainer => {
  let result = '';

  const [achievementsCompleted, achievementsCompletedTimestamp] = [
    achievementContainer.achievements.achievementsCompleted,
    achievementContainer.achievements.achievementsCompletedTimestamp
  ];

  result += getKeystoneProgress(achievementsCompleted, achievementsCompletedTimestamp, 'General');
  result += `\n${getKeystoneProgress(achievementsCompleted, achievementsCompletedTimestamp, 'BfA Season One')}`;
  // result += `\n${getKeystoneProgress(achievementsCompleted, achievementsCompletedTimestamp, 'BfA Season Two')}`;

  return result;
};

const getRaidProgression = (progressionData, achievementContainer) => {
  const [raids, progression] = [Object.keys(progressionData), Object.values(progressionData)];

  const result = [
    {
      name: '--------------------------------------------------------------------------------Raid Progression',
      value: 'Normal | Heroic | Mythic'
    }
  ];

  for (let i = 0; i < progression.length; i += 1) {
    result.push({
      name: `${sanitizeRaidName(raids[i], achievementContainer)}`,
      value: `${progression[i].normal_bosses_killed} | ${progression[i].heroic_bosses_killed} | ${progression[i]
        .mythic_bosses_killed} of ${progression[i].total_bosses}`
    });
  }

  return result;
};

const getCharacterProgression = (progress, achievementContainer) => {
  const [result, gear] = [[], progress.gear];

  // extract current gear
  result.push({
    name: 'Itemlevel',
    value: `${gear.item_level_equipped} / ${gear.item_level_total}`,
    inline: true
  });

  // extract Artifact Traits respectively Azerite/Heart of Azeroth level
  result.push({
    name: 'AP/Azerite Level',
    value: gear.artifact_traits.toString(),
    inline: true
  });

  // extract highest KeystoneAchievements
  result.push({
    name: '--------------------------------------------------------------------------------Highest Mythic+ achievement',
    value: getHighestKeystoneAchievement(achievementContainer)
  });

  // extract MPlusScores
  const MPlusData = returnSpecAgnosticMPlusScores(progress.class, progress.mythic_plus_scores, true);

  for (let i = 0; i < MPlusData.length; i += 1) {
    result.push(MPlusData[i]);
  }

  // extract highest MPlus runs
  const highestRuns = getMPlusRunData(progress.mythic_plus_highest_level_runs, 'highest');

  for (let i = 0; i < highestRuns.length; i += 1) {
    result.push(highestRuns[i]);
  }

  // extract most recent MPlus runs
  const recentRuns = getMPlusRunData(progress.mythic_plus_recent_runs, 'recent');

  for (let i = 0; i < recentRuns.length; i += 1) {
    result.push(recentRuns[i]);
  }

  // extract raid progression & achievement
  const raidProgression = getRaidProgression(progress.raid_progression, achievementContainer);

  for (let i = 0; i < raidProgression.length; i += 1) {
    result.push(raidProgression[i]);
  }

  return result;
};

const createProgressString = (progress, achievementContainer) => {
  return {
    embed: {
      description: `${progress.active_spec_name} ${progress.class}`,
      timestamp: new Date(),
      thumbnail: {
        url: progress.thumbnail_url
      },
      author: {
        name: `${progress.name} @ ${normalize.upperCase(progress.region)}-${progress.realm}`,
        icon_url: progress.thumbnail_url,
        url: progress.profile_url
      },
      fields: getCharacterProgression(progress, achievementContainer)
    }
  };
};

const stalk = async (character, region, realm) => {
  if (character && region && realm) {
    const [normedRealm, normedRegion, normedCharacter] = normCharacterInformation(character, region, realm);

    if (validateRegion(normedRegion) && validateRealm(normedRegion, normedRealm)) {
      const urls = [
        CONSTANTS.URLS.RaiderIOProgress(normedCharacter, normedRegion, normedRealm),
        CONSTANTS.URLS.BlizzardAchievements(normedCharacter, normedRegion, normedRealm)
      ];

      const progress = await rp({ uri: urls[0], json: true });
      const achievementContainer = await rp({ uri: urls[1], json: true });

      return createProgressString(progress, achievementContainer);
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
    case 'affix':
      try {
        answer = await affix(args[0]);
      } catch (e) {
        answer = CONSTANTS.ERROR_MSG.AffixError(e);
      }
      break;
    case 'stalk':
      try {
        answer = await stalk(args[0], args[1], args[2]);
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
