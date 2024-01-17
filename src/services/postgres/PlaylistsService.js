const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { mapDBToModel } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const PlaylistModel = require('../../models/PlaylistModel');
const SongModel = require('../../models/SongModel');
const PlaylistActivitiesModel = require('../../models/PlaylistActivitiesModel');
const ActivitiesModel = require('../../models/ActivitiesModel');

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

  async getPlaylistActivities(id) {
    const query = {
      text: 'SELECT id FROM playlists WHERE id = $1 AND deleted_at IS null',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlistData = result.rows[0];
    const pAInstance = mapDBToModel(PlaylistActivitiesModel, playlistData);

    const activitiesQuery = {
      text: 'SELECT u.username, s.title, psa.action, psa.time FROM playlist_song_activities AS psa JOIN users AS u ON u.id = psa.user_id JOIN songs AS s ON psa.song_id = s.id JOIN playlists AS p ON p.id = psa.playlist_id WHERE psa.playlist_id = $1 AND p.deleted_at IS null',
      values: [result.rows[0].id],
    };

    const actResult = await this._pool.query(activitiesQuery);

    pAInstance.activities = actResult.rows.map((actData) => mapDBToModel(ActivitiesModel, actData));

    return pAInstance;
  }

  async addActivity(userId, playlistId, songId, action) {
    const id = `playlist_song_activities-${nanoid(16)}`;
    const currentTimestamp = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, currentTimestamp],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Activity gagal ditambahkan');
    }
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
