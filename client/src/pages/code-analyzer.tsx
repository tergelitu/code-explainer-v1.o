import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MacWindow } from "@/components/mac-window";
import { CodeEditor } from "@/components/code-editor";
import { AnalysisPane } from "@/components/analysis-pane";
import { useToast } from "@/hooks/use-toast";
import { uploadFile, analyzeCode, sendChatMessage, getChatMessages } from "@/lib/api";

export default function CodeAnalyzer() {
  const [code, setCode] = useState("");
  const [filename, setFilename] = useState("");
  const [currentAnalysisId, setCurrentAnalysisId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chat messages for current analysis
  const { data: chatMessages = [] } = useQuery({
    queryKey: ['/api/chat', currentAnalysisId],
    queryFn: () => getChatMessages(currentAnalysisId!),
    enabled: !!currentAnalysisId,
  });

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      setCode(data.code);
      setFilename(data.filename);
      toast({
        title: "File uploaded successfully",
        description: `${data.filename} is ready for analysis`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Analyze code mutation
  const analyzeMutation = useMutation({
    mutationFn: analyzeCode,
    onSuccess: (data) => {
      setCurrentAnalysisId(data.id);
      toast({
        title: "Analysis complete",
        description: "Your code has been analyzed successfully",
      });
      // Invalidate chat messages query to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/chat', data.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send chat message mutation
  const chatMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: () => {
      // Invalidate chat messages to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/chat', currentAnalysisId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (file: File) => {
    uploadMutation.mutate(file);
  };

  const handleAnalyze = () => {
    if (!code.trim()) {
      toast({
        title: "No code to analyze",
        description: "Please paste or upload some Python code first",
        variant: "destructive",
      });
      return;
    }

    analyzeMutation.mutate({
      code: code.trim(),
      filename: filename || undefined,
      language: "python",
    });
  };

  const handleSendMessage = (message: string) => {
    if (!currentAnalysisId) {
      toast({
        title: "No analysis available",
        description: "Please analyze your code first before asking questions",
        variant: "destructive",
      });
      return;
    }

    chatMutation.mutate({
      analysisId: currentAnalysisId,
      message,
    });
  };

  const analysisData = analyzeMutation.data;

  return (
    <div className="min-h-screen p-6 flex flex-col">
      <div className="max-w-7xl mx-auto flex-1">
        <MacWindow
          title="Ted CodeExplainer"
          subtitle="AI-Powered Python Code Analysis"
        >
          <div className="flex h-[calc(100vh-180px)] min-h-[600px]">
            <CodeEditor
              code={code}
              onCodeChange={setCode}
              onFileUpload={handleFileUpload}
              onAnalyze={handleAnalyze}
              isAnalyzing={analyzeMutation.isPending}
              filename={filename}
            />
            <AnalysisPane
              explanation={analysisData?.explanation}
              issues={analysisData?.issues}
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
              isAnalyzing={analyzeMutation.isPending}
              isSendingMessage={chatMutation.isPending}
            />
          </div>
        </MacWindow>
      </div>
      <AppFooter />
    </div>
  );
}

export function AppFooter() {
  return (
    <footer className="w-full py-4 text-center text-sm text-macos-text-secondary">
      <a
        href="https://github.com/tergelitu"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline mx-2"
      >
        GitHub
      </a>
      |
      <a
        href="https://www.instagram.com/datalogic_ted/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline mx-2"
      >
        Instagram
      </a>
    </footer>
  );
}