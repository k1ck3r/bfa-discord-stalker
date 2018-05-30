const realmJSON = require('./realms.json');
const API = require('./api_keys.js');

const HELP = {
  stalk: {
    params: ['[ CHARACTER ]', '[ REGION ]', '[ REALM ]'],
    desc: 'displays general character information (itemlevel, progress, mythic+ score, etc.)',
    ex: '!stalk xepheris eu blackmoore'
  },
  logs: {
    params: ['[ CHARACTER ]', '[ REGION]', '[ REALM ]'],
    desc: 'displays top logs via WarcraftLogs of specified character',
    ex: '!logs xepheris eu blackmoore'
  },
  affix: {
    params: ['[ REGION ]'],
    desc: 'displays current affixes of specified region',
    ex: '!affix eu'
  },
  token: {
    params: ['{ REGION }'],
    desc: 'displays current token prices of specified region or all regions',
    ex: '!token eu'
  }
};

const ERROR_MSG = {
  apiError: { message: 'Sorry, the official API currently does not provide this information yet!' },
  invalidRegion: region => ({ message: `Sorry, \`${region}\` is not supported or does not exist!` }),
  invalidRealmOrRegion: (region, realm) => ({ message: `Sorry, \`${region}-${realm}\` could not be found!` }),
  invalidCharacter: (character, region, realm) => ({
    message: `Sorry, \`${character.toUpperCase()}\` on \`${region}-${realm}\` could not be found!`
  }),
  cmdNotFound: { message: 'Command not found - use `!help` if you are lost.' },
  paramMissing: { message: 'Parameter missing - use `!help` if you are lost.' },
  WoWTokenError: error => ({
    message: `Sorry, WoWToken.info appears to be unavailable currently (error message: \`${error}\`)`
  }),
  LookupError: error => ({
    message: `Sorry, could not fetch this characters information (error message: \`${error}\`)`
  }),
  AffixError: error => ({
    message: `Sorry, couldn't fetch affix data - please try again later (error message: \`${error}\`)`
  })
};

const URLS = {
  WoWToken: 'https://data.wowtoken.info/snapshot.json',
  MPlus: (character, region, realm) =>
    `https://raider.io/api/v1/characters/profile?region=${region}&realm=${realm}&name=${character}&fields=mythic_plus_scores`,
  Affixes: region => `https://raider.io/api/v1/mythic-plus/affixes?region=${region}&locale=en`,
  Progress: (character, region, realm) =>
    `https://raider.io/api/v1/characters/profile?region=${region}&realm=${realm}&name=${character}&fields=gear%2Craid_progression%2Cmythic_plus_scores%2Cmythic_plus_recent_runs%2Cmythic_plus_highest_level_runs`,
  Achievements: (character, region, realm) =>
    `https://${region}.api.battle.net/wow/character/${realm}/${character}?fields=achievements&locale=en_GB&apikey=${API.KEYS.battleNet}`
};

const REGIONS = ['EU', 'US'];
const TOKEN_REGIONS = ['EU', 'NA', 'CN', 'TW', 'KR'];

const CAN_HEAL = ['Paladin', 'Druid', 'Priest', 'Monk', 'Shaman'];
const CAN_TANK = ['Demon Hunter', 'Death Knight', 'Warrior', 'Monk', 'Druid'];
const CLASSES = ['', 'Warrior', 'Paladin', 'Hunter', 'Rogue', 'Priest', 'Death Knight', 'Shaman', 'Mage', 'Warlock', 'Monk', 'Druid', 'Demon Hunter'];

const MPLUS_ACHIEVEMENTS = [11183, 11184, 11185, 11162];
const MPLUS_ACHIEVEMENT_LEVELS = [2, 5, 10, 15];

const BFA_MPLUS_ACHIEVEMENTS_SEASON_ONE = [13079, 13080];
const BFA_MPLUS_ACHIEVEMENTS_SEASON_TWO = []; // add IDs via wowhead url:  http://bfa.wowhead.com/achievement=13080/ <-- this number
const BFA_MPLUS_LEVELS = [10, 15];

const REALMS = {
  US: realmJSON[0],
  EU: realmJSON[1]
};

module.exports = {
  HELP,
  REGIONS,
  ERROR_MSG,
  REALMS,
  URLS,
  TOKEN_REGIONS,
  CAN_HEAL,
  CAN_TANK,
  CLASSES,
  MPLUS_ACHIEVEMENTS,
  MPLUS_ACHIEVEMENT_LEVELS,
  BFA_MPLUS_ACHIEVEMENTS_SEASON_ONE,
  BFA_MPLUS_ACHIEVEMENTS_SEASON_TWO,
  BFA_MPLUS_LEVELS
};
