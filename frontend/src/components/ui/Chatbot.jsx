import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, History, Trash2, Plus, ChevronLeft, Paperclip, Mic, MicOff, ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const STORAGE_KEY = 'nutriplan_chat_sessions';

const loadSessions = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
};

const saveSessions = (sessions) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

const Chatbot = () => {
    const { isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessions, setSessions] = useState(loadSessions);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [attachedImage, setAttachedImage] = useState(null); // { file, preview, base64 }
    const [isListening, setIsListening] = useState(false);
    const [speechSupported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    if (!isAuthenticated) return null;

    // Save current session to localStorage before closing
    const handleClose = () => {
        if (messages.length > 0) {
            const title = messages[0]?.text?.slice(0, 40) || 'Chat';
            const updatedSessions = activeSessionId
                ? sessions.map(s => s.id === activeSessionId ? { ...s, messages, updatedAt: Date.now() } : s)
                : [{ id: Date.now(), title, messages, updatedAt: Date.now() }, ...sessions];
            setSessions(updatedSessions);
            saveSessions(updatedSessions);
        }
        setMessages([]);
        setActiveSessionId(null);
        setIsOpen(false);
        setShowHistory(false);
    };

    const handleNewChat = () => {
        if (messages.length > 0) {
            const title = messages[0]?.text?.slice(0, 40) || 'Chat';
            const updatedSessions = activeSessionId
                ? sessions.map(s => s.id === activeSessionId ? { ...s, messages, updatedAt: Date.now() } : s)
                : [{ id: Date.now(), title, messages, updatedAt: Date.now() }, ...sessions];
            setSessions(updatedSessions);
            saveSessions(updatedSessions);
        }
        setMessages([]);
        setActiveSessionId(null);
        setShowHistory(false);
    };

    const handleResumeSession = (session) => {
        if (messages.length > 0 && session.id !== activeSessionId) {
            const title = messages[0]?.text?.slice(0, 40) || 'Chat';
            const updatedSessions = activeSessionId
                ? sessions.map(s => s.id === activeSessionId ? { ...s, messages, updatedAt: Date.now() } : s)
                : [{ id: Date.now(), title, messages, updatedAt: Date.now() }, ...sessions];
            setSessions(updatedSessions);
            saveSessions(updatedSessions);
        }
        setMessages(session.messages);
        setActiveSessionId(session.id);
        setShowHistory(false);
    };

    const handleDeleteSession = (e, sessionId) => {
        e.stopPropagation();
        const updated = sessions.filter(s => s.id !== sessionId);
        setSessions(updated);
        saveSessions(updated);
        if (activeSessionId === sessionId) {
            setMessages([]);
            setActiveSessionId(null);
        }
    };

    // Handle file selection (images, PDFs, docs etc.)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const isImage = file.type.startsWith('image/');
        // Read ALL files (images + PDFs) as base64 so we can send to Gemini
        const reader = new FileReader();
        reader.onload = (ev) => {
            setAttachedImage({
                file,
                name: file.name,
                mimeType: file.type || 'application/octet-stream',
                type: isImage ? 'image' : 'file',
                preview: isImage ? ev.target.result : null,
                base64: ev.target.result   // full dataURL → we strip prefix on backend
            });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };


    // Toggle voice recognition
    const toggleVoice = () => {
        if (!speechSupported) return;
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; // English output
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
            setInput(transcript);
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    };

    const handleSend = async (e) => {
        e?.preventDefault();
        if ((!input.trim() && !attachedImage) || isLoading) return;

        const userMessage = input.trim();
        const imageToSend = attachedImage;
        setInput('');
        setAttachedImage(null);

        const newUserMsg = { 
            role: 'user', 
            text: userMessage || `📎 ${imageToSend?.name}`, 
            image: imageToSend?.preview || null  // only show preview for images
        };
        const newMessages = [...messages, newUserMsg];
        setMessages(newMessages);
        setIsLoading(true);

        // Build payload — send file as base64 for Gemini multimodal
        const payload = { 
            message: userMessage || `Please analyze this attached file: ${imageToSend?.name}` 
        };
        if (imageToSend?.base64) {
            // Attach file data — strip 'data:mimetype;base64,' prefix
            const base64Data = imageToSend.base64.includes(',') 
                ? imageToSend.base64.split(',')[1] 
                : imageToSend.base64;
            payload.fileData = {
                base64: base64Data,
                mimeType: imageToSend.mimeType || 'application/octet-stream',
                fileName: imageToSend.name
            };
        }

        try {
            const response = await api.post('/ai/chat', payload);
            if (response.data.success) {
                setMessages(prev => [...prev, { role: 'model', text: response.data.data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I could not connect to the server right now.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (ts) => {
        const d = new Date(ts);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="fixed bottom-24 md:bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-16 right-0 w-80 sm:w-96 h-[520px] max-h-[80vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                {showHistory ? (
                                    <button onClick={() => setShowHistory(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-base leading-tight">
                                        {showHistory ? 'Chat History' : 'Naviya AI'}
                                    </h3>
                                    {!showHistory && <p className="text-white/70 text-xs">Diet & Health Expert</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!showHistory && (
                                    <>
                                        <button onClick={handleNewChat} title="New Chat" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setShowHistory(true)} title="Chat History" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors relative">
                                            <History className="w-4 h-4" />
                                            {sessions.length > 0 && (
                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-gray-900 text-[9px] font-black rounded-full flex items-center justify-center">
                                                    {sessions.length > 9 ? '9+' : sessions.length}
                                                </span>
                                            )}
                                        </button>
                                    </>
                                )}
                                <button onClick={handleClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* History Sidebar */}
                        {showHistory ? (
                            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
                                {sessions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                        <History className="w-12 h-12 text-gray-300 mb-3" />
                                        <p className="text-gray-400 text-sm font-medium">No saved chats yet</p>
                                        <p className="text-gray-400 text-xs mt-1">Start a conversation and close it to save</p>
                                    </div>
                                ) : (
                                    <div className="p-3 space-y-2">
                                        {sessions.map(session => (
                                            <motion.div
                                                key={session.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                onClick={() => handleResumeSession(session)}
                                                className={`p-4 rounded-2xl cursor-pointer group flex items-start justify-between gap-3 border transition-all
                                                    ${activeSessionId === session.id
                                                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700'
                                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700'
                                                    }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                                                        {session.title}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {session.messages.length} messages · {formatTime(session.updatedAt)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => handleDeleteSession(e, session.id)}
                                                    className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-500 transition-all"
                                                    title="Delete chat"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                                    {messages.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full text-center gap-2 pb-8">
                                            <div className="w-16 h-16 rounded-3xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-2">
                                                <Bot className="w-8 h-8 text-primary-600" />
                                            </div>
                                            <p className="font-bold text-gray-700 dark:text-gray-200">Hi, I'm Naviya! 👋</p>
                                            <p className="text-xs text-gray-400 max-w-[200px]">Ask me anything about diet, nutrition, or your health goals.</p>
                                        </div>
                                    )}
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.role === 'model' && (
                                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0 mt-1">
                                                    <Bot className="w-4 h-4 text-primary-600" />
                                                </div>
                                            )}
                                            <div className={`max-w-[85%] rounded-2xl text-sm leading-relaxed break-words overflow-hidden ${
                                                msg.role === 'user'
                                                    ? 'bg-primary-600 text-white rounded-tr-sm'
                                                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                                            }`}>
                                                {msg.image && (
                                                    <img src={msg.image} alt="attachment" className="w-full max-h-48 object-cover rounded-t-2xl" />
                                                )}
                                                <div className="px-4 py-3">
                                                <ReactMarkdown components={{
                                                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                                    strong: ({node, ...props}) => <strong className="font-bold text-primary-700 dark:text-primary-400" {...props} />,
                                                    ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                                    ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                                                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                                }}>
                                                    {msg.text}
                                                </ReactMarkdown>
                                                </div>
                                            </div>
                                            {msg.role === 'user' && (
                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-1">
                                                    <User className="w-4 h-4 text-gray-500" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex gap-3 justify-start">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                                                <Bot className="w-4 h-4 text-primary-600" />
                                            </div>
                                            <div className="px-4 py-3 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                                                <span className="text-xs text-gray-500">Naviya is thinking...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
                                    {/* File preview */}
                                    {attachedImage && (
                                        <div className="relative mb-2 inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700">
                                            {attachedImage.type === 'image' ? (
                                                <img src={attachedImage.preview} alt="preview" className="h-10 w-10 object-cover rounded-lg" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                                                    <ImageIcon className="w-5 h-5 text-primary-600" />
                                                </div>
                                            )}
                                            <span className="text-xs text-gray-600 dark:text-gray-400 max-w-[120px] truncate">{attachedImage.name}</span>
                                            <button type="button" onClick={() => setAttachedImage(null)}
                                                className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs shrink-0">
                                                ×
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        {/* Attach image */}
                                        <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileChange} />
                                        <button type="button" onClick={() => fileInputRef.current?.click()}
                                            title="Attach file (image, PDF, doc)"
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors shrink-0">
                                            <Paperclip className="w-4 h-4" />
                                        </button>

                                        {/* Text input */}
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder={isListening ? '🎙️ Listening...' : 'Ask about your diet...'}
                                            disabled={isLoading}
                                            className={`flex-1 px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 transition disabled:opacity-50 ${
                                                isListening
                                                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/10 focus:border-rose-400 focus:ring-rose-400'
                                                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary-500 focus:ring-primary-500'
                                            }`}
                                        />

                                        {/* Voice button */}
                                        {speechSupported && (
                                            <button type="button" onClick={toggleVoice}
                                                title={isListening ? 'Stop recording' : 'Speak'}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                                    isListening
                                                        ? 'bg-rose-500 text-white animate-pulse'
                                                        : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                                                }`}>
                                                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                            </button>
                                        )}

                                        {/* Send button */}
                                        <button type="submit"
                                            disabled={(!input.trim() && !attachedImage) || isLoading}
                                            className="w-8 h-8 rounded-lg bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center disabled:opacity-50 transition-colors shrink-0">
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors z-50 ${
                    isOpen
                        ? 'bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-700'
                        : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white'
                }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
            </motion.button>
        </div>
    );
};

export default Chatbot;

