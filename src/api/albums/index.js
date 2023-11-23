const AlbumsService = require('../../services/postgres/AlbumsService');
const AlbumsValidator = require('../../validator/albums');
const AlbumsHandler = require('./handler');
const routes = require('./routes');

const plugin = {
  name: 'albums',
  version: '1.0.0',
  register: async (server) => {
    const service = new AlbumsService();
    const albumsHandler = new AlbumsHandler(service, AlbumsValidator);
    server.route(routes(albumsHandler));
  },
};

module.exports = {
  plugin,
};
