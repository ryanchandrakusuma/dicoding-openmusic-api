const InvariantError = require('../../exceptions/InvariantError');
const { PlaylistTrackPayloadSchema } = require('./schema');

const PlaylistTracksValidator = {
  validatePlaylistTrackPayload: (payload) => {
    const validationResult = PlaylistTrackPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistTracksValidator;
