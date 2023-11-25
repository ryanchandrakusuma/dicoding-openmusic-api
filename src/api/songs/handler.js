const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const {
      title, year, genre, performer, duration,
    } = request.payload;

    const songId = await this._service.addSong({
      title, year, genre, performer, duration,
    });

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan',
      data: {
        songId,
      },
    });

    response.code(201);
    return response;
  }

  async getSongsHandler(request, h) {
    const songs = await this._service.getSongs();
    const response = h.response({
      status: 'success',
      data: {
        songs,
      },
    });

    response.code(200);
    return response;
  }

  async getSongsByIdHandler(request, h) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    const response = h.response({
      status: 'success',
      data: {
        song,
      },
    });

    response.code(200);
    return response;
  }

  async putSongByIdHandler(request, h) {
    const { id } = request.params;
    this._validator.validateSongPayload(request.payload);
    const {
      title, year, genre, performer, duration,
    } = request.payload;

    await this._service.editSongById({
      id, title, year, genre, performer, duration,
    });

    const response = h.response({
      status: 'success',
      message: `${id} berhasil diubah`,
    });

    response.code(200);
    return response;
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteSongById(id);

    const response = h.response({
      status: 'success',
      message: `${id} berhasil didelete`,
    });

    response.code(200);
    return response;
  }
}

module.exports = SongsHandler;
