'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Employee } from './data/employees';

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('employees').select('*');
    if (data) setEmployees(data as Employee[]);
    setIsLoading(false);
  };
  const getWeekCoverage = () => {
    const coverage = {
      t1: [0, 0, 0, 0, 0, 0, 0], // seg to dom
      t2t3: [0, 0, 0, 0, 0, 0, 0],
      t4: [0, 0, 0, 0, 0, 0, 0]
    };
    const typicalWeekDays = [1, 2, 3, 4, 5, 6, 7]; // monday to sunday
    const firstDayOfWeek = 1; // standardizing on Monday

    employees.forEach((emp, idx) => {
      if (emp.status === 'ferias') return;
      const checkNormalOff = (d: number) => {
        const wd = (d - 1 + firstDayOfWeek) % 7;
        if (emp.sex === 'F' && wd === 0) {
          let sundaysCount = 0;
          for (let i = 1; i <= d; i++) { if ((i - 1 + firstDayOfWeek) % 7 === 0) sundaysCount++; }
          if (sundaysCount === 1 || sundaysCount === 3) return true;
        }
        const folgaDay = (idx % 6);
        if (wd === folgaDay && wd !== 0) return true;
        if (wd === 0 && idx % 2 === 0) return true;
        if (wd === 6) {
          let saturdaysCount = 0;
          for (let i = 1; i <= d; i++) { if ((i - 1 + firstDayOfWeek) % 7 === 6) saturdaysCount++; }
          if ((idx + saturdaysCount) % 2 === 0) return true;
        }
        return false;
      };

      typicalWeekDays.forEach((d, dayIndex) => {
        if (!checkNormalOff(d)) {
          if (emp.shift === 'T1') coverage.t1[dayIndex]++;
          if (emp.shift === 'T2' || emp.shift === 'T3') coverage.t2t3[dayIndex]++;
          if (emp.shift === 'T4') coverage.t4[dayIndex]++;
        }
      });
    });
    return coverage;
  };

  const cov = getWeekCoverage();

  const getShiftColor = (val: number, type: 'T1' | 'T2T3' | 'T4' | 'TOTAL') => {
    if (type === 'TOTAL') {
      if (val >= 30) return 'bg-green-500 text-white';
      if (val >= 25) return 'bg-yellow-400 text-slate-900';
      return 'bg-red-500 text-white';
    }
    if (type === 'T1') {
      if (val >= 17) return 'bg-green-500 text-white';
      if (val >= 14) return 'bg-yellow-400 text-slate-900';
      return 'bg-red-500 text-white';
    }
    if (type === 'T2T3') {
      if (val >= 13) return 'bg-green-500 text-white';
      if (val >= 11) return 'bg-yellow-400 text-slate-900';
      return 'bg-red-500 text-white';
    }
    if (type === 'T4') {
      if (val >= 4) return 'bg-green-500 text-white';
      if (val >= 3) return 'bg-yellow-400 text-slate-900';
      return 'bg-red-500 text-white';
    }
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
  };

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
              <h3 className="text-2xl font-bold mt-2">{employees.length}</h3>
              <p className="text-xs text-slate-400 mt-1">
                T1:{employees.filter(e => e.shift === 'T1' && e.status === 'ativo').length} |
                T2:{employees.filter(e => e.shift === 'T2' && e.status === 'ativo').length} |
                T3:{employees.filter(e => e.shift === 'T3' && e.status === 'ativo').length} |
                T4:{employees.filter(e => e.shift === 'T4' && e.status === 'ativo').length} |
                Férias:{employees.filter(e => e.status === 'ferias').length}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-none">Alertas de Cobertura</p>
              <h3 className="text-2xl font-bold mt-2 text-red-600 dark:text-red-400">2</h3>
              <p className="text-xs text-slate-400 mt-1">Déficit: Sáb e Dom</p>
            </div>
          </div>
          <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
              <span className="material-symbols-outlined text-2xl">flight_takeoff</span>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-none">Em Férias</p>
              <h3 className="text-2xl font-bold mt-2">3</h3>
              <p className="text-xs text-slate-400 mt-1">Limite: 3/mês</p>
            </div>
          </div>
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart: Bar Chart Horas por Turno */}
          <div className="lg:col-span-2 bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Horas por Turno</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Colaboradores por Turno</span>
              </div>
            </div>
            <div className="h-48 flex items-stretch justify-between gap-4 px-2 mt-4 pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex-1 flex flex-col items-center justify-end group">
                <div
                  className="w-full bg-primary rounded-t-lg relative flex flex-col justify-end transition-all"
                  style={{ height: `${(employees.filter(e => e.shift === 'T1').length / (employees.length || 1)) * 100}%` }}
                >
                  <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-md font-bold text-center w-full whitespace-nowrap">
                    {employees.filter(e => e.shift === 'T1').length} colab.
                  </span>
                </div>
                <p className="text-[11px] mt-2 font-bold text-slate-500 uppercase tracking-tighter whitespace-nowrap">T1 (06-15h)</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-end group">
                <div
                  className="w-full bg-primary rounded-t-lg relative flex flex-col justify-end transition-all"
                  style={{ height: `${(employees.filter(e => e.shift === 'T2').length / (employees.length || 1)) * 100}%` }}
                >
                  <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-md font-bold text-center w-full whitespace-nowrap">
                    {employees.filter(e => e.shift === 'T2').length} colab.
                  </span>
                </div>
                <p className="text-[11px] mt-2 font-bold text-slate-500 uppercase tracking-tighter whitespace-nowrap">T2 (13-22h)</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-end group">
                <div
                  className="w-full bg-primary rounded-t-lg relative flex flex-col justify-end transition-all"
                  style={{ height: `${(employees.filter(e => e.shift === 'T3').length / (employees.length || 1)) * 100}%` }}
                >
                  <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-md font-bold text-center w-full whitespace-nowrap">
                    {employees.filter(e => e.shift === 'T3').length} colab.
                  </span>
                </div>
                <p className="text-[11px] mt-2 font-bold text-slate-500 uppercase tracking-tighter whitespace-nowrap">T3 (14-23h)</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-end group">
                <div
                  className="w-full bg-primary rounded-t-lg relative flex flex-col justify-end transition-all"
                  style={{ height: `${(employees.filter(e => e.shift === 'T4').length / (employees.length || 1)) * 100}%` }}
                >
                  <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-md font-bold text-center w-full whitespace-nowrap">
                    {employees.filter(e => e.shift === 'T4').length} colab.
                  </span>
                </div>
                <p className="text-[11px] mt-2 font-bold text-slate-500 uppercase tracking-tighter whitespace-nowrap">T4 (22-06h)</p>
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
                    <Image className="w-full h-full object-cover" alt="User avatar male" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrBsVo7oV1Eo1kTQhThCSLlnjZFzML7Am5RhzqxKcFR9puN3bRl7BW8B-0d2h9kRh4zto2aMa_X7WQzJu7oCd1d7VQOy-YGZ3lqStbJJOG76i7v-ZA44LAZrov21Ms8HQVEQXaPcwZF9fmmil1c_nFlAd24NfaEw7OTG6ZMf0OgImCRIk1N1cunGlEwFeRiDEtYtx5SHDO3f5RagOp9u2ZkIhj7sZIqqOMhKMFvnj9ZAvy2q-0_vkuCuVNRFGgVXW2yMpJCpxkkiU" width={32} height={32} />
                  </div>
                  <span className="text-sm font-medium">Carlos da Silva</span>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">176h</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">2</span>
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <Image className="w-full h-full object-cover" alt="User avatar female" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKZo7h9ubyRgziA03nT-wxkhuHSrm6PdhcPe0rf65abtKIn6CETfEQRmYIQ8wXvXXW3s_2jYzVQv2lpV2yK5VAFLcVx6gQfDuPM1De-ifXl-e23FtEL6mjwj2TNZ2kEkKo3LxuI1kCv_ZKslZJFillpRjOcEUk7VmdjLRP_cd-nj9E36MhIfDXUVYVMt3hgDnM8x2PN7uoNv9Wg0OOHaddXGZWNdDO9-nVJV0YQfVJ933M7c6CjP7bjgwwCMylMy5yKDkqmu2PJwI" width={32} height={32} />
                  </div>
                  <span className="text-sm font-medium">Ana B. Rocha</span>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">168h</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">3</span>
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <Image className="w-full h-full object-cover" alt="User avatar male" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBx_u1Apyq-jm0tMvyvchDIb4_GtpUGaFfoHcZsGhL4xsv-pQUforLtFPIuXmzJH68YeYY95UAdJyR3uo8TWNcRkO2GEwRMa9bbF-TL7H1ivWl1dQ2GbrpCEzL6dUiXxUk9qlfZ4pLHrLS2KHnZ3WRsFbPmRLeBMP2OiPdZGcVd4APUFnhDmsYrnRSZVM0wktu9rrWekPyjTBn1mJ98DAdug8dlYIu4jgvIux938vrylusK8t9MQ43RS7KhWt9bUflYNKqM_fMcy2Y" width={32} height={32} />
                  </div>
                  <span className="text-sm font-medium">Roberto Almeida</span>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">160h</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">4</span>
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <Image className="w-full h-full object-cover" alt="User avatar female" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIbZxat8bf41ZL1Hsk_p5nO792jlXFGJfzxNPdKLMiNMIy3akc3YSlmdLVisiGKjaV8E0vFMSa_ajZyXVIbPt0rigqGJDdEvBc-bUqM3HuhQCpCtFBpfuaLBGlHi-0LG83w23ZKFYccL253P_LOVh7Y9g81Z_NHuqZTmiRsLBq9s6tVSWk6lpMh8_4NSZXdC5K6ZnClubcqpcKUpLIvRw8kuCtR9UB_KVZwGq0ig2cBg5QWmD9LH0zFZ46zV35X9CCEzVJSk0W3j4" width={32} height={32} />
                  </div>
                  <span className="text-sm font-medium">Juliana Mendes</span>
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
              <p className="text-sm text-slate-500">Visualização de gaps de pessoal (Meta: &gt;25 colaboradores manhã+tarde)</p>
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
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-2 text-sm font-semibold whitespace-nowrap">T1 (06-15h)</td>
                  {cov.t1.map((val, i) => (
                    <td key={i} className="p-1">
                      <div className={`h-10 flex items-center justify-center font-bold text-xs rounded-lg shadow-sm ${getShiftColor(val, 'T1')}`}>
                        {val}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-2 text-sm font-semibold whitespace-nowrap">T2+T3 (13-23h)</td>
                  {cov.t2t3.map((val, i) => (
                    <td key={i} className="p-1">
                      <div className={`h-10 flex items-center justify-center font-bold text-xs rounded-lg shadow-sm ${getShiftColor(val, 'T2T3')}`}>
                        {val}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-2 text-sm font-bold whitespace-nowrap text-primary">Total M+T</td>
                  {cov.t1.map((val, i) => {
                    const total = val + cov.t2t3[i];
                    return (
                      <td key={i} className="p-1">
                        <div className={`h-10 flex items-center justify-center font-bold text-xs rounded-lg shadow-sm ${getShiftColor(total, 'TOTAL')}`}>
                          {total}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-2 text-sm font-semibold whitespace-nowrap">T4 (22-06h)</td>
                  {cov.t4.map((val, i) => (
                    <td key={i} className="p-1">
                      <div className={`h-10 flex items-center justify-center font-bold text-xs rounded-lg shadow-sm ${getShiftColor(val, 'T4')}`}>
                        {val}
                      </div>
                    </td>
                  ))}
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
