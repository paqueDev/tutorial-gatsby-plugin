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
    if (cached === current) {
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

    const execution = {
        nodeType: 'RestcountriesCountry',
        changeStatus : false,
        idName : 'id',
        nodes: [],
        items: [],
        added: [],
        updated: [],
        deleted: [],
        cached: [],
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
         const response = await fetch(`https://restcountries.com/v3.1/all`, {
            method: 'GET',
            headers : {
                'Content-Type': 'application/json',
            },
        })
        const countries = await response.json()
        */

        const countries = countriesJSON
        execution.items = countries


        const responseCached =  await cache.get(CACHE_KEY)

        const status = getStatus(responseCached, JSON.stringify(countries))
        execution.changeStatus = status

        cache.set(CACHE_KEY, JSON.stringify(countries))
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
