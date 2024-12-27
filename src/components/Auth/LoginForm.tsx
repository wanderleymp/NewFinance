import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { LoginInput } from './LoginInput';
import { Logo } from '../Logo';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    identifier: '',
    password: '',
  });

  const validateForm = (): boolean => {
    const newErrors = {
      identifier: '',
      password: '',
    };

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Digite seu username ou email';
    }

    if (!formData.password) {
      newErrors.password = 'Digite sua senha';
    } else if (formData.password.length < 4) {
      newErrors.password = 'A senha deve ter pelo menos 4 caracteres';
    }

    setErrors(newErrors);
    return !newErrors.identifier && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(formData.identifier, formData.password);
    } catch (error) {
      // Error is already handled by the login function
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast('Funcionalidade em desenvolvimento', {
      icon: '🔨',
    });
  };

  const handleCreateAccount = () => {
    toast('Funcionalidade em desenvolvimento', {
      icon: '🔨',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Acesse sua conta
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <LoginInput
              label="Username ou Email"
              id="identifier"
              name="identifier"
              type="text"
              value={formData.identifier}
              error={errors.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              placeholder="Digite seu username ou email"
            />

            <LoginInput
              label="Senha"
              id="password"
              name="password"
              type="password"
              value={formData.password}
              error={errors.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Digite sua senha"
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Esqueceu sua senha?
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleCreateAccount}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Criar nova conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};