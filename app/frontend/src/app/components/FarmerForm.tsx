'use client';

import { useState, useEffect } from 'react';
import { Farmer, createFarmer, updateFarmer, getFarmerById } from '../services/farmer.service';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FarmerFormProps {
  farmerId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData extends Omit<Farmer, '_id' | 'active' | 'createdAt' | 'updatedAt' | 'birthDate'> {
  birthDate: string;
}

export default function FarmerForm({ farmerId, onSuccess, onCancel }: FarmerFormProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    cpf: '',
    birthDate: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Load farmer data if in edit mode
  useEffect(() => {
    if (farmerId) {
      const loadFarmer = async () => {
        try {
          setLoading(true);
          const farmer = await getFarmerById(farmerId);
          setFormData({
            fullName: farmer.fullName,
            cpf: farmer.cpf,
            birthDate: farmer.birthDate ? format(parseISO(farmer.birthDate), 'yyyy-MM-dd') : '',
            phone: farmer.phone || '',
          });
          setIsEditing(true);
        } catch (err) {
          const error = err as Error;
          toast.error(error.message || 'Erro ao carregar dados do agricultor');
        } finally {
          setLoading(false);
        }
      };
      
      loadFarmer();
    }
  }, [farmerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatCPF = (cpf: string) => {
    return cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatCPF(value);
    setFormData((prev) => ({
      ...prev,
      cpf: formattedValue,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    // Skip CPF validation in edit mode since it's disabled and can't be changed
    if (!isEditing) {
      if (!formData.cpf) {
        newErrors.cpf = 'CPF é obrigatório';
      } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
        newErrors.cpf = 'CPF inválido';
      }
    }

    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();

      if (birthDate > today) {
        newErrors.birthDate = 'Data de nascimento não pode ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isEditing && farmerId) {
        // Remove CPF from update data as it shouldn't be changed
        const { cpf, ...updateData } = formData;
        await updateFarmer(farmerId, updateData);
        toast.success('Agricultor atualizado com sucesso!');
      } else {
        await createFarmer(formData);
        toast.success('Agricultor cadastrado com sucesso!');
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Ocorreu um erro ao salvar o agricultor');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {isEditing ? 'Editar Agricultor' : 'Cadastrar Novo Agricultor'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${isEditing ? 'md:col-span-2' : ''}`}>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md ${errors.fullName ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              disabled={loading}
              required
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          <div className={isEditing ? 'opacity-50 cursor-not-allowed' : ''}>
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CPF *
            </label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleCPFChange}
              maxLength={14}
              placeholder="000.000.000-00"
              className={`mt-1 block w-full rounded-md ${errors.cpf ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              disabled={loading || isEditing}
              required
            />
            {errors.cpf && (
              <p className="mt-1 text-sm text-red-600">{errors.cpf}</p>
            )}
            {isEditing && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">CPF não pode ser alterado após o cadastro.</p>
            )}
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data de Nascimento
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md ${errors.birthDate ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              disabled={loading}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.birthDate && (
              <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Atualizando...' : 'Salvando...'}
              </span>
            ) : isEditing ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  );
}
