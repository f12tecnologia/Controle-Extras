import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

// Helper to provide more specific error messages
const processAuthError = (error) => {
  if (!error || !error.message) {
    return 'Ocorreu um erro inesperado.';
  }
  const msg = error.message.toLowerCase();
  if (msg.includes('fetch') || msg.includes('network')) {
    return 'Falha de rede. Verifique sua conexão e as configurações no Supabase.';
  }
  if (msg.includes('invalid login credentials')) {
    return 'Email ou senha inválidos.';
  }
  if (msg.includes('user already registered')) {
    return 'Este e-mail já está cadastrado.';
  }
  if (msg.includes('password should be at least 6 characters')) {
    return 'A senha deve ter no mínimo 6 caracteres.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.';
  }
  if (msg.includes('jwt expired')) {
    return 'Sua sessão expirou. Por favor, faça login novamente.';
  }
  return error.message;
}

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        } else {
          setIsPasswordRecovery(false);
        }
        handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Falha no cadastro",
        description: processAuthError(error),
      });
    }

    return { error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Falha no login",
        description: processAuthError(error),
      });
    }

    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Falha ao sair",
        description: processAuthError(error),
      });
    }

    return { error };
  }, [toast]);

  const sendPasswordResetEmail = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      toast({
        variant: "destructive",
        title: "Falha ao enviar e-mail",
        description: processAuthError(error),
      });
    } else {
      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    }

    return { error };
  }, [toast]);

  const updateUserPassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({
        variant: "destructive",
        title: "Falha ao atualizar senha",
        description: processAuthError(error),
      });
    } else {
      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso.",
      });
    }

    return { error };
  }, [toast]);

  const changeUserPassword = useCallback(async (oldPassword, newPassword) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      const error = { message: "Sessão inválida. Faça login novamente." };
      toast({ variant: "destructive", title: "Erro", description: error.message });
      return { error };
    }

    const { error: reauthError } = await supabase.auth.reauthenticate();
    if (reauthError) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: oldPassword,
        });

        if (signInError) {
            const processedError = String(signInError.message).toLowerCase().includes("invalid login credentials")
                ? "Senha atual incorreta."
                : processAuthError(signInError);
            toast({ variant: "destructive", title: "Falha na Autenticação", description: processedError });
            return { error: new Error(processedError) };
        }
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
        toast({ variant: "destructive", title: "Falha ao Salvar", description: processAuthError(updateError) });
        return { error: updateError };
    }

    return { error: null };
  }, [toast]);


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