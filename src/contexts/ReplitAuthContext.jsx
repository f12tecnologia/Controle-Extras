import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import bcrypt from 'bcryptjs';

const AuthContext = createContext(undefined);

// Determine API URL based on environment
const API_URL = import.meta.env.DEV ? 'http://localhost:3001' : '';

const processAuthError = (error) => {
  if (!error || !error.message) {
    return 'Ocorreu um erro inesperado.';
  }
  const msg = error.message.toLowerCase();
  if (msg.includes('fetch') || msg.includes('network')) {
    return 'Falha de rede. Verifique sua conexão.';
  }
  if (msg.includes('invalid login credentials') || msg.includes('email ou senha inválidos')) {
    return 'Email ou senha inválidos.';
  }
  if (msg.includes('user already exists')) {
    return 'Este e-mail já está cadastrado.';
  }
  if (msg.includes('password should be at least 6 characters')) {
    return 'A senha deve ter no mínimo 6 caracteres.';
  }
  return error.message;
}

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setSession({ user: userData });
        } catch (error) {
          console.error('Error loading user from localStorage:', error);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const signIn = useCallback(async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${encodeURIComponent(email)}`);

      if (!response.ok) {
        throw new Error('Email ou senha inválidos.');
      }

      const userData = await response.json();

      if (!userData) {
        throw new Error('Email ou senha inválidos.');
      }

      const isPasswordValid = await bcrypt.compare(password, userData.password);

      if (!isPasswordValid) {
        throw new Error('Email ou senha inválidos.');
      }

      // Store user data in state and localStorage
      const userSession = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        setor: userData.setor,
        authorized_company_ids: userData.authorized_company_ids
      };

      setUser(userSession);
      setSession({ user: userSession });
      localStorage.setItem('user', JSON.stringify(userSession));

      return { error: null };
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Falha no login",
        description: processAuthError(error),
      });
      return { error };
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem('user');
    return { error: null };
  }, []);

  const signUp = useCallback(async (email, password, options) => {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: options?.data?.name || 'Usuário',
          role: options?.data?.role || 'funcionario',
          setor: options?.data?.setor || null,
          authorizedCompanyIds: options?.data?.authorizedCompanyIds || []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar usuário');
      }

      return { error: null };
    } catch (error) {
      console.error('SignUp error:', error);
      toast({
        variant: "destructive",
        title: "Falha no cadastro",
        description: processAuthError(error),
      });
      return { error };
    }
  }, [toast]);

  const sendPasswordResetEmail = useCallback(async (email) => {
    toast({
      title: "Funcionalidade indisponível",
      description: "A redefinição de senha está temporariamente indisponível. Entre em contato com o administrador.",
    });
    return { error: null };
  }, [toast]);

  const updateUserPassword = useCallback(async (newPassword) => {
    toast({
      title: "Funcionalidade indisponível",
      description: "A alteração de senha está temporariamente indisponível. Entre em contato com o administrador.",
    });
    return { error: null };
  }, [toast]);

  const changeUserPassword = useCallback(async (oldPassword, newPassword) => {
    if (!user || !user.email) {
      const error = { message: "Sessão inválida. Faça login novamente." };
      toast({ variant: "destructive", title: "Erro", description: error.message });
      return { error };
    }

    try {
      // Verify old password
      const response = await fetch(`${API_URL}/api/users/${encodeURIComponent(user.email)}`);
      if (!response.ok) {
        throw new Error('Erro ao verificar senha atual');
      }

      const userData = await response.json();
      const isPasswordValid = await bcrypt.compare(oldPassword, userData.password);

      if (!isPasswordValid) {
        throw new Error('Senha atual incorreta.');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      const updateResponse = await fetch(`${API_URL}/api/users/${encodeURIComponent(user.email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          password: hashedPassword
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Erro ao atualizar senha');
      }

      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso.",
      });

      return { error: null };
    } catch (error) {
      console.error('Change password error:', error);
      toast({
        variant: "destructive",
        title: "Falha ao alterar senha",
        description: processAuthError(error),
      });
      return { error };
    }
  }, [user, toast]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    isPasswordRecovery: false,
    signUp,
    signIn,
    signOut,
    sendPasswordResetEmail,
    updateUserPassword,
    changeUserPassword,
  }), [user, session, loading, signUp, signIn, signOut, sendPasswordResetEmail, updateUserPassword, changeUserPassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};