import React, { useState, useEffect } from "react";
import '../App.css';
import { ThemeProvider } from "@mui/material";
import TextField from "@mui/material/TextField";
import Fab from "@mui/material/Fab";
import { appTheme } from "../themes/themes";

function TitleDetails(props) {

    const continueStep = e => {
        e.preventDefault();
        props.nextStep();
    }

    const { values, handleChange } = props;

    return (
        <ThemeProvider theme={appTheme}>
            <TextField
                helperText="Give your playlist a name"
                label="Playlist Title"
                onChange={handleChange('playlistTitle')}
                defaultValue={values.playlistTitle}
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

export default TitleDetails;
