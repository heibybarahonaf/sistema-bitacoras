"use client";

import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ISesionPayload } from '../app/common/utils/auth.utils';

export function useAuth() {
    const [user, setUser] = useState<ISesionPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        verificarSesion();
    }, []);

    const verificarSesion = async () => {
      
        try {

            const response = await fetch('/api/auth/verificar-sesion', {
                method: 'GET',
                credentials: 'include',
            });

            const json = await response.json();

            if (!response.ok) {
                throw new Error('Sesión inválida');
            }

            setUser(json.payload);

        } catch {

            await Swal.fire({
                icon: 'warning',
                title: 'Sesión expirada',
                text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
                confirmButtonText: 'Ir a Login',
                allowOutsideClick: false,
            });

            router.replace('/login');

        } finally {
          setLoading(false);
        }

    };

    const logout = async () => {

        try {

            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            setUser(null);
            router.replace('/login');
        }

    };

    return {
        user,
        loading,
        logout,
        isAuthenticated: !!user,
    };

}
