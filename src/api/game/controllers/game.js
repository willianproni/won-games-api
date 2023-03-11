'use strict';

/**
 * game controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::game.game', ({strapi}) => ({
    async populate(ctx) {
        try {
          ctx.body = 'ok';
        } catch (err) {
          ctx.body = err;
        }
      },
}));
