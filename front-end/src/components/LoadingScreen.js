
import React, { useState, useEffect } from "react";
import { ThemeProvider, Typography } from "@mui/material";
import { appTheme } from "../themes/themes";

function LoadingScreen() {
    
    return (
        <ThemeProvider theme={appTheme}> 
            <Typography variant="h2" color="textPrimary">
               Generating
            </Typography>
            <Typography variant="h2" color="textPrimary">
                Playlist...
            </Typography>
        </ThemeProvider>

    );
    
}

export default LoadingScreen;

