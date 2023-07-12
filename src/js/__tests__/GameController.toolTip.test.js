import GameController from '../GameController';
import Bowman from '../characters/bowman';

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
    const expectedToolTip = 'Информация о персонаже: 🎖 3 ⚔ 81 🛡 25 ❤ 100';

    expect(formattedToolTip).toBe(expectedToolTip);
  });

  test('should handle non-character values correctly', () => {
    const nonCharacterValue = 'Some value';
    const formattedToolTip = GameController.formatToolTip`Информация: ${nonCharacterValue}`;
    const expectedToolTip = 'Информация: Some value';

    expect(formattedToolTip).toBe(expectedToolTip);
  });
});
