import React, { useState, useEffect } from "react";
import { ThemeProvider, Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import Fab from "@mui/material/Fab";
import { appTheme } from "../themes/themes";

function TitleDetails(props) {

    const continueStep = e => {
        if (values.playlistTitle == '') {
            alert("Please enter a title.")
        } else {
            e.preventDefault();
            props.nextStep();
        }
    }

    const { values, handleChange } = props;

    return (
        <ThemeProvider theme={appTheme}>
            <Typography sx={{ mx: 10, my: 2}} variant="h3" color="textPrimary">
                Let's start with a title
            </Typography>
            <TextField 
                sx={{ mx: 10, my: 2 }}
                label="Playlist Title"
                onChange={handleChange('playlistTitle')}
                defaultValue={values.playlistTitle}
            />
            <Fab
                sx={{ mx: 10, my: 2 }}
                variant="extended"
                color="primary"

                onClick={continueStep}
            >
                Next
            </Fab>

        </ThemeProvider>
    );
}

export default TitleDetails;
