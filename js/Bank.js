export default class Bank {

  constructor(models, count, id) {
    this._rawModels = models;
    this._count = count;
    this._id = id;
    this._init();
  }

  /**
   * @todo Add ability to ensure unique banks for each attempt (assessment only)?
   * @todo Set the models or change `_isAvailable`?
   */
  _init() {
    const models = this._rawModels.filter(model => model.get('_banking')?._id === this._id);
    const randomisedModels = this._shuffle(models);
    this._models = this._pluck(randomisedModels, this._count);
  }

  /**
   * Returns a shuffled list
   * @param {Array} list
   * @returns {Array}
   */
   _shuffle(list) {
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
   * Returns a list condensed to the `count`
   * Negative counts will remove that number of items from the list
   * @param {Array} list
   * @param {Number} count The number of items to pluck from the list
   * @returns {Array}
   */
  _pluck(list, count) {
    if (list.length < Math.abs(count)) throw Error(`Insufficient models for bank ${this._id}`);
    if (count) list = list.slice(0, count);
    return list;
  }

  /**
   * Returns the banked models
   * @returns {[AdaptModel]}
   */
   get models() {
    return this._models;
  }

}
