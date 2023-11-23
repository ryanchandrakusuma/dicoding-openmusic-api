const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const deletedAt = null;

    if (albumId === undefined) {
      // eslint-disable-next-line no-param-reassign
      albumId = null;
    }

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
      values: [
        id, title, year, genre, performer, duration, albumId,
        createdAt, updatedAt, deletedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan');
    }

    return result.rows[0].id;
  }
}

module.exports = SongsService;
