import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8070/api';

function DataPreview({ title, endpoint }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${API_BASE_URL}/data/${endpoint}`);
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: No se pudieron cargar los datos.`);
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [endpoint]);

    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    return (
        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            {loading && <p className="text-gray-500">Cargando datos...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && data.length === 0 && (
                <p className="text-gray-500">No hay datos para mostrar.</p>
            )}
            {!loading && !error && data.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                {headers.map(header => (
                                    <th key={header} scope="col" className="px-4 py-3">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rowIndex) => (
                                <tr key={rowIndex} className="bg-white border-b hover:bg-gray-50">
                                    {headers.map(header => (
                                        <td key={`${rowIndex}-${header}`} className="px-4 py-3 font-mono">
                                            {
                                                // Truncar datos largos como el campo JSON
                                                typeof row[header] === 'string' && row[header].length > 50
                                                    ? `${row[header].substring(0, 50)}...`
                                                    : String(row[header] ?? 'N/A')
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default DataPreview;