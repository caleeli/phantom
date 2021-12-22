
class Resource {
    private url: string;
    constructor(
        private name: string,
        private apiBase: string
    ) {
        this.url = new URL(name, apiBase).toString();
    }

    // get resource
    public get(id: string, params = {}): Promise<any> {
        const url = new URL(id ? `${this.url}/${id}` : this.url);
        // add params to url
        Object.keys(params).forEach(key => {
            if (Array.isArray(params[key])) {
                // if value is array, add multiple params
                params[key].forEach(value => url.searchParams.append(key + '[]', value));
            } else {
                url.searchParams.append(key, params[key]);
            }
        });
        return fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
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
        return fetch(this.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
    }

    // patch resource
    public patch(id: string = null, data: any): Promise<any> {
        const url = id ? `${this.url}/${id}` : this.url;
        return fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
    }

    // patch resource
    public put(id: string = null, data: any): Promise<any> {
        const url = id ? `${this.url}/${id}` : this.url;
        return fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
    }
}

export default Resource;
