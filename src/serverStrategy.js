const Jwt = require('@hapi/jwt'); // Import your JWT plugin

const registerServerStrategy = async (server) => {
  try {
    await server.register([
      {
        plugin: Jwt,
      },
    ]);

    server.auth.strategy('openmusicapp_jwt', 'jwt', {
      keys: process.env.ACCESS_TOKEN_KEY,
      verify: {
        aud: false,
        iss: false,
        sub: false,
        maxAgeSec: process.env.ACCESS_TOKEN_AGE,
      },
      validate: (artifacts) => ({
        isValid: true,
        credentials: {
          id: artifacts.decoded.payload.id,
        },
      }),
    });
  } catch (error) {
    console.error('Error registering server strategy:', error);
    throw error; // Re-throw the error to propagate it further if needed
  }
};

module.exports = { registerServerStrategy };
