'use strict';

/**
 * game service
 */
const { createCoreService } = require('@strapi/strapi').factories;

const axios = require("axios")
const slugify = require("slugify")
const qs = require("querystring")
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


function exeption(e) {
    return { e, data: e.data && e.data.erro && e.data.errors }
}

function timeOut(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getGameInfo(slug) {
    try {
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
    } catch (e) {
        console.log("getGameInfo", exeption(e))
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
    } catch (e) {
        console.log("getByName", exeption(e))
    }
}

async function create(name, entityName) {
    try {
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
    } catch (e) {
        console.log("create", exeption(e))
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
        console.log("createManyToManyData", exeption(e))
    }
}

async function setImage(imageUrl, game, field) {
    try {
        const { data } = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const buffer = Buffer.from(data, "base64");

        const FormData = require("form-data");
        const formData = new FormData();

        formData.append("refId", game.id);
        formData.append("ref", "api::game.game")
        formData.append("field", field);
        formData.append("files", buffer, { filename: `${game.slug}.jpg` });

        console.info(`Uploading ${field} image: ${game.slug}.jpg`);

        const { data: imageUpdated } = await axios({
            method: "POST",
            url: `http://localhost:1337/api/upload`,
            data: formData,
            headers: {
                "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
            },
        });

        return imageUpdated[0].id;
    } catch (e) {
        console.log("create", Exception(e));
    }
}

async function createGames(products) {
    try {
        await Promise.all(
            products.map(async (product) => {
                const item = await getByName(product.title, 'game')

                if (!item) {
                    console.info(`Creating: ${product.title}...`)


                    const idImageCover = await setImage(
                        product.coverHorizontal,
                        product,
                        "cover"
                    );

                    const idImageGallery = await Promise.all(
                        product.screenshots
                            .slice(0, 5)
                            .map((url) => setImage(
                                url.replace("_{formatter}", ''),
                                product,
                                "gallery")
                            ));

                    await timeOut(2000);

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
                            cover: idImageCover,
                            gallery: idImageGallery,
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
    } catch (e) {
        console.log("createGames", exeption(e))
    }
}

module.exports = createCoreService('api::game.game', ({ strapi }) => ({

    async populate(params) {
        try {
            const gogApiUrl = `https://catalog.gog.com/v1/catalog?limit=48&order=desc%3Atrending&productType=in%3Agame%2Cpack%2Cdlc%2Cextras&countryCode=BR&locale=en-US&currencyCode=BRL&${qs.stringify(params)}`
            const { data: { products } } = await axios.get(gogApiUrl)

            await createManyToManyData(products)
        } catch (e) {
            console.log("populate", exeption(e))

        }
    },

    async populateGames(params) {
        try {
            const gogApiUrl = `https://catalog.gog.com/v1/catalog?limit=48&order=desc%3Atrending&productType=in%3Agame%2Cpack%2Cdlc%2Cextras&countryCode=BR&locale=en-US&currencyCode=BRL&${qs.stringify(params)}`

            const { data: { products } } = await axios.get(gogApiUrl)

            await createGames(products)
        } catch (e) {
            console.log("populateGames", exeption(e))
        }
    }
}));
