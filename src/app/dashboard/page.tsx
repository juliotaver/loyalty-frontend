'use client';

import React, { useState, useEffect } from 'react';
import { Search, Star, Award, Calendar, Users } from 'lucide-react';

interface Cliente {
  _id: string;
  name: string;
  email: string;
  phone: string;
  visits: number;
  lastVisit: string;
  passSerialNumber: string;
}

export default function DashboardPage() {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clients`);
      const data = await response.json();
      if (response.ok) {
        setClients(data.data);
      } else {
        setError(data.message || 'Error al cargar clientes');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const getNextReward = (visits: number) => {
    if (visits < 5) return "Postre gratis";
    if (visits < 10) return "Bebida gratis";
    if (visits < 15) return "Gel liso en manos";
    if (visits < 20) return "Gel liso en pies";
    return "10% descuento en uñas";
  };

  const getVisitsUntilNextReward = (visits: number) => {
    const nextMilestone = Math.ceil(visits / 5) * 5;
    return nextMilestone - visits;
  };

  const formatLastVisit = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[rgb(239,233,221)] p-4 md:p-8">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Clientas</p>
              <p className="text-2xl font-bold text-[rgb(132,149,105)]">{clients.length}</p>
            </div>
            <Users className="h-8 w-8 text-[rgb(132,149,105)]" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Visitas Hoy</p>
              <p className="text-2xl font-bold text-[rgb(132,149,105)]">
                {clients.filter(c => 
                  new Date(c.lastVisit).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-[rgb(132,149,105)]" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Clientas Frecuentes</p>
              <p className="text-2xl font-bold text-[rgb(132,149,105)]">
                {clients.filter(c => c.visits >= 10).length}
              </p>
            </div>
            <Star className="h-8 w-8 text-[rgb(132,149,105)]" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Recompensas Ganadas</p>
              <p className="text-2xl font-bold text-[rgb(132,149,105)]">
                {clients.reduce((acc, c) => acc + Math.floor(c.visits / 5), 0)}
              </p>
            </div>
            <Award className="h-8 w-8 text-[rgb(132,149,105)]" />
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-xl shadow p-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o teléfono..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(132,149,105)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Clientas */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[rgb(132,149,105)] text-white">
              <tr>
                <th className="px-6 py-3 text-left">Nombre</th>
                <th className="px-6 py-3 text-left">Contacto</th>
                <th className="px-6 py-3 text-center">Visitas</th>
                <th className="px-6 py-3 text-center">Próxima Recompensa</th>
                <th className="px-6 py-3 text-center">Última Visita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium">{client.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{client.email}</p>
                    <p className="text-sm text-gray-600">{client.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {client.visits} visitas
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm text-gray-600">
                      {getNextReward(client.visits)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Faltan {getVisitsUntilNextReward(client.visits)} visitas
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm text-gray-600">
                      {formatLastVisit(client.lastVisit)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
}