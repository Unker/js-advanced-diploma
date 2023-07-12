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

    this._level = 1;
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
    }
  }

  // повышаем уровень и характеристики count раз
  levelUp(count) {
    if (!count || count <= 0) {
      return;
    }
    const oldAttack = this.attack;
    const oldHealth = this.health;
    this.attack = Math.max(oldAttack, (oldAttack * (80 + oldHealth)) / 100);
    this.attack = Math.floor(this.attack);
    this.health = Math.floor(Math.min(100, oldHealth + 80));

    this.level += 1;
    this.levelUp(count - 1);
  }
}
