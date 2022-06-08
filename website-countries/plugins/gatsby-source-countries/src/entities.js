/*import { API_ROUTES, get }  from './api'
import { v4 as uuidv4 } from 'uuid'

export const fetchAllCountries = async ({ apiUrl,
                                     headers,
                                     createNodeId,
                                     createContentDigest}) => {

    const countryNodeEntities = {}

    const countries = await get(`${apiUrl}${API_ROUTES.ALL}`, headers)

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

        countryNodeEntities[id] = Object.assign({}, country, nodeMeta)
    }
    return countryNodeEntities
}
*/
