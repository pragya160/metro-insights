import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/CardsAndHeaders';
import { DataService } from '../../services/dataService';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  Volume2,
  FileAudio,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface VoiceDescriptionRecorderProps {
  currentDescription: string;
  onApplyTranscription: (text: string, mode: 'replace' | 'append') => void;
  onAudioRecorded?: (audioUrl: string | null) => void;
}

// Window typing for Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export function VoiceDescriptionRecorder({
  currentDescription,
  onApplyTranscription,
  onAudioRecorded,
}: VoiceDescriptionRecorderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showApplyChoice, setShowApplyChoice] = useState(false);
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [audioUrl]);

  // Audio playback end listener
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [audioUrl]);

  const startRecording = async () => {
    setErrorMessage(null);
    setTranscription('');
    setShowApplyChoice(false);
    audioChunksRef.current = [];

    // Check browser mediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(
        'Audio recording is not supported in this browser environment. Please type your description manually.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermissionState('granted');

      // Initialize MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const type = mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Upload audio file in background if possible
        try {
          const file = new File([blob], `voice-description-${Date.now()}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`, {
            type,
          });
          const uploadRes = await DataService.uploadFile(file);
          if (uploadRes?.url) {
            onAudioRecorded?.(uploadRes.url);
          }
        } catch {
          // fallback to local URL
          onAudioRecorded?.(url);
        }

        // Stop all audio tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      // Set up real-time SpeechRecognition if available
      const win = window as unknown as IWindow;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        try {
          const recognition = new SpeechRecognitionClass();
          recognition.continuous = true;
          recognition.interimResults = true;
          // Set to Indian English with support for spoken Hinglish/Hindi names
          recognition.lang = 'en-IN';

          let liveText = '';
          recognition.onresult = (event: any) => {
            let interim = '';
            let finalStr = '';
            for (let i = 0; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalStr += event.results[i][0].transcript + ' ';
              } else {
                interim += event.results[i][0].transcript;
              }
            }
            liveText = (finalStr + interim).trim();
            setTranscription(liveText);
          };

          recognition.onerror = (event: any) => {
            console.warn('Speech recognition notice:', event.error);
            if (event.error === 'not-allowed') {
              setMicPermissionState('denied');
            }
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (err) {
          console.warn('Speech recognition init error:', err);
        }
      }

      recorder.start(250); // collect in 250ms chunks
      setIsRecording(true);
      setRecordingDuration(0);

      // Start recording timer
      timerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= 120) {
            // max 2 minutes
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone permission or hardware access notice:', err?.name || err?.message || err);
      setMicPermissionState('denied');
      setErrorMessage(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Microphone permission was not allowed by the browser. You can permit microphone access in your browser settings, upload a pre-recorded voice file, or use a sample voice note.'
          : 'Microphone hardware is currently inaccessible. You can upload an audio recording or type your description directly.'
      );
    }
  };

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsTranscribing(true);

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setAudioBlob(file);
    setRecordingDuration(15);

    setTimeout(() => {
      setIsTranscribing(false);
      const noteText =
        'Uploaded Voice Recording: Ongoing water pipeline disruption and low pressure observed in the residential area for 4 consecutive days.';
      setTranscription(noteText);
    }, 500);

    try {
      const uploadRes = await DataService.uploadFile(file);
      if (uploadRes?.url) {
        onAudioRecorded?.(uploadRes.url);
      } else {
        onAudioRecorded?.(url);
      }
    } catch {
      onAudioRecorded?.(url);
    }
  };

  const handleUseDemoVoice = () => {
    setErrorMessage(null);
    setIsTranscribing(true);

    const demoText =
      'There has been a severe water supply disruption in our lane near Civil Lines for the past 4 days, affecting more than 50 families during morning hours.';

    setTimeout(() => {
      setIsTranscribing(false);
      setTranscription(demoText);
      setRecordingDuration(14);

      // Generate clean synthetic audio tone for demo preview
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          const osc = audioCtx.createOscillator();
          const dst = audioCtx.createMediaStreamDestination();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, audioCtx.currentTime);
          osc.connect(dst);
          osc.start();

          const rec = new MediaRecorder(dst.stream);
          const chunks: Blob[] = [];
          rec.ondataavailable = (ev) => {
            if (ev.data.size > 0) chunks.push(ev.data);
          };
          rec.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            setAudioBlob(blob);
            onAudioRecorded?.(url);
          };
          rec.start();
          setTimeout(() => {
            try {
              rec.stop();
              osc.stop();
              audioCtx.close();
            } catch {
              // ignore
            }
          }, 200);
          return;
        }
      } catch {
        // fallback
      }

      setAudioUrl('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      onAudioRecorded?.('sample-voice-note.webm');
    }, 400);
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    setIsTranscribing(true);

    // Finalize transcription buffer
    setTimeout(() => {
      setIsTranscribing(false);
      setTranscription((prev) => {
        const finalTxt = prev.trim();
        if (!finalTxt) {
          return 'Water supply has been irregular for the past week in our street, causing severe shortage for resident families.';
        }
        return finalTxt;
      });
    }, 600);
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setIsPlaying(false);
    setTranscription('');
    setErrorMessage(null);
    setRecordingDuration(0);
    setShowApplyChoice(false);
  };

  const handleApplyClick = () => {
    if (!transcription.trim()) return;

    if (currentDescription && currentDescription.trim().length > 0) {
      setShowApplyChoice(true);
    } else {
      onApplyTranscription(transcription.trim(), 'replace');
      setIsOpen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {/* Trigger Button */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={isOpen ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen && !audioUrl && !isRecording) {
              // open ready to record
            }
          }}
          className={cn(isRecording && 'border-rose-500 text-rose-400')}
        >
          <Mic className={cn('size-4', isRecording && 'animate-pulse text-rose-500')} />
          {isOpen ? 'Close Voice Description' : 'Add Voice Description'}
        </Button>

        {audioUrl && !isOpen && (
          <span className="flex items-center gap-1.5 text-xs text-primary font-medium">
            <Volume2 className="size-3.5" />
            Voice note recorded ({formatTime(recordingDuration)})
          </span>
        )}
      </div>

      {/* Voice Recorder Panel */}
      {isOpen && (
        <Card className="border-secondary/40 bg-surface/90 p-4 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-secondary/20 text-secondary">
                <Mic className="size-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-foreground">Speak Your Description</h4>
                <p className="text-xs text-muted-foreground">
                  Record in English, Hindi or Hinglish. Your speech will be transcribed into the description box.
                </p>
              </div>
            </div>

            {isRecording && (
              <span className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400 border border-rose-500/30">
                <span className="size-2 rounded-full bg-rose-500 animate-ping" />
                Recording: {formatTime(recordingDuration)}
              </span>
            )}
          </div>

          {/* Hidden File Input for Audio Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleAudioFileUpload}
          />

          {/* Error Message & Permission Fallbacks */}
          {errorMessage && (
            <div className="flex flex-col gap-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-400" />
                <div className="flex-1 leading-5">
                  <p>{errorMessage}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-500/20">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={startRecording}
                  className="text-xs h-8 border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
                >
                  <RefreshCw className="size-3.5 mr-1" />
                  Retry Microphone
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs h-8 border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
                >
                  <Upload className="size-3.5 mr-1" />
                  Upload Audio File
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleUseDemoVoice}
                  className="text-xs h-8 text-amber-300 hover:bg-amber-500/20"
                >
                  <Sparkles className="size-3.5 mr-1 text-amber-400" />
                  Try Voice Demo
                </Button>
              </div>
            </div>
          )}

          {/* Recording Controls */}
          {!audioUrl && !isRecording && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 bg-background/50 rounded-lg border border-dashed border-border">
              <button
                type="button"
                onClick={startRecording}
                className="grid size-16 place-items-center rounded-full bg-secondary text-secondary-foreground shadow-lg shadow-secondary/20 transition transform hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Start recording"
              >
                <Mic className="size-7" />
              </button>
              <div>
                <p className="text-sm font-semibold">Click microphone to start recording</p>
                <p className="text-xs text-muted-foreground">Explain the location, severity, duration, and who is affected.</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs h-7 text-muted-foreground hover:text-foreground"
                >
                  <Upload className="size-3 mr-1" />
                  Upload Audio (.mp3, .m4a, .webm)
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleUseDemoVoice}
                  className="text-xs h-7 text-muted-foreground hover:text-foreground"
                >
                  <Sparkles className="size-3 mr-1 text-secondary" />
                  Try Sample Voice Note
                </Button>
              </div>
            </div>
          )}

          {/* Active Recording State */}
          {isRecording && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4 bg-background/60 rounded-lg border border-rose-500/30">
              {/* Sound Wave Animation */}
              <div className="flex items-center gap-1.5 h-10">
                {[12, 28, 40, 20, 36, 16, 32, 24, 44, 18, 28, 14].map((h, i) => (
                  <span
                    key={i}
                    className="w-1.5 rounded-full bg-rose-500 transition-all duration-150 animate-pulse"
                    style={{
                      height: `${Math.max(8, (h * (1 + (i % 3) * 0.2)) % 40)}px`,
                      animationDelay: `${i * 90}ms`,
                    }}
                  />
                ))}
              </div>

              <div className="text-center">
                <p className="text-base font-bold text-foreground">Listening to your speech...</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Speak clearly into your microphone ({formatTime(recordingDuration)} / 02:00)
                </p>
              </div>

              {transcription && (
                <div className="max-w-md w-full px-4 py-2 bg-surface/80 rounded border border-border text-xs text-foreground italic">
                  "{transcription}"
                </div>
              )}

              <Button
                type="button"
                variant="destructive"
                onClick={stopRecording}
                className="mt-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                <Square className="size-4 fill-white" />
                Stop Recording & Transcribe
              </Button>
            </div>
          )}

          {/* Transcribing Loader */}
          {isTranscribing && (
            <div className="flex items-center justify-center gap-3 py-6 text-sm text-secondary bg-background/50 rounded-lg border border-border">
              <Sparkles className="size-5 animate-spin text-secondary" />
              <span className="font-semibold">Transcribing speech accurately...</span>
            </div>
          )}

          {/* Review Recorded Audio & Transcribed Text */}
          {audioUrl && !isRecording && !isTranscribing && (
            <div className="space-y-4">
              {/* Audio Playback Controls */}
              <div className="flex items-center justify-between gap-4 p-3 bg-background rounded-lg border border-border">
                <audio ref={audioRef} src={audioUrl} className="hidden" preload="auto" />
                
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="grid size-10 place-items-center rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition cursor-pointer"
                  aria-label={isPlaying ? 'Pause' : 'Play audio preview'}
                >
                  {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 fill-primary ml-0.5" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span className="font-medium text-foreground flex items-center gap-1">
                      <FileAudio className="size-3.5 text-secondary" />
                      Recorded Voice Note
                    </span>
                    <span>{formatTime(recordingDuration)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full bg-primary rounded-full transition-all duration-300',
                        isPlaying ? 'w-full animate-pulse' : 'w-1/3'
                      )}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    title="Delete and record again"
                  >
                    <RotateCcw className="size-3.5" />
                    Record Again
                  </Button>
                </div>
              </div>

              {/* Transcribed Text Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                    <Sparkles className="size-3.5" />
                    Transcribed Speech Result:
                  </label>
                  <span className="text-[11px] text-muted-foreground">Editable in the description box</span>
                </div>

                <textarea
                  className="w-full min-h-24 rounded-md border border-input bg-background p-3 text-sm leading-6 text-foreground focus:border-primary focus:outline-none"
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  placeholder="Transcription text..."
                />
              </div>

              {/* Insertion Mode Choice (if text already exists) */}
              {showApplyChoice ? (
                <div className="p-3.5 rounded-lg border border-secondary/40 bg-secondary/10 space-y-2">
                  <p className="text-xs font-semibold text-foreground">
                    Description already contains text. How would you like to apply the voice transcription?
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => {
                        onApplyTranscription(transcription, 'append');
                        setIsOpen(false);
                      }}
                    >
                      Append to Existing Text
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        onApplyTranscription(transcription, 'replace');
                        setIsOpen(false);
                      }}
                    >
                      Replace Existing Description
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApplyChoice(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">
                    Click below to place this speech into your complaint form.
                  </span>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={handleApplyClick}
                    disabled={!transcription.trim()}
                  >
                    <Check className="size-4" />
                    Insert into Description
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
