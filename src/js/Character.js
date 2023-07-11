/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    if (new.target === Character) {
      throw new Error('Cannot instantiate Character directly. Please use a subclass.');
    }

    if (level < 1 || level > 4) {
      throw new Error('Character level should be between 1 and 4.');
    }

    this._level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 100;
    this.type = type;
  }

  get level() {
    return this._level;
  }

  set level(value) {
    if (typeof value === 'number' && value >= 1 && value <= 4) {
      this._level = value;
    } else {
      throw new Error('Invalid level value. Level must be between 1 and 4');
    }
  }
}
