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
 * team.characters // [swordsman, bowman]
 * ```
 * */
export default class Team {
  constructor() {
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
}
