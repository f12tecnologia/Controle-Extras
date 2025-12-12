
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { replitDb } from '@/lib/replitDbClient';
import { useToast } from '@/components/ui/use-toast';
import bcrypt from 'bcryptjs';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    // Check for existing session in localStorage
    const checkSession = async () => {
      const sessionData = localStorage.getItem('replit_auth_session');
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);
          const user = await replitDb.getUser(parsed.email);
          if (user) {
            setUser(user);
            setSession(parsed);
          } else {
            localStorage.removeItem('replit_auth_session');
          }
        } catch (error) {
          localStorage.removeItem('replit_auth_session');
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const signUp = useCallback(async (email, password, options) => {
    try {
      // Check if user already exists
      const existingUser = await replitDb.getUser(email);
      if (existingUser) {
        const error = { message: 'Este e-mail já está cadastrado.' };
        toast({
          variant: "destructive",
          title: "Falha no cadastro",
          description: error.message,
        });
        return { error };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const userData = {
        email,
        password: hashedPassword,
        name: options?.data?.name || '',
        role: options?.data?.role || 'lançador',
        setor: options?.data?.setor || '',
        authorizedCompanyIds: options?.data?.authorizedCompanyIds || [],
      };

      const newUser = await replitDb.createUser(userData);
      
      toast({
        title: "Cadastro realizado!",
        description: "Usuário criado com sucesso.",
      });

      return { error: null, user: newUser };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha no cadastro",
        description: error.message || 'Ocorreu um erro inesperado.',
      });
      return { error };
    }
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    try {
      const user = await replitDb.getUser(email);
      
      if (!user) {
        const error = { message: 'Email ou senha inválidos.' };
        toast({
          variant: "destructive",
          title: "Falha no login",
          description: error.message,
        });
        return { error };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        const error = { message: 'Email ou senha inválidos.' };
        toast({
          variant: "destructive",
          title: "Falha no login",
          description: error.message,
        });
        return { error };
      }

      // Create session
      const sessionData = {
        email: user.email,
        userId: user.id,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem('replit_auth_session', JSON.stringify(sessionData));
      setUser(user);
      setSession(sessionData);

      return { error: null };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha no login",
        description: error.message || 'Ocorreu um erro inesperado.',
      });
      return { error };
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    localStorage.removeItem('replit_auth_session');
    setUser(null);
    setSession(null);
    return { error: null };
  }, []);

  const sendPasswordResetEmail = useCallback(async (email) => {
    try {
      const user = await replitDb.getUser(email);
      
      if (!user) {
        const error = { message: 'E-mail não encontrado.' };
        toast({
          variant: "destructive",
          title: "Falha ao enviar e-mail",
          description: error.message,
        });
        return { error };
      }

      // In a real implementation, you would send an email here
      // For now, we'll just set a recovery token in localStorage
      const recoveryToken = btoa(`${email}:${Date.now()}`);
      localStorage.setItem('password_recovery_token', recoveryToken);
      localStorage.setItem('password_recovery_email', email);
      
      setIsPasswordRecovery(true);

      toast({
        title: "Token de recuperação gerado!",
        description: "Use a página de redefinição de senha para continuar.",
      });

      return { error: null };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao enviar e-mail",
        description: error.message || 'Ocorreu um erro inesperado.',
      });
      return { error };
    }
  }, [toast]);

  const updateUserPassword = useCallback(async (newPassword) => {
    try {
      const recoveryEmail = localStorage.getItem('password_recovery_email');
      
      if (!recoveryEmail) {
        const error = { message: 'Token de recuperação inválido.' };
        toast({
          variant: "destructive",
          title: "Falha ao atualizar senha",
          description: error.message,
        });
        return { error };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await replitDb.updateUser(recoveryEmail, { password: hashedPassword });

      localStorage.removeItem('password_recovery_token');
      localStorage.removeItem('password_recovery_email');
      setIsPasswordRecovery(false);

      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso.",
      });

      return { error: null };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao atualizar senha",
        description: error.message || 'Ocorreu um erro inesperado.',
      });
      return { error };
    }
  }, [toast]);

  const changeUserPassword = useCallback(async (oldPassword, newPassword) => {
    try {
      if (!user) {
        const error = { message: "Sessão inválida. Faça login novamente." };
        toast({ variant: "destructive", title: "Erro", description: error.message });
        return { error };
      }

      // Verify old password
      const isValidPassword = await bcrypt.compare(oldPassword, user.password);
      
      if (!isValidPassword) {
        const error = { message: "Senha atual incorreta." };
        toast({ variant: "destructive", title: "Falha na Autenticação", description: error.message });
        return { error };
      }

      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await replitDb.updateUser(user.email, { password: hashedPassword });
      setUser(updatedUser);

      toast({
        title: "Senha alterada!",
        description: "Sua senha foi atualizada com sucesso.",
      });

      return { error: null };
    } catch (error) {
      toast({ variant: "destructive", title: "Falha ao Salvar", description: error.message });
      return { error };
    }
  }, [user, toast]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    isPasswordRecovery,
    signUp,
    signIn,
    signOut,
    sendPasswordResetEmail,
    updateUserPassword,
    changeUserPassword,
  }), [user, session, loading, isPasswordRecovery, signUp, signIn, signOut, sendPasswordResetEmail, updateUserPassword, changeUserPassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
