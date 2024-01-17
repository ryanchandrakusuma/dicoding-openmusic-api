/* eslint-disable camelcase */
const { BaseModel } = require('../utils');

class PlaylistActivitiesModel extends BaseModel {
  constructor({
    id, name, username, ...baseProps
  }) {
    super(baseProps);

    this.playlistId = id;
  }
}

module.exports = PlaylistActivitiesModel;
