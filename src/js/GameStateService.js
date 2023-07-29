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
    try {
      return JSON.parse(this.storage.getItem('state'));
    } catch (e) {
      throw new Error('Invalid state');
    }
  }

  saveMaxScore(state) {
    this.storage.setItem('maxScore', JSON.stringify(state));
  }

  loadMaxScore() {
    try {
      return JSON.parse(this.storage.getItem('maxScore'));
    } catch (e) {
      throw new Error('Invalid state');
    }
  }
}
