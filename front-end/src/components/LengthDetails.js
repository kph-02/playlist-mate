import React, { useState, useEffect } from "react";
import { Typography, ThemeProvider, Slider, Stack, Fab, IconButton } from "@mui/material";
import { appTheme } from "../themes/themes";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


function LengthDetails(props) {

    const { values, handleChange } = props;
    const accessToken = values.accessToken;
    const [minDesiredLength, setMinDesiredLength] = useState(0);
    const [minDesiredLengthText, setMinDesiredLengthText] = useState('');

    const finalStep = e => {
        if (values.desiredLength == 0) {
            values.desiredLength = minDesiredLength
        }
        e.preventDefault();
        props.nextStep();
        console.log("Playlist Title: " + values.playlistTitle);
        console.log("Keywords: " + values.keywords);
        console.log("isInstrumental: " + values.isInstrumental);
        console.log("isPublic: " + values.isPublic);
        console.log("Core Items: ")
        console.log("1: " + values.coreItemOne)
        console.log("2: " + values.coreItemTwo)
        console.log("3: " + values.coreItemThree)
        console.log("Desired Length: " + values.desiredLength);
    }

    const backStep = e => {
        e.preventDefault();
        props.previousStep();
    }

    useEffect(() => {
        // declare the async data fetching function
        const fetchData = async () => {
          // get the data from async method
          const data = await getMinDesiredLength();

          // set state with the result
          setMinDesiredLength(data);
        }
    
        // call the function
        fetchData()
          // make sure to catch any error
          .catch(console.error);
      }, [])

    useEffect(() => { 
        if (minDesiredLength != 0) {
            console.log("Minimum desired Length: " + minDesiredLength)
            setMinDesiredLengthText(secToDisplay(minDesiredLength))
        }
    }, [minDesiredLength])

    async function getMinDesiredLength() {
        let itemOneDesiredLength = 0
        let itemTwoDesiredLength = 0
        let itemThreeDesiredLength = 0
        if (values.coreItemOne.substring(8,14) == 'artist') {
            itemOneDesiredLength = await artistMinLenSearch(values.coreItemOne)
        } else if (values.coreItemOne.substring(8,13) == 'album') {
            itemOneDesiredLength = await albumMinLenSearch(values.coreItemOne)
        } else if (values.coreItemOne.substring(8,13) == 'track') {
            itemOneDesiredLength = await trackMinLenSearch(values.coreItemOne)
        }
        if (values.coreItemTwo !=  '') {
            if (values.coreItemTwo.substring(8,14) == 'artist') {
                itemTwoDesiredLength = await artistMinLenSearch(values.coreItemTwo)
            } else if (values.coreItemTwo.substring(8,13) == 'album') {
                itemTwoDesiredLength = await albumMinLenSearch(values.coreItemTwo)
            } else if (values.coreItemTwo.substring(8,13) == 'track') {
                itemTwoDesiredLength = await trackMinLenSearch(values.coreItemTwo)
            }
        }
        if (values.coreItemThree !=  '') {
            if (values.coreItemThree.substring(8,14) == 'artist') {
                itemThreeDesiredLength = await artistMinLenSearch(values.coreItemThree)
            } else if (values.coreItemThree.substring(8,13) == 'album') {
                itemThreeDesiredLength = await albumMinLenSearch(values.coreItemThree)
            } else if (values.coreItemThree.substring(8,13) == 'track') {
                itemThreeDesiredLength = await trackMinLenSearch(values.coreItemThree)
            }
        }
        return (itemOneDesiredLength + itemTwoDesiredLength + itemThreeDesiredLength)
    }
    var queryParameters = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        }
    }

    async function trackMinLenSearch(trackURI) {
        let returnVal = 0
        var returnedTracks = await fetch('https://api.spotify.com/v1/tracks/' + trackURI.substring(trackURI.length - 22) + '/?market=US', queryParameters)
            .then(response => response.json())
            .then(data => {
                returnVal = data.duration_ms/1000
            });
        return returnVal;
    }
    async function albumMinLenSearch(albumURI) {
        let returnVal = 0;
        var returnedAlbums = await fetch('https://api.spotify.com/v1/albums/' + albumURI.substring(albumURI.length - 22) + '/?market=US', queryParameters)
            .then(response => response.json())
            .then(data => {
                for (let i = 0; i < data.total_tracks; i++) {
                    returnVal += data.tracks.items[i].duration_ms/1000
                }
            });
        return returnVal;
    }
    async function artistMinLenSearch(artistURI) {
        let returnVal = 0;
        var returnedArtists = await fetch('https://api.spotify.com/v1/artists/' + artistURI.substring(artistURI.length - 22) + '/top-tracks?market=US', queryParameters)
            .then(response => response.json())
            .then(data => {
                if (data.tracks.length < 5) {
                    for (let i = 0; i < data.tracks.length; i++) {
                        returnVal += data.tracks[i].duration_ms/1000
                    }
                } else {
                    for (let i = 0; i < 5; i++) {
                        returnVal += data.tracks[i].duration_ms/1000
                    }
                }
            });
            return returnVal;

    }

    //Function to set seconds to display time text
    const secToDisplay = (seconds) => {
        let numHours = 0
        let numMinutes = 0
        let numSeconds = 0
        let numHoursText = ""
        let numMinutesText = ""
        let numSecondsText = ""
        numHours = Math.floor(seconds/3600)
        numMinutes = Math.floor((seconds - (numHours * 3600))/60)
        numSeconds = Math.floor(seconds - ((numHours * 3600) + (numMinutes * 60)))
        if (numHours != 0) {
            numHoursText = numHours + " h "
        }
        if (numMinutes != 0) {
            numMinutesText = numMinutes + " m "
        }
        if (numSeconds != 0) {
            numSecondsText = numSeconds + " s "
        }
        return (numHoursText +  numMinutesText + numSecondsText)
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
            <Typography 
                sx={{ mx: 5, my: 2}}
                variant="h3" 
                color="textPrimary">
                Desired Length
            </Typography>
            <Stack spacing={3} direction="row" sx={{ my: 5 }} alignItems="center">
                { (minDesiredLength == 0) ?
                    <Typography variant="h4" color="textPrimary">
                    ...
                    </Typography>
                    :
                    <Typography variant="h4" color="textPrimary">
                    {minDesiredLengthText}
                    </Typography>
                }
                <Slider 
                    sx={{width: 200 }}
                    aria-label="desiredLength"
                    min={minDesiredLength}
                    max={18000}
                    valueLabelDisplay="auto"
                    valueLabelFormat={value => <div>{secToDisplay(value)}</div>}
                    onChange={handleChange('desiredLength')}
                />
                <Typography variant="h4" color="textPrimary">
                    5H
                </Typography>
            </Stack>
            <Fab
                variant="extended"
                color="primary"
                onClick={finalStep}
            >
                Generate sounds
            </Fab>
        </ThemeProvider>
    );
}

export default LengthDetails;
