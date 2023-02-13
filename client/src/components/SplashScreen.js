/** @jsxImportSource @emotion/react */
import pmLogo from '../assets/Playlist-Mate-Logo.png';
import React, { useState, useEffect } from "react";
import { ThemeProvider, Typography } from "@mui/material";
import { appTheme } from "../themes/themes";
import { css, keyframes } from "@emotion/react";


const myEffect = keyframes`
    0% {
        transform: translate(1000px, -1000px) skew(-80deg, -10deg);
        transform-origin: 0% 0%;
        filter: blur(40px);
        opacity: 0;
    }
    100% {
        transform: translate(0, 0) skew(0deg, 0deg);
        transform-origin: 50% 50%;
        filter: blur(0);
        opacity: 1;
    }
`;
const myEffectExit = keyframes`
    0% {
        transform: translate(0, 0) skew(0deg, 0deg);
        transform-origin: 50% 50%;
        filter: blur(0);
        opacity: 1;
    }
    100% {
        transform: translate(-1000px, 1000px) skew(-80deg, -10deg);
        transform-origin: 100% 100%;
        filter: blur(40px);
        opacity: 0;
    }
`;

function SplashScreen(props) {

    const [logoShown, setLogoShown] = useState(false);

    const animatedItem = css`
        animation: ${myEffect} 1.2s ${appTheme.transitions.easing.easeOutCirc};
    `;
    const animatedItemExiting = css`
        animation: ${myEffectExit} 1.2s ${appTheme.transitions.easing.easeInCirc};
    `;
    const screen = props.screen
    useEffect(() => {
        const timer = setTimeout(() => {
            if (logoShown == false) {
                setLogoShown(true); 
            } else {
                setLogoShown(false); 
            }
        }, 1200);
        return () => clearTimeout(timer);
    });

    return (
        <ThemeProvider theme={appTheme}> 
            {(screen == "splash") ? 
            <>
            <Typography variant="h2" color="textPrimary">
                Playlist
            </Typography>
            <Typography variant="h2" color="textPrimary">
                Mate
            </Typography>
            </>
            :   
            <>
            <Typography variant="h3" color="textPrimary">
                Generating
            </Typography>
            <Typography variant="h3" color="textPrimary">
                Playlist
            </Typography> 
            </>
             }
            <div css={logoShown ? animatedItemExiting : animatedItem }>
                <img style={{ width: 350, height: 302 }} src={pmLogo} alt="logo"/>
            </div>
        </ThemeProvider>

    );
    
}

export default SplashScreen;

