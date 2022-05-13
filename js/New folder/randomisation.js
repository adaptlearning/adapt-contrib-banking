export default class Randomisation {

  constructor(isEnabled = true) {
    this._isEnabled = isEnabled;
  }

  shuffle(list) {
    return _.shuffle(list);
    /*
    const clonedList = [...list];

    for (let i = clonedList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [clonedList[i], clonedList[j]] = [clonedList[j], clonedList[i]];
    }

    return clonedList;
    */
  }

  /**
   * Returns whether randomisation is enabled
   * @returns {Boolean}
   */
  get isEnabled() {
    return this._isEnabled;
  }

}
