'use client';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Employee, ShiftType } from '../data/employees';

export default function Cadastro() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [shift, setShift] = useState<ShiftType>('T1');
  const [sex, setSex] = useState<'M' | 'F'>('M');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setEmployees(data as Employee[]);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!nome || !matricula) return alert('Por favor, preencha nome e matrícula');

    setIsSaving(true);
    const { error } = await supabase.from('employees').insert([
      {
        name: nome,
        matricula,
        shift,
        sex,
        status: 'ativo'
      }
    ]);

    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      alert('Funcionário cadastrado com sucesso!');
      setNome('');
      setMatricula('');
      fetchEmployees();
    }
    setIsSaving(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size * 1024 * 1024 < 2) { // Just for logic
        // ...
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-10">
        <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate mr-2">Cadastro de Funcionário</h2>
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="relative hidden md:block">
            <label htmlFor="header-search" className="sr-only">Buscar funcionário</label>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              id="header-search"
              title="Buscar funcionário"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary w-48 lg:w-64"
              placeholder="Buscar..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button title="Notificações" className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div title="Usuário logado" className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">AD</div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-background-light dark:bg-background-dark">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-md font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span> Informações Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-full flex items-center gap-6 mb-2">
                    <div className="relative group">
                      <label htmlFor="avatar-upload" className="sr-only">Upload de Avatar</label>
                      <input
                        id="avatar-upload"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        accept="image/*"
                        className="hidden"
                        title="Selecione uma foto"
                      />
                      <div
                        onClick={triggerFileInput}
                        className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden cursor-pointer hover:border-primary transition-colors"
                      >
                        {avatar ? (
                          <img src={avatar} alt="Preview do Perfil" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-slate-400 group-hover:scale-110 transition-transform">add_a_photo</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        title="Editar foto"
                        className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow-lg"
                      >
                        <span className="material-symbols-outlined !text-sm">edit</span>
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Foto do Perfil</p>
                      <p className="text-xs text-slate-500">JPG, PNG até 2MB</p>
                    </div>
                  </div>
                  <div className="col-span-full">
                    <label htmlFor="nome" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                    <input id="nome" name="nome" title="Nome Completo" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary" placeholder="Digite o nome completo" type="text" />
                  </div>
                  <div>
                    <label htmlFor="cargo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cargo</label>
                    <input id="cargo" name="cargo" title="Cargo" className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary" placeholder="Ex: Operador I" type="text" />
                  </div>
                  <div>
                    <label htmlFor="sexo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sexo (p/ DSR Especial)</label>
                    <select id="sexo" name="sexo" title="Sexo" value={sex} onChange={(e) => setSex(e.target.value as 'M' | 'F')} className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary">
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="admissao" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Admissão</label>
                    <input id="admissao" name="admissao" title="Data de Admissão" className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary" type="date" />
                  </div>
                  <div>
                    <label htmlFor="telefone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone / WhatsApp</label>
                    <input id="telefone" name="telefone" title="Telefone ou WhatsApp" className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary" placeholder="(00) 00000-0000" type="tel" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail Corporativo</label>
                    <input id="email" name="email" title="E-mail Corporativo" className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary" placeholder="exemplo@empresa.com.br" type="email" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-md font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">work</span> Contratual e Escala
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="carga" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Carga Horária Mensal</label>
                    <select id="carga" name="carga" title="Carga Horária Mensal" className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary">
                      <option>220h (Padrão)</option>
                      <option>180h</option>
                      <option>150h</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="matricula" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Matrícula (ID)</label>
                    <input id="matricula" name="matricula" title="Matrícula" value={matricula} onChange={(e) => setMatricula(e.target.value)} className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary" placeholder="000000" type="text" />
                  </div>
                  <div>
                    <label htmlFor="turno_fixo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Turno Fixo</label>
                    <select id="turno_fixo" name="turno_fixo" title="Turno Fixo" value={shift} onChange={(e) => setShift(e.target.value as ShiftType)} className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary">
                      <option value="T1">T1 (06:00 - 14:00)</option>
                      <option value="T2">T2 (14:00 - 22:00)</option>
                      <option value="T3">T3 (22:00 - 06:00)</option>
                      <option value="T4">T4 (Noite)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Folga Especial Dominical</p>
                      <p className="text-xs text-slate-500">Rodízio automático 1:1</p>
                    </div>
                    <label htmlFor="folga" className="relative inline-flex items-center cursor-pointer">
                      <input id="folga" title="Folga Especial Dominical" className="sr-only peer" type="checkbox" value="" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 py-4">
                <button className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-2.5 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Cadastro'}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-primary text-white p-6 rounded-xl shadow-xl shadow-primary/10">
                <h3 className="text-sm font-bold mb-4 uppercase tracking-widest opacity-80">Escala Semanal Preview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white/10 p-2 rounded-lg">
                    <span className="text-xs font-medium">Segunda</span>
                    <span className="text-xs font-bold">06:00 - 14:00</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 p-2 rounded-lg">
                    <span className="text-xs font-medium">Terça</span>
                    <span className="text-xs font-bold">06:00 - 14:00</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 p-2 rounded-lg">
                    <span className="text-xs font-medium">Quarta</span>
                    <span className="text-xs font-bold">06:00 - 14:00</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 p-2 rounded-lg">
                    <span className="text-xs font-medium">Quinta</span>
                    <span className="text-xs font-bold">06:00 - 14:00</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 p-2 rounded-lg border-l-4 border-yellow-400">
                    <span className="text-xs font-medium">Sexta</span>
                    <span className="text-xs font-bold uppercase">Folga</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 p-2 rounded-lg">
                    <span className="text-xs font-medium">Sábado</span>
                    <span className="text-xs font-bold">08:00 - 12:00</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 p-2 rounded-lg border-l-4 border-yellow-400">
                    <span className="text-xs font-medium">Domingo</span>
                    <span className="text-xs font-bold uppercase">Folga</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-sm font-bold">Cadastros Recentes</h3>
                  <button className="text-primary text-xs font-bold hover:underline">Ver todos</button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {employees.slice(0, 3).map((emp) => (
                    <div key={emp.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold">{emp.name}</p>
                        <p className="text-[10px] text-slate-500">{emp.shift} • Mat. {emp.matricula}</p>
                      </div>
                      <span className="material-symbols-outlined ml-auto text-slate-300">chevron_right</span>
                    </div>
                  ))}
                  {employees.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400">Nenhum cadastro recente</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold">Listagem de Equipe por Turno</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Funcionário</th>
                    <th className="px-6 py-3">Turno</th>
                    <th className="px-6 py-3">Carga Horária</th>
                    <th className="px-6 py-3">Data Admissão</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {emp.name[0]}
                        </div>
                        <span className="font-medium">{emp.name}</span>
                      </td>
                      <td className="px-6 py-4">{emp.shift}</td>
                      <td className="px-6 py-4">220h</td>
                      <td className="px-6 py-4 text-slate-500">{emp.matricula}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">{emp.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined !text-lg">more_vert</span></button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">Nenhum funcionário encontrado no banco de dados.</td>
                    </tr>
                  )}
                  {isLoading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic flex items-center justify-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        Buscando equipe...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
