import React,  { useState } from 'react'
import TitleDetails from './TitleDetails';
import VibeDetails from './VibeDetails';
import LengthDetails from './LengthDetails';
import CoreItemsDetails from './CoreItemsDetails';
import PlaylistDisplay from './PlaylistDisplay';
import { createColor } from 'material-ui-color';
import useAuth from './useAuth';

function UserForm(props) {
    
    const [step, setStep] = useState(1);
    const [playlistTitle, setPlaylistTitle] = useState('');
    const [isInstrumental, setIsInstrumental] = useState(false);
    const [keywords, setKeywords] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [coreItemOne, setCoreItemOne] = useState('');
    const [coreItemTwo, setCoreItemTwo] = useState('');
    const [coreItemThree, setCoreItemThree] = useState('');
    //desiredLength is in seconds.
    const [desiredLength, setDesiredLength] = useState(0);
    const {code} = props
    let accessToken = useAuth(code)
    
    
    const nextStep = () => {
        setStep(step + 1);
    }

    const logout = () => {
        var url = new URL(window.location);  
        url.searchParams.set('code', 'restart');
        window.location.href = url;
        accessToken = "";
    }

    const previousStep = () => {
        setStep(step - 1);
    }

    const handleChange = (input) => e => {
        if (input === 'playlistTitle') {
            setPlaylistTitle(e.target.value);
        /*    
        } else if (input ===  'colors') {
            
            setColors(
                colors.map((currColor) =>
                // Here you accept a id argument to the function and replace it with hard coded 2, to make it dynamic.
                currColor.id === 1
                    ? { ...currColor, colorVal:e.target.value}
                    : { ...currColor }
                )
            );
        */
        } else if (input ===  'isInstrumental') {
            if (e.target.value === 'on') {
                setIsInstrumental(true);
            }
        } else if (input ===  'keywords') {
            setKeywords(e.target.value);
        } else if (input ===  'isPublic') {
            if (e.target.value === 'on') {
                setIsPublic(true);
            }
        } else if (input ===  'desiredLength') {  
            setDesiredLength(e.target.value);
        } 
    }

    const handleCoreItems = (itemOne, itemTwo, itemThree) => {
        setCoreItemOne(itemOne);
        setCoreItemTwo(itemTwo);
        setCoreItemThree(itemThree);
    }
    
    const values = {playlistTitle, isInstrumental, keywords, isPublic, coreItemOne, coreItemTwo, coreItemThree, desiredLength, accessToken}

    switch(step) {
        case 1:
            return (
                <>
                    <TitleDetails
                        nextStep={nextStep}
                        handleChange={handleChange}
                        values={values}
                    />
                </>
            )
        case 2:
            return (
                <>
                    <VibeDetails
                        nextStep={nextStep}
                        previousStep={previousStep}
                        handleChange={handleChange}
                        values={values}
                    />            
                </>
    
            )
        case 3:
            return (
                <>
                    <CoreItemsDetails
                        nextStep={nextStep}
                        previousStep={previousStep}
                        handleCoreItems={handleCoreItems}
                        values={values}
                    />            
                </>
            )
        case 4:
            return (
                <>
                    <LengthDetails
                        nextStep={nextStep}
                        previousStep={previousStep}
                        handleChange={handleChange}
                        values={values}
                    />            
                </>
            )
        case 5:
            return (
                <>
                    <PlaylistDisplay
                        logout={logout}
                        handleChange={handleChange}
                        values={values}
                    />            
                </>
            )
    }
}

export default UserForm;