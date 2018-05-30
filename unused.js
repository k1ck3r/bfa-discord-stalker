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

const getItemlevelThresholds = items => {
  let [lowest, highest] = [Infinity, -Infinity];
  Reflect.deleteProperty(items, 'tabard');

  Object.values(items).forEach(item => {
    if (typeof item === 'object' && item !== undefined) {
      item.itemLevel < lowest ? (lowest = item.itemLevel) : void 0;
      item.itemLevel > highest ? (highest = item.itemLevel) : void 0;
    }
  });

  return `${lowest} / ${highest}`;
};
