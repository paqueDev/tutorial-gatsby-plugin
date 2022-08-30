const fetch = require('node-fetch')

const HTTP_METHODS = {
    POST: 'POST',
    GET: 'GET',
}

const API_URL = 'https://restcountries.com/v3.1'

 const API_ROUTES = {
    ALL : '/all'
}

async function apiRequest(url, method, headers) {
    const response = await fetch(url, {
        headers,
        method,
    })

    const json = await response.json()
    return json
}

function  get (url, headers) {
    return apiRequest(url, HTTP_METHODS.GET, headers)
}


function getAllCountries ({apiUrl,headers }) {
    return get(`${apiUrl}${API_ROUTES.ALL}`, headers)
}

module.exports = {
    HTTP_METHODS,
    API_URL,
    API_ROUTES,
    get,
    getAllCountries
}