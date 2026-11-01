"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { downloadBlob } from "@/lib/engine";
import { canvasToBlob } from "@/lib/imagebox-utils";
import { Field, useImgDict } from "./shared";

export default function QrTool() {
  const { t } = useImgDict();
  const [text, setText] = useState("");
  const [size, setSize] = useState(512);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const value = text.trim();
    if (!value) {
      setReady(false);
      setError("");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 220;
      canvas.height = 220;
      ctx.fillStyle = "#f3eddc";
      ctx.fillRect(0, 0, 220, 220);
      return;
    }
    QRCode.toCanvas(
      canvas,
      value,
      { width: size, margin: 2, errorCorrectionLevel: "M" },
      (err) => {
        if (err) {
          setReady(false);
          setError(t.qrcode.errTooLong);
        } else {
          setReady(true);
          setError("");
        }
      }
    );
  }, [text, size, t]);

  const download = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    const blob = await canvasToBlob(canvas, "image/png");
    downloadBlob(blob, "qrcode.png");
  };

  return (
    <div className="imgbox-tool">
      <p className="imgbox-desc">{t.qrcode.desc}</p>
      <div className="imgbox-controls">
        <Field label={t.qrcode.textLabel}>
          <input
            type="text"
            value={text}
            placeholder={t.qrcode.textPlaceholder}
            onChange={(e) => setText(e.target.value)}
          />
        </Field>
        <Field label={t.qrcode.size}>
          <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
            {[256, 512, 768, 1024].map((n) => (
              <option key={n} value={n}>
                {n} × {n}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {error && <p className="error">⚠️ {error}</p>}
      {!text.trim() && <p className="imgbox-empty">{t.qrcode.errEmpty}</p>}
      <div className="imgbox-preview">
        <canvas ref={canvasRef} className="imgbox-qr-canvas" />
      </div>
      <div className="imgbox-actions">
        <button
          type="button"
          className="btn primary"
          disabled={!ready}
          onClick={() => void download()}
        >
          ⬇ {t.qrcode.downloadPng}
        </button>
      </div>
    </div>
  );
}
