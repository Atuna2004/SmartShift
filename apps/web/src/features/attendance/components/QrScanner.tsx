import { BrowserQRCodeReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

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
  const [error, setError] = useState("");

  useEffect(() => {
    if (!active || !videoRef.current) {
      controlsRef.current?.stop();
      controlsRef.current = null;
      return;
    }

    let cancelled = false;
    const reader = new BrowserQRCodeReader();

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        const value = result?.getText();
        if (!value || value === lastValueRef.current) return;

        lastValueRef.current = value;
        onScan(value);
      })
      .then((controls) => {
        if (cancelled) {
          controls.stop();
          return;
        }

        controlsRef.current = controls;
        setError("");
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Unable to access camera.";
        setError(message);
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [active, onScan]);

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      <video className="absolute inset-0 h-full w-full object-cover" muted playsInline ref={videoRef} />
      {children}
      {error ? (
        <div className="absolute inset-x-4 bottom-4 z-40 rounded-lg bg-[#ffdad6] px-3 py-2 text-center text-sm font-semibold text-[#93000a]">
          {error}
        </div>
      ) : null}
    </div>
  );
};
