import Adapt from 'core/js/adapt';
import Data from 'core/js/data';
import BankedSet from './BankedSet';

class Banking extends Backbone.Controller {

  initialize() {
    this.listenTo(Adapt, {
      'app:dataReady': this.onAppDataReady
    });
  }

  onAppDataReady() {
    const models = Data.filter(model => model.get('_banking')?._isEnabled);
    models.forEach(model => new BankedSet({ model }));
  }

}

export default new Banking();