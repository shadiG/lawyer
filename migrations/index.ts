import * as migration_20261008_133126_initial from './20261008_133126_initial';
import * as migration_20261008_142934_redesign_highlights_image from './20261008_142934_redesign_highlights_image';
import * as migration_20261008_161810_rdv_avances from './20261008_161810_rdv_avances';
import * as migration_20261008_163101_blog from './20261008_163101_blog';

export const migrations = [
  {
    up: migration_20261008_133126_initial.up,
    down: migration_20261008_133126_initial.down,
    name: '20261008_133126_initial',
  },
  {
    up: migration_20261008_142934_redesign_highlights_image.up,
    down: migration_20261008_142934_redesign_highlights_image.down,
    name: '20261008_142934_redesign_highlights_image',
  },
  {
    up: migration_20261008_161810_rdv_avances.up,
    down: migration_20261008_161810_rdv_avances.down,
    name: '20261008_161810_rdv_avances',
  },
  {
    up: migration_20261008_163101_blog.up,
    down: migration_20261008_163101_blog.down,
    name: '20261008_163101_blog'
  },
];
