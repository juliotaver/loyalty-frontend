'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface ScanResponse {
  success: boolean;
  data?: {
    visits: number;
    name: string;
    nextReward: string;
  };
  message?: string;
}

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const html5QrCode = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const lastScannedRef = useRef<string>('');
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (html5QrCode.current) {
        html5QrCode.current.stop().catch((err) => console.log("Error deteniendo escáner:", err));
      }
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  const handleScan = async (serialNumber: string) => {
    try {
      if (processingRef.current || serialNumber === lastScannedRef.current) {
        return;
      }

      processingRef.current = true;
      lastScannedRef.current = serialNumber;
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/passes/${serialNumber}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data: ScanResponse = await response.json();
      
      if (response.ok && data.data) {
        setResult(`¡Visita registrada! ${data.data.name} tiene ${data.data.visits} visitas. 
                  ${data.data.visits >= 5 ? `¡Ha ganado: ${data.data.nextReward}!` : ''}`);
        
        // Parar el escáner después de un escaneo exitoso
        await html5QrCode.current?.stop();
        setScanning(false);
      } else {
        setError(data.message || 'Error al registrar la visita');
      }
    } catch (err) {
      setError('Error al procesar el código QR');
      console.error('Error completo:', err);
    } finally {
      setLoading(false);
      scanTimeoutRef.current = setTimeout(() => {
        processingRef.current = false;
        lastScannedRef.current = '';
      }, 3000);
    }
  };

  const startScanning = () => {
    setScanning(true);
    setError(null);
    setResult(null);
    processingRef.current = false;
    lastScannedRef.current = '';

    if (html5QrCode.current) {
      html5QrCode.current.clear();
    }

    html5QrCode.current = new Html5Qrcode("reader");
    html5QrCode.current.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      (decodedText) => handleScan(decodedText),
      (errorMessage) => {
        if (!errorMessage.includes("No QR code found")) {
          setError("Error al escanear");
        }
      }
    );
  };

  const stopScanning = () => {
    html5QrCode.current?.stop().then(() => {
      html5QrCode.current?.clear();
      setScanning(false);
    });
  };

  return (
    <div className="min-h-screen bg-[rgb(238,232,220)] p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Escanear Pase</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
            <span className="block pr-8">{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="absolute top-2 right-2 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {result && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 relative">
            <span className="block pr-8">{result}</span>
            <button 
              onClick={() => {
                setResult(null);
                startScanning();
              }} 
              className="absolute top-2 right-2 font-bold"
            >
              ×
            </button>
          </div>
        )}

        <button
          onClick={() => scanning ? stopScanning() : startScanning()}
          className="w-full bg-[rgb(238,232,220)] text-[rgb(239,233,221)] py-2 px-4 rounded-md hover:opacity-90 transition-opacity mb-4 flex items-center justify-center"
          disabled={loading}
        >
          {scanning ? 'Detener Escáner' : 'Iniciar Escáner'}
          <Camera className="ml-2" size={20} />
        </button>

        <div id="reader" className="rounded-lg overflow-hidden" />

        {scanning && !loading && (
          <p className="text-sm text-gray-500 text-center mt-4">
            Posiciona el código QR del pase dentro del cuadro de escaneo
          </p>
        )}

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(238,232,220))] mx-auto"></div>
            <p className="text-gray-600 mt-2">Procesando escaneo...</p>
          </div>
        )}
      </div>
    </div>
  );
}