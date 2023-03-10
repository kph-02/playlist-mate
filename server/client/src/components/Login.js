import React,  { useEffect, useState } from 'react'
import { Typography, ThemeProvider, Fab } from "@mui/material";
import { appTheme } from "../themes/themes";

const LIVE_URL = "https://www.playlistmate.app/";
//const LIVE_URL = "http://localhost:3000/"

function Login(props) {
    
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const CLIENT_ID = "20f6d7c7a039406b855bb7337bb6dd25"
    const RESPONSE_TYPE = "code"
    const REDIRECT_URI = LIVE_URL
    //If image upload is implemented
    //const SCOPES = "ugc-image-upload%20playlist-modify-private%20playlist-modify-public"
    const SCOPES = "playlist-modify-private%20playlist-modify-public"
    const AUTH_URL = AUTH_ENDPOINT + "?client_id=" + CLIENT_ID + "&response_type=" + RESPONSE_TYPE + "&redirect_uri=" + REDIRECT_URI + "&scope=" + SCOPES
    const {code} = props
    const FORM_URL = "https://forms.gle/nh1BWwaHDY5F1YNN6"

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
                sx={{my: 2}}
                variant="extended"
                color="primary"
                href={FORM_URL}
            >
                Request Access
            </Fab>
            <Fab 
                sx={{my: 2}}
                variant="extended"
                color="info"
                href={AUTH_URL}
            >
                Login with Spotify
            </Fab>
            <Typography sx={{my: 2}}variant="h8">
                Access needed to Login
            </Typography>
        </ThemeProvider>
        )
}

export default Login