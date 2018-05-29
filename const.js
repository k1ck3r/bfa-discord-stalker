const realmJSON = require('./realms.json');

const HELP = {
  stalk: {
    params: ['[ CHARACTER ]', '[ REGION ]', '[ REALM ]'],
    desc: 'displays general character information (itemlevel, progress, mythic+ score, etc.)',
    ex: '!stalk xepheris eu blackmoore'
  },
  azerite: {
    params: ['{ CHARACTER }', '{ REGION }', '{ REALM }'],
    desc: 'displays azerite level of specified character or region',
    ex: '!azerite xepheris eu blackmoore` or `!azerite eu` or `!azerite'
  },
  mplus: {
    params: ['[ CHARACTER]', '[ REGION ]', '[ REALM ]'],
    desc: 'displays Raider.io mythic plus scores of specified character',
    ex: '!m+ xepheris eu blackmoore'
  },
  logs: {
    params: ['[ CHARACTER ]', '[ REGION]', '[ REALM ]'],
    desc: 'displays top logs via WarcraftLogs of specified character',
    ex: '!logs xepheris eu blackmoore'
  },
  progress: {
    params: ['[ CHARACTER ]', '[ REGION ]', '[ REALM ]'],
    desc: 'displays raid progress of specified character',
    ex: '!progress xepheris eu blackmoore'
  },
  affix: {
    params: ['{ REGION }', '{ SCHEDULE }'],
    desc: 'displays current affixes of specified region or all regions',
    ex: '!affix eu or !affix eu schedule'
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

const WoWTokenURL = 'https://data.wowtoken.info/snapshot.json';

const RaiderIoURL = (character, region, realm) =>
  `https://raider.io/api/v1/characters/profile?region=${region}&realm=${realm}&name=${character}&fields=mythic_plus_scores`;

const REGIONS = ['EU', 'US'];
const TOKEN_REGIONS = ['EU', 'NA', 'CN', 'TW', 'KR'];

const REALMS = {
  US: realmJSON[0],
  EU: realmJSON[1]
};

module.exports = {
  HELP,
  REGIONS,
  ERROR_MSG,
  REALMS,
  WoWTokenURL,
  RaiderIoURL,
  TOKEN_REGIONS
};
