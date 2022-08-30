
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
    APP_NAME,
    NODES_KEY,
    NODE_TYPES,
    CACHE_KEY
}