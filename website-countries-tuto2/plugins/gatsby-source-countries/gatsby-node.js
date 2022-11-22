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
const CACHE_KEY = 'restcountries-last-response'

exports.onPreInit = () => console.log("Loaded gatsby-source-countries")

exports.sourceNodes = async ({
                                 actions,
                                 createNodeId,
                                 createContentDigest,
                                 reporter,
                                 getNodesByType,
                                 cache
                             }) => {
    const { createNode, touchNode } = actions

    const execution = {
            nodeType: 'RestcountriesCountry',
            hasChanged : false,
            items: [],
            nodes: [],
    }

    const prepareNodes = (execution) =>
        new Promise((resolve) => {
            const { nodeType } = execution

            execution.nodes = getNodesByType(nodeType)
            for (const node of execution.nodes) {
                touchNode(node)
            }
            resolve()
        })

    const fetchCountries = async () => {

        const response = await fetch(`https://restcountries.com/v3.1/all`, {
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
            },
        })
        const countries = await response.json()

        execution.items = countries

        const responseCached =  await cache.get(CACHE_KEY)
        if(!responseCached){
            console.log('init restcountries-last-response cached value')
            execution.hasChanged = true

        }else{
            if(JSON.stringify(countries) !== responseCached){
                execution.hasChanged = true
            }
        }
        cache.set(CACHE_KEY, JSON.stringify(countries))

    }

    const processData = (execution) =>
        new Promise((resolve) => {
            const { hasChanged, items} = execution

            if(hasChanged){
                for (const item of items) {
                    const nodeContent = JSON.stringify(item)

                    createNode({
                        ...item,
                        id: createNodeId(`restcountries-country-${item.name.common}`),
                        parent: null,
                        children: [],
                        internal: {
                            type: 'RestcountriesCountry',
                            mediaType: `application/json`,
                            content: nodeContent,
                            contentDigest: createContentDigest(item),
                        },
                    })
                }
            }

            resolve()
        })

     await prepareNodes(execution)

    try {

        await fetchCountries()
        await processData(execution)

    }catch (e) {
        console.error(e)
        reporter.error(e.message)
        process.exit()
    }
}
