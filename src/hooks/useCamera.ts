"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraErrorType =
  | "permission_denied"
  | "not_found"
  | "in_use"
  | "not_secure"
  | "unknown";

export interface UseCameraResult {
  stream: MediaStream | null;
  error: string | null;
  errorType: CameraErrorType | null;
  status: "idle" | "requesting" | "ready" | "error";
  retry: () => void;
  stop: () => void;
}

/** Minimal constraints – avoids "OverconstrainedError" and works even after allowing permission */
const MINIMAL_CONSTRAINTS: MediaStreamConstraints = {
  video: true,
  audio: false,
};

const MAX_RETRIES = 4;
const RETRY_DELAY_MS = 1200;

function getErrorMessage(err: unknown): { message: string; type: CameraErrorType } {
  const name = err instanceof Error ? err.name : "";
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (name === "NotAllowedError" || lower.includes("permission") || lower.includes("denied")) {
    return {
      message: "Camera permission was denied. Allow camera in your browser or site settings, then click Try again.",
      type: "permission_denied",
    };
  }
  if (name === "NotFoundError" || lower.includes("not found")) {
    return {
      message: "No camera found. Connect a camera and try again.",
      type: "not_found",
    };
  }
  if (
    name === "NotReadableError" ||
    lower.includes("in use") ||
    lower.includes("could not start") ||
    lower.includes("readable")
  ) {
    return {
      message: "Camera is in use elsewhere. Close other tabs or apps using the camera, then click Try again.",
      type: "in_use",
    };
  }
  if (name === "SecurityError" || lower.includes("secure")) {
    return {
      message: "Camera requires HTTPS. Open this page over https:// or use localhost.",
      type: "not_secure",
    };
  }
  return {
    message: "Could not access camera. Click Try again, or allow camera in browser settings and refresh.",
    type: "unknown",
  };
}

function isSecureContext(): boolean {
  if (typeof window === "undefined") return false;
  return window.isSecureContext === true;
}

/**
 * Hook to access the user's camera with retries and clear error handling.
 * Uses minimal constraints first so it works even when permission is already granted.
 */
export function useCamera(constraints: MediaStreamConstraints = MINIMAL_CONSTRAINTS): UseCameraResult {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<CameraErrorType | null>(null);
  const [status, setStatus] = useState<"idle" | "requesting" | "ready" | "error">("idle");
  const mountedRef = useRef(true);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback((s: MediaStream | null) => {
    if (!s) return;
    s.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const requestCamera = useCallback(() => {
    setError(null);
    setErrorType(null);
    setStatus("requesting");

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Camera is not supported in this browser.");
      setErrorType("unknown");
      setStatus("error");
      return;
    }

    if (!isSecureContext()) {
      const { message, type } = getErrorMessage(new Error("Secure context required"));
      setError(message);
      setErrorType(type);
      setStatus("error");
      return;
    }

    const tryRequest = (attempt: number) => {
      if (!mountedRef.current) return;

      const opts = attempt === 0 ? constraints : MINIMAL_CONSTRAINTS;
      navigator.mediaDevices
        .getUserMedia(opts)
        .then((mediaStream) => {
          if (!mountedRef.current) {
            stopStream(mediaStream);
            return;
          }
          streamRef.current = mediaStream;
          setStream(mediaStream);
          setError(null);
          setErrorType(null);
          setStatus("ready");
        })
        .catch((err) => {
          if (!mountedRef.current) return;
          const { message, type } = getErrorMessage(err);
          setError(message);
          setErrorType(type);
          setStatus("error");

          if (attempt < MAX_RETRIES - 1) {
            setTimeout(() => tryRequest(attempt + 1), RETRY_DELAY_MS);
          }
        });
    };

    tryRequest(0);
  }, [constraints, stopStream]);

  const retry = useCallback(() => {
    const current = streamRef.current;
    if (current) {
      stopStream(current);
    }
    setStream(null);
    setError(null);
    setErrorType(null);
    requestCamera();
  }, [stopStream, requestCamera]);

  const stop = useCallback(() => {
    setStream((prev) => {
      if (prev) stopStream(prev);
      return null;
    });
    setError(null);
    setErrorType(null);
    setStatus("idle");
  }, [stopStream]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      setStream((prev) => {
        if (prev) stopStream(prev);
        return null;
      });
    };
  }, [stopStream]);

  return { stream, error, errorType, status, retry, stop };
}
