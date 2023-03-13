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

async function getByName(name, entityName) {
    const item = await strapi.db
        .query(`api::${entityName}.${entityName}`)
        .findOne({
            where: { name: name }
        })

    return item ? true : false
}

async function create(name, entityName) {
    const item = await getByName(name, entityName);

    if (!item) {
        await strapi.entityService
            .create(`api::${entityName}.${entityName}`, {
                data: {
                    name: name,
                    slug: slugify(name).toLowerCase()
                }
            })
    }
}

async function createManyToManyData(products) {
    const developer = {};
    const publisher = {};
    const categories = {};
    const platforms = {};

    products.forEach((product) => {
        const { developers, publishers, genres, operatingSystems } = product;

        genres &&
            genres?.forEach((item) => {
                categories[item.name] = true
            })

        operatingSystems &&
            operatingSystems?.forEach((item) => {
                platforms[item] = true
            })

        developers?.forEach((item) => {
            developer[item] = true
        })

        publishers?.forEach((item) => {
            publisher[item] = true
        })

        return Promise.all([
            ...Object.keys(developer).map((developer) => create(developer, 'developer')),
            ...Object.keys(publisher).map((publisher) => create(publisher, 'publisher')),
            ...Object.keys(categories).map((categories) => create(categories, 'category')),
            ...Object.keys(platforms).map((platforms) => create(platforms, 'platform')),
        ])
    });
}

module.exports = createCoreService('api::game.game', ({ strapi }) => ({

    async populate(params) {
        const gogApiUrl = `https://catalog.gog.com/v1/catalog?limit=48&order=desc%3Atrending&productType=in%3Agame%2Cpack%2Cdlc%2Cextras&page=1&countryCode=BR&locale=en-US&currencyCode=BRL`

        const { data: { products } } = await axios.get(gogApiUrl)

        await createManyToManyData([products[1], products[2]])

        products.map(async products => {
            products.developers.map(async developer => {
                // await create(developer, 'developer')
            })
        })

        products.map(async products => {
            products.publishers.map(async publisher => {
                // await create(publisher, 'publisher')
            })
        })
    }
}));
