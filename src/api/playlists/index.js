const routes = require('./routes');
const PlaylistsService = require('../../services/postgres/PlaylistsService');
const PlaylistsValidator = require('../../validator/playlists');
const PlaylistsHandler = require('./handler');

const plugin = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server) => {
    const playlistsService = new PlaylistsService();

    const playlistsHandler = new PlaylistsHandler(
      playlistsService,
      PlaylistsValidator,
    );
    server.route(routes(playlistsHandler));
  },
};
module.exports = {
  plugin,
};
