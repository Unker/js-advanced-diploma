export default class GameStateService {
  constructor(storage) {
    this.storage = storage;
  }

  save(state) {
    this.storage.setItem(
      'state',
      JSON.stringify(
        state,
        (_key, value) => (value instanceof Set ? [...value] : value),
      ),
    );
  }

  load() {
    const state = this.storage.getItem('state');
    if (state) {
      return JSON.parse(state);
    }
    return { state: undefined };
  }

  saveMaxScore(state) {
    this.storage.setItem('maxScore', JSON.stringify(state));
  }

  loadMaxScore() {
    const maxScore = this.storage.getItem('maxScore');
    if (maxScore) {
      return JSON.parse(maxScore);
    }
    return { maxScore: undefined };
  }
}
