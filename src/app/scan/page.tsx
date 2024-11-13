'use client';

import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

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
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  const handleScan = async (serialNumber: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/passes/${serialNumber}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      if (response.ok && data.data) {
        setResult(`¡Visita registrada! ${data.data.name} tiene ${data.data.visits} visitas. 
                  ${data.data.visits >= 5 ? `¡Ha ganado: ${data.data.nextReward}!` : ''}`);
        if (scanner) {
          scanner.pause();
        }
      } else {
        setError(data.message || 'Error al registrar la visita');
      }
    } catch (err) {
      setError('Error al procesar el código QR');
    }
  };

  const startScanning = () => {
    setScanning(true);
    setError(null);
    setResult(null);

    const qrScanner = new Html5QrcodeScanner(
      "reader", 
      { 
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        rememberLastUsedCamera: true
      },
      false
    );

    qrScanner.render(
      (decodedText) => {
        handleScan(decodedText);
      },
      (errorMessage) => {
        // Ignoramos errores menores de escaneo
        if (errorMessage.includes('No QR code found')) {
          return;
        }
        setError(errorMessage);
      }
    );

    setScanner(qrScanner);
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-[rgb(132,149,105)] p-8">
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
                if (scanner) {
                  scanner.resume();
                }
              }} 
              className="absolute top-2 right-2 font-bold"
            >
              ×
            </button>
          </div>
        )}

        <button
          onClick={() => {
            if (scanning) {
              stopScanning();
            } else {
              startScanning();
            }
          }}
          className="w-full bg-[rgb(132,149,105)] text-[rgb(239,233,221)] py-2 px-4 rounded-md hover:opacity-90 transition-opacity mb-4 flex items-center justify-center"
        >
          {scanning ? 'Detener Escáner' : 'Iniciar Escáner'}
          <Camera className="ml-2" size={20} />
        </button>

        <div id="reader" className="rounded-lg overflow-hidden" />

        {scanning && (
          <p className="text-sm text-gray-500 text-center mt-4">
            Posiciona el código QR del pase dentro del cuadro de escaneo
          </p>
        )}
      </div>
    </div>
  );
}