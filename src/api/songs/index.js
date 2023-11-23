const SongsService = require('../../services/postgres/SongsService');
const SongsValidator = require('../../validator/songs');
const SongsHandler = require('./handler');
const routes = require('./routes');

const plugin = {
  name: 'songs',
  version: '1.0.0',
  register: async (server) => {
    const service = new SongsService();
    const songsHandler = new SongsHandler(service, SongsValidator);
    server.route(routes(songsHandler));
  },
};

module.exports = {
  plugin,
};
