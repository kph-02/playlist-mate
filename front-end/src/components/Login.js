import React,  { useState } from 'react'
import Button from "@mui/material/Button";
import { ThemeProvider } from "@mui/material";
import { appTheme } from "../themes/themes";




function Login(props) {
    
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const CLIENT_ID = "20f6d7c7a039406b855bb7337bb6dd25"
    const RESPONSE_TYPE = "code"
    const REDIRECT_URI = "http://localhost:3000/"
    const SCOPES = "streaming%20user-modify-playback-state%20ugc-image-upload%20playlist-modify-private%20playlist-modify-public"
    const AUTH_URL = AUTH_ENDPOINT + "?client_id=" + CLIENT_ID + "&response_type=" + RESPONSE_TYPE + "&redirect_uri=" + REDIRECT_URI + "&scope=" + SCOPES
    const {code} = props

    
    const login = () => {
        console.log(code)
    

    }
    const logout = () => {
        console.log(code)
    }

    return (
        <ThemeProvider theme={appTheme}> 
            {code ?
                <Button 
                variant="filled"
                onClick={logout}
                >
                    Logout and Restart
                </Button>
                :
                <Button 
                variant="filled"
                href={AUTH_URL}
                >
                    Login with Spotify
                </Button>
            }
        </ThemeProvider>
        )
}

export default Login