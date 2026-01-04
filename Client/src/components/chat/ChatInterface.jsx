import React , {useState , useEffect , useRef} from 'react'
import {Send  , MessageSquare , Sparkles, BookOpen, Globe, Info, Trash2} from "lucide-react";
import { useParams } from 'react-router-dom';
import aiService from '../../service/aiService';
import Spinner from '../common/Spinner';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';
import {useAuth } from '../../context/AuthContext';
import MarkdownRenderer from '../common/MarkdownRenderer';

const ChatInterface = () => {
    const {id : documentId} = useParams();
    const {user} = useAuth();
    const [message , setMessage] = useState("");
    const [history , setHistory] = useState([]);
    const [loading , setLoading] = useState(false);
    const [initialLoading , setInitialLoading] = useState(true);
    const [chatMode, setChatMode] = useState('hybrid'); // 'strict' or 'hybrid'
    const [showModeInfo, setShowModeInfo] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    const handleClearChat = async () => {
        if(history.length === 0) return;
        
        setClearing(true);
        setShowClearModal(false);
        try {
            await aiService.clearChatHistory(documentId);
            setHistory([]);
            toast.success("Chat history cleared!");
        } catch (error) {
            toast.error("Failed to clear chat history.");
            console.error(error);
        } finally {
            setClearing(false);
        }
    }

    const openClearModal = () => {
        if(history.length === 0) return;
        setShowClearModal(true);
    }

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                setInitialLoading(true);
                const data = await aiService.getChatHistory(documentId);
                setHistory(data.data);
            } catch (error) {
                toast.error("Failed to load chat history.");
                console.error(error);
            } finally {
                setInitialLoading(false);
            }
        }
        fetchChatHistory();
    },[documentId])

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if(!message.trim()) return;

        const userMessage = {
            role : 'user' , content : message.trim() , timestamp : new Date()
        }

        setHistory(prev => [...prev , userMessage]);
        setMessage("");
        setLoading(true);

        try{
            const response = await aiService.chat(documentId , userMessage.content, chatMode);
            const assistantMessage = {
                role : 'assistant',
                content : response?.data?.answer,
                timestamp : new Date(),
                relevantChunks : response?.data?.relevantChunks
            }
            setHistory(prev => [...prev , assistantMessage]);
        }catch(error){
            console.error(error);
            const errorMessage = {
                role : 'assistant' , content : "Sorry, I am unable to process your request right now." , timestamp : new Date()
            }
            setHistory(prev => [...prev , errorMessage]);
        }finally{
            setLoading(false);
        }
    }

    const renderMessage = (msg , index) => {
        const isUser = msg.role === 'user';
        return (
            <div key={index} className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`}>
                {!isUser && (
                    <div className='w-9 hidden sm:flex h-9 rounded-lg bg-linear-to-br from-blue-500 to-blue-400 items-center justify-center shrink-0 shadow-lg shadow-primary-25'>
                        <Sparkles className='w-4 h-4 text-white' strokeWidth={2}/>
                    </div>
                )}
                <div className={`max-w-lg p-1 sm:p-4 rounded-2xl sm:shadow-sm
                    ${isUser ? 'bg-linear-to-r from-blue-500 p-2 to-blue-400 text-white rounded-br-md' : 'bg-white sm:border sm:border-slate-200/60 text-slate-800 rounded-bl-md'}
                    `}>
                        {isUser ? (
                            <p className='text-sm leading-relaxed'>{msg.content}</p>
                        ) : (
                            <div className='prose prose-sm max-w-none prose-slate'>
                                <MarkdownRenderer content={msg.content} />
                            </div>
                        )}
                </div>
                {isUser && (
                    <div className='w-9 h-9 rounded-xl bg-linear-to-br from-slate-200 to-slate-300 hidden sm:flex 
                    items-center justify-center shrink-0 shadow-lg shadow-primary-25 text-slate-700 font-semibold'>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                )}
            </div>
        )
    }

    if(initialLoading){
        return (
            <div className='flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl items-center justify-center shadow-xl shadow-slate-200/60'>
                <div className='w-14 h-14 bg-linear-to-r from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mb-4'>
                    <MessageSquare className='w-7 h-7 text-blue-900' strokeWidth={2}/>
                </div>
                <Spinner />
                <p className='text-sm text-slate-500 mt-3 font-medium'>Loading chat...</p>
            </div>
        )
    }


  return (
    <div className='flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden'>
        {/* Messages Area */}
        <div className='flex-1 p-6 overflow-y-auto bg-linear-to-br from-slate-50/50 via-white/50 to-slate-50/50'>
            {history.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-full text-center'>
                    <div className='w-16 h-16 rounded-2xl bg-linear-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-4 shadow-lg shadow-primary-25'>
                        <MessageSquare className='w-8 h-8 text-blue-900' strokeWidth={2}/>
                    </div>
                    <h3 className='text-base font-semibold text-slate-900 '>Start a conversation</h3>
                    <p className='text-sm text-slate-500 mt-2 font-medium'>Ask me anything about the document.</p>
                </div>
            ) : (
                history.map(renderMessage)
            )}

            <div ref={messagesEndRef}>
            {loading && (
                <div className='flex items-center gap-3 my-4'>
                    <div className='w-9 h-9 rounded-2xl bg-linear-to-br from-blue-500 to-blue-400 shadow-lg shadow-primary-25 flex items-center justify-center shrink-0'>
                        <Sparkles className='w-5 h-5 text-white animate-spin'/>
                    </div>
                    <div className='flex items-center gap-2 px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-slate-200/60'>
                        <div className='flex gap-1'>
                            <span className='w-2 h-2 bg-slate-400 rounded-full animate-bounce' style={{animationDelay : '0ms'}}></span>
                            <span className='w-2 h-2 bg-slate-400 rounded-full animate-bounce' style={{animationDelay : '150ms'}}></span>
                            <span className='w-2 h-2 bg-slate-400 rounded-full animate-bounce' style={{animationDelay : '300ms'}}></span>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>

        {/* Input Area with Mode Toggle */}
        <div className='border-t border-slate-200/60 bg-white/90'>
            {/* Mode Toggle Row */}
            <div className='px-4 pt-3 pb-2 flex items-center'>
                <div className='flex items-center gap-1.5 bg-slate-200 p-1 rounded-full'>
                    {/* Mode Toggle Pills */}
                    <button
                        onClick={() => setChatMode('strict')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border ${
                            chatMode === 'strict' 
                                ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm' 
                                : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-700'
                        }`}
                    >
                        <BookOpen className='w-3 h-3' strokeWidth={2.5}/>
                        <span>Strict</span>
                    </button>
                    
                    <button
                        onClick={() => setChatMode('hybrid')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border ${
                            chatMode === 'hybrid' 
                                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' 
                                : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-700'
                        }`}
                    >
                        <Globe className='w-3 h-3' strokeWidth={2.5}/>
                        <span>Hybrid</span>
                    </button>
                </div>
                
                {/* Info Tooltip */}
                <div className='ml-2 relative'>
                    <button
                        onClick={() => setShowModeInfo(!showModeInfo)}
                        onBlur={() => setTimeout(() => setShowModeInfo(false), 150)}
                        className='p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 cursor-pointer'
                    >
                        <Info className='w-3.5 h-3.5' strokeWidth={2}/>
                    </button>
                    
                    {showModeInfo && (
                        <div className='absolute left-1/2 right-1/2 bottom-10 translate-x-[-50%] bottom-8 w-64 p-3 bg-white rounded-xl shadow-xl border border-slate-200/60 z-50'>
                            <div className='space-y-2.5'>
                                <div className='flex items-start gap-2'>
                                    <div className='p-1 rounded-md bg-amber-100 shrink-0'>
                                        <BookOpen className='w-3 h-3 text-amber-700' strokeWidth={2.5}/>
                                    </div>
                                    <div>
                                        <p className='text-[11px] font-semibold text-slate-800'>Strict Mode</p>
                                        <p className='text-[10px] text-slate-500 leading-relaxed'>Exam-safe! Only answers from your notes.</p>
                                    </div>
                                </div>
                                <div className='flex items-start gap-2'>
                                    <div className='p-1 rounded-md bg-blue-100 shrink-0'>
                                        <Globe className='w-3 h-3 text-blue-700' strokeWidth={2.5}/>
                                    </div>
                                    <div>
                                        <p className='text-[11px] font-semibold text-slate-800'>Hybrid Mode</p>
                                        <p className='text-[10px] text-slate-500 leading-relaxed'>Notes + AI knowledge for deeper learning.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Clear Chat Button */}
                {history.length > 0 && (
                    <button
                        onClick={openClearModal}
                        disabled={clearing || loading}
                        className='ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {clearing ? (
                            <div className='w-3 h-3 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin'/>
                        ) : (
                            <Trash2 className='w-3 h-3' strokeWidth={2.5}/>
                        )}
                        <span>{clearing ? 'Clearing...' : 'Clear'}</span>
                    </button>
                )}
            </div>
            
            {/* Input Row */}
            <div className='px-4 pb-4'>
                <form onSubmit={handleSendMessage} className='flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/60 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-300 transition-all duration-200'>
                    <input 
                        type="text" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder='Ask anything about your document...'
                        className='flex-1 px-4 py-3 bg-transparent text-slate-800 text-sm font-medium placeholder-slate-400 focus:outline-none'
                        disabled={loading}
                    />
                    <button 
                        type='submit'
                        disabled={loading || !message.trim()}
                        className='shrink-0 w-10 h-10 btn-primary rounded-xl flex items-center justify-center shadow-md disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 text-white cursor-pointer hover:scale-105 active:scale-95'>
                        <Send className='w-4 h-4' strokeWidth={2.5}/>
                    </button>
                </form>
            </div>
        </div>

        {/* Clear Chat Confirmation Modal */}
        <Modal
            isOpen={showClearModal}
            onClose={() => setShowClearModal(false)}
            title="Clear Chat History"
        >
            <div className='space-y-6'>
                <p className='text-sm text-slate-600'>
                    Are you sure you want to clear all chat messages? This will permanently delete your conversation history for this document.
                </p>
                <div className='flex items-center justify-end gap-3 pt-2'>
                    <button 
                        onClick={() => setShowClearModal(false)} 
                        type='button' 
                        className='px-4 cursor-pointer hover:scale-105 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-all duration-200'
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleClearChat} 
                        disabled={clearing}
                        className='px-4 cursor-pointer hover:scale-105 h-10 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                    >
                        {clearing ? (
                            <>
                                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'/>
                                Clearing...
                            </>
                        ) : (
                            <>
                                <Trash2 className='w-4 h-4' strokeWidth={2}/>
                                Clear Chat
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    </div>
  )
}

export default ChatInterface