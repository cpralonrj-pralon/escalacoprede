'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Employee, ScaleEdit, ShiftType } from './data/employees';

// ===== TIPOS =====
export type CellValue = 'T1' | 'T2' | 'T3' | 'T4' | 'FG' | 'FE' | 'FR' | 'FF' | 'COM' | 'DSR';

const SHIFT_HOURS: Record<string, { start: number; end: number }> = {
  'T1': { start: 6.0, end: 15.8 },
  'T2': { start: 13.0, end: 22.8 },
  'T3': { start: 14.0, end: 23.8 },
  'T4': { start: 22.0, end: 30.58 },
  'FG': { start: 0, end: 0 },
  'DSR': { start: 0, end: 0 },
  'FE': { start: 0, end: 0 },
  'FR': { start: 0, end: 0 },
  'FF': { start: 0, end: 0 },
  'COM': { start: 0, end: 0 },
};

const SHIFT_DURATIONS: Record<string, number> = {
  'T1': 8.8, 'T2': 8.8, 'T3': 8.8, 'T4': 8.8,
  'FG': 0, 'FE': 0, 'FF': 0, 'FR': 0, 'COM': 0, 'DSR': 0
};

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [manualEdits, setManualEdits] = useState<Record<string, string>>({});
  const [feriadosMes, setFeriadosMes] = useState<number[]>([]);

  const now = new Date();
  const todayDate = now.getDate();
  const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');
  const currentYearStr = now.getFullYear().toString();

  const monthsMap: Record<string, string> = {
    'Janeiro': '01', 'Fevereiro': '02', 'Março': '03', 'Abril': '04',
    'Maio': '05', 'Junho': '06', 'Julho': '07', 'Agosto': '08',
    'Setembro': '09', 'Outubro': '10', 'Novembro': '11', 'Dezembro': '12'
  };

  const getDaysInMonth = (m: number, y: number) => new Date(y, m, 0).getDate();
  const getFirstDayOfWeek = (m: number, y: number) => new Date(y, m - 1, 1).getDay();

  const numDays = getDaysInMonth(now.getMonth() + 1, now.getFullYear());
  const firstDayOfWeek = getFirstDayOfWeek(now.getMonth() + 1, now.getFullYear());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: emps } = await supabase.from('employees').select('*').order('name');
    if (emps) setEmployees(emps as Employee[]);

    const startDate = `${currentYearStr}-${currentMonthNum}-01`;
    const endDate = `${currentYearStr}-${currentMonthNum}-${String(numDays).padStart(2, '0')}`;

    const { data: edits } = await supabase.from('scale_edits').select('*').gte('date', startDate).lte('date', endDate);
    if (edits) {
      const map: Record<string, string> = {};
      edits.forEach((e: any) => {
        const d = parseInt(e.date.split('-')[2]);
        map[`${e.employee_id}-${currentYearStr}-${currentMonthNum}-${d}`] = e.shift_value;
      });
      setManualEdits(map);
    }

    const { data: holidays } = await supabase.from('holidays').select('date').gte('date', startDate).lte('date', endDate);
    if (holidays) setFeriadosMes(holidays.map((h: any) => parseInt(h.date.split('-')[2])));

    setIsLoading(false);
  };
  const getCell = (emp: Employee, day: number): { val: CellValue, bg: string } => {
    const key = `${emp.id}-${currentYearStr}-${currentMonthNum}-${day}`;

    if (manualEdits[key]) {
      const v = manualEdits[key] as CellValue;
      const displayVal = (v === 'DSR' || v === 'COM') ? 'FG' : v;
      const bgs: any = {
        T1: 'bg-[#3b82f6]', T2: 'bg-[#8b5cf6]', T3: 'bg-[#ef4444]', T4: 'bg-[#f59e0b]',
        FG: 'bg-[#10b981]', FE: 'bg-[#000000]', FF: 'bg-[#059669]', FR: 'bg-[#d97706]'
      };
      return { val: displayVal, bg: bgs[v] || 'bg-slate-700' };
    }

    if (emp.status === 'ferias') return { val: 'FE', bg: 'bg-[#000000]' };

    const males = employees.filter(e => e.sex === 'M');
    const females = employees.filter(e => e.sex === 'F');
    const mIdx = males.indexOf(emp);
    const fIdx = females.indexOf(emp);

    const getTheoreticalOffType = (d: number): boolean => {
      const wd = (d - 1 + firstDayOfWeek) % 7;
      if (emp.sex === 'M') {
        const pairs = [[1, 6], [2, 0], [3, 6], [4, 0], [5, 6], [0, 1], [2, 3]];
        const myPair = pairs[mIdx % 7];
        return wd === myPair[0] || wd === myPair[1];
      } else {
        const isF1 = fIdx % 2 === 0;
        let sunCount = 0;
        for (let i = 1; i <= d; i++) if ((i - 1 + firstDayOfWeek) % 7 === 0) sunCount++;
        if (isF1) {
          if (wd === 6) return true;
          if (wd === 0 && sunCount % 2 !== 0) return true;
          if (wd === 5 && sunCount % 2 === 0) return true;
        } else {
          if (wd === 0) return true;
          if (wd === 1 && sunCount % 2 !== 0) return true;
          if (wd === 6 && sunCount % 2 === 0) return true;
        }
      }
      return false;
    };

    const isH = feriadosMes.includes(day);
    const isOff = getTheoreticalOffType(day);
    const gIdx = employees.indexOf(emp);

    if (isH) {
      if (gIdx % 2 !== 0) return { val: 'FF', bg: 'bg-[#059669]' };
    }
    if (isOff) return { val: 'FG', bg: 'bg-[#10b981]' };

    const colors: any = { T1: 'bg-[#3b82f6]', T2: 'bg-[#8b5cf6]', T3: 'bg-[#ef4444]', T4: 'bg-[#f59e0b]' };
    return { val: emp.shift as CellValue, bg: colors[emp.shift] || 'bg-slate-700' };
  };

  const getMonthlyHours = (emp: Employee) => {
    let total = 0;
    for (let d = 1; d <= numDays; d++) {
      const { val } = getCell(emp, d);
      total += SHIFT_DURATIONS[val] || 0;
    }
    return Math.round(total * 10) / 10;
  };

  const getDayStats = (dayNum: number) => {
    const stats = { t1: 0, t2: 0, t3: 0, t4: 0, fg: 0, active: 0 };
    employees.forEach(emp => {
      const { val } = getCell(emp, dayNum);
      if (val === 'T1') { stats.t1++; stats.active++; }
      else if (val === 'T2') { stats.t2++; stats.active++; }
      else if (val === 'T3') { stats.t3++; stats.active++; }
      else if (val === 'T4') { stats.t4++; stats.active++; }
      else if (val === 'FG') stats.fg++;
    });
    return stats;
  };

  const getWeekCoverage = () => {
    const coverage = {
      t1: [0, 0, 0, 0, 0, 0, 0],
      t2t3: [0, 0, 0, 0, 0, 0, 0],
      t4: [0, 0, 0, 0, 0, 0, 0]
    };

    // We'll calculate for the current week
    const dateObj = new Date();
    const dayOfWeek = dateObj.getDay();
    const diffToSun = dayOfWeek;

    for (let i = 0; i < 7; i++) {
      const d = todayDate - diffToSun + i;
      if (d >= 1 && d <= numDays) {
        const stats = getDayStats(d);
        coverage.t1[i] = stats.t1;
        coverage.t2t3[i] = stats.t2 + stats.t3;
        coverage.t4[i] = stats.t4;
      }
    }
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
        {/* TOP KPIs: Utilização da Força de Trabalho */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Card Total (Geral) */}
          <div className="bg-[#0f1423] p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group">
            <div className={`absolute -top-4 -right-4 w-20 h-20 ${getDayStats(todayDate).t1 + getDayStats(todayDate).t2 + getDayStats(todayDate).t3 < 25 ? 'bg-red-600/10 animate-pulse' : 'bg-blue-600/5'} rounded-full blur-2xl`}></div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Utilização Total</h4>
              {getDayStats(todayDate).t1 + getDayStats(todayDate).t2 + getDayStats(todayDate).t3 < 25 && (
                <span className="flex items-center gap-1 text-[8px] font-black text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-full border border-red-500/20 animate-pulse">
                  <span className="material-symbols-outlined text-[10px]">warning</span> DÉFICIT
                </span>
              )}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-black text-white tracking-tighter">
                  {getDayStats(todayDate).active} <span className="text-slate-700 text-lg">/ {employees.length}</span>
                </div>
                <div className="text-[10px] font-black text-blue-500 mt-1 uppercase tracking-tighter">Colaboradores Hoje</div>
              </div>
              <div className="bg-blue-500/10 text-blue-500 font-black text-[14px] px-2 py-1 rounded-lg border border-blue-500/20">
                {Math.round((getDayStats(todayDate).active / (employees.length || 1)) * 100)}%
              </div>
            </div>
          </div>

          {/* Cards por Turno */}
          {['T1', 'T2', 'T3', 'T4'].map((t) => {
            const stats = getDayStats(todayDate);
            const active = stats[t.toLowerCase() as keyof typeof stats] as number;
            const totalInShift = employees.filter(e => e.shift === t).length;
            const pct = totalInShift > 0 ? Math.round((active / totalInShift) * 100) : 0;

            const shiftColors: Record<string, string> = {
              T1: 'text-blue-400 border-blue-400/20 bg-blue-400/5',
              T2: 'text-purple-400 border-purple-400/20 bg-purple-400/5',
              T3: 'text-red-400 border-red-400/20 bg-red-400/5',
              T4: 'text-amber-400 border-amber-400/20 bg-amber-400/5'
            };

            return (
              <div key={t} className="bg-[#0f1423] p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group">
                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Utilização {t}</h4>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-black text-white tracking-tighter">
                      {active} <span className="text-slate-700 text-base">/ {totalInShift}</span>
                    </div>
                    <div className="text-[10px] font-black text-slate-500 mt-1 uppercase tracking-tighter">Escalados</div>
                  </div>
                  <div className={`font-black text-[12px] px-2 py-1 rounded-lg border ${shiftColors[t]}`}>
                    {pct}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart: Carga Horária por Turno */}
          <div className="lg:col-span-2 bg-[#0f1423] p-10 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl"></div>
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="font-black text-white text-sm uppercase tracking-[0.2em] mb-1">Carga Horária por Turno</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Distribuição de esforço para hoje, dia {todayDate}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                  <span className="text-[8px] font-black text-slate-400">HORAS TOTAIS</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                  <span className="text-[8px] font-black text-slate-400">COLABORADORES</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 items-end h-56 relative pt-12">
              {['T1', 'T2', 'T3', 'T4'].map(shift => {
                const stats = getDayStats(todayDate);
                const count = stats[shift.toLowerCase() as keyof typeof stats] as number;
                const hours = Math.round(count * 8.8 * 10) / 10;
                const shiftPct = stats.active > 0 ? Math.round((count / stats.active) * 100) : 0;
                const maxPossibleHours = (employees.length / 2) * 8.8 || 1;
                const heightPercent = Math.min(Math.max((hours / maxPossibleHours) * 180, 40), 180);

                return (
                  <div key={shift} className="relative flex flex-col items-center group/bar w-full">
                    <div className="absolute -top-14 flex flex-col items-center z-20">
                      <div className="text-[9px] font-black text-blue-400/80 mb-1 tracking-widest">{shiftPct}%</div>
                      <div className="bg-blue-600 text-white font-black text-[12px] px-3 py-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-white/20">
                        {hours}h
                      </div>
                      <div className="w-2 h-2 bg-blue-600 rotate-45 -mt-1 shadow-[0_0_10px_rgba(59,130,246,0.4)]"></div>
                    </div>

                    <div
                      className="w-full bg-gradient-to-t from-blue-700 to-blue-500 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.15)] relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:scale-105 cursor-grab"
                      style={{ height: `${heightPercent}px` }}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-30"></div>
                      <div className="absolute bottom-3 left-0 right-0 text-center">
                        <div className="text-white font-black text-[18px] leading-none mb-1">{count}</div>
                        <div className="text-white/50 font-black text-[7px] uppercase tracking-tighter">PESSOAS</div>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <div className="text-white font-black text-[11px] tracking-widest">{shift}</div>
                      <div className="text-slate-600 font-bold text-[8px] uppercase tracking-tighter whitespace-nowrap">
                        {SHIFT_HOURS[shift].start}:00 - {SHIFT_HOURS[shift].end < 24 ? SHIFT_HOURS[shift].end.toFixed(0) : (SHIFT_HOURS[shift].end - 24).toFixed(0)}:00
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ranking: Top Colaboradores (Real Data) */}
          <div className="bg-[#0f1423] p-6 rounded-2xl border border-white/5 shadow-2xl flex flex-col relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-all"></div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-white uppercase tracking-widest text-[11px]">Mais Ativos (Top 5)</h3>
              <span className="text-[10px] font-black text-slate-500 uppercase">Horas Mês</span>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {employees
                .map(emp => ({ ...emp, totalHours: getMonthlyHours(emp) }))
                .sort((a, b) => b.totalHours - a.totalHours)
                .slice(0, 5)
                .map((emp, idx) => (
                  <div key={emp.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.02] transition-all group/item border border-transparent hover:border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-600 w-4">{idx + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-slate-400 text-[10px] group-hover/item:border-blue-500/50 transition-colors">
                        {emp.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-sm font-bold text-slate-300">{emp.name}</span>
                    </div>
                    <span className="text-[10px] font-black px-2 py-1 bg-blue-600/10 text-blue-500 rounded-lg border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                      {emp.totalHours}h
                    </span>
                  </div>
                ))}
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
