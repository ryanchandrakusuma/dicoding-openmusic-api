const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');
const AlbumModel = require('../../models/AlbumModel');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    console.log('adding album');
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const deletedAt = null;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, name, year, createdAt, updatedAt, deletedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1 AND deleted_at IS null',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const albumData = result.rows[0];
    const albumInstance = mapDBToModel(AlbumModel, albumData);
    return albumInstance;
  }
}

module.exports = AlbumsService;
