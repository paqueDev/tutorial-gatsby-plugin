const APP_NAME = 'restcountries'

const NODES_KEY = {
    COUNTRY: 'country',
}

const NODES_TYPES = {
    [NODES_KEY.COUNTRY] :  `${APP_NAME}Country`,
}

module.exports = {
    APP_NAME,
    NODES_KEY,
    NODES_TYPES,

}