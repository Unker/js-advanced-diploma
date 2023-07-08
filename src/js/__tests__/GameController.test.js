import GameController from '../GameController';
import PositionedCharacter from '../PositionedCharacter';
import Bowman from '../characters/bowman';
import Swordsman from '../characters/swordsman';
import Magician from '../characters/magician';

describe('GameController _generatePositions method', () => {
  test('should generate positions for characters in the specified columns', () => {
    const gamePlayMock = {
      boardSize: 8,
    };

    const stateServiceMock = {};

    const gameController = new GameController(gamePlayMock, stateServiceMock);

    const characters = [new Bowman(1), new Swordsman(2), new Magician(3)];
    const startColumn = 1;
    const endColumn = 2;

    const positions = gameController._generatePositions(characters, startColumn, endColumn);

    expect(positions).toHaveLength(characters.length);

    positions.forEach((positionedCharacter) => {
      expect(positionedCharacter).toBeInstanceOf(PositionedCharacter);
      expect(positionedCharacter.character).toBeDefined();
      expect(positionedCharacter.position).toBeGreaterThanOrEqual(0);
      expect(positionedCharacter.position)
        .toBeLessThan(gamePlayMock.boardSize * gamePlayMock.boardSize);

      // check columns
      const column = (positionedCharacter.position % gamePlayMock.boardSize) + 1;
      expect(column).toBeGreaterThanOrEqual(startColumn);
      expect(column).toBeLessThanOrEqual(endColumn);
    });
  });
});

describe('formatToolTip function', () => {
  let gameController;

  beforeEach(() => {
    const gamePlayMock = {
      boardSize: 8,
    };

    const stateServiceMock = {};
    gameController = new GameController(gamePlayMock, stateServiceMock);
  });

  test('should format character info correctly', () => {
    const character = new Bowman(3);

    const formattedToolTip = GameController.formatToolTip`Информация о персонаже: ${character}`;
    const expectedToolTip = 'Информация о персонаже: 🎖 3 ⚔ 25 🛡 25 ❤ 50';

    expect(formattedToolTip).toBe(expectedToolTip);
  });

  test('should handle non-character values correctly', () => {
    const nonCharacterValue = 'Some value';
    const formattedToolTip = GameController.formatToolTip`Информация: ${nonCharacterValue}`;
    const expectedToolTip = 'Информация: Some value';

    expect(formattedToolTip).toBe(expectedToolTip);
  });
});
