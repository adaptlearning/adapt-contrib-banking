import Adapt from 'core/js/adapt';
import Data from 'core/js/data';
import BankedSet from './BankedSet';

class Banking extends Backbone.Controller {

  initialize() {
    this.listenTo(Adapt, {
      'app:dataReady': this.onAppDataReady
    });
  }

  hasBanking(model) {
    return this.getConfigByModel(model)?._isEnabled;
  }

  getConfigByModel(model) {
    return model.get('_banking');
  }

  get bankedModels() {
    return Data.filter(model => this.hasBanking(model));
  }

  onAppDataReady() {
    this.bankedModels.forEach(model => new BankedSet({ model }));
  }

}

export default new Banking();