# adapt-contrib-banking

An extension to categorise the children of the model to which it is attached, into banks.

Most commonly used with an [assessment](https://github.com/adaptlearning/adapt-contrib-scoringAssessment) to pluck a defined number of questions from each bank, but could also be used to display different banked content within a page. Outside of an assessment, consideration should be made regarding the user journey and completion requirements for any banked content.

Banks will be drawn from unused models, whilst enough unique models remain, to limit the recyclng of previous models.

If the config or associated child models are changed in a way which affects banking, the parent model is reset as the content will be refreshed and needs to be retaken.

## Attributes

The attributes listed below can be used in *articles.json*, and are properly formatted as JSON in [*example.json*](https://github.com/adaptlearning/adapt-contrib-banking/blob/master/example.json).

**\_isEnabled** (boolean): Determines whether banking is enabled for this model. The default is `false`.

**\_split** (string): A comma-separated list of numbers corresponding to the number of child models to be drawn from each bank. The position of the numeral in the list corresponds to the `_banking._id` assigned to each child model.

The attributes listed below can be used in *blocks.json*, and are properly formatted as JSON in [*example.json*](https://github.com/adaptlearning/adapt-contrib-banking/blob/master/example.json).

**\_id** (number): The bank ID with which the model is associated.

## Limitations

Restricted to articles as the parent model due to the use of `_trackingId` (only available for blocks and components) when saving the child models used for restoration across sessions. If not saving state for restoration, banking could technically be assigned to other parent-child model relationships.

----------------------------
**Version number:** 1.0.0<br>
**Framework versions:** >=5.28.8<br>
**Author / maintainer:** Adapt Core Team with [contributors](https://github.com/adaptlearning/adapt-contrib-banking/graphs/contributors)<br>
**Plugin dependenies:** [adapt-contrib-modifiers](https://github.com/adaptlearning/adapt-contrib-modifiers): ">=0.0.1"
