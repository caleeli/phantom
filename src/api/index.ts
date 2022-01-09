import Resource from "./Resource";
// load from env api_base
const env = process.env;
const apiBase = env.api_base || 'http://localhost/';

/**
 * @class Api
 * 
 * @returns {Resource}
 */
function api(url: string): Resource {
    return new Resource(url, apiBase);
}

export default api;
