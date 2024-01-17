const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, songsService, validator, playlistTracksValidator) {
    this._service = service;
    this._songsService = songsService;
    this._validator = validator;
    this._playlistTracksValidator = playlistTracksValidator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({
      name, owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async postSongToPlaylistHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyAccess(id, credentialId);

    this._playlistTracksValidator.validatePlaylistTrackPayload(request.payload);
    const { songId } = request.payload;

    const song = await this._songsService.getSongById(songId);

    const playlistId = await this._service.addSongToPlaylist(id, song.id);

    const response = h.response({
      status: 'success',
      message: `Song berhasil ditambahkan ke ${playlistId}`,
    });
    response.code(201);
    return response;
  }

  async getPlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async getPlaylistWithSongsHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyAccess(id, credentialId);

    const playlist = await this._service.getPlaylistById(id);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyOwner(playlistId, credentialId);

    await this._service.deletePlaylistById(playlistId);

    const response = h.response({
      status: 'success',
      message: `${playlistId} berhasil didelete`,
    });

    response.code(200);
    return response;
  }

  async deleteSongInPlaylistHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyAccess(playlistId, credentialId);

    this._playlistTracksValidator.validatePlaylistTrackPayload(request.payload);

    const { songId } = request.payload;
    await this._service.deleteSongInPlaylistById(playlistId, songId);

    const response = h.response({
      status: 'success',
      message: `${songId} dari ${playlistId} berhasil didelete`,
    });

    response.code(200);
    return response;
  }
}

module.exports = PlaylistsHandler;
