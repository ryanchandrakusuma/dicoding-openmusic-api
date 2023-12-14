require('dotenv').config();

// package
const Hapi = require('@hapi/hapi');

// plugin
const albums = require('./api/albums');
const songs = require('./api/songs');
const users = require('./api/users');
const collaborations = require('./api/collaborations');
const playlists = require('./api/playlists');
const authentications = require('./api/authentications');

// function
const { registerPreResponseServerExtension } = require('./serverExtensions');
const { registerServerStrategy } = require('./serverStrategy');

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

  await registerServerStrategy(server);

  await server.register([
    albums.plugin,
    songs.plugin,
    users.plugin,
    authentications.plugin,
    collaborations.plugin,
    playlists.plugin,
  ]);

  registerPreResponseServerExtension(server);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
