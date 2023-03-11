'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('list-content-type')
      .service('myService')
      .getWelcomeMessage();
  },
});
