import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, ShieldCheck, KeyRound } from 'lucide-react';
import ChangePasswordForm from '@/components/Profile/ChangePasswordForm';

const Profile = () => {
  const { user } = useAuth();
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);

  if (!user) {
    return null;
  }

  const userName = user.user_metadata?.name || user.email;
  const userRole = user.user_metadata?.role || 'N/A';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Meu Cadastro</h1>
        <p className="text-gray-300 mt-1">Gerencie suas informações pessoais e de segurança.</p>
      </div>

      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Informações do Perfil</CardTitle>
          <CardDescription className="text-gray-300">
            Estes são seus dados cadastrados na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
            <User className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Nome</p>
              <p className="text-white font-medium">{userName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
            <Mail className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Perfil de Acesso</p>
              <p className="text-white font-medium capitalize">{userRole}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Segurança</CardTitle>
           <CardDescription className="text-gray-300">
            Altere sua senha de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Button onClick={() => setIsPasswordFormOpen(true)} className="btn-primary">
            <KeyRound className="w-4 h-4 mr-2" />
            Alterar Senha
          </Button>
        </CardContent>
      </Card>

      <ChangePasswordForm 
        isOpen={isPasswordFormOpen}
        onClose={() => setIsPasswordFormOpen(false)}
      />
    </div>
  );
};

export default Profile;