import { useState, useCallback } from "react";
import { Upload, Zap, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  onFileUpload: (file: File) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  filename?: string;
}

export function CodeEditor({ 
  code, 
  onCodeChange, 
  onFileUpload, 
  onAnalyze, 
  isAnalyzing,
  filename 
}: CodeEditorProps) {
  const { toast } = useToast();
  const [lineCount, setLineCount] = useState(1);

  const handleFileUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.py,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onFileUpload(file);
      }
    };
    input.click();
  }, [onFileUpload]);

  const handleCodeChange = useCallback((value: string) => {
    onCodeChange(value);
    setLineCount(value.split('\n').length);
  }, [onCodeChange]);

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied to clipboard",
      duration: 2000,
    });
  }, [code, toast]);

  const generateLineNumbers = () => {
    return Array.from({ length: Math.max(lineCount, 20) }, (_, i) => i + 1);
  };

  return (
    <div className="flex-1 p-6 border-r border-white/10">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-macos-text">Code Input</h2>
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleFileUpload}
              className="glass-panel-light hover:bg-white/10"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
            <Button
              size="sm"
              onClick={onAnalyze}
              disabled={!code.trim() || isAnalyzing}
              className="bg-macos-blue hover:bg-macos-blue/80"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze Code
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 glass-panel-light rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-editor-bg">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-macos-text-secondary">
                {filename || "Python"}
              </span>
              <div className="w-1 h-1 bg-macos-text-secondary rounded-full"></div>
              <span className="text-sm text-macos-text-secondary">
                {lineCount} lines
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCode}
                className="text-macos-text-secondary hover:text-macos-text p-1"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Code Area */}
          <div className="h-full bg-editor-bg custom-scrollbar overflow-auto">
            <div className="flex h-full">
              {/* Line Numbers */}
              <div className="flex-shrink-0 p-4 text-right text-sm text-macos-text-secondary bg-black/20 font-mono select-none min-w-[60px]">
                {generateLineNumbers().map(lineNum => (
                  <div key={lineNum} className="leading-6">
                    {lineNum}
                  </div>
                ))}
              </div>
              
              {/* Code Content */}
              <div className="flex-1 relative">
                <Textarea
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="# Paste your Python code here or upload a .py file&#10;&#10;def hello_world():&#10;    print('Hello, World!')&#10;&#10;hello_world()"
                  className="w-full h-full bg-transparent border-none text-sm font-mono text-white leading-6 resize-none focus:outline-none p-4"
                  style={{ minHeight: '400px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
