const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');
const SongModel = require('../../models/SongModel');

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

  async getSongs() {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE deleted_at IS null',
    };

    const result = await this._pool.query(query);

    const songs = result.rows.map((songData) => mapDBToModel(SongModel, songData));

    return songs;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1 AND deleted_at IS null',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const albumData = result.rows[0];
    const albumInstance = mapDBToModel(SongModel, albumData);
    return albumInstance;
  }

  async editSongById({
    id, title, year, genre, performer, duration, albumId,
  }) {
    const updatedAt = new Date().toISOString();

    if (albumId === undefined) {
      // eslint-disable-next-line no-param-reassign
      albumId = null;
    }

    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [
        title, year, genre, performer, duration, albumId,
        updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui song. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const deletedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET deleted_at = $1 WHERE id = $2 RETURNING id',
      values: [deletedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
