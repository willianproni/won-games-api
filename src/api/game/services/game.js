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
    try {
        const item = await strapi.db
            .query(`api::${entityName}.${entityName}`)
            .findOne({
                where: { name: name }
            })

        return item ? item.id : false
    } catch (err) {
        console.log('ERRO: ', err)
    }
}

async function getByNameTest(name, entityName) {
    try {
        const item = await strapi.db
            .query(`api::${entityName}.${entityName}`)
            .findOne({
                where: { name: name }
            })

        return item ? item : false
    } catch (err) {
        console.log('ERRO: ', err)
    }
}

async function create(name, entityName) {
    const item = await getByName(name, entityName);

    if (!item) {
        await strapi.entityService
            .create(`api::${entityName}.${entityName}`, {
                data: {
                    name: name,
                    slug: slugify(name).toLowerCase().replaceAll('-', '_')
                }
            })
    }
}

async function createManyToManyData(products) {
    try {
        const developer = {};
        const publisher = {};
        const categories = {};
        const platforms = {};

        products.forEach(async (product) => {
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

            Promise.all([
                ...Object.keys(developer).map((developer) => create(developer, 'developer')),
                ...Object.keys(publisher).map((publisher) => create(publisher, 'publisher')),
                ...Object.keys(categories).map((categories) => create(categories, 'category')),
                ...Object.keys(platforms).map((platforms) => create(platforms, 'platform')),
            ])
        });
    }
    catch (err) {
        console.log('ERRO: ', { err })
    } finally {
        console.log('createManyToManyData Finish')
    }

}

async function createGames(products) {
    try {
        await Promise.all(
            products.map(async (product) => {
                const item = await getByName(product.title, 'game')

                if (!item) {
                    console.info(`Creating: ${product.title}...`)

                    const game = await strapi.entityService.create('api::game.game', {
                        data: {
                            name: product.title,
                            slug: product.slug.replaceAll('-', '_'),
                            price: Number(product.price.base.replace('R$', '')),
                            release_date: product.releaseDate.replaceAll('.', '-'),
                            categories: await Promise.all(product.genres.map(async (item) =>
                                await getByName(item.name, 'category'))),
                            platforms: await Promise.all(product.operatingSystems.map(async (item) =>
                                await getByName(item, 'platform'))),
                            developers: await Promise.all(product.developers.map(async (item) =>
                                await getByName(item, 'developer'))),
                            publisher: [await getByName(product.publishers, 'publisher')],
                            ...(await getGameInfo(product.slug.replaceAll('-', '_')))
                        }
                    })
                    return game
                }
            })
        )
    } catch (err) {
        console.log('ERRO: ', { err })
    } finally {
        console.log('createGames Finish')
    }
}

module.exports = createCoreService('api::game.game', ({ strapi }) => ({

    async populate(params) {
        const gogApiUrl = `https://catalog.gog.com/v1/catalog?limit=48&order=desc%3Atrending&productType=in%3Agame%2Cpack%2Cdlc%2Cextras&page=1&countryCode=BR&locale=en-US&currencyCode=BRL`

        const { data: { products } } = await axios.get(gogApiUrl)

        await createManyToManyData([products[1], products[2], products[3]])
    },

    async populateGames(params) {
        const gogApiUrl = `https://catalog.gog.com/v1/catalog?limit=48&order=desc%3Atrending&productType=in%3Agame%2Cpack%2Cdlc%2Cextras&page=1&countryCode=BR&locale=en-US&currencyCode=BRL`

        const { data: { products } } = await axios.get(gogApiUrl)

        await createGames([products[1], products[2], products[3]])
    }
}));
