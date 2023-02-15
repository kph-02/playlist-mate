import React, { useState, useEffect } from "react";
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, Typography, ThemeProvider, Fab } from "@mui/material";
import pmLogo from '../assets/Playlist-Mate-Logo.png';
import axios from 'axios';
import Login from "./Login";
import io from 'socket.io-client';

import { appTheme } from "../themes/themes";
import SplashScreen from "./SplashScreen";

const LIVE_URL = "https://www.playlistmate.app";
//const LIVE_URL = "http://localhost:3001"

const socket = io.connect(LIVE_URL + '/');

function PlaylistDisplay(props) {

    const [playlistGenerated, setPlaylistGenerated] = useState(false);
    const { values, handleChange, logout } = props;
    const accessToken = values.accessToken;
    const [playlistDescription, setPlaylistDescription] = useState("");
    const[playlistItems, setPlaylistItems] = useState([]);
    const [backendData, setBackendData] = useState({});
    const screen = "playlistDisplay"

    var getQueryParameters = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        }
    } 

    const generatePlaylist = () => {
        socket.emit("generate_playlist_request", {values});
    };

    useEffect(() => {
        console.log(values);
        generatePlaylist();
    }, [])

    useEffect(() => {
        socket.on("generate_playlist_return", async (data) => {
            console.log("Final Playlist Recieved")
            console.log(data);
            if (data.finalPlaylist.length != 0) {
                setPlaylistGenerated(true)
                setBackendData(data)
                await generatePlaylistDescription()
            }
        })
    }, [socket])

    /* Using old API route for generating playlist
    useEffect(() => {
        console.log(values)
        axios.get(LIVE_URL + '/generatePlaylist', {
            params: values
        }).then(async (res) => {
            if (res.data.finalPlaylist.length != 0) {
                setPlaylistGenerated(true)
                setBackendData(res.data)
                await generatePlaylistDescription()
            }
        }).catch(error => {
            console.log(error);
        });
    }, [])
    */

    async function getPlaylistItems() {
        let playlistLength = backendData.finalPlaylist.length
        let playlistTracks = backendData.finalPlaylist;
        let numBatchCalls = Math.ceil(playlistLength/50)
        let playlistItemsArray = [];

        for (let i = 0; i < numBatchCalls; i++) {
            let playlistOffset = i * 50;
            let currQueryString = "";
            if (i == numBatchCalls - 1) {
                for (let j = playlistOffset; j < playlistLength; j++) {
                    let currTrackID = playlistTracks[j].id
                    if (j == playlistLength - 1) {
                        currQueryString += currTrackID
                    } else {
                        currQueryString += currTrackID
                        currQueryString+= ","
                    }
                }
            } else {
                for (let j = playlistOffset; j < playlistOffset + 50; j++) {
                    let currTrackID = playlistTracks[j].id
                    if (j == (playlistOffset + 50) - 1) {
                        currQueryString += currTrackID
                    } else {
                        currQueryString += currTrackID
                        currQueryString+= ","
                    }
                }
            }
            //Insert Batch call to populate items
            var returnedTracks = await fetch('https://api.spotify.com/v1/tracks?market=US&ids=' + currQueryString , getQueryParameters)
                .then(response => response.json())
                .then(data => {
                    if (data.tracks.length != 0) {
                        for (let i = 0; i < data.tracks.length; i++) {
                            let currItem = {
                                name: data.tracks[i].name,
                                artist: data.tracks[i].artists[0].name,
                                image: data.tracks[i].album.images[0].url
                            }
                            playlistItemsArray.push(currItem);
                        }
                    }
            });
        }
        setPlaylistItems(playlistItemsArray);

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
        setPlaylistDescription(generatedDescription)        
    }

    async function addToSpotify() {
        
        //Create playlist description

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
        let isPlaylistPublic = false;
        if (values.isPublic == true || values.isPublic == 'true') {
            isPlaylistPublic = true;
            console.log("Playlist is public")
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
                    "public": isPlaylistPublic
            })
        }
        console.log(postCreateQueryParameters)
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
        console.log(backendData)
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
        if (playlistID != "") {
            alert("Added to Spotify")
        } else {
            alert("Error adding to Spotify")
        }
    }



    useEffect(() => {
        async function fetchData() {
            if (backendData.hasOwnProperty('finalPlaylist')) {
                await getPlaylistItems()
            }
        }
        fetchData();
    }, [backendData])

    return (
        <ThemeProvider theme={appTheme}>
            { ((playlistGenerated == false) || (playlistDescription == "") || (playlistItems.length == 0))  ?
                <SplashScreen
                    screen={screen}
                />
                :
                <div>
                    <Typography 
                        sx={{ mx: 5, my: 2}}
                        variant="h3" 
                        color="textPrimary">
                        {values.playlistTitle}
                    </Typography>
                    <Typography 
                        sx={{ mx: 5, my: 2}}                    
                        variant="h4" 
                        color="textPrimary">
                        {playlistDescription.substring(0, playlistDescription.length - 43)}
                    </Typography>             
                    <Fab
                        variant="extended"
                        color="info"

                        onClick={addToSpotify}
                    >
                        Add to Spotify
                    </Fab>
                    <List
                        sx={{
                            width: 360,
                            maxHeight: 400, 
                            overflow: 'auto',
                            zIndex: 10,
                            mx: 2,
                            my: 3,
                            border:1,
                            borderColor: '#B2B2B2',
                            borderRadius: '10px' 
                        }}
                    >
                        {playlistItems.map((item, i) => {
                            return (
                                <div>
                                    <ListItem>
                                        <ListItemAvatar                              
                                            sx={{mr: 1}}>   
                                            <Avatar
                                                variant="rounded"
                                                sx={{ width: 64, height: 64 }}
                                                src={item.image}
                                            />
                                        </ListItemAvatar>
                                        <ListItemText primary={item.name} secondary={item.artist} />
                                    </ListItem>
                                    <Divider variant="inset" component="li" />
                                </div>
                            )
                        })}
                    </List>
                    <Fab
                        variant="extended"
                        color="primary"
                        onClick={logout}
                    >
                        Logout and Restart
                    </Fab>
                </div>
            }
            <br/>
        </ThemeProvider>
    );
}

export default PlaylistDisplay;
