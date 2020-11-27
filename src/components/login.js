import React, { useState } from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { useAppContext } from "../helpers/contextLib";
import "../css/login.css";


export default function Login() {
    const { userHasAuthenticated, isUserAdmin } = useAppContext();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    function validateForm() {
        return username.length > 0 && password.length > 0;
    }

    function handleSubmit(event) {
        event.preventDefault();
        userHasAuthenticated(true);
        localStorage.setItem('userHasAuthenticated', true);
        if (username.toLocaleLowerCase === 'admin') {
            isUserAdmin(true)
            localStorage.setItem('isUserAdmin', true);
        }
        
        window.location.href="/";
    }

    return (
        
    <form onSubmit={handleSubmit}>
        <div className="Login">
            <div>
                <label>username</label>
                <TextField
                    autoFocus
                    type="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div>
                <label>Password</label>
                <TextField
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