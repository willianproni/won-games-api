'use strict';

/**
 * game service
 */
const { createCoreService } = require('@strapi/strapi').factories;

const axios = require("axios")
const slugify = require("slugify")

async function getGameInfo(slug) {
    const jsdom = require("jsdom");
    const { JSDOM } = jsdom;
    const body = await axios.get(`https://www.gog.com/en/game/${slug}`)
    const dom = new JSDOM(body.data)
    const description = dom.window.document.querySelector('.description')

    return {
        rating: 'BR0',
        short_description: description.textContent.slice(0, 160),
        description: description.innerHTML
    }
}

module.exports = createCoreService('api::game.game', ({ strapi }) => ({

    async populate(params) {
        const gogApiUrl = `https://catalog.gog.com/v1/catalog?limit=48&order=desc%3Atrending&productType=in%3Agame%2Cpack%2Cdlc%2Cextras&page=1&countryCode=BR&locale=en-US&currencyCode=BRL`

        const { data: { products } } = await axios.get(gogApiUrl)

        await strapi.entityService
            .create('api::publisher.publisher', {
                data: {
                    name: products[1].publishers[0],
                    slug: slugify(products[1].publishers[0]).toLowerCase()
                }
            })

            await strapi.entityService
            .create('api::developer.developer', {
                data: {
                    name: products[1].developer,
                    slug: slugify(products[1].developer).toLowerCase()
                }
            })
    }

    // console.log(await getGameInfo(products[0].slug.replaceAll('-', '_')));

}));
