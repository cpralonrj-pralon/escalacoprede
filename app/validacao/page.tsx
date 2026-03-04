export default function Validacao() {
  return (
    <>
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Validação e Auditoria de Escala</h1>
          <p className="text-sm text-slate-500">Módulo de análise de cobertura e detecção de déficits críticos.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span className="px-4 text-sm font-bold">Novembro 2023</span>
            <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base">download</span>
            Exportar Relatório
          </button>
        </div>
      </header>
      <div className="p-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Déficits Detectados</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">14 Turnos</h3>
              <div className="flex items-center gap-1 mt-2 text-rose-600 font-bold text-sm">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                +5% vs mês anterior
              </div>
            </div>
            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-xl">
              <span className="material-symbols-outlined text-2xl">error</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Cobertura Média</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">82%</h3>
              <div className="flex items-center gap-1 mt-2 text-rose-600 font-bold text-sm">
                <span className="material-symbols-outlined text-sm">trending_down</span>
                -2.4% vs meta
              </div>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
              <span className="material-symbols-outlined text-2xl">query_stats</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Próximo Turno Crítico</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">T2 - 15/Nov</h3>
              <div className="flex items-center gap-1 mt-2 text-primary font-bold text-sm">
                <span className="material-symbols-outlined text-sm">schedule</span>
                Déficit de 8 colaboradores
              </div>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <span className="material-symbols-outlined text-2xl">notification_important</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                  Grade de Cobertura Diária
                </h3>
                <div className="flex gap-2 text-xs font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-500 rounded-full"></span> Crítico</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded-full"></span> Alerta</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-full"></span> Ideal</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/30 text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-4">Dia / Turno</th>
                      <th className="px-6 py-4">T1 (Manhã)</th>
                      <th className="px-6 py-4">T2 (Tarde)</th>
                      <th className="px-6 py-4">T3 (Noite)</th>
                      <th className="px-6 py-4">T4 (Madrug)</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-bold">01/Nov (Qua)</td>
                      <td className="px-6 py-4 text-rose-600 font-bold bg-rose-50 dark:bg-rose-900/10">12</td>
                      <td className="px-6 py-4 text-rose-600 font-bold bg-rose-50 dark:bg-rose-900/10">10 <span className="text-[10px] ml-1 font-normal opacity-70">(Total T1+T2: 22)</span></td>
                      <td className="px-6 py-4">15</td>
                      <td className="px-6 py-4">12</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 text-[10px] font-black uppercase">Crítico</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-bold">02/Nov (Qui)</td>
                      <td className="px-6 py-4">18</td>
                      <td className="px-6 py-4">15</td>
                      <td className="px-6 py-4 text-amber-600 font-bold">10</td>
                      <td className="px-6 py-4">14</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-[10px] font-black uppercase">Alerta</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-bold">03/Nov (Sex)</td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">28</td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">25</td>
                      <td className="px-6 py-4">15</td>
                      <td className="px-6 py-4">12</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-black uppercase">Ideal</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-bold">04/Nov (Sáb)</td>
                      <td className="px-6 py-4 text-rose-600 font-bold bg-rose-50 dark:bg-rose-900/10">10</td>
                      <td className="px-6 py-4 text-rose-600 font-bold bg-rose-50 dark:bg-rose-900/10">12 <span className="text-[10px] ml-1 font-normal opacity-70">(Total T1+T2: 22)</span></td>
                      <td className="px-6 py-4">14</td>
                      <td className="px-6 py-4">10</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 text-[10px] font-black uppercase">Crítico</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-lg">Mapa de Calor (Concentração de Pessoal)</h3>
                  <p className="text-sm text-slate-500">Visualização hora a hora para o dia selecionado (01/Nov)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Menos</span>
                  <div className="flex h-4 w-32 rounded overflow-hidden">
                    <div className="bg-rose-500 flex-1"></div>
                    <div className="bg-amber-400 flex-1"></div>
                    <div className="bg-primary/40 flex-1"></div>
                    <div className="bg-primary/80 flex-1"></div>
                    <div className="bg-primary flex-1"></div>
                  </div>
                  <span className="text-[10px] text-slate-400">Mais</span>
                </div>
              </div>
              <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] h-16 w-full gap-1">
                <div className="bg-primary/40 rounded flex flex-col items-center justify-end pb-1" title="00:00 - 8px"><span className="text-[8px] font-bold">00</span></div>
                <div className="bg-primary/40 rounded flex flex-col items-center justify-end pb-1" title="01:00 - 8px"><span className="text-[8px] font-bold">01</span></div>
                <div className="bg-primary/40 rounded flex flex-col items-center justify-end pb-1" title="02:00 - 7px"><span className="text-[8px] font-bold">02</span></div>
                <div className="bg-primary/30 rounded flex flex-col items-center justify-end pb-1" title="03:00 - 6px"><span className="text-[8px] font-bold">03</span></div>
                <div className="bg-rose-400 rounded flex flex-col items-center justify-end pb-1" title="04:00 - 4px"><span className="text-[8px] font-bold">04</span></div>
                <div className="bg-rose-500 rounded flex flex-col items-center justify-end pb-1" title="05:00 - 3px"><span className="text-[8px] font-bold">05</span></div>
                <div className="bg-amber-400 rounded flex flex-col items-center justify-end pb-1" title="06:00 - 10px"><span className="text-[8px] font-bold">06</span></div>
                <div className="bg-primary/60 rounded flex flex-col items-center justify-end pb-1" title="07:00 - 15px"><span className="text-[8px] font-bold">07</span></div>
                <div className="bg-primary/70 rounded flex flex-col items-center justify-end pb-1" title="08:00 - 18px"><span className="text-[8px] font-bold">08</span></div>
                <div className="bg-primary rounded flex flex-col items-center justify-end pb-1" title="09:00 - 22px"><span className="text-[8px] font-bold">09</span></div>
                <div className="bg-primary rounded flex flex-col items-center justify-end pb-1" title="10:00 - 22px"><span className="text-[8px] font-bold">10</span></div>
                <div className="bg-primary rounded flex flex-col items-center justify-end pb-1" title="11:00 - 24px"><span className="text-[8px] font-bold">11</span></div>
                <div className="bg-amber-500 rounded flex flex-col items-center justify-end pb-1" title="12:00 - 12px"><span className="text-[8px] font-bold">12</span></div>
                <div className="bg-primary/60 rounded flex flex-col items-center justify-end pb-1" title="13:00 - 15px"><span className="text-[8px] font-bold">13</span></div>
                <div className="bg-primary/70 rounded flex flex-col items-center justify-end pb-1" title="14:00 - 18px"><span className="text-[8px] font-bold">14</span></div>
                <div className="bg-rose-500 rounded flex flex-col items-center justify-end pb-1" title="15:00 - 2px"><span className="text-[8px] font-bold">15</span></div>
                <div className="bg-rose-600 rounded flex flex-col items-center justify-end pb-1" title="16:00 - 1px"><span className="text-[8px] font-bold">16</span></div>
                <div className="bg-amber-400 rounded flex flex-col items-center justify-end pb-1" title="17:00 - 11px"><span className="text-[8px] font-bold">17</span></div>
                <div className="bg-primary/60 rounded flex flex-col items-center justify-end pb-1" title="18:00 - 14px"><span className="text-[8px] font-bold">18</span></div>
                <div className="bg-primary/80 rounded flex flex-col items-center justify-end pb-1" title="19:00 - 20px"><span className="text-[8px] font-bold">19</span></div>
                <div className="bg-primary/80 rounded flex flex-col items-center justify-end pb-1" title="20:00 - 20px"><span className="text-[8px] font-bold">20</span></div>
                <div className="bg-primary/70 rounded flex flex-col items-center justify-end pb-1" title="21:00 - 18px"><span className="text-[8px] font-bold">21</span></div>
                <div className="bg-primary/60 rounded flex flex-col items-center justify-end pb-1" title="22:00 - 15px"><span className="text-[8px] font-bold">22</span></div>
                <div className="bg-primary/50 rounded flex flex-col items-center justify-end pb-1" title="23:00 - 12px"><span className="text-[8px] font-bold">23</span></div>
              </div>
              <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-lg flex items-center gap-4">
                <span className="material-symbols-outlined text-rose-600">report</span>
                <p className="text-sm text-rose-800 dark:text-rose-400 font-medium">
                  Déficit crítico identificado entre <span className="font-black underline">15:00 e 16:00</span>. Apenas 1 colaborador em posto. Risco alto de interrupção operacional.
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">auto_fix_high</span>
                Sugestões &quot;Quick Fix&quot;
              </h3>
              <p className="text-sm text-slate-500 mb-6">Colaboradores em Folga (FG) com competência para cobrir os gaps identificados.</p>
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">Para 15/Nov (T2)</span>
                    <span className="material-symbols-outlined text-slate-400 text-sm">more_vert</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center font-bold text-primary">RM</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">Ricardo Mendes</p>
                      <p className="text-[10px] text-slate-500">Última folga: 08/Nov</p>
                    </div>
                  </div>
                  <button className="w-full mt-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-bold hover:bg-primary hover:text-white transition-all">
                    Convocar de FG
                  </button>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">Para 15/Nov (T2)</span>
                    <span className="material-symbols-outlined text-slate-400 text-sm">more_vert</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center font-bold text-primary">AS</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">Ana Soares</p>
                      <p className="text-[10px] text-slate-500">Última folga: Ontem</p>
                    </div>
                  </div>
                  <button className="w-full mt-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-bold hover:bg-primary hover:text-white transition-all">
                    Convocar de FG
                  </button>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg opacity-60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">Para 16/Nov (T1)</span>
                    <span className="material-symbols-outlined text-slate-400 text-sm">more_vert</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center font-bold text-primary">JL</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">Julia Lima</p>
                      <p className="text-[10px] text-slate-500">Indisponível (HE Max)</p>
                    </div>
                  </div>
                  <button className="w-full mt-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold text-slate-400 cursor-not-allowed" disabled>
                    Limite de Horas
                  </button>
                </div>
              </div>
              <button className="w-full mt-6 text-primary text-sm font-bold flex items-center justify-center gap-1 hover:underline">
                Ver mais sugestões
                <span className="material-symbols-outlined text-sm">east</span>
              </button>
            </div>
            <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold text-lg mb-2">Resumo da Auditoria</h4>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  A análise atual indica que o remanejamento de <span className="text-white font-bold">4 colaboradores</span> das equipes de suporte resolveria 80% dos déficits críticos do turno da tarde (T2).
                </p>
                <button className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-black uppercase w-full">Aplicar Remanejamento</button>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
              <div className="absolute -left-4 top-0 w-16 h-16 bg-primary/10 rounded-full blur-xl"></div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
