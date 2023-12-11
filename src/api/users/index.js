const UsersService = require('../../services/postgres/UsersService');
const UsersValidator = require('../../validator/users');
const UsersHandler = require('./handler');
const routes = require('./routes');

const plugin = {
  name: 'users',
  version: '1.0.0',
  register: async (server) => {
    const usersService = new UsersService();
    const usersHandler = new UsersHandler(usersService, UsersValidator);

    server.route(routes(usersHandler));
  },
};

module.exports = {
  plugin,
};
