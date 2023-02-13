import React, { useState, useEffect } from "react";
import { Box, Stack, Typography, IconButton, ThemeProvider, TextField, Fab, Autocomplete, Container, List, ListItem, ListItemText, ListItemAvatar, ListItemButton, Avatar, Divider } from "@mui/material";
import { appTheme } from "../themes/themes";
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';import { ImageSearch, SettingsOverscanOutlined } from "@material-ui/icons";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import zIndex from "@mui/material/styles/zIndex";



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

    const backStep = e => {
        e.preventDefault();
        props.previousStep();
    }

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
    
    const removeItemOne = () => {
        setItemOneType('');
    }

    const removeItemTwo = () => {
        setItemTwoType('');
        setCoreItemsNums(0);
    }

    const removeItemThree = () => {
        setItemThreeType('');
        setCoreItemsNums(1);
    }

    const coreItemOptions = ['Artist', 'Song', 'Album'];
    
    let coreItemCompOne = <></>
    let coreItemCompTwo = <></>
    let coreItemCompThree = <></>

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
        <Stack
            sx={{ my: 1 }}   
            direction="row">
            {(coreItemsNums == 0) ?
            <RemoveCircleOutlineOutlinedIcon
                sx={{my: 2}}
                color="secondary"
                onClick={removeItemOne}
            /> : 
            <RemoveCircleOutlineOutlinedIcon
                sx={{my: 2}}
                color="#181818"
            />
            }
            <Autocomplete
                id="combo-box-demo"
                options={coreItemOptions}
                sx={{ width: 130, mr: 1 }}
                renderInput={(params) => <TextField {...params} label="Type"/>}
                value={itemOneType}
                onChange={(event, newValue) => {setItemOneType(newValue);}}    
            />
            <Stack
                direction="column">
            {(itemOneType != '') ?
            <TextField
                label="Search"
                value={itemOneQuery}
                onChange={handleQueryOneChange}  
                type="search" 
                sx={{ width: 200,
                zIndex: 1}}
            /> :
            <Box
            sx={{
              width: 200,
              height: 5,
              backgroundColor: 'primary',
              zIndex: 1
            }}
          />
            }
            {((itemOneQuery != '') && (itemOneURI == '')) &&
                <List
                sx={{
                    width: 200,
                    maxHeight: 300, 
                    overflow: 'auto',
                    zIndex: 10
                }}
                >
                    {itemOneResults.map((item, i) => {
                        return (
                            <div>
                                <ListItem
                                onClick={handleItemOneSelect(item.uri, item.name)}
                                >
                                    <ListItemAvatar                              
                                        sx={{mr: 1}}>   
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
            </Stack> 
        </Stack>          

    }
    if (coreItemsNums >= 1) {
        coreItemCompTwo =   
        <Stack
            sx={{ my: 1 }}
            direction="row">
            {(coreItemsNums == 1) ?
            <RemoveCircleOutlineOutlinedIcon
                sx={{my: 2}}
                color="secondary"
                onClick={removeItemTwo}
            /> :
            <RemoveCircleOutlineOutlinedIcon
                sx={{my: 2}}
                color='transparent'
            />
            }
            <Autocomplete
                id="combo-box-demo"
                options={coreItemOptions}
                sx={{ width: 130, mr: 1 }}
                renderInput={(params) => <TextField {...params} label="Type"/>}
                value={itemTwoType}
                onChange={(event, newValue) => {setItemTwoType(newValue);}}    
            />
            <Stack
                direction="column">
            {(itemTwoType != '') ?
            <TextField
                label="Search"
                value={itemTwoQuery}
                onChange={handleQueryTwoChange}  
                type="search" 
                sx={{ width: 200, zIndex: 1}}
            /> :
            <Box
            sx={{
              width: 200,
              height: 5,
              backgroundColor: 'primary',
              zIndex: 1
            }}
            />
            }
            {((itemTwoQuery != '') && (itemTwoURI == '')) &&
                <List
                sx={{
                    width: 200,
                    maxHeight: 300, 
                    overflow: 'auto',
                    zIndex: 10
                }}
                >
                    {itemTwoResults.map((item, i) => {
                        return (
                            <div>
                                <ListItem
                                onClick={handleItemTwoSelect(item.uri, item.name)}
                                >
                                    <ListItemAvatar
                                        sx={{mr: 1}}>
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
            </Stack> 
        </Stack>          

    } 
    if (coreItemsNums >= 2) {
        coreItemCompThree =   
        <Stack
            sx={{ my: 1 }}
            direction="row">
            {(coreItemsNums == 2) ?
            <RemoveCircleOutlineOutlinedIcon
                sx={{my: 2}}
                color="secondary"
                onClick={removeItemThree}
            /> :
            <RemoveCircleOutlineOutlinedIcon
                sx={{my: 2}}
                color='transparent'
            />
            }
            <Autocomplete
                id="combo-box-demo"
                options={coreItemOptions}
                sx={{ width: 130, mr: 1 }}
                renderInput={(params) => <TextField {...params} label="Type"/>}
                value={itemThreeType}
                onChange={(event, newValue) => {setItemThreeType(newValue);}}    
            />
            <Stack
                direction="column">
            {(itemThreeType != '') ?
            <TextField
                label="Search"
                value={itemThreeQuery}
                onChange={handleQueryThreeChange}  
                type="search" 
                sx={{ width: 200, zIndex: 1}}
            /> :
            <Box
            sx={{
              width: 200,
              height: 5,
              backgroundColor: 'primary',
              zIndex: 1
            }}
          />
            }
            {((itemThreeQuery != '') && (itemThreeURI == '')) &&
                <List
                sx={{
                    width: 200,
                    maxHeight: 300, 
                    overflow: 'auto',
                    zIndex: 10
                }}
                >
                    {itemThreeResults.map((item, i) => {
                        return (
                            <div>
                                <ListItem
                                onClick={handleItemThreeSelect(item.uri, item.name)}
                                >
                                    <ListItemAvatar
                                        sx={{mr: 1}}>
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
            </Stack> 
        </Stack>          
    }

    return (
        <ThemeProvider theme={appTheme}>
             <IconButton 
                sx={{ 
                    mr:30, 
                }} 
                onClick={backStep} color="secondary">
                <ArrowBackIcon/>
            </IconButton>
            <Typography sx={{ mx: 10, my: 2}} variant="h3" color="textPrimary">
                Pick up to 3 "Samples"
            </Typography>

            {coreItemCompOne}
            {coreItemCompTwo}
            {coreItemCompThree}
            {coreItemsNums < 2 &&
            <AddCircleOutlineRoundedIcon
                sx={{ my: 2}}
                onClick={handleCoreItemsInc}
                color="secondary"
            />
            }
                <Fab
                    variant="extended"
                    color="primary"

                    onClick={continueStep}
                >
                    Next
                </Fab>

        </ThemeProvider>
    );
}

export default CoreItemsDetails;
