/* eslint-disable camelcase */
const { BaseModel } = require('../utils');

class PlaylistModel extends BaseModel {
  constructor({
    id, name, username, ...baseProps
  }) {
    super(baseProps);

    this.id = id;
    this.name = name;
    this.username = username;
  }
}

module.exports = PlaylistModel;
