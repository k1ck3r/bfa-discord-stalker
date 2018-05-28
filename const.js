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
  apiError: 'Sorry, the official API currently does not provide this information yet!',
  invalidRegion: region => `Sorry, ${region} is not supported or does not exist!`,
  invalidRealmOrRegion: (region, realm) => `Sorry, ${region}-${realm} could not be found!`,
  invalidCharacter: (character, region, realm) => `Sorry, ${character.toUpperCase} on ${region}-${realm} could not be found!`,
  cmdNotFound: 'Command not found - use `!help` if you are lost.',
  paramMissing: 'Parameter missing - use `!help` if you are lost.',
  WoWTokenError: error => `Sorry, WoWToken.info appears to be unavailable currently (error message: ${error})`
};

const WoWTokenURL = 'https://data.wowtoken.info/snapshot.json';

const REGIONS = ['EU', 'US'];
const TOKEN_REGIONS = ['EU', 'NA', 'CN', 'TW', 'KR'];

const REALMS = {
  EU: [],
  US: []
};

module.exports = {
  HELP,
  REGIONS,
  ERROR_MSG,
  REALMS,
  WoWTokenURL,
  TOKEN_REGIONS
};
