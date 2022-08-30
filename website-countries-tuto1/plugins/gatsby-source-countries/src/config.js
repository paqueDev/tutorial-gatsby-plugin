
const APP_NAME = 'restcountries'

const NODES_KEY = {
    COUNTRY: 'country',
}

const NODE_TYPES = {
    [NODES_KEY.COUNTRY] :  `${APP_NAME}Country`,
}

module.exports = {
    APP_NAME,
    NODES_KEY,
    NODE_TYPES,
}