import GameController from '../GameController';
import Bowman from '../characters/bowman';
import Swordsman from '../characters/swordsman';
import Magician from '../characters/magician';
import Undead from '../characters/undead';
import Vampire from '../characters/vampire';
import Daemon from '../characters/daemon';
import GameState from '../GameState';

describe('GameController - Character Movement', () => {
  let gameController;
  // let gameState;
  const allPositions = Array.from({ length: 8 ** 2 }, (_, i) => i);

  beforeEach(() => {
    const gamePlayMock = {
      boardSize: 8,
    };
    gameController = new GameController(gamePlayMock, null);
    gameController.gameState = new GameState();
  });

  const characterMovementTemplate = (CharacterClass, allowedMoves, allowedAttacks) => {
    test(`${CharacterClass.name} can move to the specified positions`, () => {
      const character = new CharacterClass();
      const selectedCharacter = { character, position: 0 };

      gameController.gameState.playerPositions = Array(selectedCharacter);

      const result = allPositions.filter((position) => gameController
        .isMoveAllowed(selectedCharacter, position));

      expect(result).toEqual(allowedMoves);
    });

    test(`${CharacterClass.name} can attack to the specified positions`, () => {
      const character = new CharacterClass();
      const selectedCharacter = { character, position: 0 };

      gameController.playerPositions = Array(selectedCharacter);

      const result = allPositions.filter((position) => gameController
        .isAttackAllowed(selectedCharacter, position));

      expect(result).toEqual(allowedAttacks);
    });
  };

  characterMovementTemplate(Swordsman, [1, 2, 3, 4, 8, 9, 16, 18, 24, 27, 32, 36], [1, 8, 9]);
  characterMovementTemplate(Undead, [1, 2, 3, 4, 8, 9, 16, 18, 24, 27, 32, 36], [1, 8, 9]);
  characterMovementTemplate(Bowman, [1, 2, 8, 9, 16, 18], [1, 2, 8, 9, 10, 16, 17, 18]);
  characterMovementTemplate(Vampire, [1, 2, 8, 9, 16, 18], [1, 2, 8, 9, 10, 16, 17, 18]);
  characterMovementTemplate(
    Magician,
    [1, 8, 9],
    [1, 2, 3, 4, 8, 9, 10, 11, 12, 16, 17, 18, 19, 20, 24, 25, 26, 27, 28, 32, 33, 34, 35, 36],
  );
  characterMovementTemplate(
    Daemon,
    [1, 8, 9],
    [1, 2, 3, 4, 8, 9, 10, 11, 12, 16, 17, 18, 19, 20, 24, 25, 26, 27, 28, 32, 33, 34, 35, 36],
  );
});
