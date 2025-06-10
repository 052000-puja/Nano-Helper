import React, { useContext, useEffect, useState, useRef } from 'react';
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiImg from '../assets/ai.gif';
import userImg from '../assets/user.gif';
import {CgMenuRight} from 'react-icons/cg';
import {RxCross1} from 'react-icons/rx';

function Home() {
  const{userData, serverUrl, setUserData, getGeminiResponse} = useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening]=useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const isSpeakingRef=useRef(false);
  const recognitionRef=useRef(null);
  const [ham, setHam] = useState(false);
  const isRecognizingRef=useRef(false);
  const synth=window.speechSynthesis;

  const handleLogout = async () => {
    try{
      const result = await axios.get(`${serverUrl}/api/auth/logout`, {withCredentials: true});
      setUserData(null);
      navigate("/signin");
    }catch(error){
      setUserData(null);
      console.error("Logout failed:", error);
    }
  }
  
 const startRecognition = () => {
  if(!isSpeakingRef.current && !isRecognizingRef.current){
  try{
    recognitionRef.current?.start();
    setListening(true);
  } catch (error) {
    if(!error.message.includes("Start")){
      console.error("Recognition error:", error);
    }
  } 
}
  };

  const speak=(text)=>{
    const utterence = new SpeechSynthesisUtterance(text);
    utterence.lang='hi-IN';
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v =>v.lang === 'hi-IN');
    if(hindiVoice){
      utterence.voice = hindiVoice;
    }

    isSpeakingRef.current=true;
    utterence.onend=()=>{
      setAiText("");
      isSpeakingRef.current=false;
      setTimeout(()=>{
        startRecognition();
      }, 800);
    }
    synth.cancel();
    synth.speak(utterence);
  }

  const handleCommand = (data) => {
  const { type, userInput, response } = data;
  speak(response);

  if (type === 'google_search') {
    const query = encodeURIComponent(userInput);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  }

  if (type === 'youtube_search' || type === 'youtube_play') {
    const query = encodeURIComponent(userInput);
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
  }

  if (type === 'weather_show') {
    window.open(`https://www.google.com/search?q=weather`, '_blank');
  }

  if (type === 'calculator_open') {
    window.open(`https://www.google.com/search?q=calculator`, '_blank');
  }

  if (type === 'instagram_open') {
    window.open(`https://www.instagram.com/`, '_blank');
  }

  if (type === 'facebook_open') {
    window.open(`https://www.facebook.com/`, '_blank');
  }

  if (type === 'twitter_open') {
    window.open(`https://www.twitter.com/`, '_blank');
  }

  if (type === 'linkedin_open') {
    window.open(`https://www.linkedin.com/`, '_blank');
  }

  if (type === 'tiktok_open') {
    window.open(`https://www.tiktok.com/`, '_blank');
  }

  if (type === 'reddit_open') {
    window.open(`https://www.reddit.com/`, '_blank');
  }

  if (type === 'github_open') {
    window.open(`https://github.com/`, '_blank');
  }

  if (type === 'whatsapp_open') {
    window.open(`https://web.whatsapp.com/`, '_blank');
  }

  if (type === 'telegram_open') {
    window.open(`https://web.telegram.org/`, '_blank');
  }

  if (type === 'slack_open') {
    window.open(`https://slack.com/`, '_blank');
  }

  if (type === 'discord_open') {
    window.open(`https://discord.com/`, '_blank');
  }

  if (type === 'medium_open') {
    window.open(`https://medium.com/`, '_blank');
  }

  if (type === 'stackoverflow_open') {
    window.open(`https://stackoverflow.com/`, '_blank');
  }

};


  useEffect(()=>{
   
    const SpeechRecognition= window.SpeechRecognition || window.webkitSpeechRecognition;
   
    const recognition = new SpeechRecognition()
    recognition.continuous=true,
    recognition.lang='en-US'
    recognition.interimResults=false;

    recognitionRef.current=recognition;

    let isMounted = true;

   const startTimeout=setTimeout(()=>{
      if(isMounted && !isSpeakingRef.current && !isRecognizingRef.current){
        try{
          recognition.start();
          console.log("Speech recognition request started");
        } catch(e){
          if(e.name !== "InvalidStateError"){
            console.error("Error starting speech recognition:", e);
          }
        }
      }
    }, 1000);

    recognition.onstart=()=>{

      console.log("Recognition started");
      isRecognizingRef.current=true;
      setListening(true);
    };

    recognition.onend=()=>{
      
      isRecognizingRef.current=false;
      setListening(false);
     if(isMounted && !isSpeakingRef.current){
      setTimeout(()=>{
        if(isMounted){
         try{
          recognition.start();
          console.log("Speech recognition restarted");
         } catch(e){
          if(e.name !== "InvalidStateError"){
            console.error("Error restarting speech recognition:", e);
          }
         }
        }
        }, 1000);
      
    }
    };

    recognition.onerror=(event)=>{
      console.warn("Recognition error:", event.error);
      isRecognizingRef.current=false;
      setListening(false);
      if(event.error !== "aborted" && isMounted && !isSpeakingRef.current){
        setTimeout(()=>{
          if(isMounted){
            try{
              recognition.start();
              console.log("Speech recognition restarted after error");
            } catch(e){
              if(e.name !== "InvalidStateError"){
                console.error("Error restarting speech recognition after error:", e);
              }
            }
          }
        }, 1000);
      }
    };
    

    recognition.onresult=async (e)=>{
      const transcript= e.results[e.results.length-1][0].transcript.trim();
      if(transcript.toLowerCase().includes(userData.assistantName.toLowerCase())){
      setAiText("");
      setUserText(transcript);
      recognition.stop();
      isRecognizingRef.current=false;
      setListening(false);
      const data = await getGeminiResponse(transcript);
      handleCommand(data);
      speak(data.response);
      setAiText(data.response);
      setUserText("");

    }
    };


      const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with today?`);
      greeting.lang = 'hi-IN';
     
      window.speechSynthesis.speak(greeting);


    return ()=>{
    isMounted = false;
    clearTimeout(startTimeout);
    recognition.stop();
    setListening(false);
    isRecognizingRef.current=false;
    };
  },[])
  

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>
      <CgMenuRight className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(true)}/>
    <div className={`absolute top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col  items-start ${ham?"translate-x-0":"translate-x-full"} transition-transform lg:hidden`}>
     <RxCross1 className='text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]'  onClick={()=>setHam(false)}/>

   <div className='flex flex-col gap-[10px] justify-center items-start'>
     <button className='min-w-[120px] h-[40px] text-black font-semibold  bg-white rounded-full text-[17px] cursor-pointer ' onClick={handleLogout}>Log Out</button>
      <button className='min-w-[150px] h-[50px] text-black font-semibold  bg-white rounded-full text-[17px] px-[20px] py-[10px] cursor-pointer ' onClick={()=>navigate("/customize")}>Customize Your Assistant</button> 
   </div>

      <div className='w-full h-[2px] bg-gray-400 mt-[20px] mb-[10px]'></div>
      <h1 className='text-white font-semibold text-[19px] '>History </h1>

      <div className='w-full h-[60%] overflow-auto flex flex-col gap-[10px]'>
        {userData.history?.map((his)=>(
          <div className='text-gray-200 text-[12px] w-full h-[30px]'>{his} </div>
         
        ))}

      </div>

      </div>
      <button className='min-w-[150px] h-[50px] mt-[30px] text-black font-semibold absolute hidden lg:block  top-[20px] right-[20px] bg-white rounded-full text-[17px] cursor-pointer' onClick={handleLogout}>Log Out</button> 
      <button className='min-w-[200px] h-[60px] mt-[30px] text-black font-semibold absolute hidden lg:block top-[100px] right-[20px] bg-white rounded-full text-[17px] px-[20px] py-[10px] cursor-pointer' onClick={()=>navigate("/customize")}>Customize Your Assistant</button> 
      <div className='w-[150px] h-[200px] lg:w-[300px] lg:h-[400px]  flex justify-center items-center overflow-hidden rounded-4xl shadow-2xl'>
          <img src={userData?.assistantImage} alt="" className='h-full object-cover' />
      </div>
      <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>
     {!aiText&& <img src={userImg} alt="" className='w-[200px]'/>}
      {aiText && <img src={aiImg} alt="" className='w-[200px]'/>}
      <h1 className='text-white text-[12px] font-semibold text-wrap'> {userText?userText: aiText?aiText:null}</h1>
    </div>  
  )
}

export default Home
