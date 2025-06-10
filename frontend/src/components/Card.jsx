import React, { useContext } from 'react'
import { userDataContext } from '../context/UserContext';

function Card({image}) {
   const {serverUrl, userData, setUserData,  frontendImage, setFrontendImage, backendImage, setBackendImage, selectedImage, setSelectedImage}=useContext(userDataContext);
  return (
    <div className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#020220] border-2 border-[#0000ff66] rounded-2xl overflow-hidden hover:shadow-2xl hover:border-4 hover:border-white flex hover:shadow-blue-500 cursor-pointer ${selectedImage==image?"shadow-2xl border-4 border-white shadow-blue-500":null}`} onClick={()=>{
      setSelectedImage(image)
      setBackendImage(null)
      setFrontendImage(null)      
    }}>
      <img src={image} className='h-full object-cover' />
    </div>
  )
}

export default Card
