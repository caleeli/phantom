
class Resource {
    constructor(
        public name: string,
    ) { }

    // post resource
    public get(id: string): Promise<any> {
        return fetch(`/api/${this.name}/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    // post resource
    public post(data: any): Promise<any> {
        return fetch(`/api/${this.name}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
    }

    // patch resource
    public patch(data: any): Promise<any> {
        return fetch(`/api/${this.name}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
    }
}

export default Resource;
