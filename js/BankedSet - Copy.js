import Adapt from 'core/js/adapt';
import Bank from './Bank';

export default class BankedSet extends Backbone.Controller {

  initialize(options = {}) {
    this._model = options.model;
    if (!this.originalModels) this.model.set('_originalModels', this.model.getChildren().toArray());

    if (!this.isAllModelsAdded) {
      Adapt.log.error(`Models cannot be added dynamically when using banking. Please check config for ${this.model.get('_id')}.`);
      return;
    }

    this._initConfig();
    this._setupModels();
    this._setupListeners();
  }

  /**
   * @private
   */
  _initConfig() {
    this._config = this.model.get('_banking');
    //this._isEnabled = this._config?._isEnabled ?? false;
    this._split = this._config?._split.split(',') ?? [];
  }

  /**
   * @private
   * @todo Should models be setup when associated model is rendered?
   * @todo How to guarantee that banking occurs before randomisation without a dependency?
   */
  _setupModels() {
    let models = [];
    const data = Adapt.offlineStorage.get('b')?.[this.model.get('_id')];

    if (data) {
      const trackingIds = Adapt.offlineStorage.deserialize(data);
      model = trackingIds.map(trackingId => Adapt.data.findWhere({ _trackingId: trackingId }));
    } else {
      //let banks = [];

      this._split.forEach((count, index) => {
        const bank = new Bank(this.models, count, (index + 1));
        models.push(...bank.models);

        //banks.push(new Bank(this.models, count, (index + 1)));
      });

      //this.models = banks.reduce(bank => bank.models, []);
    }

    this.models = models;
    this._saveState();
  }

  /**
   * @private
   */
  _setupListeners() {
    this.listenTo(Adapt, {
      'assessment:reset': this.onAssessmentReset
    });
  }

  /**
   * Reset models back to their original configuration
   * @todo Add reset config to control when randomisation is reset for non assessment models?
   */
  async reset() {
    this.models = this.originalModels;
    await Adapt.wait.queue();
  }

  /**
   * Returns the model containing the `_randomise` config
   * @returns {AdaptModel}
   */
  get model() {
    return this._model;
  }

  /**
   * Returns the original unmodified child models associated with the model
   * @returns {[AdaptModel]}
   */
   get originalModels() {
    return this.model.get('_originalModels');
  }

  /**
   * Returns current child models associated with the model
   * @returns {[AdaptModel]}
   */
  get models() {
    const models = this.model.getChildren().toArray();
    return models;
    //return models.filter(model => model.get('_isAvailable'));
  }

  /**
   * Set the child models associated with the model
   * @todo Set the models or change `_isAvailable`?
   */
  set models(list) {
    this.model.getChildren().models = list;

    /*
    this.models.forEach(model => {
      const isAvailable = list.includes(model);
      model.set('_isAvailable', isAvailable);
    });
    */
  }

  /**
   * Returns whether all models have been added
   * @returns {Boolean}
   */
   get isAllModelsAdded() {
    return this.model.get('_requireCompletionOf') !== Number.POSITIVE_INFINITY;
  }

  /**
   * Returns the state to save to offlineStorage
   * @returns {[_trackingId]}
   */
   get saveState() {
    return this.models.map(model => model.get('_trackingId'));
  }

  /**
   * @private
   * @todo Is 'b' and appropriate name? Reduces size but could lead to conflicts.
   * @todo Do we need to ensure order is preserved if using randomisation?
   */
  _saveState() {
    const data = Adapt.offlineStorage.get('b') ?? {};
    data[this.model.get('_id')] = Adapt.offlineStorage.serialize(this.saveState);
    Adapt.offlineStorage.set('b', data);
  }

  /**
   * @param {AssessmentSet} set
   * @listens Adapt#assessment:reset
   */
  async onAssessmentReset(set) {
    if (set.model.get('_id') !== this.model.get('_id')) return;
    await this.reset();
    this._setupModels();
  }

}
