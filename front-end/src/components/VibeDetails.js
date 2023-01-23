import React, { useState, useEffect } from "react";
import '../App.css';
import { ThemeProvider } from "@mui/material";
import TextField from "@mui/material/TextField";
import Fab from "@mui/material/Fab";
import Switch from "@mui/material/Switch"
import { appTheme } from "../themes/themes";
import { ColorPicker } from 'material-ui-color'
import FormControlLabel from '@mui/material/FormControlLabel';



function VibeDetails(props) {

    const continueStep = e => {
        e.preventDefault();
        props.nextStep();
    }

    const { values, handleChange } = props;

    return (
        <ThemeProvider theme={appTheme}>
            <h2>Whats the Vibe?</h2>
            {/* TODO when implementing listener
            <ColorPicker 
                value={values.colors.find(x => x.id=1).colorVal}
                onChange={handleChange('colors')} />
            <ColorPicker
                defaultValue={values.colors.find(x => x.id=2).colorVal}
                name='colorTwo'
                onChange={colorTwo => console.log(colorTwo)}
             />
            <ColorPicker
                defaultValue={values.colors.find(x => x.id=2).colorVal}
                name='colorThree'
                onChange={colorThree => console.log(colorThree)}
            />
            */}
            <h3>*Insert Color selectors here*</h3>
            <FormControlLabel
                labelPlacement="start"
                control={<Switch onChange={handleChange('isInstrumental')} />}
                label="Instrumentals only"
            />
            <br/>
            <FormControlLabel
                labelPlacement="start"
                control={<Switch onChange={handleChange('isPublic')} />}
                label="Public Spotify playlist"
            />
            <br/>
            <TextField
                helperText="Genres, mood, setting, etc. (ex: Late night indie rock drive)"
                label="Keywords"
                onChange={handleChange('keywords')}
                defaultValue={values.keywords}
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



export default VibeDetails;
