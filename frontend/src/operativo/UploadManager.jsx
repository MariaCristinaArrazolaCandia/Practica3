import React, { useState, useEffect, useCallback } from 'react';

// URLs de la API (ajusta el puerto si es necesario)
const API_BASE_URL = 'http://localhost:8070/api';

/**
 * Hook personalizado para consultar periódicamente el estado de una tarea.
 */
const useTaskPolling = (taskId, onTaskCompletion) => {
    const [task, setTask] = useState(null);

    useEffect(() => {
        if (!taskId) {
            setTask(null);
            return;
        }

        setTask({ id: taskId, state: 'PENDING', result: null });

        const intervalId = setInterval(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/task-status/${taskId}`);
                const data = await response.json();

                setTask({ id: taskId, state: data.state, result: data.result });

                if (data.state === 'SUCCESS' || data.state === 'FAILURE') {
                    clearInterval(intervalId);
                    if (onTaskCompletion) {
                        onTaskCompletion(data);
                    }
                }
            } catch (error) {
                console.error('Error al consultar el estado de la tarea:', error);
                setTask(prev => ({ ...prev, state: 'FETCH_ERROR' }));
                clearInterval(intervalId);
            }
        }, 2000); // Consulta cada 2 segundos

        return () => clearInterval(intervalId);
    }, [taskId, onTaskCompletion]);

    return task;
};

/**
 * Componente para gestionar la subida de archivos y mostrar el estado.
 */
function UploadManager() {
    const [file, setFile] = useState(null);
    const [sensorType, setSensorType] = useState('calidad_aire');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [lastTaskId, setLastTaskId] = useState(null);

    const handleTaskCompletion = useCallback((completedTask) => {
        // Aquí podrías usar una librería de notificaciones (ej. react-toastify)
        if (completedTask.state === 'SUCCESS') {
            alert(`Tarea ${completedTask.task_id} completada con éxito!`);
        } else {
            alert(`La tarea ${completedTask.task_id} falló.`);
        }
    }, []);

    const task = useTaskPolling(lastTaskId, handleTaskCompletion);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Por favor, selecciona un archivo.');
            return;
        }

        setUploading(true);
        setError('');
        setLastTaskId(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('sensor_type', sensorType);

        try {
            const response = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                body: formData,
                // No incluyas 'Content-Type', el navegador lo hará por ti con el boundary correcto.
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Error al subir el archivo.');
            }

            setLastTaskId(data.task_id);

        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-8 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Cargar Datos de Sensor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="sensorType" className="block text-sm font-medium text-gray-700">Tipo de Sensor</label>
                    <select id="sensorType" value={sensorType} onChange={(e) => setSensorType(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                        <option value="calidad_aire">Calidad del Aire</option>
                        <option value="sonido">Sonido</option>
                        <option value="soterrado">Soterrado</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700">Archivo CSV</label>
                    <input id="fileUpload" type="file" onChange={handleFileChange} accept=".csv" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                </div>
                <button type="submit" disabled={uploading || !file} className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50">
                    {uploading ? 'Subiendo...' : 'Procesar Archivo'}
                </button>
            </form>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            {task && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold">Estado de la Tarea: <span className="font-mono text-sm bg-gray-100 p-1 rounded">{task.id}</span></h3>
                    <p className="mt-2">Estado: <span className="font-bold">{task.state}</span></p>
                    {task.state === 'SUCCESS' && task.result && (
                        <div className="mt-2 p-2 bg-green-50 border-l-4 border-green-400">
                            <p className="text-sm text-green-800">{task.result.message}</p>
                            <p className="text-sm text-green-800">Datos guardados en la colección: <span className="font-semibold">{task.result.collection}</span></p>
                        </div>
                    )}
                    {task.state === 'FAILURE' && (
                         <div className="mt-2 p-2 bg-red-50 border-l-4 border-red-400">
                            <p className="text-sm text-red-800">La tarea ha fallado.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default UploadManager;