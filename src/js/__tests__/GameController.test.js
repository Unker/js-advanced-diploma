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
