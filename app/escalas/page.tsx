import Link from 'next/link';

export default function Escalas() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const getShiftData = (day: number, type: 'AM' | 'BS' | 'CO' | 'DF' | 'EL') => {
    let val = '';
    let bg = '';
    
    if (type === 'AM') {
      val = 'T1'; bg = 'bg-shift-t1';
      if (day > 25) { val = 'FE'; bg = 'bg-shift-fe'; }
      else if (day % 7 === 6 || day % 7 === 0) { val = 'FG'; bg = 'bg-shift-fg'; }
    } else if (type === 'BS') {
      val = 'T2'; bg = 'bg-shift-t2';
      if (day === 12) { val = 'FR'; bg = 'bg-shift-fr'; }
      else if (day % 7 === 1 || day % 7 === 2) { val = 'FG'; bg = 'bg-shift-fg'; }
    } else if (type === 'CO') {
      val = 'T3'; bg = 'bg-shift-t3';
      if (day % 7 === 3 || day % 7 === 4) { val = 'FG'; bg = 'bg-shift-fg'; }
    } else if (type === 'DF') {
      val = 'T4'; bg = 'bg-shift-t4';
      if (day % 7 === 5 || day % 7 === 6) { val = 'FG'; bg = 'bg-shift-fg'; }
    } else if (type === 'EL') {
      val = 'T1'; bg = 'bg-shift-t1';
      if (day < 10) { val = 'FE'; bg = 'bg-shift-fe'; }
      else if (day % 7 === 0 || day % 7 === 1) { val = 'FG'; bg = 'bg-shift-fg'; }
    }

    return { val, bg };
  };

  return (
    <>
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white px-6 py-3 lg:px-10 sticky top-0 z-20">
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-6">
            <Link className="text-slate-600 hover:text-primary text-sm font-medium transition-colors" href="/">Dashboard</Link>
            <Link className="text-primary text-sm font-bold border-b-2 border-primary pb-1" href="/escalas">Escalas</Link>
            <Link className="text-slate-600 hover:text-primary text-sm font-medium transition-colors" href="/cadastro">Colaboradores</Link>
            <Link className="text-slate-600 hover:text-primary text-sm font-medium transition-colors" href="/validacao">Relatórios</Link>
          </nav>
        </div>
        <div className="flex flex-1 justify-end gap-4 lg:gap-8 items-center">
          <label className="hidden sm:flex flex-col min-w-40 h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg bg-slate-100 border border-slate-200">
              <div className="text-slate-500 flex items-center justify-center pl-3">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input className="w-full border-none bg-transparent focus:ring-0 text-sm placeholder:text-slate-500 px-3 outline-none" placeholder="Pesquisar funcionário..." />
            </div>
          </label>
          <div className="flex gap-2">
            <button className="flex items-center justify-center rounded-lg size-10 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="flex items-center justify-center rounded-lg size-10 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col p-4 lg:p-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">Escala (Grade Mensal)</h1>
            <p className="text-slate-500 text-base font-normal">Visualização premium da grade de turnos e folgas para o mês vigente.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-all">
              <span className="material-symbols-outlined text-[20px]">file_download</span>
              <span>Exportar Excel</span>
            </button>
            <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:opacity-90 transition-all shadow-md">
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Novo Turno</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/50 px-4 flex flex-wrap items-center justify-between">
            <div className="flex gap-6 overflow-x-auto no-scrollbar">
              <button className="flex items-center border-b-2 border-primary text-primary font-bold py-4 px-2 text-sm whitespace-nowrap">Visão Mensal</button>
              <button className="flex items-center border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium py-4 px-2 text-sm transition-colors whitespace-nowrap">Visão Semanal</button>
              <button className="flex items-center border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium py-4 px-2 text-sm transition-colors whitespace-nowrap">Ajustes de Grade</button>
            </div>
            <div className="flex gap-3 py-3 overflow-x-auto custom-scrollbar">
              <button className="flex h-8 items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shrink-0">
                <span>Setor: Operacional</span>
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
              <button className="flex h-8 items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shrink-0">
                <span>Mês: Outubro</span>
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
              <button className="flex h-8 items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shrink-0">
                <span>Ano: 2023</span>
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
              <div className="h-6 w-px bg-slate-200 self-center mx-1"></div>
              <div className="flex items-center gap-1.5 px-2">
                <span className="size-2 rounded-full bg-green-500"></span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status: Validado</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 p-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2"><div className="size-4 rounded-sm bg-shift-fg"></div><span className="text-xs font-semibold text-slate-600">FG (Folga)</span></div>
            <div className="flex items-center gap-2"><div className="size-4 rounded-sm bg-shift-fe"></div><span className="text-xs font-semibold text-slate-600">FE (Férias)</span></div>
            <div className="flex items-center gap-2"><div className="size-4 rounded-sm bg-shift-fr"></div><span className="text-xs font-semibold text-slate-600">FR (Feriado)</span></div>
            <div className="flex items-center gap-2"><div className="size-4 rounded-sm bg-shift-t1"></div><span className="text-xs font-semibold text-slate-600">T1 (06:00-15:48)</span></div>
            <div className="flex items-center gap-2"><div className="size-4 rounded-sm bg-shift-t2"></div><span className="text-xs font-semibold text-slate-600">T2 (13:00-22:48)</span></div>
            <div className="flex items-center gap-2"><div className="size-4 rounded-sm bg-shift-t3"></div><span className="text-xs font-semibold text-slate-600">T3 (14:00-23:48)</span></div>
            <div className="flex items-center gap-2"><div className="size-4 rounded-sm bg-shift-t4"></div><span className="text-xs font-semibold text-slate-600">T4 (22:00-06:35)</span></div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="sticky left-0 z-10 border-r border-slate-200 px-4 py-3 min-w-[200px] font-bold text-slate-700 bg-slate-100">Colaborador</th>
                  {days.map(i => {
                    const isWeekend = (i % 7 === 6 || i % 7 === 0);
                    return (
                      <th key={i} className={`border-r border-slate-200 px-1 py-3 min-w-[36px] text-center font-bold ${isWeekend ? 'bg-slate-200 text-slate-800' : 'text-slate-600'}`}>
                        {i < 10 ? '0' + i : i}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { id: 'AM', name: 'Ana Martins' },
                  { id: 'BS', name: 'Bruno Silva' },
                  { id: 'CO', name: 'Carla Oliveira' },
                  { id: 'DF', name: 'Daniel Ferreira' },
                  { id: 'EL', name: 'Eduardo Lima' },
                ].map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="sticky left-0 z-10 border-r border-slate-200 px-4 py-3 font-medium text-slate-900 bg-white">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">{user.id}</div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    {days.map(day => {
                      const { val, bg } = getShiftData(day, user.id as any);
                      return (
                        <td key={day} className="border-r border-slate-200 p-0.5 text-center">
                          <div className={`${bg} text-white font-bold py-1 rounded-sm`}>{val}</div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-800 text-white">
                <tr>
                  <td className="sticky left-0 z-10 border-r border-slate-700 px-4 py-3 font-bold bg-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-green-400">check_circle</span>
                    Cobertura T1+T2
                  </td>
                  {days.map(i => {
                    const coverage = (i % 7 === 0 || i % 7 === 6) ? 8 : 12;
                    const isAlert = coverage < 10 && (i % 7 !== 0 && i % 7 !== 6);
                    return (
                      <td key={i} className={`border-r border-slate-700 px-1 py-3 text-center font-bold ${isAlert ? 'text-red-400' : 'text-green-400'}`}>
                        {coverage}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700">Resumo de Horas</h3>
              <span className="material-symbols-outlined text-primary">schedule</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Média setor:</span>
                <span className="font-bold text-slate-900">176h / mês</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-4/5"></div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700">Alertas de Escala</h3>
              <span className="material-symbols-outlined text-red-500">warning</span>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-600 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-red-500"></span>
                Baixa cobertura T2 nos dias 14, 15.
              </p>
              <p className="text-xs text-slate-600 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-orange-500"></span>
                3 colaboradores com +44h semanais.
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700">Ações Rápidas</h3>
              <span className="material-symbols-outlined text-slate-400">offline_bolt</span>
            </div>
            <div className="flex flex-col gap-2">
              <button className="w-full text-left px-3 py-2 rounded bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-primary transition-colors">
                Replicar escala mês anterior
              </button>
              <button className="w-full text-left px-3 py-2 rounded bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-primary transition-colors">
                Validar todas as folgas
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
