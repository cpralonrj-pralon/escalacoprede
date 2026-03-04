export default function Configuracoes() {
  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Configurações do Sistema</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">AD</div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-background-dark">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Preferências Gerais</h1>
            <p className="text-sm text-slate-500 mt-1">Ajuste as regras de negócio e parâmetros globais do Sistame Escala.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1 space-y-2">
              <button className="w-full text-left px-4 py-2.5 rounded-lg bg-primary/10 text-primary font-bold text-sm transition-colors flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">tune</span>
                Parâmetros
              </button>
              <button className="w-full text-left px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition-colors flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">schedule</span>
                Turnos
              </button>
              <button className="w-full text-left px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition-colors flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">group</span>
                Permissões
              </button>
              <button className="w-full text-left px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition-colors flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                Notificações
              </button>
            </div>

            <div className="md:col-span-3 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-md font-bold mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <span className="material-symbols-outlined text-primary">rule</span> Regras de Escala
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="max-w-[70%]">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Folga Dominical Obrigatória</p>
                      <p className="text-xs text-slate-500 mt-1">Garante pelo menos 1 domingo de folga a cada 7 semanas trabalhadas (CLT).</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input className="sr-only peer" type="checkbox" value="" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="max-w-[70%]">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Intervalo Interjornada (11h)</p>
                      <p className="text-xs text-slate-500 mt-1">Bloqueia a alocação de turnos com menos de 11 horas de descanso entre jornadas.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input className="sr-only peer" type="checkbox" value="" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="max-w-[70%]">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Alerta de Hora Extra (&gt;2h/dia)</p>
                      <p className="text-xs text-slate-500 mt-1">Gera alerta visual na grade quando a jornada diária excede 10 horas totais.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input className="sr-only peer" type="checkbox" value="" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-md font-bold mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <span className="material-symbols-outlined text-primary">settings_suggest</span> Parâmetros de Cobertura
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Meta Mínima Diária (T1+T2)</label>
                    <div className="relative">
                      <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary pl-4 pr-12 py-2 text-sm" type="number" defaultValue={25} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">colab.</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Abaixo deste valor, a grade indicará status &quot;Crítico&quot;.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Margem de Alerta (T1+T2)</label>
                    <div className="relative">
                      <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary pl-4 pr-12 py-2 text-sm" type="number" defaultValue={30} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">colab.</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Entre a meta mínima e este valor, indicará &quot;Alerta&quot;.</p>
                  </div>
                  <div className="col-span-full">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Limite Máximo de Férias Simultâneas</label>
                    <div className="flex items-center gap-4">
                      <input type="range" min="0" max="20" defaultValue="10" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-primary" />
                      <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">10%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">Percentual máximo da equipe que pode estar em férias no mesmo período.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4">
                <button className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">Restaurar Padrões</button>
                <button className="px-8 py-2.5 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
