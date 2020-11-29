import React, { useState } from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { useAppContext } from "../helpers/contextLib";
import "../css/login.css";
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk/global';
 
        
AWS.config.region = 'eu-west-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.REACT_APP_IDENITY_POOLID,
});

export default function Login() {
    const { userHasAuthenticated } = useAppContext();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    function validateForm() {
        return username.length > 0 && password.length > 0;
    }

    function handleSubmit(event) {
        event.preventDefault();
        const authenticationData = {
            Username : username,
            Password : password,
        };
        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
        const poolData = { 
            UserPoolId : process.env.REACT_APP_COGNITO_POOLID,
            ClientId : process.env.REACT_APP_COGNITO_CLIENTID
        };
        const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        const userData = {
            Username : username,
            Pool : userPool
        };
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                const accessToken = result.getAccessToken().getJwtToken();
                localStorage.setItem('userHasAuthenticated', true);

                localStorage.setItem('userAttributes', JSON.stringify(result.accessToken.payload));
                console.log(result.accessToken.payload);
                userHasAuthenticated(true);
                window.location.href="/";
            },
            newPasswordRequired: function(userAttributes, requiredAttributes) {
                // the api doesn't accept this field back
                delete userAttributes.email_verified;
                setPassword('');
                var newPassword = prompt('Enter new password \n 8 Characters, Uppercase, Lowcase, Numeric');
                cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes);
            },
            onFailure: function(err) {
                setErrorMessage(err.message)
                setPassword('');
                console.log(err)
            },
        });
    }

    return (
        
    <form  className="login-form" onSubmit={handleSubmit}>
        <div className="login-box">
            <div className='login-error'>
                {errorMessage}
            </div>
            <div className='login-row'>
                <TextField
                    autoFocus
                    label="Username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className='login-row'>
                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <Button block size="lg" type="submit"  disabled={!validateForm()} color="primary">
                Login
            </Button>
        </div>
    </form>
  );
}