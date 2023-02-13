import React,  { useEffect, useState } from 'react'
import { ThemeProvider, Fab } from "@mui/material";
import { appTheme } from "../themes/themes";

function Login(props) {
    
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const CLIENT_ID = "20f6d7c7a039406b855bb7337bb6dd25"
    const RESPONSE_TYPE = "code"
    const REDIRECT_URI = "http://localhost:3000/"
    const SCOPES = "streaming%20user-modify-playback-state%20ugc-image-upload%20playlist-modify-private%20playlist-modify-public"
    const AUTH_URL = AUTH_ENDPOINT + "?client_id=" + CLIENT_ID + "&response_type=" + RESPONSE_TYPE + "&redirect_uri=" + REDIRECT_URI + "&scope=" + SCOPES
    const {code} = props


    useEffect(() => {
        var url = new URL(window.location);  
        if (url.searchParams.get('code') == 'restart') {        
            url.searchParams.delete('code');
            window.location.href = url;
        }
    });
    return (
        <ThemeProvider theme={appTheme}> 

                <Fab 
                    variant="extended"
                    color="info"
                    href={AUTH_URL}
                >
                    Login with Spotify
                </Fab>

        </ThemeProvider>
        )
}

export default Login