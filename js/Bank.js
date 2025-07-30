import Logging from 'core/js/logging';
import {
  isModelAvailableInHierarchy
} from 'extensions/adapt-contrib-scoring/js/adapt-contrib-scoring';

export default class Bank {

  constructor(id, models, count) {
    this._id = id;
    this._originalModels = models;
    this._count = count;
    this._usedModels = [];
  }

  /**
   * Select unused models from those available.
   * Recycle the models once all used.
   */
  selectModels() {
    const availableModels = this._originalModels.filter(model => {
      const isInBank = model.get('_banking')?._id === this._id;
      return isInBank && isModelAvailableInHierarchy(model, { allowDetached: true });
    });
    const models = availableModels.filter(model => !(this._usedModels.includes(model)));
    const shortfall = this._count - models.length;
    if (shortfall > 0) {
      Logging.warn(`Insufficient unique models for bank ${this._id} - recycling ${shortfall} model(s) and resetting used models`);
      models.push(...this._pluck(availableModels, shortfall));
      this._usedModels = [];
    }
    const randomisedModels = _.shuffle(models);
    this._models = this._pluck(randomisedModels, this._count);
    this._usedModels.push(...this.models);
  }

  /**
   * Returns the banked models
   * @returns {[AdaptModel]}
   */
  get models() {
    return this._models;
  }

  /**
   * Returns a list condensed to the `count`.
   * Negative counts will remove that number of items from the list.
   * @private
   * @param {Array} list
   * @param {Number} count The number of items to pluck from the list
   * @returns {[AdaptModel]}
   */
  _pluck(list, count) {
    if (isNaN(count)) throw Error(`Invalid count for bank ${this._id}`);
    if (count === 0) return [];
    if (list.length < Math.abs(count)) throw Error(`Insufficient models for bank ${this._id}`);
    if (count) list = list.slice(0, count);
    return list;
  }

}
