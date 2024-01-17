const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { mapDBToModel } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const PlaylistModel = require('../../models/PlaylistModel');
const SongModel = require('../../models/SongModel');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({
    name, owner,
  }) {
    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, owner, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists JOIN users ON users.id = playlists.owner LEFT JOIN collaborations AS c ON c.playlist_id = playlists.id WHERE (playlists.owner = $1 OR c.user_id = $1) AND deleted_at IS null',
      values: [owner],
    };

    const result = await this._pool.query(query);

    const plistInstances = result.rows.map((plistData) => mapDBToModel(PlaylistModel, plistData));

    return plistInstances;
  }

  async getPlaylistById(id) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists JOIN users ON users.id = playlists.owner WHERE playlists.id = $1 AND playlists.deleted_at IS null',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlistData = result.rows[0];
    const playlistInstance = mapDBToModel(PlaylistModel, playlistData);

    const songsQuery = {
      text: 'SELECT s.id, s.title, s.performer FROM playlist_tracks AS p_tracks JOIN songs AS s ON s.id = p_tracks.song_id WHERE p_tracks.playlist_id = $1',
      values: [result.rows[0].id],
    };

    const songsResult = await this._pool.query(songsQuery);

    playlistInstance.songs = songsResult.rows.map((songData) => mapDBToModel(SongModel, songData));

    return playlistInstance;
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlist_track-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_tracks VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan ke playlist');
    }

    return result.rows[0].id;
  }

  async deleteSongInPlaylistById(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_tracks AS pt WHERE pt.playlist_id = $1 AND pt.song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
  }

  async deletePlaylistById(playlistId) {
    const deletedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE playlists SET deleted_at = $1 WHERE id = $2 RETURNING id',
      values: [deletedAt, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Resource yang Anda minta tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyAccess(playlistId, userId) {
    try {
      await this.verifyOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      await this._collaborationsService.verifyCollaborator(playlistId, userId);
    }
  }
}

module.exports = PlaylistsService;
