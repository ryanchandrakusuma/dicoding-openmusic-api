const AuthenticationsHandler = require('./handler');
const UsersService = require('../../services/postgres/UsersService');
const AuthenticationsService = require('../../services/postgres/AuthenticationsService');
const routes = require('./routes');
const TokenManager = require('../../tokenize/TokenManager');
const AuthenticationsValidator = require('../../validator/authentications');

const plugin = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server) => {
    const authenticationsService = new AuthenticationsService();
    const usersService = new UsersService();
    const authenticationsHandler = new AuthenticationsHandler(
      authenticationsService,
      usersService,
      TokenManager,
      AuthenticationsValidator,
    );

    server.route(routes(authenticationsHandler));
  },
};

module.exports = {
  plugin,
};
