import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

function validatePassword(pw) {
  const min = pw.length >= 8;
  const hasNum = /\d/.test(pw);
  const hasLetter = /[A-Za-z]/.test(pw);
  return min && hasNum && hasLetter;
}

const ChangePasswordForm = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const { changeUserPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
      });
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não conferem",
        description: "A nova senha e a confirmação devem ser iguais.",
      });
      setLoading(false);
      return;
    }

    if (!validatePassword(newPassword)) {
      toast({
        variant: "destructive",
        title: "Senha inválida",
        description: "A nova senha deve ter no mínimo 8 caracteres, com letras e números.",
      });
      setLoading(false);
      return;
    }

    const { error } = await changeUserPassword(oldPassword, newPassword);

    if (!error) {
      toast({
        title: "Sucesso!",
        description: "Sua senha foi alterada com sucesso.",
      });
      handleClose();
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
          <DialogDescription className="text-gray-400">
            Para sua segurança, informe sua senha atual antes de definir uma nova.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="old-password">Senha Atual</Label>
            <Input
              id="old-password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="input-glow bg-white/10 border-white/20"
              autoComplete="current-password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-glow bg-white/10 border-white/20"
              autoComplete="new-password"
              required
            />
            <p className="text-xs text-gray-400">Mínimo 8 caracteres, com letras e números.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-glow bg-white/10 border-white/20"
              autoComplete="new-password"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} className="text-white border-white/20 hover:bg-white/10">
              Cancelar
            </Button>
            <Button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordForm;