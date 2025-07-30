import Logging from 'core/js/logging';
import Bank from './Bank';
import {
  LifecycleSet,
  StateSetModelChildren
} from 'extensions/adapt-contrib-scoring/js/adapt-contrib-scoring';

export default class BankedSet extends LifecycleSet {

  initialize(options = {}) {
    super.initialize({
      ...options,
      _type: 'banking'
    });
    if (!this.isAwaitingChildren) return;
    Logging.error(`Models cannot be added dynamically when using banking. Please check config for ${this.modelId}.`);
  }

  /**
   * Fetch the config object from the set model.
   * @returns {Object}
   */
  get config() {
    return this.model.get('_banking');
  }

  /**
   * Create a state object which saves and restores the set models.
   * @returns {StateSetModelChildren}
   */
  get state() {
    if (this.isIntersectedSet) return;
    return (this._state = this._state || new StateSetModelChildren({ set: this }));
  }

  /** @override */
  get order() {
    // 200 is less than randomise (300) and scoringAssessment (500) but greater than AdaptModelSet (< 100)
    return 200;
  }

  /**
   * Returns whether the set is enabled
   * @returns {boolean}
   */
  get isEnabled() {
    return this.config?._isEnabled ?? false;
  }

  /**
   * Returns the number of items to pick from each bank.
   * @returns {number[]|null}
   */
  get split() {
    return this.isEnabled
      ? this.config._split.split(',').map(Number)
      : null;
  }

  /** @override */
  onInit() {
    if (!this.isEnabled) return;
    this._banks = {};
  }

  /** @override */
  async onRestore() {
    if (!this.isEnabled) return false;
    if (!this.state.restore()) return false;
    await super.onRestore();
    return true;
  }

  /** @override */
  async onStart() {
    if (!this.split) return;
    const models = [];
    this.split.forEach((count, index) => {
      const bankId = index + 1;
      const bank = this._banks[bankId] ?? new Bank(bankId, this.models, parseInt(count));
      bank.selectModels();
      bank.models.forEach(model => models.push(model));
      this._banks[bankId] = bank;
    });
    this.model.getChildren().reset(models);
    this.state.save();
    await super.onStart();
  }

}
