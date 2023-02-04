import React, { useState, useEffect } from "react";
import '../App.css';
import { ThemeProvider } from "@mui/material";
import { TextField }  from "@mui/material";
import pmLogo from '../assets/Playlist-Mate.png';
import axios from 'axios';

import { appTheme } from "../themes/themes";

function PlaylistDisplay(props) {

    const [playlistGenerated, setPlaylistGenerated] = useState(false);
    const { values, handleChange } = props;
    const accessToken = values.accessToken;

    const [backendData, setBackendData] = useState()
    
    useEffect(() => {
        console.log(values)
        axios.get('http://localhost:3001/generatePlaylist', {
            params: values
        }).then((res) => {
            console.log(res.data)
            if (res.data.finalPlaylist.length != 0) {
                setPlaylistGenerated(true)
            }
        }).catch(error => {
            console.log(error);
        });
    }, [])

    return (
        <ThemeProvider theme={appTheme}>
            { (playlistGenerated == false)  ?
                <img  src={pmLogo} alt="logo"/>
                :
                <h1>Playlist</h1>
            }

            <br/>
        </ThemeProvider>
    );
}

export default PlaylistDisplay;
