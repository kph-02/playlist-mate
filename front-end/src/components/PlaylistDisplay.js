import React, { useState, useEffect } from "react";
import '../App.css';
import { ThemeProvider, TextField, Fab } from "@mui/material";
import pmLogo from '../assets/Playlist-Mate.png';
import axios from 'axios';

import { appTheme } from "../themes/themes";

function PlaylistDisplay(props) {

    const [playlistGenerated, setPlaylistGenerated] = useState(false);
    const { values, handleChange } = props;
    const accessToken = values.accessToken;
    const [playlistDescription, setPlaylistDescription] = useState("");

    const [backendData, setBackendData] = useState()


    var getQueryParameters = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        }
    } 

    async function getCoreItemName(coreItem) {
        let coreItemName = "";
        let coreItemID = coreItem.substring(coreItem.length - 22);
        if (coreItem.substring(8, 13) == "track") {    
            var returnedTrack = await fetch('https://api.spotify.com/v1/tracks/' + coreItemID + '/?market=US', getQueryParameters)
            .then(response => response.json())
            .then(data => {
                coreItemName = data.name
            });
        } else if (coreItem.substring(8,14) == 'artist') {
            var returnedArtist = await fetch('https://api.spotify.com/v1/artists/' + coreItemID, getQueryParameters)
            .then(response => response.json())
            .then(data => {
                coreItemName = data.name
            });
        } else if (coreItem.substring(8,13) == 'album') {
            var returnedAlbum = await fetch('https://api.spotify.com/v1/albums/' + coreItemID + '/?market=US', getQueryParameters)
            .then(response => response.json())
            .then(data => {
                coreItemName = data.name

            });
        }
        if (coreItemName != "") {
            return coreItemName
        } else {
            console.log("Error!")
            return null;
        }
    }

    async function generatePlaylistDescription() {
        let coreItemsString = "";
        if (values.coreItemTwo == '') {
            coreItemsString = await getCoreItemName(values.coreItemOne)
        } else if (values.coreItemThree == '') {
            let coreItemOneName = await getCoreItemName(values.coreItemOne)
            let coreItemTwoName = await getCoreItemName(values.coreItemTwo)
            coreItemsString = coreItemOneName + " and " + coreItemTwoName
        } else {
            let coreItemOneName = await getCoreItemName(values.coreItemOne)
            let coreItemTwoName = await getCoreItemName(values.coreItemTwo)
            let coreItemThreeName = await getCoreItemName(values.coreItemThree)
            coreItemsString = coreItemOneName + ", " + coreItemTwoName + ", and " + coreItemThreeName
        }
        let instrumentalString = "";
        if (values.isInstrumental == true) {
            instrumentalString = "instrumental"
        }
        let generatedDescription = values.keywords + " " + instrumentalString + " playlist with " + coreItemsString + ". Made with Playlist Mate @ playlistmate.app"
        return generatedDescription
    }

    async function addToSpotify() {
        
        //Create playlist description
        let playlistDescription = await generatePlaylistDescription()

        let userID = "";
        let playlistID = "";
        //Get User ID
        var returnedUser = await fetch('https://api.spotify.com/v1/me', getQueryParameters)
            .then(response => response.json())
            .then(data => {
                userID = data.id
            });
        if (userID == "") {
            console.log("API Error!")
        }

        var postCreateQueryParameters = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            },
            body: JSON.stringify(
                {
                    "name": values.playlistTitle,
                    "description": playlistDescription,
                    "public": values.isPublic
            })
        }
        var createPlaylist = await fetch('https://api.spotify.com/v1/users/' + userID + '/playlists', postCreateQueryParameters)
        .then(response => response.json())
        .then(data => {
            playlistID = data.id
        });

        if (playlistID == "") {
            console.log("API Error!")
        } else {
            console.log("Playlist ID:" + playlistID)
        }
        
        //Add tracks to playlist

        let playlistTracks = backendData.finalPlaylist;
        let playlistLength = playlistTracks.length
        let numTrackInsertCalls = Math.ceil(playlistLength / 100)

        for (let i = 0; i < numTrackInsertCalls; i++) {
            let playlistOffset = i * 100;
            let uriArray = [];
            if (i == numTrackInsertCalls - 1) {
                for (let j = playlistOffset; j < playlistLength; j++) {
                    let currTrackURI = "spotify:track:" + playlistTracks[j].id
                    uriArray.push(currTrackURI)
                }
            } else {
                for (let j = playlistOffset; j < playlistOffset + 100; j++) {
                    let currTrackURI = "spotify:track:" + playlistTracks[j].id
                    uriArray.push(currTrackURI)
                }
            }

            var postInsertQueryParameters = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + accessToken
                },
                body: JSON.stringify(
                    {
                    "uris": uriArray,
                    "position": playlistOffset
                })
            }
            var addTracks = await fetch('https://api.spotify.com/v1/playlists/' + playlistID + '/tracks', postInsertQueryParameters)
            .then(response => response.json())
            .then(data => {
                console.log("Tracks Added!")
            });            
        }
    }

    useEffect(() => {
        console.log(values)
        axios.get('http://localhost:3001/generatePlaylist', {
            params: values
        }).then((res) => {
            console.log(res.data)
            if (res.data.finalPlaylist.length != 0) {
                setPlaylistGenerated(true)
                setBackendData(res.data)
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
                <div>            
                    <Fab
                        variant="extended"
                        onClick={addToSpotify}
                    >
                        Add to Spotify
                    </Fab>
                    <h1>Playlist</h1>
                </div>
                
            }
            <br/>
        </ThemeProvider>
    );
}

export default PlaylistDisplay;
