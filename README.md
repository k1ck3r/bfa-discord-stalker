# bfa-discord-stalker

just a small Discord bot for competitive Mythic+ players, built upon


1. [WoWToken.info](https://WoWToken.info) 
2. [raider.io API](https://raider.io)
3. [warcraftlogs.com API](https://warcraftlogs.com)
4. [battle.net API](https://dev.battle.net)

# Setup

```sh
git clone https://github.com/ljosberinn/bfa-discord-stalker/

cd bfa-discord-stalker

npm install
```

go to

```sh
node_modules/discord.io/lib/index.js
```

and change line 6

```js
GATEWAY_VERSION = 5,
```

to 6

then you may start it with

```sh
node bot.js
```
