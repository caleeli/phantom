import aws_amplify from './amplify.js';

class Auth {
    driver: any;
    // constructor
    constructor() {
        aws_amplify.init();
        this.driver = aws_amplify.Auth
    }

    signIn(username, password) {
        return this.driver.signIn(username, password)
    }
}

export default Auth;
