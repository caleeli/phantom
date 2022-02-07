const env = process.env;
export default {
    Auth: null,
    init() {
        try {
            let aws_amplify = window.aws_amplify;
            if (aws_amplify) {
                aws_amplify.Amplify.configure({
                    aws_project_region: env.cognito_region,
                    aws_cognito_region: env.cognito_region,
                    aws_user_pools_id: env.cognito_pools_id,
                    aws_user_pools_web_client_id: env.cognito_client_id,
                    oauth: {
                        domain: env.cognito_domain,
                        scope: [
                            "phone",
                            "email",
                            "openid",
                            "profile",
                        ],
                        redirectSignIn: `${location.origin}/`,
                        redirectSignOut: `${location.origin}/logout/`,
                        responseType: "token",
                    },
                    federationTarget: "COGNITO_USER_POOLS",
                    aws_cognito_login_mechanisms: ["PREFERRED_USERNAME"],
                    aws_cognito_signup_attributes: ["EMAIL"],
                    aws_cognito_mfa_configuration: "OFF",
                    aws_cognito_mfa_types: ["SMS"],
                    aws_cognito_password_protection_settings: {
                        passwordPolicyMinLength: 8,
                        passwordPolicyCharacters: [],
                    },
                    aws_cognito_verification_mechanisms: ["EMAIL"],
                });
                this.Auth = aws_amplify.Amplify.Auth;
            } else {
                console.error('aws_amplify not loaded');
            }
        } catch (error) {
            console.error(error);
        }
    },
};
