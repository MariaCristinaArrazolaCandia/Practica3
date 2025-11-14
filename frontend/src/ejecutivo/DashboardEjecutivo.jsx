import React from 'react';
import UploadManager from '../operativo/UploadManager';
import DataPreview from './DataPreview';

function DashboardEjecutivo({ user, onLogout, setView }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Dashboard Ejecutivo
                        </h1>
                        <p className="text-sm text-gray-500">Monitoreo Estratégico GAMC</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-800">{user?.fullName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <button
                            onClick={onLogout}
                            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0 space-y-8">
                        {/* Sección Superior: Carga y Gestión */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <UploadManager />
                            <div className="p-8 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col justify-center">
                                <h2 className="text-xl font-semibold text-gray-800">Administración</h2>
                                <p className="mt-2 text-gray-600">Gestione los roles y accesos de los usuarios del sistema.</p>
                                <button onClick={() => setView('user_management')} className="mt-4 w-fit inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
                                    <span className="mr-2">👥</span>
                                    Gestionar Usuarios
                                </button>
                            </div>
                        </div>
                        {/* Sección Inferior: Vista Previa de Datos */}
                        <div className="space-y-6">
                            <DataPreview title="Últimos Registros de Calidad de Aire" endpoint="air-quality" />
                            <DataPreview title="Últimos Registros de Sonido" endpoint="sound" />
                            <DataPreview title="Últimos Registros de Sensores Soterrados" endpoint="buried" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DashboardEjecutivo;