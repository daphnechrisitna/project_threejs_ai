import React, {useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSnapshot } from 'valtio';
import axios from 'axios';

import config from '../config/config';
import state from '../store';
import { download, logoShirt, stylishShirt } from '../assets';
import { downloadCanvasToImage, reader } from '../config/helpers';
import { EditorTabs, FilterTabs, DecalTypes } from '../config/constants';
import { fadeAnimation, slideAnimation } from '../config/motion';
import { Tab, FilePicker, ColorPicker, AIPicker, CustomButton } from '../components';

const Customizer = () => {
  const snap = useSnapshot(state);

  const [file, setFile] = useState('');

  const [prompt, setPrompt] = useState('');
  const [generatingImg, setGeneratingImg] = useState(false);

  const [activeEditorTab, setActiveEditorTab] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: true,
    stylishShirt: false,  
  })

  //show tab content based on the current tab
  const generateTabContent = () => {
    switch (activeEditorTab) {
      case 'filepicker':
        return <FilePicker 
          file={file}
          setFile={setFile}
          readFile={readFile} 
        />;
      case 'colorpicker':
        return <ColorPicker />;
      case 'aipicker':
        return <AIPicker 
        prompt={prompt}
        setPrompt={setPrompt}
        generatingImg={generatingImg}
        handleSubmit={handleSubmit}
        />;
      default:
        return null;
    }

  }
  

  const handleSubmit = async (type) => {
    if(!prompt) return alert("Please enter a prompt")

    try {
      //call our backend to generate an image
      setGeneratingImg(true);

      const response = await axios.post('https://shirt-design-ehnm.onrender.com/api/v1/dalle',
        { prompt },
        {            
          responseType: 'blob',
        });

      if (!response.data || response.data.size === 0) {
        throw new Error("Received empty image");
      }

      const blob = new Blob([response.data], { type: 'image/png' });
      const imgUrl = URL.createObjectURL(response.data);

      const blobToBase64 = (blob) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      };

      const base64Image = await blobToBase64(blob);
    

      handleDecals(type, base64Image);
    

    } catch (error) {
      console.error("Full Error Details:",{
        error: error,
        response: error.response,
        blobInfo: error.response?.data
          ? {
            size: error.response.data.size,
            type: error.response.data.type,
          }
          :null
      });

      alert(error.response?.data?.message || error.message);
    } finally {
      setGeneratingImg(false);
      setActiveEditorTab("");
    }
  }

  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type];

    state[decalType.stateProperty] = result;

    if(!activeFilterTab[decalType.filterTab]) {
      handleActiveFilterTab(decalType.filterTab);
      }
    }


  const handleActiveFilterTab = (tabName) => {
   switch (tabName) {
    case "logoShirt":
      state.isLogoTexture = !activeFilterTab[tabName];
    break;
    case "stylishShirt":
      state.isFullTexture = !activeFilterTab[tabName];
    break;
    default:
      state.isLogoTexture = true;
      state.isFullTexture = false;
    break;
   }

   //after setting the state, update the active filter tab
   setActiveFilterTab((prevState) => {
      return {
        ...prevState,
        [tabName]: !prevState[tabName]
      }
    }
   )
  }

  const readFile = (type) => {
    reader(file)
      .then((result) => {
        handleDecals(type, result);
        setActiveEditorTab("");
      })
  }

  return (
    <AnimatePresence>
      {!snap.intro &&(
        <>
          <motion.div
           key="custom"
           className="absolute top-0 left-0 z-10"
           {...slideAnimation('left')}
          >
            <div className="flex items-center min-h-screen">
              <div className="editortabs-container tabs">
                {EditorTabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    tab={tab}
                    handleClick={() => setActiveEditorTab(tab.name)}
                  />
                ))}

                {generateTabContent()}
              </div>
            </div>
            </motion.div>

            <motion.div
              className="absolute z-10 top-5 right-5"
              {...fadeAnimation}
            >
              <CustomButton
                type="filled"
                title="Go Back"
                handleClick={() => state.intro = true}
                customStyles="w-fit px-4 py-2.5 font-bold text-sm"
              />
            </motion.div>

            <motion.div 
              className="filtertabs-container" 
              {...slideAnimation('up')}
            >
              {FilterTabs.map((tab) => (
                <Tab
                  key={tab.name}
                  tab={tab}
                  isFilterTab
                  isActiveTab={activeFilterTab[tab.name]}
                  handleClick={() => handleActiveFilterTab(tab.name)}            />
                ))}
              </motion.div>
          </>
        )
      }
    </AnimatePresence>
  )
}

export default Customizer