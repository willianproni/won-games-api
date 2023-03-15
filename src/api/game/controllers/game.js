'use strict';

/**
 * game controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::game.game', ({ strapi }) => ({
  async populate(ctx) {
    try {
      console.log("Start to populate...")

      await strapi.service('api::game.game').populate()

      ctx.send("Finish Populating!");
    } catch (err) {
      ctx.body = err;
    }
  },

  async populateGames(ctx) {
    try {
      console.log("Start to populate...")

      await strapi.service('api::game.game').populateGames()

      ctx.send("Finish Populating!");
    } catch (err) {
      ctx.body = err;
    }
  }
}));
