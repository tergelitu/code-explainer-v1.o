import { apiRequest } from "./queryClient";

export interface CodeAnalysisRequest {
  code: string;
  filename?: string;
  language: string;
}

export interface ChatMessageRequest {
  analysisId: number;
  message: string;
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  
  return response.json();
}

export async function analyzeCode(data: CodeAnalysisRequest) {
  const response = await apiRequest('POST', '/api/analyze', data);
  return response.json();
}

export async function sendChatMessage(data: ChatMessageRequest) {
  const response = await apiRequest('POST', '/api/chat', data);
  return response.json();
}

export async function getChatMessages(analysisId: number) {
  const response = await fetch(`/api/chat/${analysisId}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch chat messages');
  }
  
  return response.json();
}

export async function getAnalysis(id: number) {
  const response = await fetch(`/api/analysis/${id}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch analysis');
  }
  
  return response.json();
}
