import { createContext,useState,useContext } from "react";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({children})=>{

    const [msg, setMsg] = useState(null); 

    const sendMessage = (msg) =>{
        setMsg({role : 'user', content: msg});
    }
    
    return <ChatContext.Provider value={{msg, setMsg, sendMessage}}>
        {children}
    </ChatContext.Provider>
}