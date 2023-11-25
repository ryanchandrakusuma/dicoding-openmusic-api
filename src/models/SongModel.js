/* eslint-disable camelcase */
const { BaseModel } = require('../utils');

class SongModel extends BaseModel {
  constructor({
    id, title, year, genre, performer, duration, album_id, ...baseProps
  }) {
    super(baseProps);

    this.id = id;
    this.title = title;
    this.year = year;
    this.genre = genre;
    this.performer = performer;
    this.duration = duration;
    this.albumId = album_id;
  }
}

module.exports = SongModel;
