'use strict';

/**
 * game controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::game.game', ({ strapi }) => ({
  async populate(ctx) {
    try {
      console.log("Start to populate attributes...")

      const options = {
        page: "1",
        ...ctx.query
      }

      await strapi.service('api::game.game').populate(options)

      ctx.send("Finish Populating!");
    } catch (err) {
      ctx.body = err;
    }
  },

  async populateGames(ctx) {
    try {
      console.log("Start to populate games...")

      const options = {
        page: "1",
        ...ctx.query
      }

      await strapi.service('api::game.game').populateGames(options)

      ctx.send("Finish Populating!");
    } catch (err) {
      ctx.body = err;
    }
  }
}));
