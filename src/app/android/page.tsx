'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';

interface FormData {
  name: string;
  email: string;
  phone: string;
}

interface GooglePassData {
  saveUrl: string;
  clientId: string;
  serialNumber: string;
}

export default function AndroidPassPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: ''
  });
  const [passData, setPassData] = useState<GooglePassData | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQrCode(null);

    try {
      const clientResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const clientData = await clientResponse.json();
      if (!clientResponse.ok) throw new Error(clientData.message);
      
      const passResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/passes/${clientData.data._id}/google`
      );
      
      const passData = await passResponse.json();
      if (!passResponse.ok) throw new Error(passData.message);

      setPassData(passData.data);
      
      // Generar código QR para la URL de Google Wallet
      const qrCodeDataUrl = await QRCode.toDataURL(passData.data.saveUrl);
      setQrCode(qrCodeDataUrl);
      
      setFormData({ name: '', email: '', phone: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el pase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[rgb(238,232,220)] p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Pases Android</h1>
          <div className="flex gap-4">
            <Link 
              href="/dashboard" 
              className="text-[rgb(132,149,105)] hover:underline"
            >
              Dashboard
            </Link>
            <Link 
              href="/" 
              className="text-[rgb(132,149,105)] hover:underline"
            >
              iOS
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[rgb(132,149,105)] text-white py-2 px-4 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Generando...' : 'Generar Pase Android'}
          </button>
        </form>

        {passData && qrCode && (
          <div className="mt-6 text-center space-y-4">
            <h2 className="text-lg font-semibold mb-4">¡Pase generado!</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">
                La clienta puede escanear este código QR con su teléfono para añadir el pase a Google Wallet:
              </p>
              <img
                src={qrCode}
                alt="QR Code para Google Wallet"
                className="mx-auto"
                width={200}
                height={200}
              />
            </div>

            <p className="text-sm text-gray-500">
              O usar directamente el botón:
            </p>
            <a
              href={passData.saveUrl}
              className="inline-block bg-[rgb(132,149,105)] text-white py-2 px-4 rounded-md hover:opacity-90 transition-opacity"
              target="_blank"
              rel="noopener noreferrer"
            >
              Añadir a Google Wallet
            </a>
          </div>
        )}
      </div>

      <p className="text-xs text-[rgb(132,149,105)] mt-4 text-center italic">
        Desarrollado por Julio T. para el amor de su vida ❤️
      </p>
    </main>
  );
}