import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface UseVoiceSearchReturn {
  isListening: boolean;
  isProcessing: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
}

// Type declarations for Web Speech API
interface SpeechRecognitionResult {
  isFinal: boolean;
  0: {
    transcript: string;
    confidence: number;
  };
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export function useVoiceSearch(onTranscript?: (text: string) => void): UseVoiceSearchReturn {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const startListening = useCallback(() => {
    // Check for browser support
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      toast.error('Voice search is not supported in your browser');
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // English - India for better food name recognition

      recognition.onstart = () => {
        setIsListening(true);
        setIsProcessing(false);
        toast.info('Listening... Speak now', { duration: 2000 });
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const results = event.results;
        const lastResult = results[results.length - 1];
        
        if (lastResult.isFinal) {
          const finalTranscript = lastResult[0].transcript;
          setTranscript(finalTranscript);
          onTranscript?.(finalTranscript);
          toast.success(`Searching for "${finalTranscript}"`);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsProcessing(false);
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone permissions.');
        } else if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else {
          toast.error('Voice search failed. Please try again.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsProcessing(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      toast.error('Failed to start voice search');
      setIsListening(false);
    }
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return {
    isListening,
    isProcessing,
    startListening,
    stopListening,
    transcript,
  };
}
