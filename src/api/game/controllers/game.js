'use strict';

/**
 * game controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::game.game', ({strapi}) => ({
    async populate(ctx) {
        try {
          console.log("Start to populate...")
          
          await strapi.service('api::game.game').populate()

          console.log(ctx.query)

          ctx.send("Finish Populating!");
        } catch (err) {
          ctx.body = err;
        }
      },
}));
