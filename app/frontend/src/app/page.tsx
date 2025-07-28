'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importação dinâmica para melhor performance
const FarmerForm = dynamic(() => import('./components/FarmerForm'), { 
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
});

const FarmersList = dynamic(() => import('./components/FarmersList'), { 
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
});

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Verifica se há um ID de edição na URL
  useEffect(() => {
    const editParam = searchParams.get('edit');
    if (editParam) {
      setEditId(editParam);
      setShowForm(true);
    } else {
      setEditId(null);
      setShowForm(false);
    }
  }, [searchParams]);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setShowForm(false);
    setEditId(null);
    // Remove o parâmetro de edição da URL
    router.push('/', { scroll: false });
    toast.success(editId ? 'Agricultor atualizado com sucesso!' : 'Agricultor cadastrado com sucesso!');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    // Remove o parâmetro de edição da URL
    router.push('/', { scroll: false });
  };

  const handleAddFarmer = () => {
    setShowForm(true);
    setEditId(null);
    router.push('/', { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {editId ? 'Editar Agricultor' : 'Sistema de Gestão de Agricultores'}
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {showForm ? (
          <div className="mb-6">
            <FarmerForm 
              farmerId={editId || undefined} 
              onSuccess={handleSuccess} 
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Lista de Agricultores
              </h2>
              <button
                onClick={handleAddFarmer}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                Novo Agricultor
              </button>
            </div>
            <FarmersList key={refreshKey} onAddFarmer={handleAddFarmer} />
          </div>
        )}
      </main>
    </div>
  );
}
