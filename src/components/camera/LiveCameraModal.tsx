import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import {
  Camera,
  RotateCcw,
  X,
  Check,
  SwitchCamera,
  AlertCircle,
  Upload,
  Sparkles,
} from 'lucide-react';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (file: File, previewUrl: string) => void;
}

export function LiveCameraModal({
  isOpen,
  onClose,
  onPhotoCaptured,
}: LiveCameraModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  const stopCurrentStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(
    async (mode: 'environment' | 'user') => {
      setErrorMsg(null);
      setIsInitializing(true);
      stopCurrentStream();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg('Camera access is not supported by your browser environment.');
        setIsInitializing(false);
        return;
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        console.warn('Camera access notice:', err?.name || err?.message || err);
        // Fallback constraint attempt without specific facingMode
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.play().catch(() => {});
          }
        } catch (fallbackErr: any) {
          console.warn('Camera fallback notice:', fallbackErr?.name || fallbackErr?.message);
          setErrorMsg(
            fallbackErr?.name === 'NotAllowedError' || fallbackErr?.name === 'PermissionDeniedError'
              ? 'Camera permission was not granted by your browser. You can use your device camera file picker or upload an existing photo below.'
              : 'Could not access device camera hardware. You can capture or select a photo using your device file picker.'
          );
        }
      } finally {
        setIsInitializing(false);
      }
    },
    [stopCurrentStream]
  );

  useEffect(() => {
    if (isOpen) {
      setCapturedPhotoUrl(null);
      setCapturedBlob(null);
      startCamera(facingMode);
    } else {
      stopCurrentStream();
    }
    return () => {
      stopCurrentStream();
    };
  }, [isOpen, facingMode, startCamera, stopCurrentStream]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCapturedBlob(blob);
        const url = URL.createObjectURL(blob);
        setCapturedPhotoUrl(url);
        stopCurrentStream();
      },
      'image/jpeg',
      0.88
    );
  };

  const handleRetake = () => {
    if (capturedPhotoUrl) {
      URL.revokeObjectURL(capturedPhotoUrl);
    }
    setCapturedPhotoUrl(null);
    setCapturedBlob(null);
    startCamera(facingMode);
  };

  const handleConfirmPhoto = () => {
    if (!capturedBlob || !capturedPhotoUrl) return;
    const filename = `photo-${Date.now()}.jpg`;
    const file = new File([capturedBlob], filename, { type: 'image/jpeg' });
    onPhotoCaptured(file, capturedPhotoUrl);
    onClose();
  };

  const handleNativeFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    onPhotoCaptured(file, previewUrl);
    onClose();
  };

  const handleUseSamplePhoto = () => {
    // Generate a clean dummy canvas placeholder photo for testing
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Evidence Photo (Civic Problem)', 320, 220);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText(`Captured: ${new Date().toLocaleString()}`, 320, 260);
    }
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `sample-evidence-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        onPhotoCaptured(file, previewUrl);
        onClose();
      },
      'image/jpeg',
      0.85
    );
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/40">
          <div className="flex items-center gap-2">
            <Camera className="size-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {capturedPhotoUrl ? 'Confirm Evidence Photo' : 'Take Evidence Photo'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Viewfinder / Preview Body */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} className="hidden" />

          {/* Native file input fallback */}
          <input
            ref={nativeCameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleNativeFileSelected}
          />

          {/* Captured Photo Preview */}
          {capturedPhotoUrl ? (
            <img
              src={capturedPhotoUrl}
              alt="Captured evidence"
              className="h-full w-full object-contain"
            />
          ) : (
            <>
              {/* Live Video Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Viewfinder crosshairs */}
              <div className="pointer-events-none absolute inset-6 border-2 border-white/20 rounded-lg flex flex-col justify-between p-2">
                <div className="flex justify-between text-[10px] text-white/60 font-mono">
                  <span>REC LIVE</span>
                  <span>DELHI INFRA REPORT</span>
                </div>
                <div className="self-center text-[11px] text-white/70 bg-black/40 px-2 py-0.5 rounded">
                  Center the infrastructure issue
                </div>
              </div>

              {/* Loading spinner */}
              {isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xs gap-2">
                  <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Starting camera...</span>
                </div>
              )}
            </>
          )}

          {/* Permission / Hardware Error Notice */}
          {errorMsg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/95 p-6 text-center z-10 space-y-4">
              <div className="rounded-full bg-amber-500/10 p-3 text-amber-500 border border-amber-500/30">
                <AlertCircle className="size-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Camera Notice</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm">{errorMsg}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="w-full text-xs"
                >
                  <Upload className="size-3.5 mr-1" />
                  Open Device Camera / File
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseSamplePhoto}
                  className="w-full text-xs"
                >
                  <Sparkles className="size-3.5 mr-1 text-primary" />
                  Use Sample Photo
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between p-4 bg-muted/20 border-t border-border">
          {capturedPhotoUrl ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRetake}
                className="gap-1.5 text-xs"
              >
                <RotateCcw className="size-3.5" />
                Retake
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleConfirmPhoto}
                className="gap-1.5 text-xs"
              >
                <Check className="size-3.5" />
                Attach Photo
              </Button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleCameraFacing}
                title="Switch Camera (Front/Back)"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground p-1.5 rounded hover:bg-muted cursor-pointer"
              >
                <SwitchCamera className="size-4" />
                <span className="hidden sm:inline">Flip Camera</span>
              </button>

              <button
                type="button"
                onClick={handleCapture}
                disabled={Boolean(errorMsg) || isInitializing}
                className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 active:scale-95 transition disabled:opacity-40 cursor-pointer"
                aria-label="Capture photo"
              >
                <div className="size-11 rounded-full border-2 border-primary-foreground/80 flex items-center justify-center">
                  <div className="size-8 rounded-full bg-primary-foreground" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground p-1.5 rounded hover:bg-muted cursor-pointer"
              >
                <Upload className="size-4" />
                <span className="hidden sm:inline">Choose File</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
