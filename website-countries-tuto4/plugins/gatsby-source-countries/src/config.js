const packageJson = require('../package.json')
const PLUGIN_NAME = packageJson.name

const APP_NAME = 'restcountries'

const NODES_KEY = {
    COUNTRY: 'country',
}

const NODE_TYPES = {
    [NODES_KEY.COUNTRY] :  `${APP_NAME}Country`,
}

const CACHE_KEY = {
    ALL : 'all-last-response'
}

module.exports = {
    PLUGIN_NAME,
    APP_NAME,
    NODES_KEY,
    NODE_TYPES,
    CACHE_KEY
}