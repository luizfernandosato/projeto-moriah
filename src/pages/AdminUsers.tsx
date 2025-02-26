
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UserApproval {
  id: string;
  email: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    loadUsers();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email === 'luizfernandosato@gmail.com') {
      setIsAdmin(true);
    }
  };

  const loadUsers = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('user_approvals')
        .select(`
          id,
          status,
          created_at
        `);

      if (usersError) throw usersError;

      const userDetails = await Promise.all(
        usersData.map(async (user) => {
          const { data: { users }, error } = await supabase.auth.admin.listUsers();
          const authUser = users.find(u => u.id === user.id);
          return {
            ...user,
            email: authUser?.email || '',
            name: authUser?.user_metadata?.name || '',
          };
        })
      );

      setUsers(userDetails);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('user_approvals')
        .update({
          status,
          approved_at: status === 'approved' ? new Date().toISOString() : null
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`Usuário ${status === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso`);
      loadUsers();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do usuário');
    }
  };

  if (!isAdmin) {
    return <div className="p-4">Acesso não autorizado</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Usuários</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-sm rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Registro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      user.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {user.status === 'approved' ? 'Aprovado' : 
                     user.status === 'rejected' ? 'Rejeitado' : 
                     'Pendente'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  {user.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleApproval(user.id, 'approved')}
                        variant="default"
                        size="sm"
                      >
                        Aprovar
                      </Button>
                      <Button
                        onClick={() => handleApproval(user.id, 'rejected')}
                        variant="destructive"
                        size="sm"
                      >
                        Rejeitar
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
