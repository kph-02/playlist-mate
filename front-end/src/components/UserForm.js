import React,  { useState } from 'react'
import TitleDetails from './TitleDetails';
import VibeDetails from './VibeDetails';
import LengthDetails from './LengthDetails';
import CoreItemsDetails from './CoreItemsDetails';
import { createColor } from 'material-ui-color';
import useAuth from './useAuth';

function UserForm(props) {
    
    const [step, setStep] = useState(1);
    const [playlistTitle, setPlaylistTitle] = useState('');
    const defaultColorsArray = [
        { 
            id: 1,
            colorVal: createColor('#000')
        },
        { 
            id: 2,
            colorVal: createColor('#000')
        },
        {  
            id: 3,
            colorVal: createColor('#000')
        }
    ];
    const [colors, setColors] = useState(defaultColorsArray);
    const [isInstrumental, setIsInstrumental] = useState(false);
    const [keywords, setKeywords] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [coreItemOne, setCoreItemOne] = useState('');
    const [coreItemTwo, setCoreItemTwo] = useState('');
    const [coreItemThree, setCoreItemThree] = useState('');
    //desiredLength is in seconds.
    const [desiredLength, setDesiredLength] = useState(0);
    const {code} = props
    const accessToken = useAuth(code)
    
    
    const nextStep = () => {
        setStep(step + 1);
    }

    const previousStep = () => {
        setStep(step + 1);
    }

    const handleChange = (input) => e => {
        if (input === 'playlistTitle') {
            setPlaylistTitle(e.target.value);
        } else if (input ===  'colors') {
            /*
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
    
    const values = {playlistTitle, colors, isInstrumental, keywords, isPublic, coreItemOne, coreItemTwo, coreItemThree, desiredLength, accessToken}

    switch(step) {
        case 1:
            return (
                <div>
                    <TitleDetails
                        nextStep={nextStep}
                        handleChange={handleChange}
                        values={values}
                    />
                </div>
            )
        case 2:
            return (
                <div>
                    <VibeDetails
                        nextStep={nextStep}
                        handleChange={handleChange}
                        values={values}
                    />            
                </div>
    
            )
        case 3:
            return (
                <div>
                    <CoreItemsDetails
                        nextStep={nextStep}
                        handleCoreItems={handleCoreItems}
                        values={values}
                    />            
                </div>
            )
        case 4:
            return (
                <div>
                    <LengthDetails
                        nextStep={nextStep}
                        handleChange={handleChange}
                        values={values}
                    />            
                </div>
            )
    }
}

export default UserForm;