import { BrowserQRCodeReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export const QrScanner = ({
  active,
  children,
  className = "",
  onScan,
}: {
  active: boolean;
  children?: ReactNode;
  className?: string;
  onScan: (value: string) => void;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const lastValueRef = useRef("");
  const onScanRef = useRef(onScan);
  const [videoReady, setVideoReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const setVideoNode = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    setVideoReady(Boolean(node));
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!active || !videoReady || !video) {
      controlsRef.current?.stop();
      controlsRef.current = null;
      return;
    }

    let cancelled = false;
    const reader = new BrowserQRCodeReader();

    reader
      .decodeFromConstraints({ video: { facingMode: { ideal: "environment" } } }, video, (result) => {
        const value = result?.getText();
        if (!value || value === lastValueRef.current) return;

        lastValueRef.current = value;
        onScanRef.current(value);
      })
      .then(async (controls) => {
        if (cancelled) {
          controls.stop();
          return;
        }

        controlsRef.current = controls;
        await video.play().catch(() => undefined);
        setError("");
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Không thể mở camera.";
        setError(message);
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [active, videoReady]);

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      <video autoPlay className="absolute inset-0 h-full w-full object-cover" muted playsInline ref={setVideoNode} />
      {children}
      {error ? (
        <div className="absolute inset-x-4 bottom-4 z-40 rounded-lg bg-[#ffdad6] px-3 py-2 text-center text-sm font-semibold text-[#93000a]">
          {error}
        </div>
      ) : null}
    </div>
  );
};
