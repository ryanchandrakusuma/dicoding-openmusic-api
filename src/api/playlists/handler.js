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
    console.log(song.id);

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
}

module.exports = PlaylistsHandler;
