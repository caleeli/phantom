import api from "../api";

const env = process.env;
const api_base = env.api_base;

class PhantomAuth {
    signIn(username, password) {
        return api(api_base + 'auth').post({
            data: {
                attributes: {
                    username: username,
                    password: password
                },
            },
        }).catch(error => { throw { message: error.error } })
            .then(response => {
                return { ...response, token: response.signInUserSession.token }
            });
    }
}

export default {
    Auth: null,
    init() {
        try {
            this.Auth = new PhantomAuth();
        } catch (error) {
            console.error(error);
        }
    },
};
