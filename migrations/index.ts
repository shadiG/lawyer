import * as migration_20261008_133126_initial from './20261008_133126_initial';

export const migrations = [
  {
    up: migration_20261008_133126_initial.up,
    down: migration_20261008_133126_initial.down,
    name: '20261008_133126_initial'
  },
];
