import React, { useState, useEffect } from "react";
import '../App.css';
import { ThemeProvider, TextField, Fab, Autocomplete, Container, List, ListItem, ListItemText, ListItemAvatar, ListItemButton, Avatar, Divider } from "@mui/material";
import { appTheme } from "../themes/themes";
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import { ImageSearch, SettingsOverscanOutlined } from "@material-ui/icons";
import AccountBoxIcon from '@mui/icons-material/AccountBox';


function CoreItemsDetails(props) {
    const [coreItemsNums, setCoreItemsNums] = useState(0);
    const [itemOneType, setItemOneType] = useState('');
    const [itemTwoType, setItemTwoType] = useState('');
    const [itemThreeType, setItemThreeType] = useState('');
    const [itemOneQuery, setItemOneQuery] = useState('');
    const [itemTwoQuery, setItemTwoQuery] = useState('');
    const [itemThreeQuery, setItemThreeQuery] = useState('');
    const [itemOneResults, setItemOneResults] = useState([])
    const [itemTwoResults, setItemTwoResults] = useState([])
    const [itemThreeResults, setItemThreeResults] = useState([])
    const [itemOneURI, setItemOneURI] = useState('');
    const [itemTwoURI, setItemTwoURI] = useState('');
    const [itemThreeURI, setItemThreeURI] = useState('');
    const [itemOneName, setItemOneName] = useState('');
    const [itemTwoName, setItemTwoName] = useState('');
    const [itemThreeName, setItemThreeName] = useState('');

    
    const { values, handleCoreItems } = props;
    const accessToken = values.accessToken;

    const handleCoreItemsInc = () => {
        setCoreItemsNums(coreItemsNums + 1);
    }

    const handleQueryOneChange = e => {
        setItemOneQuery(e.target.value)
    }
    const handleQueryTwoChange = e => {
        setItemTwoQuery(e.target.value)
    }
    const handleQueryThreeChange = e => {
        setItemThreeQuery(e.target.value)
    }
    const handleItemOneSelect = (inputURI, inputName) => e => { 
        setItemOneURI(inputURI)
        setItemOneQuery(inputName)
        setItemOneName(inputName)
        handleCoreItems(inputURI, itemTwoURI, itemThreeURI)
    }
    const handleItemTwoSelect = (inputURI, inputName) => e => { 
        setItemTwoURI(inputURI)
        setItemTwoQuery(inputName)
        setItemTwoName(inputName)
        handleCoreItems(itemOneURI, inputURI, itemThreeURI)
    }
    const handleItemThreeSelect = (inputURI, inputName) => e => { 
        setItemThreeURI(inputURI)
        setItemThreeQuery(inputName)
        setItemThreeName(inputName)
        handleCoreItems(itemOneURI, itemTwoURI, inputURI)
    }
    
    const continueStep = e => {
        e.preventDefault();
        props.nextStep()
    }
    

    const coreItemOptions = ['Artist', 'Song', 'Album'];
    
    let coreItemCompOne = <br/>
    let coreItemCompTwo = <br/>
    let coreItemCompThree = <br/>

    //Core Item Type switching reset
    useEffect(() => {
        setItemOneResults([])
        setItemOneQuery('')
        setItemOneURI('')
        setItemOneName('')
    }, [itemOneType])

    useEffect(() => {
        setItemTwoResults([])
        setItemTwoQuery('')
        setItemTwoURI('')
        setItemTwoName('')
    }, [itemTwoType])

    useEffect(() => {
        setItemThreeResults([])
        setItemThreeQuery('')
        setItemThreeURI('')
        setItemThreeName('')
    }, [itemThreeType])

    //Search
    useEffect(() => {
        if (itemOneQuery != '') {
            searchOne()
        }
        
        if (itemOneQuery != itemOneName) {
            setItemOneURI('')
        }
    }, [itemOneQuery])
    useEffect(() => {
        if (itemTwoQuery != '') {
            searchTwo()
        }
        
        if (itemTwoQuery != itemTwoName) {
            setItemTwoURI('')
        }
    }, [itemTwoQuery])
    useEffect(() => {
        if (itemThreeQuery != '') {
            searchThree()
        }
        
        if (itemThreeQuery != itemThreeName) {
            setItemThreeURI('')
        }
    }, [itemThreeQuery])

    var queryParameters = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        }
    }

    async function searchOne() {
        console.log("Searching for " + itemOneType + ":" + itemOneQuery)
        
        if (itemOneType == 'Artist') {
            var returnedArtists = await fetch('https://api.spotify.com/v1/search?q=' + itemOneQuery + '&type=artist', queryParameters)
            .then(response => response.json())
            .then(data => {
                setItemOneResults(data.artists.items)   
            });

        } else if (itemOneType == 'Song') {
            var returnedTracks = await fetch('https://api.spotify.com/v1/search?q=' + itemOneQuery + '&type=track', queryParameters)
            .then(response => response.json())
            .then(data => {
                setItemOneResults(data.tracks.items)    
            });
        } else if (itemOneType == 'Album') {
            var returnedAlbums = await fetch('https://api.spotify.com/v1/search?q=' + itemOneQuery + '&type=album', queryParameters)
            .then(response => response.json())
            .then(data => {
                setItemOneResults(data.albums.items)    
            });
        }
        console.log("Search One Results")
        console.log(itemOneResults)
    }

    async function searchTwo() {
        console.log("Searching for " + itemTwoType + ":" + itemTwoQuery)
        
        if (itemTwoType == 'Artist') {
            var returnedArtists = await fetch('https://api.spotify.com/v1/search?q=' + itemTwoQuery + '&type=artist', queryParameters)
            .then(response => response.json())
            .then(data => {
                setItemTwoResults(data.artists.items)    
            });

        } else if (itemTwoType == 'Song') {
            var returnedTracks = await fetch('https://api.spotify.com/v1/search?q=' + itemTwoQuery + '&type=track', queryParameters)
            .then(response => response.json())
            .then(data => {
                setItemTwoResults(data.tracks.items)    
            });
        } else if (itemTwoType == 'Album') {
            var returnedAlbums = await fetch('https://api.spotify.com/v1/search?q=' + itemTwoQuery + '&type=album', queryParameters)
            .then(response => response.json())
            .then(data => {
                setItemTwoResults(data.albums.items)    
            });
        }
        console.log("Search Two Results")
        console.log(itemTwoResults)
    }

    async function searchThree() {
        console.log("Searching for " + itemThreeType + ":" + itemThreeQuery)

        if (itemThreeType == 'Artist') {
            var returnedArtists = await fetch('https://api.spotify.com/v1/search?q=' + itemThreeQuery + '&type=artist', queryParameters)
            .then(response => response.json())
            .then(data => {
                setItemThreeResults(data.artists.items)    
            });

        } else if (itemThreeType == 'Song') {
            var returnedTracks = await fetch('https://api.spotify.com/v1/search?q=' + itemThreeQuery + '&type=track', queryParameters)
            .then(response => response.json())
            .then(data => {
                setItemThreeResults(data.tracks.items)    
            });
        } else if (itemThreeType == 'Album') {
            var returnedAlbums = await fetch('https://api.spotify.com/v1/search?q=' + itemThreeQuery + '&type=album', queryParameters)
            .then(response => response.json())
            .then(data => {
                setItemThreeResults(data.albums.items)    
            });
        }
        console.log("Search Three Results")
        console.log(itemThreeResults)
    }

    if (coreItemsNums >= 0) {
        coreItemCompOne =             
        <div>
            <Autocomplete
                id="combo-box-demo"
                options={coreItemOptions}
                sx={{ width: 150 }}
                renderInput={(params) => <TextField {...params} label="Type"/>}
                value={itemOneType}
                onChange={(event, newValue) => {setItemOneType(newValue);}}    
            />
            <br/>
            {(itemOneType != '') &&
            <TextField
                label="Search"
                value={itemOneQuery}
                onChange={handleQueryOneChange}  
                type="search"  
            />
            }
            {((itemOneQuery != '') && (itemOneURI == '')) &&
                <List
                sx={{
                    width: '100%',
                    maxWidth: 360,
                }}
                >
                    {itemOneResults.map((item, i) => {
                        return (
                            <div>
                                <ListItem
                                onClick={handleItemOneSelect(item.uri, item.name)}
                                >
                                    <ListItemAvatar>
                                        { itemOneType == "Song" && 
                                            <Avatar
                                                variant="rounded"
                                                sx={{ width: 64, height: 64 }}
                                                src={item.album.images[0].url}
                                            />
                                        }
                                        { (itemOneType != "Song" && item.images.length != 0) &&
                                            <Avatar
                                                variant="rounded"
                                                sx={{ width: 64, height: 64 }}
                                                src={item.images[0].url}
                                            />}
                                        { (itemOneType != "Song" && item.images.length == 0) &&
                                            <Avatar
                                                variant="rounded"
                                                sx={{ width: 64, height: 64 }}
                                                fontSize="large"
                                            >
                                                <AccountBoxIcon/>
                                            </Avatar>
                                        }
                                    </ListItemAvatar>
                                    { (itemOneType == "Artist") ?
                                        <ListItemText primary={item.name}  />
                                        :
                                        <ListItemText primary={item.name} secondary={item.artists[0].name} />
                                    }
                                </ListItem>
                                <Divider variant="inset" component="li" />
                            </div>
                        )
                    })}
                    
                </List>
            }   
        </div>
    }
    if (coreItemsNums >= 1) {
        coreItemCompTwo = 
        <div>
            <Autocomplete
                id="combo-box-demo"
                options={coreItemOptions}
                sx={{ width: 150 }}
                renderInput={(params) => <TextField {...params} label="Type"/>}
                value={itemTwoType}
                onChange={(event, newValue) => {setItemTwoType(newValue);}}    
            />
            <br/>
            {(itemTwoType != '') &&
            <TextField
                label="Search"
                value={itemTwoQuery}
                onChange={handleQueryTwoChange}   
                type="search"
            />
            }
            {((itemTwoQuery != '') && (itemTwoURI == '')) &&
                <List
                sx={{
                    width: '100%',
                    maxWidth: 360,
                }}
                >
                    {itemTwoResults.map((item, i) => {
                        return (
                            <div>
                                <ListItem
                                onClick={handleItemTwoSelect(item.uri, item.name)}
                                >
                                    <ListItemAvatar>
                                        { itemTwoType == "Song" && 
                                            <Avatar
                                                variant="rounded"
                                                sx={{ width: 64, height: 64 }}
                                                src={item.album.images[0].url}
                                            />
                                        }
                                        { (itemTwoType != "Song" && item.images.length != 0) &&
                                            <Avatar
                                                variant="rounded"
                                                sx={{ width: 64, height: 64 }}
                                                src={item.images[0].url}
                                            />}
                                        { (itemTwoType != "Song" && item.images.length == 0) &&
                                            <Avatar
                                                variant="rounded"
                                                sx={{ width: 64, height: 64 }}
                                                fontSize="large"
                                            >
                                                <AccountBoxIcon/>
                                            </Avatar>
                                        }
                                    </ListItemAvatar>
                                    { (itemTwoType == "Artist") ?
                                        <ListItemText primary={item.name}  />
                                        :
                                        <ListItemText primary={item.name} secondary={item.artists[0].name} />
                                    }
                                </ListItem>
                                <Divider variant="inset" component="li" />
                            </div>
                        )
                    })}
                    
                </List>
            }   
        </div>
    } 
    if (coreItemsNums >= 2) {
        coreItemCompThree = 
        <div>
            <Autocomplete
                id="combo-box-demo"
                options={coreItemOptions}
                sx={{ width: 150 }}
                renderInput={(params) => <TextField {...params} label="Type"/>}
                value={itemThreeType}
                onChange={(event, newValue) => {setItemThreeType(newValue);}}    
            />
            <br/>
            {(itemThreeType != '') &&
            <TextField
                label="Search"
                value={itemThreeQuery}
                onChange={handleQueryThreeChange}
                type="search"   
            />
            }
            {((itemThreeQuery != '') && (itemThreeURI == '')) &&
                <List
                sx={{
                    width: '100%',
                    maxWidth: 360,
                }}
                >
                    {itemThreeResults.map((item, i) => {
                        return (
                            <div>
                                <ListItem
                                onClick={handleItemThreeSelect(item.uri, item.name)}
                                >
                                    <ListItemAvatar>
                                        { itemThreeType == "Song" && 
                                            <Avatar
                                                variant="rounded"
                                                sx={{ width: 64, height: 64 }}
                                                src={item.album.images[0].url}
                                            />
                                        }
                                        { (itemThreeType != "Song" && item.images.length != 0) &&
                                            <Avatar
                                                variant="rounded"
                                                sx={{ width: 64, height: 64 }}
                                                src={item.images[0].url}
                                            />}
                                        { (itemThreeType != "Song" && item.images.length == 0) &&
                                            <Avatar
                                                variant="rounded"
                                                sx={{ width: 64, height: 64 }}
                                                fontSize="large"
                                            >
                                                <AccountBoxIcon/>
                                            </Avatar>
                                        }
                                    </ListItemAvatar>
                                    { (itemThreeType == "Artist") ?
                                        <ListItemText primary={item.name}  />
                                        :
                                        <ListItemText primary={item.name} secondary={item.artists[0].name} />
                                    }
                                </ListItem>
                                <Divider variant="inset" component="li" />
                            </div>
                        )
                    })}

                </List>
            }   
        </div>
    }

    return (
        <ThemeProvider theme={appTheme}>
            <h2>Choose up to 3 Core Items</h2>
            {coreItemCompOne}
            {coreItemCompTwo}
            {coreItemCompThree}
            <AddCircleOutlineRoundedIcon
                    onClick={handleCoreItemsInc}
            />
            <br/>
            <Fab
                variant="extended"
                onClick={continueStep}
            >
                Next
            </Fab>

        </ThemeProvider>
    );
}

export default CoreItemsDetails;
