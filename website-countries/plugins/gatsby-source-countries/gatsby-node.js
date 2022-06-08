/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */
// You can delete this file if you're not using it

/**
 * You can uncomment the following line to verify that
 * your plugin is being loaded in your site.
 *
 * See: https://www.gatsbyjs.com/docs/creating-a-local-plugin/#developing-a-local-plugin-that-is-outside-your-project
 */

const {API_URL, getAllCountries} = require('./src/api')
const { v4: uuidv4 } = require('uuid');


exports.onPreInit = () => console.log("Loaded gatsby-source-countries")

exports.sourceNodes = async ({
                                 actions,
                                 createNodeId,
                                 createContentDigest,
                                 reporter,
                                 getNodesByType,
                             }) => {
    const { createNode } = actions

    try {

        const countriesNodeEntities = {}
        const countries = await getAllCountries({
            apiUrl: API_URL,
            headers : {
                'Content-Type': 'application/json',
            }})

        for (const country of countries) {
            const nodeContent = JSON.stringify(country)
            const id = uuidv4()

            const nodeMeta = {
                id: createNodeId(`restcountries-country-${id}`),
                parent: null,
                children: [],
                internal: {
                    type: `RestcountriesCountry`,
                    mediaType: `application/json`,
                    content: nodeContent,
                    contentDigest: createContentDigest(country),
                },
            }

            countriesNodeEntities[id] = Object.assign({}, country, nodeMeta)
        }

        for (const entity of Object.values(countriesNodeEntities)) {
            createNode(entity)
        }

    }catch (e) {
        console.error(e)
        reporter.error(e.message)
        process.exit()
    }
}
