const routes = require('./routes');
const PlaylistsService = require('../../services/postgres/PlaylistsService');
const PlaylistsValidator = require('../../validator/playlists');
const PlaylistsHandler = require('./handler');
const SongsService = require('../../services/postgres/SongsService');
const PlaylistTracksValidator = require('../../validator/playlist_tracks');

const plugin = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server) => {
    const playlistsService = new PlaylistsService();
    const songsService = new SongsService();

    const playlistsHandler = new PlaylistsHandler(
      playlistsService,
      songsService,
      PlaylistsValidator,
      PlaylistTracksValidator,
    );
    server.route(routes(playlistsHandler));
  },
};
module.exports = {
  plugin,
};
