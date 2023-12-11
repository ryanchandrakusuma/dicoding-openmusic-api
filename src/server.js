require('dotenv').config();

const Hapi = require('@hapi/hapi');
const { registerPreResponseServerExtension } = require('./serverExtensions');
const albums = require('./api/albums');
const songs = require('./api/songs');
const users = require('./api/users');
const authentications = require('./api/authentications');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    albums.plugin,
    songs.plugin,
    users.plugin,
    authentications.plugin,
  ]);

  registerPreResponseServerExtension(server);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
