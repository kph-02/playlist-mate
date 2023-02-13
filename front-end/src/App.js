import React, { useState, useEffect } from "react";
import UserForm from './components/UserForm';
import Login from './components/Login';
import SplashScreen from "./components/SplashScreen";
import { Paper, IconButton } from "@mui/material";
import { styled } from "@mui/system";

const code = new URLSearchParams(window.location.search).get('code')

/*
const StyledPaper = styled(Paper, {
  name: "StyledPaper"
})`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh; 
  width: 100%; 
  max-width: 500px;
  background: #121212;
  text-align: center;
  .MuiTypography-root: {color: "#FFFFFF"};
`;
*/

const StyledPaper = styled(Paper, {
  name: "StyledPaper"
}) ({
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  width: '100%',
  maxWidth: '500px',
  background: '#121212',
  textAlign: 'center',
  ".MuiTypography-root": {color: "#FFFFFF"}
});

function App() {

  const [splashScreenShown, setSplashScreenShown] = useState(false)
  const screen = "splash";
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashScreenShown(true); 
      //TODO: Set to time it takes for 1 animation cycle of logo. 
    }, 3600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <StyledPaper>
        {splashScreenShown || ((code)) ? 
          <>
            {((code != 'restart') && (code)) ? 
              <>
                <UserForm code={code} />
              </> : 
              <Login code={code}/>
            }
          </> : 
          <SplashScreen
            screen={screen}
          />
        }
    </StyledPaper>
  );
}

export default App;
