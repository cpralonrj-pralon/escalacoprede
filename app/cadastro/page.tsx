export default function Cadastro() {
  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Cadastro de Funcionário</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary w-64" placeholder="Buscar funcionário..." type="text" />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">AD</div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-background-dark">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-md font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span> Informações Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-full flex items-center gap-6 mb-2">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden">
                        <span className="material-symbols-outlined text-slate-400 group-hover:scale-110 transition-transform">add_a_photo</span>
                      </div>
                      <button className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow-lg">
                        <span className="material-symbols-outlined !text-sm">edit</span>
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Foto do Perfil</p>
                      <p className="text-xs text-slate-500">JPG, PNG até 2MB</p>
                    </div>
                  </div>
                  <div className="col-span-full">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                    <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary" placeholder="Digite o nome completo" type="text" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cargo</label>
                    <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary" placeholder="Ex: Operador I" type="text" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Admissão</label>
                    <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary" type="date" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-md font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">work</span> Contratual e Escala
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Carga Horária Mensal</label>
                    <select className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary">
                      <option>220h (Padrão)</option>
                      <option>180h</option>
                      <option>150h</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Matrícula (ID)</label>
                    <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary" placeholder="000000" type="text" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Turno Fixo</label>
                    <select className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary">
                      <option>T1 (06:00 - 14:00)</option>
                      <option>T2 (14:00 - 22:00)</option>
                      <option>T3 (22:00 - 06:00)</option>
                      <option>T4 (Escala 12x36)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Folga Especial Dominical</p>
                      <p className="text-xs text-slate-500">Rodízio automático 1:1</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input className="sr-only peer" type="checkbox" value="" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 py-4">
                <button className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
                <button className="px-8 py-2.5 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">Salvar Cadastro</button>
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
                  <div className="p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    <div>
                      <p className="text-xs font-bold">Ricardo Oliveira</p>
                      <p className="text-[10px] text-slate-500">Operador T1 • Mat. 2931</p>
                    </div>
                    <span className="material-symbols-outlined ml-auto text-slate-300">chevron_right</span>
                  </div>
                  <div className="p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    <div>
                      <p className="text-xs font-bold">Mariana Santos</p>
                      <p className="text-[10px] text-slate-500">Analista T2 • Mat. 2940</p>
                    </div>
                    <span className="material-symbols-outlined ml-auto text-slate-300">chevron_right</span>
                  </div>
                  <div className="p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    <div>
                      <p className="text-xs font-bold">Carlos Eduardo</p>
                      <p className="text-[10px] text-slate-500">Líder T3 • Mat. 2955</p>
                    </div>
                    <span className="material-symbols-outlined ml-auto text-slate-300">chevron_right</span>
                  </div>
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
                  <tr>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10"></div>
                      <span className="font-medium">Fabio Junior</span>
                    </td>
                    <td className="px-6 py-4">T1 (06-14)</td>
                    <td className="px-6 py-4">220h</td>
                    <td className="px-6 py-4 text-slate-500">12/05/2021</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Ativo</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined !text-lg">more_vert</span></button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10"></div>
                      <span className="font-medium">Beatriz Lima</span>
                    </td>
                    <td className="px-6 py-4">T1 (06-14)</td>
                    <td className="px-6 py-4">180h</td>
                    <td className="px-6 py-4 text-slate-500">22/08/2022</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Ativo</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined !text-lg">more_vert</span></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
