
class Resource {
    private url: string;
    constructor(
        private name: string,
        private apiBase: string
    ) {
        this.url = new URL(name, apiBase).toString();
    }

    // get resource
    public get(id: string): Promise<any> {
        const url = id ? `${this.url}/${id}` : this.url;
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    // get resource as Row object
    public getRow(id: string, row = {}): any {
        this.get(id).then(({data}) => Object.assign(row, data))
        return row;
    }

    // get resource as Row object
    public getList(row = {}): any {
        this.get(null).then(({data}) => Object.assign(row, data))
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
    public patch(data: any): Promise<any> {
        return fetch(this.url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
    }
}

export default Resource;
