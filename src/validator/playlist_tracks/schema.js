const Joi = require('joi');

const PlaylistTrackPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = { PlaylistTrackPayloadSchema };
