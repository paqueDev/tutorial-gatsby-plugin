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
const countriesJSON = require("./data/countries.json")



exports.onPreInit = () => console.log("Loaded gatsby-source-countries")

const STATUS = {
    NOT_INITIALIZED: 'not-initialized',
    NOT_MODIFIED: 'not-modified',
    MODIFIED: 'modified',
}

const getStatus = (cached, current) => {
    if (!cached) {
        return STATUS.NOT_INITIALIZED
    }
    if (cached && cached === current) {
        return STATUS.NOT_MODIFIED
    }
    return STATUS.MODIFIED
}

exports.sourceNodes = async ({
                                 actions,
                                 createNodeId,
                                 createContentDigest,
                                 reporter,
                                 getNodesByType,
                                 cache
                             }) => {
    const { createNode,deleteNode,touchNode } = actions

    const {COUNTRY} = NODES_KEY

    const executions = {
        [COUNTRY]: {
            nodeType: NODE_TYPES[COUNTRY],
            changeStatus : false,
            idName : 'cca3',
            nodes: [],
            items: [],
            added: [],
            updated: [],
            deleted: [],
            cached: [],
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
        /*
        const countries = await getAllCountries({
        apiUrl: API_URL,
        headers : {
            'Content-Type': 'application/json',
        }})
        */

        const countries = countriesJSON
        executions.country.items = countries


        const responseCached =  await cache.get(CACHE_KEY.ALL)

        const status = getStatus(responseCached, JSON.stringify(countries))
        executions.country.changeStatus = status

        cache.set(CACHE_KEY.ALL, JSON.stringify(countries))
    }

    const processData = (execution) =>
        new Promise((resolve) => {
            const { changeStatus, items, nodes , idName} = execution

            switch (changeStatus) {
                case STATUS.NOT_INITIALIZED: {
                    console.log(`case : ${STATUS.NOT_INITIALIZED}`)
                    execution.added = [...items]
                    break
                }

                case STATUS.NOT_MODIFIED: {
                    console.log(`case : ${STATUS.NOT_MODIFIED}`)
                    execution.cached = [...nodes]
                    break
                }

                case STATUS.MODIFIED: {
                    console.log(`case : ${STATUS.MODIFIED}`)
                    nodes.forEach((node) => {
                        if (!items.find((item) => item[idName] === node[idName])) {
                            execution.deleted.push(node)
                        }
                    })

                    items.forEach((item) => {
                        const existingNode = nodes.find(
                            (node) => node[idName] === item[idName]
                        )

                        if (existingNode) {
                            if (existingNode.internal.content !== JSON.stringify(item)) {
                                execution.deleted.push(existingNode)
                                execution.updated.push(item)
                            } else {
                                execution.cached.push(existingNode)
                            }
                        } else {
                            execution.added.push(item)
                        }
                    })

                    break
                }
            }

            console.log('nbr added : ', execution.added.length )
            console.log('nbr cached : ', execution.cached.length )
            console.log('nbr deleted : ', (execution.deleted.length - execution.updated.length)  )
            console.log('nbr updated : ', execution.updated.length )

            for (const node of execution.deleted) {
                deleteNode(node)
            }

            const itemsToCreate = [...execution.added, ...execution.updated]

            for (const item of itemsToCreate) {
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
