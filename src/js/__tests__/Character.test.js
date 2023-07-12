import Character from '../Character';
import Daemon from '../characters/daemon';
import Vampire from '../characters/vampire';
import Undead from '../characters/undead';
import Swordsman from '../characters/swordsman';
import Magician from '../characters/magician';
import Bowman from '../characters/bowman';

describe('Character class', () => {
  test('should throw an error when instantiated directly', () => {
    expect(() => {
      const person = new Character(1);
    }).toThrow('Cannot instantiate Character directly. Please use a subclass.');
  });

  test('should throw an error when not called with "new"', () => {
    expect(() => {
      Character(1);
    }).toThrow('Class constructor Character cannot be invoked without \'new\'');
  });

  test('should throw an error when level is less than 1', () => {
    expect(() => {
      const person = new Daemon(0);
    }).toThrow('Character level should be between 1 and 4.');
  });

  test('should throw an error when level is greater than 4', () => {
    expect(() => {
      const person = new Daemon(5);
    }).toThrow('Character level should be between 1 and 4.');
  });

  test('should create a Character instance with correct properties', () => {
    const daemon = new Daemon(1);

    expect(daemon).toBeInstanceOf(Daemon);
    expect(daemon.level).toBe(1);
    expect(daemon.attack).toBe(10);
    expect(daemon.defence).toBe(10);
    expect(daemon.health).toBe(100);
    expect(daemon.type).toBe('daemon');

    const vampire = new Vampire(2);

    expect(vampire).toBeInstanceOf(Vampire);
    expect(vampire.level).toBe(2);
    expect(vampire.attack).toBe(45);
    expect(vampire.defence).toBe(25);
    expect(vampire.health).toBe(100);
    expect(vampire.type).toBe('vampire');

    const undead = new Undead(3);

    expect(undead).toBeInstanceOf(Undead);
    expect(undead.level).toBe(3);
    expect(undead.attack).toBe(129);
    expect(undead.defence).toBe(10);
    expect(undead.health).toBe(100);
    expect(undead.type).toBe('undead');

    const swordsman = new Swordsman(4);

    expect(swordsman).toBeInstanceOf(Swordsman);
    expect(swordsman.level).toBe(4);
    expect(swordsman.attack).toBe(232);
    expect(swordsman.defence).toBe(10);
    expect(swordsman.health).toBe(100);
    expect(swordsman.type).toBe('swordsman');

    const magician = new Magician(4);

    expect(magician).toBeInstanceOf(Magician);
    expect(magician.level).toBe(4);
    expect(magician.attack).toBe(57);
    expect(magician.defence).toBe(40);
    expect(magician.health).toBe(100);
    expect(magician.type).toBe('magician');

    const bowman = new Bowman(4);

    expect(bowman).toBeInstanceOf(Bowman);
    expect(bowman.level).toBe(4);
    expect(bowman.attack).toBe(145);
    expect(bowman.defence).toBe(25);
    expect(bowman.health).toBe(100);
    expect(bowman.type).toBe('bowman');
  });
});
