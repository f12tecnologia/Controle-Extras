import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/ReplitAuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { sendPasswordResetEmail } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitted(false);
    const { error } = await sendPasswordResetEmail(email);
    if (!error) {
      setSubmitted(true);
    }
    setLoading(false);
  };

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
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl gradient-text">Recuperar Senha</CardTitle>
            <CardDescription className="text-gray-300">
              {submitted
                ? "Verifique sua caixa de entrada!"
                : "Insira seu e-mail para receber o link de recuperação."}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {submitted ? (
              <div className="text-center text-white">
                <p>Um link para redefinir sua senha foi enviado para <strong>{email}</strong>.</p>
                <p className="mt-4">Se não o encontrar, verifique sua pasta de spam.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 input-glow bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary"
                >
                  {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </Button>
              </form>
            )}
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-300">
                Lembrou da senha?{' '}
                <Link to="/login" className="font-medium text-blue-400 hover:underline">
                  Fazer Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;