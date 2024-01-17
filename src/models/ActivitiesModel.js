/* eslint-disable camelcase */
const { BaseModel } = require('../utils');

class ActivitiesModel extends BaseModel {
  constructor({
    username, title, action, time, ...baseProps
  }) {
    super(baseProps);

    this.username = username;
    this.title = title;
    this.action = action;
    this.time = time;
  }
}

module.exports = ActivitiesModel;
