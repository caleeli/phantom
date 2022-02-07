import aws_amplify from './auth/amplify.js';
import phantom from './auth/phantom.js';

const env = process.env;

class Auth {
    driver: any;
    // constructor
    constructor() {
        if (env.auth_driver === 'amplify') {
            aws_amplify.init();
            this.driver = aws_amplify.Auth;
        } else {
            phantom.init();
            this.driver = phantom.Auth;
        }
    }

    signIn(username, password) {
        return this.driver.signIn(username, password);
    }
}

export default Auth;
