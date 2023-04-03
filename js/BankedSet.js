import Logging from 'core/js/logging';
import ModifierSet from 'extensions/adapt-contrib-modifiers/js/ModifierSet';
import Bank from './Bank';

export default class BankedSet extends ModifierSet {

  initialize(options = {}) {
    this._banks = {};
    super.initialize({
      ...options,
      _type: 'banking'
    });
    if (this.isAwaitingChildren) {
      Logging.error(`Models cannot be added dynamically when using banking. Please check config for ${this.modelId}.`);
      return;
    }
  }

  /**
   * @override
   */
  setupModels() {
    if (!this.isEnabled) return;
    let models = [];
    const savedModels = this._getSavedModels();
    if (savedModels) {
      models = savedModels
    } else if (this._split) {
      this._split.forEach((count, index) => {
        const bankId = index + 1;
        const bank = this._banks[bankId] ?? new Bank(bankId, this.originalModels, parseInt(count));
        bank.selectModels();
        models.push(...bank.models);
        this._banks[bankId] = bank;
      });
    }
    this.models = models;
    this._saveState();
  }

  /**
   * @override
   */
  get order() {
    return 1;
  }

  /**
   * @override
   */
  _initConfig() {
    this._config = this.model.get('_banking');
    this._split = this.isEnabled ? this._config?._split?.split(',') : null;
  }

  /**
   * @extends
   */
  _setupListeners() {
    super._setupListeners();
    this.listenTo(this.model, 'change:_banking', this.onModelConfigChange);
  }

  /**
   * @extends
   */
  onModelConfigChange() {
    super.onModelConfigChange();
    this._banks = {};
  }

}
