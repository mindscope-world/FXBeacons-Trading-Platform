import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Send, Cpu, Activity, ShieldAlert, BarChart2, TrendingUp, Image as ImageIcon, ScanEye } from 'lucide-react';
import { ExpertType, Message } from '../types';
import { analyzeChart } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AnalysisPanelProps {
  onAnalyzeStart: () => void;
  onAnalyzeEnd: () => void;
  onScanRequest: (file: File | null) => void;
}

const EXPERT_ICONS = {
  [ExpertType.GENERAL]: <Cpu size={14} />,
  [ExpertType.TREND]: <TrendingUp size={14} />,
  [ExpertType.REVERSAL]: <Activity size={14} />,
  [ExpertType.RISK]: <ShieldAlert size={14} />,
  [ExpertType.SENTIMENT]: <BarChart2 size={14} />,
  [ExpertType.SCALPER]: <ScanEye size={14} />,
};

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ onAnalyzeStart, onAnalyzeEnd, onScanRequest }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expert, setExpert] = useState<ExpertType>(ExpertType.GENERAL);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to **FXBeacons**. I am your visual market co-pilot. I can analyze trends, calculate risk, or generate trade ideas.',
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScan = () => {
    onScanRequest(selectedImage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const currentImage = selectedImage;
    const currentPreview = imagePreview;
    const currentInput = input;
    const currentExpert = expert;

    setInput('');
    clearImage();
    setIsLoading(true);
    onAnalyzeStart();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      image: currentPreview || undefined,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);

    const responseText = await analyzeChart(currentImage, currentInput, currentExpert);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseText,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
    onAnalyzeEnd();
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
      {/* Header */}
      <div className="p-3 border-b border-gray-800 bg-gray-950">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-200 font-semibold flex items-center gap-2 text-sm">
            <Cpu className="text-trade-accent" size={16} />
            AI Analyst
            </h3>
            <button 
                onClick={handleScan}
                className="text-[10px] bg-gray-800 hover:bg-gray-700 text-trade-accent border border-gray-700 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                title="Generate Trade Beacon from current view"
            >
                <ScanEye size={12}/> Scan for Signals
            </button>
        </div>
        
        {/* Expert Selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {Object.values(ExpertType).map((type) => (
            <button
              key={type}
              onClick={() => setExpert(type)}
              className={`text-[10px] whitespace-nowrap px-2 py-1 rounded-full flex items-center gap-1 transition-colors border ${
                expert === type 
                  ? 'bg-trade-accent/10 border-trade-accent text-trade-accent' 
                  : 'bg-gray-800 border-transparent text-gray-400 hover:bg-gray-700'
              }`}
            >
              {EXPERT_ICONS[type]}
              {type.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-lg p-3 ${
              msg.role === 'user' ? 'bg-blue-900/40 border border-blue-800 text-blue-100' : 'bg-gray-800 border border-gray-700 text-gray-200'
            }`}>
              {msg.image && (
                <div className="mb-2 rounded overflow-hidden border border-gray-600">
                  <img src={msg.image} alt="Chart context" className="max-w-full h-auto max-h-[150px] object-cover" />
                </div>
              )}
              
              <div className="prose prose-invert prose-sm max-w-none text-xs leading-relaxed">
                 <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              
              <div className="text-[10px] text-gray-500 mt-1 flex justify-end">
                 <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-trade-accent border-t-transparent animate-spin"></div>
                    <span className="text-xs text-gray-400">Processing visual data...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-gray-950 border-t border-gray-800">
        {imagePreview && (
          <div className="mb-2 relative inline-block group">
            <img src={imagePreview} alt="Preview" className="h-16 w-auto rounded border border-gray-700 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <button 
              onClick={clearImage}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
            >
              <X size={10} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
            accept="image/*"
          />
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-lg transition-colors border ${selectedImage ? 'bg-trade-accent/20 border-trade-accent text-trade-accent' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'}`}
          >
            <ImageIcon size={18} />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trade-accent focus:ring-1 focus:ring-trade-accent transition-all"
          />
          
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="p-2 bg-trade-accent text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-500/20"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AnalysisPanel;
