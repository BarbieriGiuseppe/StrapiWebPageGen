'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('static-web-page-gen')
      .service('myService')
      .getWelcomeMessage();
  },
});
