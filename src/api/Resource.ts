import { user } from '../store';

class Resource {
    private url: string;
    public headers: any;
    constructor(
        private name: string,
        private apiBase: string
    ) {
        this.url = new URL(name, apiBase).toString();
        this.headers = {
            'Content-Type': 'application/json',
        };
        user.subscribe(session => {
            if (session && session.token) {
                const token = session.token;
                this.headers['Authorization'] = `Bearer ${token}`;
            }
        });
    }

    // get resource
    public get(id: string = null, params = {}): Promise<any> {
        const url = new URL(id ? `${this.url}/${id}` : this.url);
        // add params to url
        Object.keys(params).forEach(key => {
            if (Array.isArray(params[key])) {
                // if value is array, add multiple params
                params[key].forEach(value => url.searchParams.append(key + '[]', value));
            } else if (params[key] instanceof Object) {
                // if value is object, add multiple params
                Object.keys(params[key]).forEach(value => url.searchParams.append(key + '[' + value + ']', params[key][value]));
            } else if (params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });
        return fetch(url.toString(), {
            method: 'GET',
            headers: this.headers,
        }).then(response => this.processResponse(response))
            .then(({ data }) => data)
    }

    // get resource as Row object
    public getRow(id: string = null, row = {}): any {
        this.get(id).then((data) => { Object.assign(row, data); row = row; }).catch(err => console.error(err))
        return row;
    }

    // get resource as Row object
    public getList(row = []): any {
        this.get(null).then((data) => row.splice(0, row.length, ...data)).catch(err => console.error(err))
        return row;
    }

    // post resource
    public post(data: any): Promise<any> {
        const body = (data instanceof FormData) ? data : JSON.stringify(data);
        const headers = (data instanceof FormData) ? undefined: this.headers;
        return fetch(this.url, {
            method: 'POST',
            headers,
            body
        }).then(response => this.processResponse(response))
            .then(({ data }) => data)
    }

    // patch resource
    public patch(id: string = null, data: any): Promise<any> {
        const url = id ? `${this.url}/${id}` : this.url;
        return fetch(url, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify(data)
        })
    }

    // patch resource
    public put(id: string = null, data: any): Promise<any> {
        const url = id ? `${this.url}/${id}` : this.url;
        return fetch(url, {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify(data)
        })
    }

    // delete resource
    public delete(id: string = null): Promise<any> {
        const url = id ? `${this.url}/${id}` : this.url;
        return fetch(url, {
            method: 'DELETE',
            headers: this.headers
        })
    }

    private async processResponse(response) {
        if (!response.ok) throw await response.json();
        return response.json();
    }
}

export default Resource;
