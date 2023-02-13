import React, { useState, useEffect } from "react";
import { ThemeProvider, FormControlLabel, Fab, TextField, IconButton, Switch, Typography } from "@mui/material";
import { appTheme } from "../themes/themes";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';




function VibeDetails(props) {

    const continueStep = e => {
        if (values.keywords == '') {
            alert("Please enter genre keywords.")
        } else {
            e.preventDefault();
            props.nextStep();
        }
    }
    const backStep = e => {
        e.preventDefault();
        props.previousStep();
    }

    const { values, handleChange } = props;

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
                sx={{ mx: 10, my: 2}}
                variant="h3" 
                color="textPrimary">
                    Vibe
            </Typography>
            <FormControlLabel
                sx={{ mx: 10 }}
                labelPlacement="start"
                control={<Switch onChange={handleChange('isInstrumental')} />}
                label="Instrumentals only"
            />
            <br/>
            <FormControlLabel
                sx={{ mx: 10 }}
                labelPlacement="start"
                control={<Switch onChange={handleChange('isPublic')} />}
                label="Public Spotify playlist"
            />
            <br/>
            <TextField
                sx={{ mx: 10, my: 2 }}
                label="Genre Keywords"
                onChange={handleChange('keywords')}
                defaultValue={values.keywords}
            />
            <br/>
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



export default VibeDetails;
