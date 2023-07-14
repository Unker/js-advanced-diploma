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

  static fromObject(object) {
    const positionedCharacter = new PositionedCharacter();
    Object.assign(positionedCharacter, object);

    return positionedCharacter;
  }
}
