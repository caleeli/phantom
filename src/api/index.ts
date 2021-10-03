import Resource from "./Resource";

const api = new Proxy({}, {
    get: (target, prop: string) => {
        return new Resource(prop)
    }
})

export default api;
