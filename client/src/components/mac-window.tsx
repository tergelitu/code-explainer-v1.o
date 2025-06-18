import { X, Minus, Square } from "lucide-react";

interface MacWindowProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export function MacWindow({ title, subtitle, children, onClose, onMinimize, onMaximize }: MacWindowProps) {
  return (
    <div className="glass-panel rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          {/* Mac Window Controls */}
          <button 
            className="window-controls bg-macos-red hover:opacity-80" 
            onClick={onClose}
            aria-label="Close window"
          >
            <X className="w-2 h-2 text-white opacity-0 group-hover:opacity-100" />
          </button>
          <button 
            className="window-controls bg-macos-yellow hover:opacity-80" 
            onClick={onMinimize}
            aria-label="Minimize window"
          >
            <Minus className="w-2 h-2 text-white opacity-0 group-hover:opacity-100" />
          </button>
          <button 
            className="window-controls bg-macos-green hover:opacity-80" 
            onClick={onMaximize}
            aria-label="Maximize window"
          >
            <Square className="w-2 h-2 text-white opacity-0 group-hover:opacity-100" />
          </button>
        </div>
        
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-macos-text">{title}</h1>
          <p className="text-sm text-macos-text-secondary">{subtitle}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-macos-green rounded-full animate-pulse"></div>
            <span className="text-sm text-macos-text-secondary">Connected</span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      {children}
    </div>
  );
}
