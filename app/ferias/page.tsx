export default function Ferias() {
  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Férias e Afastamentos</h2>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Gestão de Férias</h1>
              <p className="text-sm text-slate-500 mt-1">Controle de períodos aquisitivos e programação de férias.</p>
            </div>
            <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-base">add</span>
              Nova Programação
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Em Férias</h3>
                <span className="material-symbols-outlined text-primary">flight_takeoff</span>
              </div>
              <p className="text-3xl font-black">4</p>
              <p className="text-xs text-slate-500 mt-2">Colaboradores atualmente</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Próximos 30d</h3>
                <span className="material-symbols-outlined text-amber-500">event_upcoming</span>
              </div>
              <p className="text-3xl font-black">12</p>
              <p className="text-xs text-slate-500 mt-2">Férias programadas</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Vencidas</h3>
                <span className="material-symbols-outlined text-rose-500">warning</span>
              </div>
              <p className="text-3xl font-black text-rose-600">2</p>
              <p className="text-xs text-rose-500 mt-2 font-medium">Atenção imediata</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">A Vencer (90d)</h3>
                <span className="material-symbols-outlined text-slate-400">schedule</span>
              </div>
              <p className="text-3xl font-black">8</p>
              <p className="text-xs text-slate-500 mt-2">Programar em breve</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex gap-4">
                <button className="text-sm font-bold text-primary border-b-2 border-primary pb-1">Programadas</button>
                <button className="text-sm font-medium text-slate-500 hover:text-slate-700 pb-1">Histórico</button>
                <button className="text-sm font-medium text-slate-500 hover:text-slate-700 pb-1">Afastamentos (INSS)</button>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                </button>
                <button className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                  <span className="material-symbols-outlined text-sm">sort</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/30 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4">Colaborador</th>
                    <th className="px-6 py-4">Período Aquisitivo</th>
                    <th className="px-6 py-4">Data Início</th>
                    <th className="px-6 py-4">Data Fim</th>
                    <th className="px-6 py-4">Dias</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">JS</div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">João Silva</p>
                          <p className="text-[10px] text-slate-500">Operador T1</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">2022/2023</td>
                    <td className="px-6 py-4 font-medium">10/Nov/2023</td>
                    <td className="px-6 py-4 font-medium">29/Nov/2023</td>
                    <td className="px-6 py-4">20</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">Aprovado</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">MA</div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Maria Almeida</p>
                          <p className="text-[10px] text-slate-500">Analista T2</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">2022/2023</td>
                    <td className="px-6 py-4 font-medium">15/Dez/2023</td>
                    <td className="px-6 py-4 font-medium">13/Jan/2024</td>
                    <td className="px-6 py-4">30</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">Pendente</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors bg-rose-50/30 dark:bg-rose-900/10">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">PR</div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Paulo Roberto</p>
                          <p className="text-[10px] text-slate-500">Líder T3</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-bold text-rose-600">2021/2022</td>
                    <td className="px-6 py-4 font-medium text-slate-400">-</td>
                    <td className="px-6 py-4 font-medium text-slate-400">-</td>
                    <td className="px-6 py-4">-</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase">Vencida</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:text-primary/80 font-bold text-xs uppercase tracking-wider transition-colors">
                        Programar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
              <span>Mostrando 1 a 3 de 24 registros</span>
              <div className="flex gap-1">
                <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 transition-colors" disabled>Anterior</button>
                <button className="px-3 py-1 border border-slate-200 rounded bg-primary text-white font-bold">1</button>
                <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 transition-colors">2</button>
                <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 transition-colors">3</button>
                <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 transition-colors">Próxima</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
