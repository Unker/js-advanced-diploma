import Character from './Character';

export default class PositionedCharacter {
  constructor(character, position) {
    if (!(character instanceof Character)) {
      throw new Error('character must be instance of Character or its children');
    }

    if (typeof position !== 'number') {
      throw new Error('position must be a number');
    }

    this.character = character;
    this.position = position;
  }

  static sortByAttack(positionedCharacter) {
    positionedCharacter.sort((a, b) => b.character.attack - a.character.attack);
    return positionedCharacter;
  }

  static getMaxAttackCharacter(positionedCharacter) {
    return positionedCharacter.reduce((prev, current) => {
      const ret = (prev.character.attack > current.character.attack) ? prev : current;
      return ret;
    });
  }

  static fromObject(object) {
    const positionedCharacter = new PositionedCharacter();
    Object.assign(positionedCharacter, object);

    return positionedCharacter;
  }
}
