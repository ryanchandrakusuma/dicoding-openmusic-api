const CollaborationsService = require('../../services/postgres/CollaborationsService');
const CollaborationsHandler = require('./handler');
const CollaborationsValidator = require('../../validator/collaborations');
const routes = require('./routes');
const PlaylistsService = require('../../services/postgres/PlaylistsService');
const UsersService = require('../../services/postgres/UsersService');

const plugin = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server) => {
    const collaborationsService = new CollaborationsService();
    const playlistsService = new PlaylistsService();
    const usersService = new UsersService();

    const collaborationsHandler = new CollaborationsHandler(
      collaborationsService,
      playlistsService,
      usersService,
      CollaborationsValidator,
    );
    server.route(routes(collaborationsHandler));
  },
};
module.exports = {
  plugin,
};
