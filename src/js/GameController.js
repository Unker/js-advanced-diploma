import themes from './themes';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.drawUi(themes.arctic);
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  // eslint-disable-next-line class-methods-use-this
  onCellClick(index) {
    // TODO: react to click
  }

  // eslint-disable-next-line class-methods-use-this
  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  // eslint-disable-next-line class-methods-use-this
  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
