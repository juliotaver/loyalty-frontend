'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface FormData {
  name: string;
  email: string;
  phone: string;
}

interface PassData {
  passUrl: string;
  qrCode: string;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: ''
  });
  const [passData, setPassData] = useState<PassData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!baseUrl) {
        throw new Error('URL del backend no configurada');
      }

      console.log('Enviando petición a:', `${baseUrl}/api/clients`);

      const clientResponse = await fetch(`${baseUrl}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!clientResponse.ok) {
        const errorText = await clientResponse.text();
        console.error('Error response:', errorText);
        throw new Error(`Error del servidor: ${clientResponse.status}`);
      }

      const clientData = await clientResponse.json();
      
      const passResponse = await fetch(
        `${baseUrl}/api/passes/${clientData.data._id}/generate`
      );
      
      if (!passResponse.ok) {
        throw new Error('Error al generar el pase');
      }

      const passData = await passResponse.json();
      setPassData(passData.data);
      setFormData({ name: '', email: '', phone: '' });
    } catch (err) {
      console.error('Error completo:', err);
      setError(err instanceof Error ? err.message : 'Error al generar el pase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[rgb(238,232,220)] p-8">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[rgb(239,233,221)]">Pases de Fidelidad</h1>
          <Link 
            href="/dashboard"
            className="bg-[rgb(239,233,221)] text-[rgb(132,149,105)] px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
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

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className="w-full bg-[rgb(132,149,105)] text-[rgb(239,233,221)] py-2 px-4 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Generando...' : 'Generar Pase iOS'}
              </button>
              
              <Link 
                href="/android"
                className="w-full bg-[rgb(239,233,221)] text-[rgb(132,149,105)] py-2 px-4 rounded-md hover:opacity-90 transition-opacity text-center"
              >
                Generar Pase Android
              </Link>
            </div>
          </form>

          {passData && (
            <div className="mt-6 text-center">
              <h2 className="text-lg font-semibold mb-4">¡Pase generado!</h2>
              <div className="mb-4">
                {passData.qrCode && (
                  <img
                    src={passData.qrCode}
                    alt="QR Code"
                    className="mx-auto"
                    width={200}
                    height={200}
                  />
                )}
              </div>
              <a
                href={passData.passUrl}
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Descargar Pase
              </a>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/scan"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Ir a Escanear Pases
            </Link>
          </div>
        </div>

        <p className="text-xs text-[rgb(239,233,221)] mt-4 text-center italic">
          Desarrollado por Julio T. para el amor de su vida ❤️
        </p>
      </div>
    </main>
  );
}