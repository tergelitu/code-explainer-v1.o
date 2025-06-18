import { useState, useCallback } from "react";
import { Send, MessageSquare, AlertTriangle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CodeExplanation {
  lineRanges: Array<{
    start: number;
    end: number;
    title: string;
    explanation: string;
  }>;
}

interface CodeIssue {
  line: number;
  severity: "error" | "warning" | "info";
  type: string;
  description: string;
  suggestion: string;
}

interface ChatMessage {
  id: number;
  message: string;
  response: string;
  createdAt: string;
}

interface AnalysisPaneProps {
  explanation?: CodeExplanation;
  issues?: CodeIssue[];
  chatMessages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isAnalyzing: boolean;
  isSendingMessage: boolean;
}

export function AnalysisPane({ 
  explanation, 
  issues, 
  chatMessages, 
  onSendMessage, 
  isAnalyzing,
  isSendingMessage 
}: AnalysisPaneProps) {
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("explanation");

  const handleSendMessage = useCallback(() => {
    if (message.trim() && !isSendingMessage) {
      onSendMessage(message.trim());
      setMessage("");
    }
  }, [message, onSendMessage, isSendingMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  return (
    <div className="w-2/5 p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-macos-text">AI Analysis</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3 py-1 glass-panel-light rounded-full">
            <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-yellow-400 animate-pulse' : 'bg-macos-green'}`}></div>
            <span className="text-xs text-macos-text-secondary">
              {isAnalyzing ? 'Analyzing...' : 'Analysis Complete'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="glass-panel-light p-1 mb-4">
          <TabsTrigger value="explanation" className="flex-1 data-[state=active]:bg-macos-blue data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Explanation
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex-1 data-[state=active]:bg-macos-blue data-[state=active]:text-white">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Issues
            {issues && issues.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {issues.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex-1 data-[state=active]:bg-macos-blue data-[state=active]:text-white">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
            {chatMessages.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {chatMessages.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <div className="flex-1 overflow-hidden mb-4">
          <TabsContent value="explanation" className="h-full mt-0">
            <ScrollArea className="h-full custom-scrollbar">
              {isAnalyzing ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 animate-spin rounded-full border-2 border-macos-blue/30 border-t-macos-blue"></div>
                    <p className="text-sm text-macos-text-secondary">Analyzing your code...</p>
                  </div>
                </div>
              ) : explanation ? (
                <div className="space-y-4">
                  {explanation.lineRanges.map((range, index) => (
                    <div key={index} className="glass-panel-light rounded-xl p-4 chat-message">
                      <h3 className="text-sm font-semibold text-macos-blue mb-2">
                        Lines {range.start}-{range.end}: {range.title}
                      </h3>
                      <p className="text-sm text-macos-text-secondary leading-relaxed">
                        {range.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-sm text-macos-text-secondary">
                    Upload or paste code and click "Analyze Code" to get started
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="issues" className="h-full mt-0">
            <ScrollArea className="h-full custom-scrollbar">
              {isAnalyzing ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 animate-spin rounded-full border-2 border-macos-blue/30 border-t-macos-blue"></div>
                    <p className="text-sm text-macos-text-secondary">Identifying issues...</p>
                  </div>
                </div>
              ) : issues && issues.length > 0 ? (
                <div className="space-y-4">
                  {issues.map((issue, index) => (
                    <div key={index} className="glass-panel-light rounded-xl p-4 chat-message">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getSeverityIcon(issue.severity)}</span>
                          <Badge className={getSeverityColor(issue.severity)}>
                            {issue.severity.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-macos-text-secondary">Line {issue.line}</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-semibold text-macos-text mb-1">{issue.type}</h4>
                      <p className="text-sm text-macos-text-secondary mb-2">{issue.description}</p>
                      <div className="bg-black/30 rounded-lg p-3">
                        <p className="text-xs text-macos-blue font-medium mb-1">Suggestion:</p>
                        <p className="text-xs text-macos-text-secondary">{issue.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-sm text-macos-text-secondary">
                    {explanation ? "No issues found in your code! 🎉" : "Analyze your code to identify potential issues"}
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="chat" className="h-full mt-0">
            <ScrollArea className="h-full custom-scrollbar">
              {chatMessages.length > 0 ? (
                <div className="space-y-4">
                  {chatMessages.map((chat) => (
                    <div key={chat.id} className="space-y-2">
                      <div className="glass-panel-light rounded-xl p-3 bg-macos-blue/20">
                        <p className="text-sm text-macos-text">{chat.message}</p>
                      </div>
                      <div className="glass-panel-light rounded-xl p-3 chat-message">
                        <p className="text-sm text-macos-text-secondary leading-relaxed whitespace-pre-wrap">
                          {chat.response}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isSendingMessage && (
                    <div className="glass-panel-light rounded-xl p-3 opacity-60">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-macos-blue/30 border-t-macos-blue"></div>
                        <p className="text-sm text-macos-text-secondary">Thinking...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-sm text-macos-text-secondary">
                    Ask questions about your code to get detailed explanations
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </div>

        {/* Chat Input */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex space-x-3">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your code..."
              className="flex-1 glass-panel-light border-white/10 placeholder:text-macos-text-secondary focus:ring-macos-blue/50"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isSendingMessage || !explanation}
              className="bg-macos-blue hover:bg-macos-blue/80"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
