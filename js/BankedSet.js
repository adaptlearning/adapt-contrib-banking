import Adapt from 'core/js/adapt';
import Logging from 'core/js/logging';
import OfflineStorage from 'core/js/offlineStorage';
import Bank from './Bank';

export default class BankedSet extends Backbone.Controller {

  initialize(options = {}) {
    this._model = options.model;
    if (!this.originalModels) this.model.set('_originalModels', this.model.getChildren().toArray());

    if (!this.isAllModelsAdded) {
      Logging.error(`Models cannot be added dynamically when using banking. Please check config for ${this.model.get('_id')}.`);
      return;
    }

    this._initConfig();
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
   */
  _setupListeners() {
    if (OfflineStorage.ready) {
      this.onOfflineStorageReady();
    } else {
      this.listenTo(Adapt, {
        'offlineStorage:ready': this.onOfflineStorageReady
      });
    }

    this.listenTo(Adapt, {
      'assessment:reset': this.onAssessmentReset
    });
  }

  /**
   * @private
   * @todo Should models be setup when associated model is rendered?
   * @todo How to guarantee that banking occurs before randomisation without a dependency?
   */
  _setupModels() {
    let models = [];
    const storedData = OfflineStorage.get(this.saveStateName)?.[this.model.get('_id')];

    if (storedData) {
      const trackingIds = OfflineStorage.deserialize(storedData);
      models = trackingIds.map(trackingId => this.models.find(model => model.get('_trackingId') === trackingId));
    } else {
      this._split.forEach((count, index) => {
        const bank = new Bank(this.models, count, (index + 1));
        models.push(...bank.models);
      });
    }

    this.models = models;
    this._saveState();
  }

  /**
   * Reset models back to their original configuration
   * @todo Add reset config to control when randomisation is reset for non assessment models?
   * @returns {Promise}
   */
  async reset() {
    this.models = null;
    this._saveState();
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
   * @todo Component trackingIds instead of block?
   * @returns {[_trackingId]}
   */
   get saveState() {
    return this.models.length > 0 ? this.models.map(model => model.get('_trackingId')) : null;
  }

  /**
   * Returns the state name for offlineStorage
   * @note Uses same name as `adapt-randomise`
   * @returns {String}
   */
  get saveStateName() {
    return 'restorationIds';
  }

  /**
   * @private
   * @todo Do we need to ensure order is preserved if using randomisation?
   */
  _saveState() {
    const data = OfflineStorage.get(this.saveStateName) ?? {};
    const saveState = this.saveState;
    saveState ? data[this.model.get('_id')] = OfflineStorage.serialize(saveState) : delete data[this.model.get('_id')]
    OfflineStorage.set(this.saveStateName, data);
  }

  /**
   * @listens Adapt#offlineStorage:ready
   */
   onOfflineStorageReady() {
    this._setupModels();
  }

  /**
   * @param {AssessmentSet} assessment
   * @listens Adapt#assessment:reset
   */
  async onAssessmentReset(assessment) {
    if (assessment.model.get('_id') !== this.model.get('_id')) return;
    await this.reset();
    this._setupModels();
  }

}
