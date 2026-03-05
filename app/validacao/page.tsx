'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShiftType, Employee } from '../data/employees';
import { CellValue } from '../escalas/page';

// Horários de Turno para Cálculo de Interjornada (11h)
const SHIFT_HOURS: Record<string, { start: number; end: number }> = {
  'T1': { start: 6.0, end: 15.8 },      // 06:00 - 15:48
  'T2': { start: 13.0, end: 22.8 },     // 13:00 - 22:48
  'T3': { start: 14.0, end: 23.8 },     // 14:00 - 23:48
  'T4': { start: 22.0, end: 30.58 },    // 22:00 - 06:35 (dia seguinte)
  'FG': { start: 0, end: 0 },
  'FE': { start: 0, end: 0 },
  'FR': { start: 0, end: 0 },
  'FF': { start: 0, end: 0 },
};


export default function Validacao() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mes, setMes] = useState('Março');
  const [ano, setAno] = useState('2026');
  const [todayDate, setTodayDate] = useState<number | null>(null);
  const [manualEdits, setManualEdits] = useState<Record<string, string>>({});
  const [conflicts, setConflicts] = useState<{ empName: string; day: number; rest: number }[]>([]);


  const monthsMap: Record<string, string> = {
    'Janeiro': '01', 'Fevereiro': '02', 'Março': '03', 'Abril': '04',
    'Maio': '05', 'Junho': '06', 'Julho': '07', 'Agosto': '08',
    'Setembro': '09', 'Outubro': '10', 'Novembro': '11', 'Dezembro': '12'
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('employees').select('*').order('name');
      if (data) setEmployees(data as Employee[]);
      setIsLoading(false);
    };
    fetchEmployees();

    const now = new Date();
    setTodayDate(now.getDate());
    const currentMonthStr = Object.keys(monthsMap).find(k => parseInt(monthsMap[k]) === now.getMonth() + 1) || 'Março';
    setMes(currentMonthStr);
    setAno(now.getFullYear().toString());
  }, []);

  useEffect(() => {
    const fetchEdits = async () => {
      const monthNum = monthsMap[mes] || '03';
      const numDays = getDaysInMonth(mes, ano);
      const startDate = `${ano}-${monthNum}-01`;
      const endDate = `${ano}-${monthNum}-${String(numDays).padStart(2, '0')}`;

      const { data } = await supabase
        .from('scale_edits')
        .select('employee_id, date, shift_value')
        .gte('date', startDate)
        .lte('date', endDate);

      if (data) {
        const editsMap: Record<string, string> = {};
        data.forEach(edit => {
          const dateParts = edit.date.split('-');
          const day = parseInt(dateParts[2], 10);
          const key = `${edit.employee_id}-${ano}-${monthNum}-${day}`;
          editsMap[key] = edit.shift_value;
        });
        setManualEdits(editsMap);
      }
    };

    if (!isLoading && employees.length > 0) {
      fetchEdits();
    }
  }, [ano, mes, isLoading, employees]);

  const getDaysInMonth = (monthName: string, yearStr: string) => {
    const m = parseInt(monthsMap[monthName] || '03', 10);
    const y = parseInt(yearStr, 10);
    return new Date(y, m, 0).getDate();
  };

  const checkNormalOff = (d: number, emp: Employee) => {
    const date = new Date(parseInt(ano), parseInt(monthsMap[mes]) - 1, d);
    const dayOfWeek = date.getDay();
    const isOdd = parseInt(emp.id.split('-')[1]) % 2 !== 0;

    if (emp.shift === 'T1') {
      if (dayOfWeek === 0) return true;
      if (dayOfWeek === 6 && isOdd) return true;
    } else if (emp.shift === 'T2' || emp.shift === 'T3') {
      if (dayOfWeek === 1) return true;
      if (dayOfWeek === 6 && !isOdd) return true;
    } else if (emp.shift === 'T4') {
      if (dayOfWeek === 2) return true;
      if (dayOfWeek === 0 && !isOdd) return true;
    }
    return false;
  };

  const getCellVal = (emp: Employee, d: number) => {
    const key = `${emp.id}-${ano}-${monthsMap[mes]}-${d}`;
    let val = manualEdits[key];
    if (val === 'FG') {
      const date = new Date(parseInt(ano), parseInt(monthsMap[mes]) - 1, d);
      const wd = date.getDay();
      if (wd === 6) val = 'DSR';
      if (wd === 0) val = 'COM';
    }
    if (val) return val;
    if (emp.status === 'ferias') return 'FE';
    if (checkNormalOff(d, emp)) {
      const date = new Date(parseInt(ano), parseInt(monthsMap[mes]) - 1, d);
      const wd = date.getDay();
      if (wd === 6) return 'DSR';
      if (wd === 0) return 'COM';
      return wd % 2 === 0 ? 'DSR' : 'COM';
    }
    return emp.shift;
  };

  const getStats = (dayNum: number) => {
    const stats = { t1: 0, t2: 0, t3: 0, t4: 0 };
    employees.forEach(emp => {
      const val = getCellVal(emp, dayNum);
      if (val === 'T1') stats.t1++;
      else if (val === 'T2') stats.t2++;
      else if (val === 'T3') stats.t3++;
      else if (val === 'T4') stats.t4++;
    });
    return stats;
  };

  const numDays = getDaysInMonth(mes, ano);
  const days = Array.from({ length: numDays }, (_, i) => i + 1);

  // Verificação de Interjornada (11h)
  useEffect(() => {
    const newConflicts: { empName: string; day: number; rest: number }[] = [];
    employees.forEach(emp => {
      for (let d = 1; d < numDays; d++) {
        const valToday = getCellVal(emp, d);
        const valTomorrow = getCellVal(emp, d + 1);
        const todayEnd = SHIFT_HOURS[valToday as string]?.end || 0;
        const tomorrowStart = SHIFT_HOURS[valTomorrow as string]?.start || 0;
        if (todayEnd > 0 && tomorrowStart > 0) {
          const restHours = (24 - (todayEnd % 24)) + tomorrowStart;
          if (restHours < 11 && restHours > 0) {
            newConflicts.push({ empName: emp.name, day: d + 1, rest: Math.round(restHours * 10) / 10 });
          }
        }
      }
    });
    setConflicts(newConflicts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualEdits, mes, ano, numDays, employees]);

  let defictsCount = 0;
  let totalPctSum = 0;
  let nextCriticalStr = 'Nenhum';
  const dailyValidationData: any[] = [];

  for (const d of days) {
    const s = getStats(d);
    const mt = s.t1 + s.t2 + s.t3;
    const isCritical = mt < 20;
    const isAlert = mt >= 20 && mt < 25;
    if (isCritical) defictsCount++;
    const dayPct = Math.min((mt / 25) * 100, 100);
    totalPctSum += dayPct;

    if (isCritical && d >= (todayDate || 1) && nextCriticalStr === 'Nenhum') {
      nextCriticalStr = `T2 - ${d < 10 ? '0' + d : d}/${monthsMap[mes]}`;
    }

    dailyValidationData.push({ day: d, ...s, mt, isCritical, isAlert });
  }
  const avgCoverage = days.length > 0 ? Math.round(totalPctSum / days.length) : 0;

  const handlePrevMonth = () => {
    const monthList = Object.keys(monthsMap);
    const currIdx = monthList.indexOf(mes);
    if (currIdx > 0) setMes(monthList[currIdx - 1]);
    else { setMes(monthList[11]); setAno((parseInt(ano) - 1).toString()); }
  };

  const handleNextMonth = () => {
    const monthList = Object.keys(monthsMap);
    const currIdx = monthList.indexOf(mes);
    if (currIdx < 11) setMes(monthList[currIdx + 1]);
    else { setMes(monthList[0]); setAno((parseInt(ano) + 1).toString()); }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark h-screen">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Carregando auditoria da nuvem...</p>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Validação e Auditoria de Escala</h1>
          <p className="text-sm text-slate-500">Módulo de análise de cobertura e detecção de déficits críticos.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePrevMonth}
              title="Mês anterior"
              aria-label="Mês anterior"
              className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span className="px-4 text-sm font-bold" aria-live="polite">{mes} {ano}</span>
            <button
              onClick={handleNextMonth}
              title="Próximo mês"
              aria-label="Próximo mês"
              className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          <button
            disabled={conflicts.length > 0}
            title={conflicts.length > 0 ? "Corrija os conflitos de interjornada antes de exportar" : "Exportar Relatório"}
            className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${conflicts.length > 0
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-50'
              : 'bg-primary text-white hover:opacity-90'
              }`}
          >
            <span className="material-symbols-outlined text-base">download</span>
            Exportar Relatório
          </button>
        </div>
      </header>
      <div className="p-8 space-y-6">
        {/* Alerta de Interjornada */}
        {conflicts.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-xl p-4 flex items-start gap-4 shadow-sm animate-pulse">
            <span className="material-symbols-outlined text-orange-600">priority_high</span>
            <div>
              <h4 className="text-sm font-bold text-orange-800 dark:text-orange-400">Conflito de Interjornada (Descanso Mínimo 11h)</h4>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                Foram identificadas {conflicts.length} violações do descanso legal de 11 horas. O salvamento/exportação está bloqueado.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {conflicts.slice(0, 8).map((c, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-900 rounded text-[10px] font-medium text-orange-700">
                    {c.empName} (Dia {c.day}): {c.rest}h descanso
                  </span>
                ))}
                {conflicts.length > 8 && <span className="text-[10px] text-orange-600 font-bold">+{conflicts.length - 8} mais...</span>}
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Déficits Detectados</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{defictsCount} Turnos</h3>
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
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{avgCoverage}%</h3>
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
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{nextCriticalStr}</h3>
              <div className="flex items-center gap-1 mt-2 text-primary font-bold text-sm">
                <span className="material-symbols-outlined text-sm">schedule</span>
                Déficit de {(defictsCount * 2) || 8} colaboradores
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
                    {dailyValidationData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-bold">{row.day < 10 ? '0' + row.day : row.day}/{monthsMap[mes]}</td>
                        <td className={`px-6 py-4 ${row.mt < 25 ? 'text-rose-600 font-bold bg-rose-50 dark:bg-rose-900/10' : ''}`}>{row.t1}</td>
                        <td className={`px-6 py-4 ${row.mt < 25 ? 'text-rose-600 font-bold bg-rose-50 dark:bg-rose-900/10' : ''}`}>
                          {row.t2} <span className="text-[10px] ml-1 font-normal opacity-70">(M+T: {row.mt})</span>
                        </td>
                        <td className="px-6 py-4">{row.t3}</td>
                        <td className="px-6 py-4">{row.t4}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${row.isCritical ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' : row.isAlert ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'}`}>
                            {row.isCritical ? 'Crítico' : row.isAlert ? 'Alerta' : 'Ideal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-lg">Mapa de Calor (Concentração de Pessoal)</h3>
                  <p className="text-sm text-slate-500">Visualização hora a hora para o dia selecionado (01/{monthsMap[mes]})</p>
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
              <p className="text-sm text-slate-500 mb-6">Colaboradores em Folga/Descanso (FG/DSR/COM) com competência para cobrir os gaps identificados.</p>
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">Para 15/{monthsMap[mes]} (T2)</span>
                    <span className="material-symbols-outlined text-slate-400 text-sm">more_vert</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center font-bold text-primary">RM</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">Ricardo Mendes</p>
                      <p className="text-[10px] text-slate-500">Última folga: 08/{monthsMap[mes]}</p>
                    </div>
                  </div>
                  <button className="w-full mt-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-bold hover:bg-primary hover:text-white transition-all">
                    Convocar de FG
                  </button>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">Para 15/{monthsMap[mes]} (T2)</span>
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
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">Para 16/{monthsMap[mes]} (T1)</span>
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
