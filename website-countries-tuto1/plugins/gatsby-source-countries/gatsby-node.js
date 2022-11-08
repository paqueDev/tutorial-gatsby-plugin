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

const fetch = require('node-fetch')

exports.onPreInit = () => console.log("Loaded gatsby-source-countries")

exports.sourceNodes = async ({
                                 actions,
                                 createNodeId,
                                 createContentDigest,
                                 reporter,
                             }) => {
    const { createNode } = actions

    try {
        const response = await fetch(`https://restcountries.com/v3.1/all`, {
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
            },
        })
        const countries = await response.json()

        for (const country of countries) {
            const nodeContent = JSON.stringify(country)

            console.log('country.name', country.name)

            const nodeMeta = {
                id: createNodeId(`restcountries-country-${country.name.common}`),
                parent: null,
                children: [],
                internal: {
                    type: `RestcountriesCountry`,
                    mediaType: `application/json`,
                    content: nodeContent,
                    contentDigest: createContentDigest(country),
                },
            }

            createNode( Object.assign({}, country, nodeMeta))
        }


    }catch (e) {
        console.error(e)
        reporter.error(e.message)
        process.exit()
    }
}
