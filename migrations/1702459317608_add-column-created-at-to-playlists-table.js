exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('playlists', {
    created_at: {
      type: 'timestamp',
      notNull: true,
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
    },
    deleted_at: {
      type: 'timestamp',
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('playlists', ['created_at', 'deleted_at', 'updated_at']);
};
