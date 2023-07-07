import { characterGenerator, generateTeam } from '../generators';
import Bowman from '../characters/bowman';
import Swordsman from '../characters/swordsman';
import Magician from '../characters/magician';

describe('characterGenerator function', () => {
  test('should generate a random character with the correct properties', () => {
    const playerTypes = [Bowman, Swordsman, Magician];
    const maxLevel = 2;
    const playerGenerator = characterGenerator(playerTypes, maxLevel);

    for (let i = 0; i < 10; i += 1) {
      const character = playerGenerator.next().value;

      expect(playerTypes).toContain(character.constructor);
      expect(character.level).toBeGreaterThanOrEqual(1);
      expect(character.level).toBeLessThanOrEqual(maxLevel);
    }
  });
});

describe('generateTeam function', () => {
  test('should generate a team with specified character count', () => {
    const allowedTypes = [Bowman, Swordsman, Magician];
    const maxLevel = 3;
    const characterCount = 4;

    const team = generateTeam(allowedTypes, maxLevel, characterCount);

    expect(team.characters.length).toBe(characterCount);
  });

  test('should generate a team with characters of correct levels and types', () => {
    const allowedTypes = [Bowman, Swordsman, Magician];
    const maxLevel = 3;
    const characterCount = 4;

    const team = generateTeam(allowedTypes, maxLevel, characterCount);

    team.characters.forEach((character) => {
      expect(allowedTypes.includes(character.constructor)).toBe(true);
      expect(character.level).toBeGreaterThanOrEqual(1);
      expect(character.level).toBeLessThanOrEqual(maxLevel);
    });
  });
});
