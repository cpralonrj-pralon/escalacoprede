export default function Dashboard() {
  return (
    <>
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex items-center justify-between px-8 sticky top-0 z-10">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <div className="flex items-center gap-4">
          <div className="relative max-w-md hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input className="pl-10 pr-4 py-1.5 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary w-64 text-sm" placeholder="Pesquisar..." type="text" />
          </div>
          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>
          </button>
          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>
      <div className="p-8 space-y-8">
        {/* Top KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <span className="material-symbols-outlined text-2xl">groups</span>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-none">Total Colaboradores</p>
              <h3 className="text-2xl font-bold mt-2">85</h3>
              <p className="text-xs text-green-500 font-semibold mt-1">▲ +5% vs mês passado</p>
            </div>
          </div>
          <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-none">Alertas de Cobertura</p>
              <h3 className="text-2xl font-bold mt-2 text-red-600 dark:text-red-400">3</h3>
              <p className="text-xs text-slate-400 mt-1">Crítico: Turno Noite</p>
            </div>
          </div>
          <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
              <span className="material-symbols-outlined text-2xl">flight_takeoff</span>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-none">Em Férias</p>
              <h3 className="text-2xl font-bold mt-2">2</h3>
              <p className="text-xs text-slate-400 mt-1">Próximos: 4 (Maio)</p>
            </div>
          </div>
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart: Bar Chart Horas por Turno */}
          <div className="lg:col-span-2 bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Horas por Turno</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Semana Atual</span>
                <span className="text-sm font-bold text-green-500">+12%</span>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-4 px-2">
              <div className="flex-1 flex flex-col items-center group">
                <div className="w-full bg-primary/20 rounded-t-lg relative flex flex-col justify-end" style={{ height: '35%' }}>
                  <div className="w-full bg-primary rounded-t-lg h-3/4"></div>
                  <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded">280h</span>
                </div>
                <p className="text-xs mt-4 font-semibold text-slate-500 uppercase tracking-wider">Manhã</p>
              </div>
              <div className="flex-1 flex flex-col items-center group">
                <div className="w-full bg-primary/20 rounded-t-lg relative flex flex-col justify-end" style={{ height: '85%' }}>
                  <div className="w-full bg-primary rounded-t-lg h-4/5"></div>
                  <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded">420h</span>
                </div>
                <p className="text-xs mt-4 font-semibold text-slate-500 uppercase tracking-wider">Tarde</p>
              </div>
              <div className="flex-1 flex flex-col items-center group">
                <div className="w-full bg-primary/20 rounded-t-lg relative flex flex-col justify-end" style={{ height: '95%' }}>
                  <div className="w-full bg-primary rounded-t-lg h-full"></div>
                  <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded">510h</span>
                </div>
                <p className="text-xs mt-4 font-semibold text-slate-500 uppercase tracking-wider">Noite</p>
              </div>
              <div className="flex-1 flex flex-col items-center group">
                <div className="w-full bg-primary/20 rounded-t-lg relative flex flex-col justify-end" style={{ height: '25%' }}>
                  <div className="w-full bg-primary rounded-t-lg h-2/3"></div>
                  <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded">120h</span>
                </div>
                <p className="text-xs mt-4 font-semibold text-slate-500 uppercase tracking-wider">Madrugada</p>
              </div>
            </div>
          </div>
          {/* Ranking: Top Colaboradores */}
          <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold mb-4">Mais Ativos (Top 10)</h3>
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[256px] pr-2 custom-scrollbar">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">1</span>
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <img className="w-full h-full object-cover" alt="User avatar male" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrBsVo7oV1Eo1kTQhThCSLlnjZFzML7Am5RhzqxKcFR9puN3bRl7BW8B-0d2h9kRh4zto2aMa_X7WQzJu7oCd1d7VQOy-YGZ3lqStbJJOG76i7v-ZA44LAZrov21Ms8HQVEQXaPcwZF9fmmil1c_nFlAd24NfaEw7OTG6ZMf0OgImCRIk1N1cunGlEwFeRiDEtYtx5SHDO3f5RagOp9u2ZkIhj7sZIqqOMhKMFvnj9ZAvy2q-0_vkuCuVNRFGgVXW2yMpJCpxkkiU" />
                  </div>
                  <span className="text-sm font-medium">Carlos Silva</span>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">176h</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">2</span>
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <img className="w-full h-full object-cover" alt="User avatar female" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKZo7h9ubyRgziA03nT-wxkhuHSrm6PdhcPe0rf65abtKIn6CETfEQRmYIQ8wXvXXW3s_2jYzVQv2lpV2yK5VAFLcVx6gQfDuPM1De-ifXl-e23FtEL6mjwj2TNZ2kEkKo3LxuI1kCv_ZKslZJFillpRjOcEUk7VmdjLRP_cd-nj9E36MhIfDXUVYVMt3hgDnM8x2PN7uoNv9Wg0OOHaddXGZWNdDO9-nVJV0YQfVJ933M7c6CjP7bjgwwCMylMy5yKDkqmu2PJwI" />
                  </div>
                  <span className="text-sm font-medium">Ana Souza</span>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">168h</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">3</span>
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <img className="w-full h-full object-cover" alt="User avatar male" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBx_u1Apyq-jm0tMvyvchDIb4_GtpUGaFfoHcZsGhL4xsv-pQUforLtFPIuXmzJH68YeYY95UAdJyR3uo8TWNcRkO2GEwRMa9bbF-TL7H1ivWl1dQ2GbrpCEzL6dUiXxUk9qlfZ4pLHrLS2KHnZ3WRsFbPmRLeBMP2OiPdZGcVd4APUFnhDmsYrnRSZVM0wktu9rrWekPyjTBn1mJ98DAdug8dlYIu4jgvIux938vrylusK8t9MQ43RS7KhWt9bUflYNKqM_fMcy2Y" />
                  </div>
                  <span className="text-sm font-medium">Roberto Dias</span>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">160h</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">4</span>
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <img className="w-full h-full object-cover" alt="User avatar female" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIbZxat8bf41ZL1Hsk_p5nO792jlXFGJfzxNPdKLMiNMIy3akc3YSlmdLVisiGKjaV8E0vFMSa_ajZyXVIbPt0rigqGJDdEvBc-bUqM3HuhQCpCtFBpfuaLBGlHi-0LG83w23ZKFYccL253P_LOVh7Y9g81Z_NHuqZTmiRsLBq9s6tVSWk6lpMh8_4NSZXdC5K6ZnClubcqpcKUpLIvRw8kuCtR9UB_KVZwGq0ig2cBg5QWmD9LH0zFZ46zV35X9CCEzVJSk0W3j4" />
                  </div>
                  <span className="text-sm font-medium">Juliana Lima</span>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">158h</span>
              </div>
            </div>
          </div>
        </div>
        {/* Heatmap: Cobertura Semanal */}
        <section className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold">Cobertura Semanal</h3>
              <p className="text-sm text-slate-500">Visualização de gaps de pessoal (Meta: &gt;25 colaboradores por dia)</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-sm"></span> Crítico (&lt; 25)</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded-sm"></span> Alerta (25-30)</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-sm"></span> Ideal (&gt; 30)</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left text-xs font-bold text-slate-400 uppercase">Turno/Dia</th>
                  <th className="p-2 text-center text-xs font-bold text-slate-400 uppercase">Seg</th>
                  <th className="p-2 text-center text-xs font-bold text-slate-400 uppercase">Ter</th>
                  <th className="p-2 text-center text-xs font-bold text-slate-400 uppercase">Qua</th>
                  <th className="p-2 text-center text-xs font-bold text-slate-400 uppercase">Qui</th>
                  <th className="p-2 text-center text-xs font-bold text-slate-400 uppercase">Sex</th>
                  <th className="p-2 text-center text-xs font-bold text-slate-400 uppercase">Sab</th>
                  <th className="p-2 text-center text-xs font-bold text-slate-400 uppercase">Dom</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 text-sm font-semibold border-b border-slate-100 dark:border-slate-800">Manhã</td>
                  <td className="p-1 border-b border-slate-100 dark:border-slate-800"><div className="bg-green-500 h-10 flex items-center justify-center text-white font-bold text-xs rounded-lg">32</div></td>
                  <td className="p-1 border-b border-slate-100 dark:border-slate-800"><div className="bg-green-500 h-10 flex items-center justify-center text-white font-bold text-xs rounded-lg">31</div></td>
                  <td className="p-1 border-b border-slate-100 dark:border-slate-800"><div className="bg-yellow-400 h-10 flex items-center justify-center text-slate-900 font-bold text-xs rounded-lg">26</div></td>
                  <td className="p-1 border-b border-slate-100 dark:border-slate-800"><div className="bg-green-500 h-10 flex items-center justify-center text-white font-bold text-xs rounded-lg">30</div></td>
                  <td className="p-1 border-b border-slate-100 dark:border-slate-800"><div className="bg-green-500 h-10 flex items-center justify-center text-white font-bold text-xs rounded-lg">35</div></td>
                  <td className="p-1 border-b border-slate-100 dark:border-slate-800"><div className="bg-red-500 h-10 flex items-center justify-center text-white font-bold text-xs rounded-lg">22</div></td>
                  <td className="p-1 border-b border-slate-100 dark:border-slate-800"><div className="bg-red-500 h-10 flex items-center justify-center text-white font-bold text-xs rounded-lg">21</div></td>
                </tr>
                <tr>
                  <td className="p-2 text-sm font-semibold border-b border-slate-100 dark:border-slate-800">Tarde</td>
                  <td className="p-1 border-b border-slate-100 dark:border-slate-800"><div className="bg-green-500 h-10 flex items-center justify-center text-white font-bold text-xs rounded-lg">34</div></td>
                  <td className="p-1 border-b border-slate-100 dark:border-slate-800"><div className="bg-green-500 h-10 flex items-center justify-center text-white font-bold text-xs rounded-lg">32</div></td>
                  <td className="p-1 border-b border-slate-100 dark:border-slate-800"><div className="bg-green-500 h-10 flex items-center justify-center text-white font-bold text-xs rounded-lg">31</div></td>
                  <td className="p-1 border-b border-slate-100 dark:border-slate-800"><div className="bg-green-500 h-10 flex items-center justify-center text-white font-bold text-xs rounded-lg">32</div></td>
                  <td className="p-1 border-b border-slate-100 dark:border-slate-800"><div className="bg-green-500 h-10 flex items-center justify-center text-white font-bold text-xs rounded-lg">38</div></td>
                  <td className="p-1 border-b border-slate-100 dark:border-slate-800"><div className="bg-yellow-400 h-10 flex items-center justify-center text-slate-900 font-bold text-xs rounded-lg">28</div></td>
                  <td className="p-1 border-b border-slate-100 dark:border-slate-800"><div className="bg-yellow-400 h-10 flex items-center justify-center text-slate-900 font-bold text-xs rounded-lg">27</div></td>
                </tr>
                <tr>
                  <td className="p-2 text-sm font-semibold">Noite</td>
                  <td className="p-1"><div className="bg-red-500 h-10 flex items-center justify-center text-white font-bold text-xs rounded-lg">18</div></td>
                  <td className="p-1"><div className="bg-red-500 h-10 flex items-center justify-center text-white font-bold text-xs rounded-lg">18</div></td>
                  <td className="p-1"><div className="bg-red-500 h-10 flex items-center justify-center text-white font-bold text-xs rounded-lg">20</div></td>
                  <td className="p-1"><div className="bg-red-500 h-10 flex items-center justify-center text-white font-bold text-xs rounded-lg">19</div></td>
                  <td className="p-1"><div className="bg-yellow-400 h-10 flex items-center justify-center text-slate-900 font-bold text-xs rounded-lg">25</div></td>
                  <td className="p-1"><div className="bg-red-500 h-10 flex items-center justify-center text-white font-bold text-xs rounded-lg">15</div></td>
                  <td className="p-1"><div className="bg-red-500 h-10 flex items-center justify-center text-white font-bold text-xs rounded-lg">14</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <footer className="mt-auto p-8 border-t border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
        © 2024 Sistame Escala. Todos os direitos reservados.
      </footer>
    </>
  );
}
