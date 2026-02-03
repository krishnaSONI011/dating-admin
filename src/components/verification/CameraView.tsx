"use client";

import React, { useEffect, useRef } from "react";
import Button from "@/components/ui/button/Button";
import { useCamera } from "@/hooks/useCamera";

export interface CameraViewProps {
  /** Called when stream is ready (e.g. to attach to canvas or submit) */
  onReady?: (stream: MediaStream) => void;
  /** Video constraints override */
  constraints?: MediaStreamConstraints;
  /** Optional class for the video container */
  className?: string;
  /** Show a "Try again" button on error (default true) */
  showRetry?: boolean;
}

/**
 * Verification-style camera view with retries and clear error handling.
 * Reduces "Could not access camera" flakiness by retrying and showing a retry button.
 */
export default function CameraView({
  onReady,
  constraints,
  className = "",
  showRetry = true,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, error, status, retry } = useCamera(constraints ?? undefined);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  useEffect(() => {
    if (stream && onReady) onReady(stream);
  }, [stream, onReady]);

  if (status === "requesting") {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-800/50 ${className}`}
      >
        <p className="text-gray-600 dark:text-gray-400">Accessing camera…</p>
      </div>
    );
  }

  if (status === "error" && error) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-800/50 ${className}`}
      >
        <p className="text-center text-gray-700 dark:text-gray-300">{error}</p>
        {showRetry && (
          <Button onClick={retry} size="sm">
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (status === "ready" && stream) {
    return (
      <div className={`overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return null;
}
