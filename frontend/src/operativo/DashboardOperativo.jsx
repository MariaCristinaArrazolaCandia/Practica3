import React from 'react';
import UploadManager from './UploadManager';

function DashboardOperativo({ user, onLogout }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Dashboard Operativo
                        </h1>
                        <p className="text-sm text-gray-500">Gestión y Monitoreo de Tareas</p>
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
                    <div className="px-4 py-6 sm:px-0">
                        {/* El componente de carga y monitoreo va aquí */}
                        <UploadManager />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DashboardOperativo;