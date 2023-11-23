const { BaseModel } = require('../utils');

class AlbumModel extends BaseModel {
  constructor({
    id, name, year, ...baseProps
  }) {
    super(baseProps);

    this.id = id;
    this.name = name;
    this.year = year;
  }
}

module.exports = AlbumModel;
