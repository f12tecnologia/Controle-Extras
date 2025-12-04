import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Lock, KeyRound } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, isPasswordRecovery, updateUserPassword, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isPasswordRecovery) {
      toast({
        variant: "destructive",
        title: "Token Inválido",
        description: "O link de recuperação de senha é inválido ou expirou.",
      });
      navigate('/login');
    }
  }, [authLoading, isPasswordRecovery, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "As senhas não coincidem",
        description: "Por favor, verifique e tente novamente.",
      });
      return;
    }
    setLoading(true);
    const { error } = await updateUserPassword(password);
    if (!error) {
      navigate('/login');
    }
    setLoading(false);
  };

  if (authLoading || !isPasswordRecovery) {
    return <div className="flex items-center justify-center min-h-screen text-white">Verificando token...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-effect border-white/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl gradient-text">Redefinir Senha</CardTitle>
            <CardDescription className="text-gray-300">
              Olá, {user?.email}! Defina sua nova senha abaixo.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 input-glow bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 input-glow bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? 'Salvando...' : 'Salvar Nova Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;