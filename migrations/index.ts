import * as migration_20261008_133126_initial from './20261008_133126_initial';
import * as migration_20261008_142934_redesign_highlights_image from './20261008_142934_redesign_highlights_image';

export const migrations = [
  {
    up: migration_20261008_133126_initial.up,
    down: migration_20261008_133126_initial.down,
    name: '20261008_133126_initial',
  },
  {
    up: migration_20261008_142934_redesign_highlights_image.up,
    down: migration_20261008_142934_redesign_highlights_image.down,
    name: '20261008_142934_redesign_highlights_image'
  },
];
