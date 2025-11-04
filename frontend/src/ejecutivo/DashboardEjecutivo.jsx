import React from 'react';

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
                    <div className="px-4 py-6 sm:px-0">
                        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8 bg-white">
                            <h2 className="text-xl font-semibold text-gray-800">Indicadores Clave de Rendimiento (KPIs)</h2>
                            <p className="mt-2 text-gray-600">
                                Aquí se mostrarían gráficos y métricas de alto nivel para la toma de decisiones.
                            </p>
                            <div className="mt-8">
                                <button
                                    onClick={() => setView('user_management')}
                                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150"
                                >
                                    <span className="mr-2">👥</span>
                                    Gestion de Usuarios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DashboardEjecutivo;