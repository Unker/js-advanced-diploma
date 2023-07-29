import Undead from './characters/undead';
import Vampire from './characters/vampire';
import Swordsman from './characters/swordsman';
import Magician from './characters/magician';
import Bowman from './characters/bowman';
import Daemon from './characters/daemon';
import Character from './Character';

/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
export default class Team {
  constructor() {
    // this.characters = characters;
    this.members = new Set();
  }

  add(character) {
    if (!(character instanceof Character)) {
      throw new Error('Объект не принадлежит классу Character');
    }
    if (this.members.has(character)) {
      throw new Error('Персонаж уже находится в команде');
    }
    this.members.add(character);
  }

  addAll(...characters) {
    characters.forEach((character) => {
      this.members.add(character);
    });
  }

  has(character) {
    return this.members.has(character);
  }

  refresh() {
    this.characters.forEach((character) => {
      if (character.health <= 0) {
        this.members.delete(character);
      }
    });
  }

  get characters() {
    return Array.from(this.members);
  }

  static fromObject(object) {
    const team = new Team();

    if (object && object.members) {
      team.characters = object.characters.map((characterObject) => {
        switch (characterObject.type) {
          case 'undead':
            return new Undead(characterObject._level);
          case 'vampire':
            return new Vampire(characterObject._level);
          case 'swordsman':
            return new Swordsman(characterObject._level);
          case 'magician':
            return new Magician(characterObject._level);
          case 'bowman':
            return new Bowman(characterObject._level);
          case 'daemon':
            return new Daemon(characterObject._level);
          default:
            throw new Error(`Unknown character type: ${characterObject.type}`);
        }
      });
    }

    return team;
  }
}
