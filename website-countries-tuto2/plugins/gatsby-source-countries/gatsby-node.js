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
const {APP_NAME, NODES_KEY, NODE_TYPES, CACHE_KEY} = require("./src/config")


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

    const {COUNTRY} = NODES_KEY

    const executions = {
        [COUNTRY]: {
            nodeType: NODE_TYPES[COUNTRY],
            hasChanged : false,
            nodes: [],
            items: [],
        }
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

        const countries = await getAllCountries({
            apiUrl: API_URL,
            headers : {
                'Content-Type': 'application/json',
            }})

        executions.country.items = countries

        const responseCached =  await cache.get(CACHE_KEY.ALL)
        if(!responseCached){
            console.log('init all-last-response cached value')
            executions.country.hasChanged = true

        }else{
            if(JSON.stringify(countries) !== responseCached){
                executions.country.hasChanged = true
            }
        }
        cache.set(CACHE_KEY.ALL, JSON.stringify(countries))

    }

    const processData = (execution) =>
        new Promise((resolve) => {
            const { hasChanged, items} = execution

            if(hasChanged){
                for (const item of items) {
                    const nodeContent = JSON.stringify(item)
                    const id = item.cca3

                    createNode({
                        ...item,
                        id: createNodeId(`${APP_NAME}-${NODES_KEY.COUNTRY}-${id}`),
                        parent: null,
                        children: [],
                        internal: {
                            type: NODE_TYPES[NODES_KEY.COUNTRY],
                            mediaType: `application/json`,
                            content: nodeContent,
                            contentDigest: createContentDigest(item),
                        },
                    })
                }
            }

            resolve()
        })

    await Promise.all(
        Object.values(executions).map((execution) => prepareNodes(execution))
    )

    try {

        await fetchCountries()
        await Promise.all(Object.values(executions).map(processData))


    }catch (e) {
        console.error(e)
        reporter.error(e.message)
        process.exit()
    }
}
