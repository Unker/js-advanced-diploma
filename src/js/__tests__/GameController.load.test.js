import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameState from '../GameState';
import GameStateService from '../GameStateService';
import Undead from '../characters/undead';
import Vampire from '../characters/vampire';
import PositionedCharacter from '../PositionedCharacter';
import { loadGame } from '../utils';

jest.mock('../GameStateService');
jest.mock('../GamePlay');

describe('GameController load game', () => {
  let gameController;
  let gameStateServiceMock;
  let gamePlayMock;

  beforeEach(() => {
    gamePlayMock = new GamePlay();
    gameStateServiceMock = new GameStateService();
    gameController = new GameController(gamePlayMock, gameStateServiceMock);
    gameController.stateService = gameStateServiceMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should load game state successfully', () => {
    const playerTeamMock = {
      members: [
        new Undead(1),
        new Vampire(1),
      ],
    };

    const enemyTeamMock = {
      members: [
        new Undead(1),
        new Vampire(1),
      ],
    };

    const playerPositionsMock = [
      new PositionedCharacter(playerTeamMock.members[0], 0),
      new PositionedCharacter(playerTeamMock.members[1], 1),
    ];

    const enemyPositionsMock = [
      new PositionedCharacter(enemyTeamMock.members[0], 0),
      new PositionedCharacter(enemyTeamMock.members[1], 1),
    ];

    const expectedLoad = {
      gameState: {
        currentPlayer: 'player',
        _level: 1,
        score: 0,
        maxScore: 0,
        playerTeam: JSON.parse(JSON.stringify(playerTeamMock)),
        enemyTeam: JSON.parse(JSON.stringify(enemyTeamMock)),
        playerPositions: JSON.parse(JSON.stringify(playerPositionsMock)),
        enemyPositions: JSON.parse(JSON.stringify(enemyPositionsMock)),
      },
    };
    const expectedGameState = GameState.fromObject(expectedLoad.gameState);

    // Мокаем метод load в замоканном GameStateService
    gameStateServiceMock.load.mockReturnValue(expectedLoad);
    gameStateServiceMock.loadMaxScore.mockReturnValue([]);

    loadGame(gameController);

    // Проверяем, что метод load был вызван
    expect(gameStateServiceMock.load).toHaveBeenCalledTimes(1);

    // Проверяем, что game state был установлен правильно
    expect(gameController.gameState).toEqual(expectedGameState);
  });

  test('should handle error during game state loading', async () => {
    const errorMessage = 'Failed to load game state';

    gameStateServiceMock.load.mockReturnValue(new Error(errorMessage));

    loadGame(gameController, GamePlay.showError);

    expect(GamePlay.showError).toHaveBeenCalledWith(errorMessage);
  });
});
