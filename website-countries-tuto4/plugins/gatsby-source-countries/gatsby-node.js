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
const {APP_NAME, NODES_KEY, NODE_TYPES, CACHE_KEY, PLUGIN_NAME} = require("./src/config")

exports.onPreInit = ({reporter}) => reporter.info(`Loaded ${PLUGIN_NAME}`)

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
                                 cache,
                                 parentSpan
                             }) => {
    const { createNode,deleteNode,touchNode } = actions

    const {COUNTRY} = NODES_KEY

    const executions = {
        [COUNTRY]: {
            nodeType: NODE_TYPES[COUNTRY],
            changeStatus : false,
            idName : 'cca3',
            cacheKey : CACHE_KEY.ALL,
            nodes: [],
            items: [],
            added: [],
            updated: [],
            deleted: [],
            cached: [],
        }
    }

    const logExecution = (execution) => {
        const { added, updated, deleted, cached, cacheKey, nodeType } = execution
        reporter.info(`${APP_NAME}: ${added.length} new ${nodeType}`)
        reporter.info(`${APP_NAME}: ${updated.length} updated ${nodeType}`)
        reporter.info(
            `${APP_NAME}: ${deleted.length - updated.length} deleted ${nodeType}`
        )
        reporter.info(`${APP_NAME}: ${cached.length} cached ${nodeType}`)
        reporter.info(`${APP_NAME}: data cached on cache key ${cacheKey} `)
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

        const status = getStatus(responseCached, JSON.stringify(countries))
        executions.country.changeStatus = status
        cache.set(CACHE_KEY.ALL, JSON.stringify(countries))
    }

    const processData = (execution) =>
        new Promise((resolve) => {
            const { changeStatus, items, nodes , idName, nodeType} = execution

            switch (changeStatus) {
                case STATUS.NOT_INITIALIZED: {
                    execution.added = [...items]
                    break
                }

                case STATUS.NOT_MODIFIED: {
                    execution.cached = [...nodes]
                    break
                }

                case STATUS.MODIFIED: {
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

            const deletionActivity = reporter.activityTimer(
                `${APP_NAME}: Deleting ${nodeType} nodes `,
                {
                    parentSpan,
                }
            )
            deletionActivity.start()
            for (const node of execution.deleted) {
                deleteNode(node)
            }
            deletionActivity.end()

            const creationActivity = reporter.activityTimer(
                `${APP_NAME}: Creating ${nodeType} nodes`,
                {
                    parentSpan,
                }
            )
            creationActivity.start()
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
            creationActivity.end()

            resolve()
        })

    await Promise.all(
        Object.values(executions).map((execution) => prepareNodes(execution))
    )

    try {
        const fetchActivity = reporter.activityTimer(`${APP_NAME}: Fetch data`, {
            parentSpan,
        })
        fetchActivity.start()
        await fetchCountries()
        fetchActivity.end()

        const processingActivity = reporter.activityTimer(
            `${APP_NAME}: Process data`,
            {
                parentSpan,
            }
        )
        processingActivity.start()
        await Promise.all(Object.values(executions).map(processData))
        processingActivity.end()

        Object.values(executions).forEach(logExecution)

    }catch (e) {
        reporter.panic({
            id: '10000',
            context: {
                sourceMessage: e.message,
            },
        })
    }
}
