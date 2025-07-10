"use client";

import Swal from 'sweetalert2';
import React, { useState } from 'react';
import { Mail, Lock, Key, Send, LogIn } from 'lucide-react';

interface FormData {
  correo: string;
  password: string;
  codigo: string;
}

interface FormErrors {
  correo?: string;
  password?: string;
  codigo?: string;
}

export default function LoginInterface() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    
    const [errors, setErrors] = useState<FormErrors>({});
    const [formData, setFormData] = useState<FormData>({
        correo: '',
        password: '',
        codigo: ''
    });

    const validateEmail = (email:string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (step === 1) {

            if (!formData.correo.trim()) {
                newErrors.correo = 'El correo es requerido';
            } else if (!validateEmail(formData.correo)) {
                newErrors.correo = 'Ingrese un correo válido';
            }

        } else {

            if (!formData.correo.trim()) {
                newErrors.correo = 'El correo es requerido';
            } else if (!validateEmail(formData.correo)) {
                newErrors.correo = 'Ingrese un correo válido';
            }
            
            if (!formData.password.trim()) {
                newErrors.password = 'La contraseña es requerida';
            } else if (formData.password.length < 6) {
                newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
            }
            
            if (!formData.codigo.trim()) {
                newErrors.codigo = 'El código es requerido';
            }

        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }

    };

    const handleSolicitarCodigo = async () => {
        if (!validateForm()) return;
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/enviar-codigo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: formData.correo })
            });

            const data = await response.json();

            if (!response.ok) {
            
                if (data.message?.toLowerCase().includes("correo")) {
                    setErrors({ correo: data.message });
                } else {
                    Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Error al enviar el código'
                    });
                }
                return;
            }

            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: data.message || "Código enviado correctamente",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });

            setStep(2);

        } catch {

            Swal.fire({
                icon: 'error',
                title: 'Error al enviar el código',
                text: 'No se pudo conectar con el servidor'
            });

        } finally {
            setIsLoading(false);
        }

    };

    const handleLogin = async () => {
        if (!validateForm()) return;
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    correo: formData.correo,
                    password: formData.password,
                    codigo: formData.codigo
                })
            });

            const data = await response.json();
            if (!response.ok) {
                const msg = data.message?.toLowerCase() || "";

                if (msg.includes("correo")) {
                    setErrors(prev => ({ ...prev, correo: data.message }));
                } else if (msg.includes("contraseña")) {
                    setErrors(prev => ({ ...prev, password: data.message }));
                } else if (msg.includes("código")) {
                    setErrors(prev => ({ ...prev, codigo: data.message }));
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de autenticación',
                        text: data.message || 'Error al iniciar sesión'
                    });
                }

                return;
            }

            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: data.message || 'Inicio de sesión exitoso',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });

            setTimeout(() => {
                window.location.href = '/';
            }, 2000);

        } catch {

            Swal.fire({
                icon: 'error',
                title: 'Error al iniciar sesión',
                text: 'No se pudo conectar con el servidor'
            });

        } finally {
            setIsLoading(false);
        }

    };


    const handleVolver = () => {
        setStep(1);
        setFormData(prev => ({
            ...prev,
            password: '',
            codigo: ''
        }));

        setErrors({});
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <div className="text-center mb-8">

            <h1 className="text-2xl font-bold text-gray-900">Inicio de Sesión</h1>
            <p className="text-gray-600 mt-2">
                {step === 1 ? 'Ingresa tu correo para recibir el código' : 'Completa tu información para ingresar'}
            </p>
            </div>

            {step === 1 ? (
            <div className="space-y-6">
                <div>
                <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="email"
                        id="correo"
                        name="correo"
                        value={formData.correo}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                            errors.correo ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="correo@gmail.com"
                        disabled={isLoading}
                    />
                </div>
                {errors.correo && (
                    <p className="mt-1 text-sm text-red-600">{errors.correo}</p>
                )}
                </div>

                <button
                    onClick={handleSolicitarCodigo}
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                        <Send className="w-5 h-5" />
                        Solicitar Código
                        </>
                    )}
                </button>
            </div>
            ) : (
            <div className="space-y-6">
                <div>
                <label htmlFor="correo-step2" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="email"
                        id="correo-step2"
                        name="correo"
                        value={formData.correo}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                            errors.correo ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="tu@ejemplo.com"
                        disabled={isLoading}
                    />
                </div>
                {errors.correo && (
                    <p className="mt-1 text-sm text-red-600">{errors.correo}</p>
                )}
                </div>

                <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                            errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                        disabled={isLoading}
                    />
                </div>
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                </div>

                <div>
                <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Verificación
                </label>
                <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        id="codigo"
                        name="codigo"
                        value={formData.codigo}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                            errors.codigo ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ingresa el código recibido"
                        disabled={isLoading}
                    />
                </div>
                {errors.codigo && (
                    <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
                )}
                </div>

                <div className="space-y-3">
                <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                    <>
                        <LogIn className="w-5 h-5" />
                        Ingresar
                    </>
                    )}
                </button>

                <button
                    onClick={handleVolver}
                    disabled={isLoading}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Volver
                </button>
                </div>
            </div>
            )}
        </div>
        </div>
    );
}
