import { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VoiceExpenseInputProps {
  onExpenseDetected: (data: { foodName: string; amount: number; category?: string }) => void;
}

export function VoiceExpenseInput({ onExpenseDetected }: VoiceExpenseInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
    }
  }, []);

  const parseExpenseFromText = (text: string) => {
    // Smart parsing of voice input
    // Examples:
    // "Pizza 500 rupees" -> { foodName: "Pizza", amount: 500 }
    // "Biryani for 350" -> { foodName: "Biryani", amount: 350 }
    // "Spent 200 on coffee" -> { foodName: "Coffee", amount: 200 }
    
    const lowerText = text.toLowerCase();
    
    // Extract amount
    const amountMatch = lowerText.match(/(\d+)\s*(rupees?|rs\.?|₹)?/i);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    
    if (amount === 0) {
      toast.error('Could not detect amount in voice input');
      return null;
    }
    
    // Extract food name
    let foodName = text;
    
    // Remove common phrases
    const removePatterns = [
      /spent\s+/gi,
      /paid\s+/gi,
      /bought\s+/gi,
      /for\s+/gi,
      /on\s+/gi,
      /rupees?/gi,
      /rs\.?/gi,
      /₹/gi,
      /\d+/g,
    ];
    
    removePatterns.forEach(pattern => {
      foodName = foodName.replace(pattern, ' ');
    });
    
    foodName = foodName.trim();
    
    if (!foodName) {
      toast.error('Could not detect expense description');
      return null;
    }
    
    // Detect category from keywords
    let category: string | undefined;
    if (/pizza|burger|sandwich|fries/i.test(foodName)) {
      category = 'delivery';
    } else if (/restaurant|dine|hotel/i.test(text)) {
      category = 'dine-in';
    } else if (/street|chaat|vada|pav/i.test(foodName)) {
      category = 'street-food';
    } else if (/home|cooked|kitchen/i.test(text)) {
      category = 'home-cooked';
    }
    
    return { foodName, amount, category };
  };

  const startListening = () => {
    if (!isSupported) {
      toast.error('Voice input not supported in your browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-IN'; // Indian English
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      toast.success('🎤 Listening... Say your expense!');
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptResult = event.results[current][0].transcript;
      setTranscript(transcriptResult);
    };

    recognition.onend = () => {
      setIsListening(false);
      
      if (transcript) {
        const parsed = parseExpenseFromText(transcript);
        if (parsed) {
          toast.success(`✅ Detected: ${parsed.foodName} - ₹${parsed.amount}`);
          onExpenseDetected(parsed);
        }
        setTranscript('');
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech') {
        toast.error('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please enable microphone permission.');
      } else {
        toast.error('Voice input error. Please try again.');
      }
    };

    recognition.start();
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={startListening}
        disabled={isListening}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all',
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        )}
      >
        {isListening ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Listening...
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            Voice Input
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 right-0 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20"
          >
            <p className="text-sm text-blue-500">
              🎤 "{transcript}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
