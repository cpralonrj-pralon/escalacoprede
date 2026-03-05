'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Employee, ScaleEdit, ShiftType } from '@/app/data/employees';

// ===== TIPOS =====
export type CellValue = 'T1' | 'T2' | 'T3' | 'T4' | 'FG' | 'FE' | 'FR' | 'FF' | 'COM' | 'DSR';

// Horários de Turno para Cálculo de Interjornada (11h)
const SHIFT_HOURS: Record<string, { start: number; end: number }> = {
  'T1': { start: 6.0, end: 15.8 },      // 06:00 - 15:48
  'T2': { start: 13.0, end: 22.8 },     // 13:00 - 22:48
  'T3': { start: 14.0, end: 23.8 },     // 14:00 - 23:48
  'T4': { start: 22.0, end: 30.58 },    // 22:00 - 06:35 (dia seguinte)
  'FG': { start: 0, end: 0 },
  'DSR': { start: 0, end: 0 },
  'FE': { start: 0, end: 0 },
  'FR': { start: 0, end: 0 },
  'FF': { start: 0, end: 0 },
  'COM': { start: 0, end: 0 },
};


export default function Escalas() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mensal' | 'semanal' | 'ajustes'>('mensal');
  const [setor, setSetor] = useState('Operacional');
  const [mes, setMes] = useState('Março');
  const [ano, setAno] = useState('2026');

  const [todayDate, setTodayDate] = useState<number | null>(null);
  const [todayMonthStr, setTodayMonthStr] = useState<string | null>(null);
  const [todayYearStr, setTodayYearStr] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const monthsMap: Record<string, string> = {
    'Janeiro': '01', 'Fevereiro': '02', 'Março': '03', 'Abril': '04',
    'Maio': '05', 'Junho': '06', 'Julho': '07', 'Agosto': '08',
    'Setembro': '09', 'Outubro': '10', 'Novembro': '11', 'Dezembro': '12'
  };

  const getDaysInMonth = (monthName: string, yearStr: string) => {
    const m = parseInt(monthsMap[monthName] || '03', 10);
    const y = parseInt(yearStr, 10);
    return new Date(y, m, 0).getDate();
  };

  const getFirstDayOfWeek = (monthName: string, yearStr: string) => {
    const m = parseInt(monthsMap[monthName] || '03', 10) - 1;
    const y = parseInt(yearStr, 10);
    return new Date(y, m, 1).getDay();
  };

  const numDays = getDaysInMonth(mes, ano);
  const firstDayOfWeek = getFirstDayOfWeek(mes, ano);
  const days = Array.from({ length: numDays }, (_, i) => i + 1);

  // ===== LÓGICA DE ESCALA =====
  const [feriadosMes, setFeriadosMes] = useState<number[]>([]);
  const [manualEdits, setManualEdits] = useState<Record<string, string>>({});
  const [conflicts, setConflicts] = useState<{ empName: string; day: number; rest: number }[]>([]);


  useEffect(() => {
    const fetchEdits = async () => {
      const monthNum = monthsMap[mes] || '03';
      const startDate = `${ano}-${monthNum}-01`;
      const endDate = `${ano}-${monthNum}-${String(numDays).padStart(2, '0')}`;

      const { data, error } = await supabase
        .from('scale_edits')
        .select('employee_id, date, shift_value')
        .gte('date', startDate)
        .lte('date', endDate);

      if (data) {
        const editsMap: Record<string, string> = {};
        (data as ScaleEdit[]).forEach(edit => {
          const dateParts = edit.date.split('-'); // YYYY-MM-DD
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
  }, [ano, mes, isLoading, employees, numDays]);

  // Carregar Funcionários do Supabase
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('employees').select('*').order('name');
      if (error) {
        console.error('Erro ao buscar colaboradores:', error);
      } else if (data) {
        setEmployees(data as Employee[]);
      }
      setIsLoading(false);
    };
    fetchEmployees();
  }, []);

  const handleManualEdit = async (empId: string, day: number, newVal: string) => {
    const monthNum = monthsMap[mes] || '03';
    const key = `${empId}-${ano}-${monthNum}-${day}`;
    const newEdits = { ...manualEdits };

    const formattedDate = `${ano}-${monthNum}-${String(day).padStart(2, '0')}`;

    if (newVal === 'AUTO') {
      delete newEdits[key];
      setManualEdits(newEdits);
      await supabase
        .from('scale_edits')
        .delete()
        .match({ employee_id: empId, date: formattedDate });
    } else {
      newEdits[key] = newVal;
      setManualEdits(newEdits);
      await supabase
        .from('scale_edits')
        .upsert(
          { employee_id: empId, date: formattedDate, shift_value: newVal },
          { onConflict: 'employee_id, date' }
        );
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('sistame_feriados');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Filtrar feriados do mês/ano selecionado
        const monthNum = monthsMap[mes] || '03';
        const prefix = `${ano}-${monthNum}-`;
        const mappedDays = parsed
          .filter((f: any) => f.data.startsWith(prefix))
          .map((f: any) => parseInt(f.data.split('-')[2], 10));
        setFeriadosMes(mappedDays);
      } catch (e) {
        setFeriadosMes([]);
      }
    } else {
      setFeriadosMes([]);
    }
  }, [mes, ano]);

  useEffect(() => {
    const now = new Date();
    const currentMonthStr = Object.keys(monthsMap).find(k => parseInt(monthsMap[k]) === now.getMonth() + 1) || 'Março';
    const currentYearStr = now.getFullYear().toString();

    setMes(currentMonthStr);
    setAno(currentYearStr);
    setTodayDate(now.getDate());
    setSelectedDay(now.getDate());
    setTodayMonthStr(currentMonthStr);
    setTodayYearStr(currentYearStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrevMonth = () => {
    const monthList = Object.keys(monthsMap);
    const currIdx = monthList.indexOf(mes);
    if (currIdx > 0) {
      setMes(monthList[currIdx - 1]);
    } else {
      setMes(monthList[11]);
      setAno((parseInt(ano) - 1).toString());
    }
  };

  const handleNextMonth = () => {
    const monthList = Object.keys(monthsMap);
    const currIdx = monthList.indexOf(mes);
    if (currIdx < 11) {
      setMes(monthList[currIdx + 1]);
    } else {
      setMes(monthList[0]);
      setAno((parseInt(ano) + 1).toString());
    }
  };

  const getCell = (emp: Employee, day: number): { val: CellValue, bg: string } => {
    // 0. Manual Override
    const dateKey = `${emp.id}-${ano}-${monthsMap[mes]}-${day}`;
    if (manualEdits[dateKey]) {
      let mVal = manualEdits[dateKey] as CellValue;
      if (mVal === 'FG') {
        const wd = (day - 1 + firstDayOfWeek) % 7;
        if (wd === 6) mVal = 'DSR';
        if (wd === 0) mVal = 'COM';
      }
      const mBg: Record<string, string> = {
        'T1': 'bg-shift-t1', 'T2': 'bg-shift-t2', 'T3': 'bg-shift-t3', 'T4': 'bg-shift-t4',
        'FG': 'bg-shift-fg', 'DSR': 'bg-shift-fg', 'FE': 'bg-shift-fe',
        'FR': 'bg-amber-500',
        'COM': 'bg-amber-50 text-amber-700 font-bold border-amber-200 dark:bg-amber-900/30',
        'FF': 'bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-900/30 dark:text-emerald-400'
      };
      return { val: mVal, bg: `${mBg[mVal] || 'bg-slate-400'} ring-1 ring-inset ring-amber-500/80` };
    }

    // Férias: todos os dias = FE
    if (emp.status === 'ferias') return { val: 'FE', bg: 'bg-shift-fe' };

    const idx = employees.indexOf(emp);
    // Motor de Cálculo de Status (Sequencial para lidar com Compensação de Feriado)
    const getTheoreticalOffType = (d: number): 'DSR' | 'COM' | false => {
      const wd = (d - 1 + firstDayOfWeek) % 7;
      const groupOffDays = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [0, 1]];
      const m = parseInt(monthsMap[mes], 10) - 1;
      const y = parseInt(ano, 10);
      const currentDayDate = new Date(Date.UTC(y, m, d));
      const refDate = new Date(Date.UTC(2026, 0, 4));
      const diffDays = Math.floor((currentDayDate.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
      const absoluteWeekIdx = Math.floor(diffDays / 7);
      const baseGroup = idx % 7;
      const currentGroup = (baseGroup - absoluteWeekIdx) % 7;
      const safeGroup = (currentGroup + 7) % 7;
      const myOffDays = groupOffDays[safeGroup];

      if (emp.sex === 'F' && wd === 0) {
        if ((absoluteWeekIdx + (idx % 2)) % 2 === 0) return 'COM';
      }
      if (emp.sex === 'M' && wd === 0) {
        if ((absoluteWeekIdx + (idx % 4)) % 4 === 0) return 'COM';
      }

      if (wd === myOffDays[0] || wd === myOffDays[1]) {
        if (wd === 6) return 'DSR';
        if (wd === 0) return 'COM';

        if (myOffDays[0] === 5 && myOffDays[1] === 6) return wd === 5 ? 'COM' : 'DSR';
        if (myOffDays[0] === 0 && myOffDays[1] === 1) return wd === 1 ? 'DSR' : 'COM';

        return wd === myOffDays[0] ? 'DSR' : 'COM';
      }

      return false;
    };

    let pendingCOMs = 0;
    for (let d = 1; d <= day; d++) {
      const h = feriadosMes.includes(d);
      const offType = getTheoreticalOffType(d);
      const isHolidayOff = h && ((idx % 7) < 3);

      if (d === day) {
        if (h) {
          if (offType) pendingCOMs++;
          if (isHolidayOff) return { val: 'FF', bg: 'bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-900/30 dark:text-emerald-400' };
          return { val: emp.shift, bg: 'bg-white dark:bg-slate-900' };
        }
        if (offType) {
          if (offType === 'DSR') return { val: 'DSR', bg: 'bg-shift-fg' };
          if (offType === 'COM') return { val: 'COM', bg: 'bg-amber-50 text-amber-700 font-bold border-amber-200 dark:bg-amber-900/30' };
        }
        if (pendingCOMs > 0) return { val: 'COM', bg: 'bg-amber-50 text-amber-700 font-bold border-amber-200 dark:bg-amber-900/30' };

        const shiftColors: Record<ShiftType, string> = { T1: 'bg-shift-t1', T2: 'bg-shift-t2', T3: 'bg-shift-t3', T4: 'bg-shift-t4' };
        return { val: emp.shift, bg: shiftColors[emp.shift] };
      }

      if (h && offType) pendingCOMs++;
      if (!h && !offType && pendingCOMs > 0) pendingCOMs--;
    }

    return { val: emp.shift, bg: 'bg-white dark:bg-slate-900' };
  };

  // Funções de estatísticas de mês para o colaborador
  const getEmployeeMonthStats = (emp: Employee) => {
    let worked = 0;
    let dsr = 0; // FG
    let com = 0; // FF/FR
    let fer = 0; // FE
    for (let d = 1; d <= numDays; d++) {
      const { val } = getCell(emp, d);
      if (['T1', 'T2', 'T3', 'T4'].includes(val)) worked++;
      else if (val === 'FG' || val === 'DSR') dsr++;
      else if (['FF', 'FR', 'COM'].includes(val)) com++;
      else if (val === 'FE') fer++;
    }
    return { worked, dsr, com, fer, totalOff: dsr + com + fer };
  };

  // ===== LÓGICA DE CONTAGEM UNIFICADA =====
  const getStats = (dayNum: number) => {
    const stats = { total: 0, ativos: 0, ferias: 0, fg: 0, ff: 0, com: 0, t1: 0, t2: 0, t3: 0, t4: 0 };
    employees.forEach(emp => {
      stats.total++;
      const { val } = getCell(emp, dayNum);
      if (emp.status === 'ferias' || val === 'FE') {
        stats.ferias++;
      } else if (val === 'FG' || val === 'DSR') {
        stats.fg++;
      } else if (val === 'FF') {
        stats.ff++;
      } else if (val === 'COM') {
        stats.com++;
      } else {
        stats.ativos++;
        if (val === 'T1') stats.t1++;
        else if (val === 'T2') stats.t2++;
        else if (val === 'T3') stats.t3++;
        else if (val === 'T4') stats.t4++;
      }
    });
    return stats;
  };

  const getCoverage = (day: number) => {
    const s = getStats(day);
    return s.t1 + s.t2 + s.t3;
  };

  // Verificação de Interjornada (11h)
  useEffect(() => {
    const newConflicts: { empName: string; day: number; rest: number }[] = [];

    employees.forEach(emp => {
      for (let d = 1; d < numDays; d++) {
        const cellToday = getCell(emp, d).val;
        const cellTomorrow = getCell(emp, d + 1).val;

        const todayEnd = SHIFT_HOURS[cellToday]?.end || 0;
        const tomorrowStart = SHIFT_HOURS[cellTomorrow]?.start || 0;

        // Se ambos forem turnos de trabalho (não folga/férias)
        if (todayEnd > 0 && tomorrowStart > 0) {
          const restHours = (24 - (todayEnd % 24)) + tomorrowStart;

          if (restHours < 11 && restHours > 0) {
            newConflicts.push({
              empName: emp.name,
              day: d + 1,
              rest: Math.round(restHours * 10) / 10
            });
          }
        }
      }
    });

    setConflicts(newConflicts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualEdits, mes, ano, numDays, employees]);

  const shiftColors: Record<ShiftType, string> = {
    T1: 'bg-shift-t1',
    T2: 'bg-shift-t2',
    T3: 'bg-shift-t3',
    T4: 'bg-shift-t4',
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group filtered employees by shift for display
  const shiftGroups: { label: string; shift: ShiftType; emps: Employee[] }[] = [
    { label: 'T1 (06:00-15:48)', shift: 'T1', emps: filteredEmployees.filter(e => e.shift === 'T1' && e.status === 'ativo') },
    { label: 'T2 (13:00-22:48)', shift: 'T2', emps: filteredEmployees.filter(e => e.shift === 'T2' && e.status === 'ativo') },
    { label: 'T3 (14:00-23:48)', shift: 'T3', emps: filteredEmployees.filter(e => e.shift === 'T3' && e.status === 'ativo') },
    { label: 'T4 (22:00-06:35)', shift: 'T4', emps: filteredEmployees.filter(e => e.shift === 'T4' && e.status === 'ativo') },
  ];
  const feriasList = filteredEmployees.filter(e => e.status === 'ferias');

  // Compute stats for selected day
  const summaryDay = selectedDay || todayDate || 1;
  const dayStats = getStats(summaryDay);

  // Validação e Auditoria stats
  let defictsCount = 0;
  let totalPctSum = 0;
  let nextCriticalStr = 'Nenhum';
  const dailyValidationData: any[] = [];

  if (activeTab === 'ajustes') {
    for (const day of days) {
      const stats = getStats(day);
      const { t1, t2, t3, t4 } = stats;
      const mtCoverage = t1 + t2 + t3;
      const isCritical = mtCoverage < 20;
      const isAlert = mtCoverage >= 20 && mtCoverage < 25;

      let statusStr = isCritical ? 'CRÍTICO' : isAlert ? 'ALERTA' : 'IDEAL';
      let statusColor = isCritical ? 'bg-red-500/10 text-red-500 border-red-500/20' : isAlert ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';

      if (isCritical) defictsCount++;

      const dayPct = Math.min((mtCoverage / 25) * 100, 100);
      totalPctSum += dayPct;

      if (isCritical && day >= (todayDate || 1) && nextCriticalStr === 'Nenhum') {
        nextCriticalStr = `T2 - ${day < 10 ? '0' + day : day}/${monthsMap[mes]}`;
      }

      dailyValidationData.push({ day, t1, t2, t3, t4, mtCoverage, statusStr, statusColor, isCritical, isAlert });
    }
  }
  const avgCoverage = days.length > 0 ? Math.round(totalPctSum / days.length) : 0;

  const daysBelowMeta = activeTab === 'mensal' ? days.filter(d => {
    const wd = (d - 1 + firstDayOfWeek) % 7;
    const isWeekend = wd === 0 || wd === 6;
    return !isWeekend && getCoverage(d) < 25;
  }) : [];

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 sm:px-8 shrink-0 sticky top-0 z-10 transition-colors">
          <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">calendar_month</span>
            Módulo Escalas
          </h2>
        </header>
        <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <p className="text-slate-500 font-medium">Carregando dados da nuvem...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Escala (Grade Mensal)</h2>
        <div className="flex items-center gap-6">
          <div className="relative hidden sm:block">
            <label htmlFor="header-search" className="sr-only">Buscar funcionário</label>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              id="header-search"
              title="Buscar funcionário"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary w-64"
              placeholder="Buscar funcionário..."
              type="text"
            />
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
        <div className="max-w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Grade Mensal — {mes} {ano}</h1>
              <p className="text-xs sm:text-sm text-slate-500">43 colaboradores • Meta: ≥25 manhã+tarde</p>
            </div>
            <div className="flex gap-3">
              <button
                disabled={conflicts.length > 0}
                title={conflicts.length > 0 ? "Corrija os conflitos de interjornada antes de exportar" : "Exportar para Excel"}
                className={`flex items-center justify-center gap-2 rounded-lg h-10 px-4 border text-sm font-bold transition-all ${conflicts.length > 0
                  ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed opacity-50'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                <span className="material-symbols-outlined text-[20px]">file_download</span>
                <span>Exportar Excel</span>
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>Novo Turno</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Tabs + Filtros */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-4 flex flex-col md:flex-row items-stretch md:items-center justify-between">
              <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar border-b md:border-b-0 border-slate-200 dark:border-slate-700">
                <button onClick={() => setActiveTab('mensal')} className={`flex items-center border-b-2 py-4 px-2 text-xs sm:text-sm whitespace-nowrap transition-colors ${activeTab === 'mensal' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium'}`}>Visão Mensal</button>
                <button onClick={() => setActiveTab('semanal')} className={`flex items-center border-b-2 py-4 px-2 text-xs sm:text-sm whitespace-nowrap transition-colors ${activeTab === 'semanal' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium'}`}>Visão Semanal</button>
                <button onClick={() => setActiveTab('ajustes')} className={`flex items-center border-b-2 py-4 px-2 text-xs sm:text-sm whitespace-nowrap transition-colors ${activeTab === 'ajustes' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium'}`}>Validação e Auditoria</button>
              </div>
              <div className="flex gap-2 sm:gap-3 py-3 overflow-x-auto no-scrollbar">
                <div className="relative shrink-0">
                  <select
                    value={setor}
                    onChange={(e) => setSetor(e.target.value)}
                    title="Selecione o setor"
                    aria-label="Setor"
                    className="appearance-none flex h-8 items-center gap-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-2 pr-7 w-[110px] sm:w-[140px] text-slate-700 dark:text-slate-300 text-[10px] sm:text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="Operacional">Setor: Operacional</option>
                    <option value="Administrativo">Setor: Administrativo</option>
                    <option value="Atendimento">Setor: Atendimento</option>
                  </select>
                  <span className="material-symbols-outlined text-[14px] sm:text-[16px] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
                </div>
                <div className="relative shrink-0">
                  <select
                    value={mes}
                    onChange={(e) => setMes(e.target.value)}
                    title="Selecione o mês"
                    aria-label="Mês"
                    className="appearance-none flex h-8 items-center gap-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-2 pr-7 w-[90px] sm:w-[110px] text-slate-700 dark:text-slate-300 text-[10px] sm:text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="Janeiro">Mês: Janeiro</option>
                    <option value="Fevereiro">Mês: Fevereiro</option>
                    <option value="Março">Mês: Março</option>
                    <option value="Abril">Mês: Abril</option>
                    <option value="Maio">Mês: Maio</option>
                    <option value="Junho">Mês: Junho</option>
                    <option value="Julho">Mês: Julho</option>
                    <option value="Agosto">Mês: Agosto</option>
                    <option value="Setembro">Mês: Setembro</option>
                    <option value="Outubro">Mês: Outubro</option>
                    <option value="Novembro">Mês: Novembro</option>
                    <option value="Dezembro">Mês: Dezembro</option>
                  </select>
                  <span className="material-symbols-outlined text-[14px] sm:text-[16px] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 self-center mx-0.5 hidden sm:block"></div>
                <div className="flex items-center gap-1 sm:gap-1.5 px-1 sm:px-2 shrink-0">
                  <span className="size-1.5 sm:size-2 rounded-full bg-green-500"></span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Validado</span>
                </div>
              </div>
            </div>

            {/* --- VISÃO MENSAL --- */}
            {activeTab === 'mensal' && (
              <>
                {/* Legenda */}
                <div className="flex flex-nowrap items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-2 shrink-0"><div className="size-3 sm:size-4 rounded-sm bg-shift-fg"></div><span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400">FG/DSR</span></div>
                  <div className="flex items-center gap-2 shrink-0"><div className="size-3 sm:size-4 rounded-sm bg-shift-fe"></div><span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400">FE</span></div>
                  <div className="flex items-center gap-2 shrink-0"><div className="size-3 sm:size-4 rounded-sm bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800"></div><span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400">COM</span></div>
                  <div className="flex items-center gap-2 shrink-0"><div className="size-3 sm:size-4 rounded-sm bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800"></div><span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400">FF</span></div>
                  <div className="flex items-center gap-2 shrink-0"><div className="size-3 sm:size-4 rounded-sm bg-shift-t1"></div><span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400">T1</span></div>
                  <div className="flex items-center gap-2 shrink-0"><div className="size-3 sm:size-4 rounded-sm bg-shift-t2"></div><span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400">T2</span></div>
                  <div className="flex items-center gap-2 shrink-0"><div className="size-3 sm:size-4 rounded-sm bg-shift-t3"></div><span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400">T3</span></div>
                  <div className="flex items-center gap-2 shrink-0"><div className="size-3 sm:size-4 rounded-sm bg-shift-t4"></div><span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400">T4</span></div>
                </div>

                {/* ALERTA DE COBERTURA */}
                {daysBelowMeta.length > 0 && (
                  <div className="mx-4 mt-4 mb-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-3 flex items-start gap-3 shadow-sm">
                    <span className="material-symbols-outlined text-red-500">warning</span>
                    <div>
                      <h4 className="text-sm font-bold text-red-800 dark:text-red-400">Atenção! Grade com Déficit Crítico Oculto</h4>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                        A quantidade de colaboradores em turno (M+T) está abaixo do requisito mínimo (25 colaboradores) nos dias:
                        <span className="font-bold ml-1">{daysBelowMeta.join(', ')}</span>.
                      </p>
                    </div>
                  </div>
                )}

                {/* ALERTA DE INTERJORNADA */}
                {conflicts.length > 0 && (
                  <div className="mx-4 mt-2 mb-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-lg p-3 flex items-start gap-3 shadow-sm">
                    <span className="material-symbols-outlined text-orange-500">priority_high</span>
                    <div>
                      <h4 className="text-sm font-bold text-orange-800 dark:text-orange-400">Conflito de Interjornada (Descanso Mínimo 11h)</h4>
                      <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">
                        As edições manuais geraram {conflicts.length} violações do descanso legal de 11 horas.
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

                {/* Tabela */}

                {/* Saúde da Escala - Dashboard de Meta Operacional */}
                {activeTab === 'mensal' && (() => {
                  let criticalDays = 0;
                  let totalWorkingDays = 0;
                  for (let i = 1; i <= numDays; i++) {
                    const wd = (i - 1 + firstDayOfWeek) % 7;
                    if (wd !== 0 && wd !== 6) {
                      totalWorkingDays++;
                      if (getCoverage(i) < 25) criticalDays++;
                    }
                  }
                  const healthScore = Math.max(0, 100 - (criticalDays / (totalWorkingDays || 1)) * 100);

                  return (
                    <div className="mb-6 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10 backdrop-blur-sm">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`size-12 rounded-full flex items-center justify-center border-4 ${healthScore >= 90 ? 'border-emerald-500 text-emerald-500' : healthScore >= 70 ? 'border-amber-500 text-amber-500' : 'border-red-500 text-red-500'} bg-white dark:bg-slate-900`}>
                            <span className="text-sm font-black">{Math.round(healthScore)}%</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Saúde da Escala (Meta: 25+)</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Objetivo: Manter no mínimo 25 pessoas ativas no operacional (M+T)</p>
                          </div>
                        </div>

                        <div className="flex gap-6">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Dias Críticos</span>
                            <span className={`text-lg font-black ${criticalDays === 0 ? 'text-emerald-600' : 'text-red-500'}`}>{criticalDays} <span className="text-[11px] font-medium text-slate-400">dias</span></span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Cobertura Média</span>
                            <span className="text-lg font-black text-slate-800 dark:text-slate-200">~29 <span className="text-[11px] font-medium text-slate-400">ativos</span></span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${healthScore >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {healthScore >= 90 ? 'EXCELENTE' : healthScore >= 70 ? 'ATENÇÃO' : 'CRÍTICO'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Resumo do Dia em Cards */}
                {activeTab === 'mensal' && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                        <span className="material-symbols-outlined text-primary text-[22px]">calendar_today</span>
                        Resumo do Dia <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full ml-1">{summaryDay < 10 ? `0${summaryDay}` : summaryDay}/{monthsMap[mes]}</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Card 1: Total Escala */}
                      <div className="bg-white dark:bg-[#0f1423] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Escalados</span>
                          <span className="material-symbols-outlined text-slate-400 text-sm">groups</span>
                        </div>
                        <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">{dayStats.total} <span className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-tight">colaboradores</span></div>
                      </div>

                      {/* Card 2: Ativos */}
                      <div className="bg-white dark:bg-[#0f1423] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Ativos no Dia</span>
                          <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                        </div>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{dayStats.ativos}</div>
                      </div>

                      {/* Card 3: Ausências */}
                      <div className="bg-white dark:bg-[#0f1423] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Ausentes</span>
                          <span className="material-symbols-outlined text-orange-500 text-sm">event_busy</span>
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-black text-orange-600 dark:text-orange-500">{dayStats.ferias + dayStats.fg + dayStats.ff + dayStats.com}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[90px] leading-tight font-medium">{dayStats.ferias} Férias<br />{dayStats.fg + dayStats.ff + dayStats.com} Folgas</span>
                        </div>
                      </div>

                      {/* Card 4: Distribuição */}
                      <div className="bg-white dark:bg-[#0f1423] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Distribuição</span>
                          <span className="material-symbols-outlined text-blue-500 text-sm">schedule</span>
                        </div>
                        <div className="flex justify-between mt-1 px-1">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400">T1</span>
                            <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{dayStats.t1}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400">T2</span>
                            <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{dayStats.t2}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400">T3</span>
                            <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{dayStats.t3}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400">T4</span>
                            <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{dayStats.t4}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="sticky left-0 z-20 border-r border-slate-200 dark:border-slate-700 px-3 py-2.5 min-w-[200px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                          Colaborador
                        </th>
                        <th className="sticky left-[200px] z-10 border-r border-slate-200 dark:border-slate-700 px-1 py-2.5 min-w-[35px] text-center font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800" title="Dias Trabalhados">
                          Trá.
                        </th>
                        <th className="sticky left-[235px] z-10 border-r border-slate-200 dark:border-slate-700 px-1 py-2.5 min-w-[35px] text-center font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800" title="Total de Folgas">
                          Fol.
                        </th>
                        {days.map(i => {
                          const wd = (i - 1 + firstDayOfWeek) % 7;
                          const isWeekend = wd === 0 || wd === 6;
                          const isToday = todayMonthStr === mes && todayYearStr === ano && i === todayDate;
                          const isSelected = selectedDay === i;
                          const isAlert = daysBelowMeta.includes(i);
                          return (
                            <th key={i} onClick={() => setSelectedDay(i)} className={`cursor-pointer relative border-r border-slate-200 dark:border-slate-700 px-0.5 pt-3 pb-0.5 min-w-[32px] text-center font-bold transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 ${isSelected ? 'bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary border-b-2 border-b-primary' : isWeekend ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'} ${isAlert && !isSelected ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                              {isAlert && (
                                <span className="absolute top-0 right-0 text-red-500 text-[10px] leading-none material-symbols-outlined" title="Abaixo da meta (25)">warning</span>
                              )}
                              {isToday && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 text-red-500 text-[10px] leading-none text-shadow-sm shadow-red-500/50">▼</span>
                              )}
                              {i < 10 ? '0' + i : i}
                            </th>
                          );
                        })}
                      </tr>
                      <tr>
                        <th className="sticky left-0 z-20 border-r border-slate-200 dark:border-slate-700 px-3 pb-2 bg-slate-100 dark:bg-slate-800"></th>
                        <th className="sticky left-[200px] z-10 border-r border-slate-200 dark:border-slate-700 px-1 pb-2 bg-slate-100 dark:bg-slate-800"></th>
                        <th className="sticky left-[235px] z-10 border-r border-slate-200 dark:border-slate-700 px-1 pb-2 bg-slate-100 dark:bg-slate-800"></th>
                        {days.map(i => {
                          const wd = (i - 1 + firstDayOfWeek) % 7;
                          const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                          const isWeekend = wd === 0 || wd === 6;
                          const isToday = todayMonthStr === mes && todayYearStr === ano && i === todayDate;
                          return (
                            <th key={`wd-${i}`} className={`border-r border-slate-200 dark:border-slate-700 px-0.5 pb-2 min-w-[32px] text-center text-[9px] font-bold uppercase tracking-wider ${isToday ? 'text-primary dark:text-primary' : isWeekend ? 'bg-slate-200 dark:bg-slate-700 text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                              {dayNames[wd]}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Render by shift group */}
                      {shiftGroups.map(group => (
                        <>
                          <tr key={`header-${group.shift}`} className="bg-slate-50 dark:bg-slate-800/40">
                            <td colSpan={32} className="sticky left-0 z-10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                              <div className="flex items-center gap-2">
                                <div className={`size-2.5 rounded-sm ${shiftColors[group.shift]}`}></div>
                                {group.label} — {group.emps.length} colaboradores
                              </div>
                            </td>
                          </tr>
                          {group.emps.map(emp => (
                            <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800/50">
                              <td className="sticky left-0 z-20 border-r border-slate-200 dark:border-slate-700 px-3 py-1.5 font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 group/emp relative">
                                <div className="flex items-center gap-2">
                                  <div className={`size-5 rounded-full ${shiftColors[emp.shift]} text-white flex items-center justify-center font-bold text-[8px]`}>
                                    {emp.sex === 'F' ? '♀' : '♂'}
                                  </div>
                                  <span className="truncate max-w-[140px]">{emp.name}</span>
                                </div>

                                {/* Smart Tooltip de Estatísticas */}
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-[100] hidden group-hover/emp:block animate-in fade-in zoom-in duration-200 pointer-events-none">
                                  <div className="bg-slate-900 text-white rounded-lg shadow-xl border border-slate-700 p-3 min-w-[180px]">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-700 pb-1">Resumo do Mês</p>
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between items-center text-[11px]">
                                        <span className="text-slate-300">Dias Trabalhados:</span>
                                        <span className="font-bold text-blue-400">{getEmployeeMonthStats(emp).worked}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-[11px]">
                                        <span className="text-slate-300">Folgas (DSR):</span>
                                        <span className="font-bold text-emerald-400">{getEmployeeMonthStats(emp).dsr}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-[11px]">
                                        <span className="text-slate-300">Compensações:</span>
                                        <span className="font-bold text-amber-400">{getEmployeeMonthStats(emp).com}</span>
                                      </div>
                                      {getEmployeeMonthStats(emp).fer > 0 && (
                                        <div className="flex justify-between items-center text-[11px]">
                                          <span className="text-slate-300">Férias:</span>
                                          <span className="font-bold text-purple-400">{getEmployeeMonthStats(emp).fer}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="sticky left-[200px] z-10 border-r border-slate-200 dark:border-slate-700 px-1 py-1.5 text-center font-bold text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">
                                {getEmployeeMonthStats(emp).worked}
                              </td>
                              <td className="sticky left-[235px] z-10 border-r border-slate-200 dark:border-slate-700 px-1 py-1.5 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-slate-50/50 dark:bg-slate-800/50">
                                {getEmployeeMonthStats(emp).totalOff}
                              </td>
                              {days.map(day => {
                                const { val, bg } = getCell(emp, day);
                                return (
                                  <td key={day} className="border-r border-slate-100 dark:border-slate-800/50 p-0.5 text-center relative group">
                                    <div className={`${bg} text-white font-bold py-0.5 rounded-sm text-[10px] leading-tight`}>{val}</div>
                                    <select
                                      value={manualEdits[`${emp.id}-${ano}-${monthsMap[mes]}-${day}`] || 'AUTO'}
                                      onChange={(e) => handleManualEdit(emp.id, day, e.target.value)}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[10px] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                      title="Alterar turno manualmente"
                                      aria-label={`Alterar turno de ${emp.name} no dia ${day}`}
                                    >
                                      <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium" value="AUTO">Automático ({val})</option>
                                      <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium" value="T1">T1 (06h-15h)</option>
                                      <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium" value="T2">T2 (13h-22h)</option>
                                      <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium" value="T3">T3 (14h-23h)</option>
                                      <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium" value="T4">T4 (22h-06h)</option>
                                      <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium" value="DSR">DSR (Descanso / Folga Sab)</option>
                                      <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium" value="COM">COM (Folga Dom/Fer)</option>
                                      <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium" value="FF">FF (Folga Feriado)</option>
                                      <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium" value="FE">FE (Férias)</option>
                                    </select>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </>
                      ))}

                      {/* Férias */}
                      <tr className="bg-slate-50 dark:bg-slate-800/40">
                        <td colSpan={32} className="sticky left-0 z-10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          <div className="flex items-center gap-2">
                            <div className="size-2.5 rounded-sm bg-shift-fe"></div>
                            FÉRIAS — {feriasList.length} colaboradores
                          </div>
                        </td>
                      </tr>
                      {feriasList.map(emp => (
                        <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800/50 opacity-50">
                          <td className="sticky left-0 z-20 border-r border-slate-200 dark:border-slate-700 px-3 py-1.5 font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 opacity-70">
                            <div className="flex items-center gap-2">
                              <div className="size-5 rounded-full bg-shift-fe text-white flex items-center justify-center font-bold text-[8px]">
                                {emp.sex === 'F' ? '♀' : '♂'}
                              </div>
                              <span className="truncate max-w-[140px] line-through">{emp.name}</span>
                            </div>
                          </td>
                          <td className="sticky left-[200px] z-10 border-r border-slate-200 dark:border-slate-700 px-1 py-1.5 text-center font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">
                            {getEmployeeMonthStats(emp).worked}
                          </td>
                          <td className="sticky left-[235px] z-10 border-r border-slate-200 dark:border-slate-700 px-1 py-1.5 text-center font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">
                            {getEmployeeMonthStats(emp).totalOff}
                          </td>
                          {days.map(day => {
                            const { val, bg } = getCell(emp, day);
                            return (
                              <td key={day} className="border-r border-slate-100 dark:border-slate-800/50 p-0.5 text-center">
                                <div className={`${bg} text-white font-bold py-0.5 rounded-sm text-[10px] leading-tight`}>{val}</div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>

                    {/* Rodapé: Cobertura */}
                    <tfoot className="bg-slate-800 text-white">
                      <tr>
                        <td className="sticky left-0 z-20 border-r border-slate-700 px-3 py-2.5 font-bold bg-slate-800 flex items-center gap-2 text-[10px]">
                          <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                          Cobert.
                        </td>
                        <td className="sticky left-[200px] z-10 border-r border-slate-700 px-1 py-2.5 bg-slate-800"></td>
                        <td className="sticky left-[235px] z-10 border-r border-slate-700 px-1 py-2.5 bg-slate-800"></td>
                        {days.map(i => {
                          const wd = (i - 1 + firstDayOfWeek) % 7;
                          const isWeekend = wd === 0 || wd === 6;
                          const cov = getCoverage(i);
                          const color = cov >= 25 ? 'text-green-400' : cov >= 20 ? 'text-yellow-400' : 'text-red-400';
                          return (
                            <td key={i} className={`border-r border-slate-700 px-0.5 py-2.5 text-center font-bold text-[10px] ${color} relative group`}>
                              <div className="flex flex-col items-center justify-center">
                                {cov}
                                {!isWeekend && cov < 25 && (
                                  <span className="material-symbols-outlined text-[10px] text-red-500 mt-0.5" title="Abaixo de 25">warning</span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}

            {/* --- VISÃO SEMANAL --- */}
            {activeTab === 'semanal' && (() => {
              // Sempre priorizar o todayDate (data real de hoje) para a visão semanal,
              // ou o selectedDay se o usuário estiver navegando especificamente.
              // Como o usuário quer SEMPRE a semana corrente, usamos a data atual do sistema.
              const now = new Date();
              const isCurrentMonth = todayMonthStr === mes && todayYearStr === ano;

              const refDay = isCurrentMonth ? (todayDate || 1) : (selectedDay || 1);
              const refWd = (refDay - 1 + firstDayOfWeek) % 7; // 0=Dom ... 6=Sáb

              // Ajustar para que a semana comece na Segunda (1) e termine no Domingo (0)
              // No JS: 0=Dom, 1=Seg...
              // Se for domingo (0), queremos voltar 6 dias pra pegar a segunda.
              const diffToMonday = refWd === 0 ? -6 : 1 - refWd;

              const startOfWeek = refDay + diffToMonday;

              const weekDays: (number | null)[] = [];
              for (let i = 0; i < 7; i++) {
                const d = startOfWeek + i;
                if (d >= 1 && d <= numDays) {
                  weekDays.push(d);
                } else {
                  // Se cair no mês anterior ou próximo, pra simplificar na view atual, podemos omitir ou usar null (nesse MVP deixaremos os dias unicamente do mês)
                  weekDays.push(null);
                }
              }

              const weekLabels = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

              return (
                <div className="bg-[#0f1423] p-8 min-h-[500px] flex flex-col rounded-b-xl border-t border-slate-800/50">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                        Cobertura Semanal
                        <span className="text-xs ml-2 bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 font-bold font-mono">
                          Semana do dia {startOfWeek > 0 ? (startOfWeek < 10 ? '0' + startOfWeek : startOfWeek) : '01'}/{monthsMap[mes]}
                        </span>
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Visualização de gaps de pessoal (Meta: {'>'}25 colaboradores manhã+tarde)</p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] uppercase font-bold text-slate-300">
                      <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-red-500"></span> Crítico {'(< 25)'}</div>
                      <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-yellow-500"></span> Alerta (25-30)</div>
                      <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald-500"></span> Ideal {'(> 30)'}</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                      <thead>
                        <tr>
                          <th className="pb-4 font-black text-[11px] text-slate-500 uppercase tracking-widest px-4 w-[200px]">TURNO/DIA</th>
                          {weekLabels.map((lbl, idx) => {
                            const d = weekDays[idx];
                            return (
                              <th key={idx} className="pb-4 font-black text-[11px] text-slate-400 uppercase tracking-widest text-center relative">
                                {lbl}
                                {d && (
                                  <div className="text-[10px] text-slate-600 mt-0.5">{d < 10 ? '0' + d : d}/{monthsMap[mes]}</div>
                                )}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {/* T1 */}
                        <tr>
                          <td className="px-4 py-3 font-bold text-slate-300 text-xs bg-slate-800/20 border border-slate-800/50 rounded-l-lg border-r-0">T1 (06-15h)</td>
                          {weekDays.map((d, idx) => {
                            if (!d) return <td key={idx} className="bg-slate-800/10 border border-slate-800/30"></td>;
                            const stats = getStats(d);
                            const count = stats.t1;
                            const colorClass = count < 14 ? 'bg-red-500 text-red-50 border-red-600' : count < 17 ? 'bg-yellow-500 text-yellow-950 border-yellow-600' : 'bg-green-500 text-green-950 border-green-600';
                            return (
                              <td key={idx} className={`text-center font-black rounded-sm border ${colorClass}`}>
                                {count}
                              </td>
                            );
                          })}
                          <td className="w-2 bg-slate-800/20 border border-slate-800/50 border-l-0 rounded-r-lg"></td>
                        </tr>

                        {/* T2+T3 */}
                        <tr>
                          <td className="px-4 py-3 font-bold text-slate-300 text-xs bg-slate-800/20 border border-slate-800/50 rounded-l-lg border-r-0">T2+T3 (13-23h)</td>
                          {weekDays.map((d, idx) => {
                            if (!d) return <td key={idx} className="bg-slate-800/10 border border-slate-800/30"></td>;
                            const stats = getStats(d);
                            const count = stats.t2 + stats.t3;
                            const colorClass = count < 10 ? 'bg-red-500 text-red-50 border-red-600' : count < 13 ? 'bg-yellow-500 text-yellow-950 border-yellow-600' : 'bg-green-500 text-green-950 border-green-600';
                            return (
                              <td key={idx} className={`text-center font-black rounded-sm border ${colorClass}`}>
                                {count}
                              </td>
                            );
                          })}
                          <td className="w-2 bg-slate-800/20 border border-slate-800/50 border-l-0 rounded-r-lg"></td>
                        </tr>

                        {/* Total M+T */}
                        <tr>
                          <td className="px-4 py-4 font-bold text-blue-400 text-xs bg-blue-900/10 border border-blue-900/30 rounded-l-lg border-r-0">Total M+T</td>
                          {weekDays.map((d, idx) => {
                            if (!d) return <td key={idx} className="bg-slate-800/10 border border-slate-800/30"></td>;
                            const stats = getStats(d);
                            const count = stats.t1 + stats.t2 + stats.t3;
                            const isAlert = idx < 5 && count < 25; // Alerta de seg a sex pra M+T < 25
                            const colorClass = count <= 24 ? 'bg-[#ff2b44] text-white border-red-700' : count <= 30 ? 'bg-[#ffb000] text-[#4d3500] border-yellow-600' : 'bg-[#00c648] text-[#003b15] border-green-600';

                            return (
                              <td key={idx} className={`text-center font-black rounded border relative ${colorClass}`}>
                                {count}
                                {isAlert && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 border border-red-700 bg-red-100"></span></span>}
                              </td>
                            );
                          })}
                          <td className="w-2 bg-blue-900/10 border border-blue-900/30 border-l-0 rounded-r-lg"></td>
                        </tr>

                        {/* T4 */}
                        <tr className="mt-4">
                          <td className="px-4 py-3 font-bold text-slate-300 text-xs bg-slate-800/20 border border-slate-800/50 rounded-l-lg border-r-0">T4 (22-06h)</td>
                          {weekDays.map((d, idx) => {
                            if (!d) return <td key={idx} className="bg-slate-800/10 border border-slate-800/30"></td>;
                            const stats = getStats(d);
                            const count = stats.t4;
                            const colorClass = count < 3 ? 'bg-[#ff2b44] text-white border-red-700' : count < 4 ? 'bg-[#ffb000] text-[#4d3500] border-yellow-600' : 'bg-[#00c648] text-[#003b15] border-green-600';
                            return <td key={idx} className={`text-center font-black rounded-sm border ${colorClass}`}>{count}</td>;
                          })}
                          <td className="w-2 bg-slate-800/20 border border-slate-800/50 border-l-0 rounded-r-lg"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* --- VALIDAÇÃO E AUDITORIA --- */}
            {activeTab === 'ajustes' && (
              <div className="bg-[#0f1423] text-slate-300 p-8 flex flex-col gap-8 rounded-b-xl border-t border-slate-800/50">
                {/* Header Title hidden in tabs usually, but let's replicate the mockup's top title area inside the tab for isolated feel */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Validação e Auditoria de Escala</h2>
                    <p className="text-sm text-slate-500 mt-1">Módulo de análise de cobertura e detecção de déficits críticos.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Date Selector estilo Mockup */}
                    <div className="flex items-center gap-1 bg-[#1a2035] rounded-lg border border-slate-800 p-1">
                      <button
                        onClick={handlePrevMonth}
                        className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 transition-colors"
                        title="Mês Anterior"
                      >
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                      </button>
                      <div className="px-4 py-1 text-sm font-bold text-white min-w-[140px] text-center">
                        {mes} {ano}
                      </div>
                      <button
                        onClick={handleNextMonth}
                        className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 transition-colors"
                        title="Próximo Mês"
                      >
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                      </button>
                    </div>

                    <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95">
                      <span className="material-symbols-outlined text-[20px]">download</span>
                      Exportar Relatório
                    </button>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1 */}
                  <div className="bg-[#151b2b] p-6 rounded-xl border border-slate-800/60 shadow-lg relative overflow-hidden">
                    <div className="absolute top-5 right-5 size-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mb-2">Déficits Detectados</p>
                    <div className="text-4xl font-black text-white">{defictsCount} <span className="text-xl font-bold text-slate-400">Turnos</span></div>
                    <div className="mt-4 text-xs font-bold text-red-500 bg-red-500/10 w-fit px-2 py-1 rounded-md border border-red-500/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">trending_up</span>
                      +5% vs mês anterior
                    </div>
                  </div>
                  {/* Card 2 */}
                  <div className="bg-[#151b2b] p-6 rounded-xl border border-slate-800/60 shadow-lg relative overflow-hidden">
                    <div className="absolute top-5 right-5 size-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-orange-500 text-lg">stacked_line_chart</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mb-2">Cobertura Média</p>
                    <div className="text-4xl font-black text-white">{avgCoverage}%</div>
                    <div className="mt-4 text-xs font-bold text-red-500 bg-red-500/10 w-fit px-2 py-1 rounded-md border border-red-500/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">trending_down</span>
                      -2.4% vs meta
                    </div>
                  </div>
                  {/* Card 3 */}
                  <div className="bg-[#151b2b] p-6 rounded-xl border border-slate-800/60 shadow-lg relative overflow-hidden">
                    <div className="absolute top-5 right-5 size-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-500 text-lg">notifications_active</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mb-2">Próximo Turno Crítico</p>
                    <div className="text-4xl text-white font-bold tracking-tight">{nextCriticalStr}</div>
                    <div className="mt-4 text-xs font-bold text-blue-400 bg-blue-500/10 w-fit px-2 py-1 rounded-md border border-blue-500/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      Déficit de {(defictsCount * 2)} colaboradores
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-2">
                  <div className="xl:col-span-2 flex flex-col gap-6">
                    {/* Grade de Cobertura Diária */}
                    <div className="bg-[#151b2b] rounded-xl border border-slate-800/60 shadow-lg p-6">
                      <div className="flex justify-between items-center mb-8">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <span className="material-symbols-outlined text-blue-500 text-[20px]">table_chart</span>
                          Grade de Cobertura Diária
                        </h3>
                        <div className="flex items-center gap-4 text-[11px] uppercase font-bold text-slate-400">
                          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800"><span className="size-2.5 rounded-full bg-red-500"></span> CRÍTICO</div>
                          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800"><span className="size-2.5 rounded-full bg-yellow-500"></span> ALERTA</div>
                          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800"><span className="size-2.5 rounded-full bg-emerald-500"></span> IDEAL</div>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="text-[11px] text-slate-500 uppercase tracking-widest border-b-2 border-slate-800">
                            <tr>
                              <th className="pb-4 font-black">DIA / TURNO</th>
                              <th className="pb-4 font-black text-center">T1 (MANHÃ)</th>
                              <th className="pb-4 font-black text-center">T2 (TARDE)</th>
                              <th className="pb-4 font-black text-center">T3 (NOITE)</th>
                              <th className="pb-4 font-black text-center">T4 (MADRUG)</th>
                              <th className="pb-4 font-black text-right pr-4">STATUS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {dailyValidationData.slice(0, 7).map((d: any) => {
                              const wd = (d.day - 1 + firstDayOfWeek) % 7;
                              const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                              const isToday = todayMonthStr === mes && todayYearStr === ano && d.day === (todayDate || 1);

                              const T1color = d.t1 < 14 ? 'text-red-500' : d.t1 >= 17 ? 'text-emerald-500' : 'text-yellow-500';
                              const T2color = d.t2 < 4 ? 'text-red-500' : d.t2 >= 8 ? 'text-emerald-500' : 'text-yellow-500';
                              const T3color = d.t3 < 10 ? 'text-red-500' : d.t3 >= 12 ? 'text-emerald-500' : 'text-yellow-500';
                              const T4color = d.t4 < 3 ? 'text-red-500' : d.t4 >= 4 ? 'text-emerald-500' : 'text-yellow-500';

                              return (
                                <tr key={d.day} className={`hover:bg-slate-800/30 transition-colors ${isToday ? 'bg-primary/5' : ''}`}>
                                  <td className="py-4 font-bold text-slate-200">
                                    {d.day < 10 ? '0' + d.day : d.day}/{monthsMap[mes]} <span className="text-slate-500 font-medium ml-1">({dayNames[wd]})</span>
                                  </td>
                                  <td className={`py-4 font-bold text-center text-base ${T1color}`}>{d.t1}</td>
                                  <td className="py-4 font-bold text-center text-slate-300">
                                    <span className={`text-base ${T2color}`}>{d.t2}</span> <span className="text-[10px] text-slate-600 font-bold ml-2">(Total T1+T2: {d.t1 + d.t2})</span>
                                  </td>
                                  <td className={`py-4 font-bold text-center text-base ${T3color}`}>{d.t3}</td>
                                  <td className={`py-4 font-bold text-center text-base ${T4color}`}>{d.t4}</td>
                                  <td className="py-4 text-right pr-4">
                                    <span className={`px-2.5 py-1 rounded text-[10px] font-black tracking-widest border ${d.statusColor}`}>{d.statusStr}</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mapa de Calor */}
                    <div className="bg-[#151b2b] rounded-xl border border-slate-800/60 shadow-lg p-6">
                      <div className="flex justify-between items-center mb-8">
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            Mapa de Calor (Concentração de Pessoal)
                          </h3>
                          <p className="text-[13px] text-slate-500 mt-1">Visualização hora a hora para o dia selecionado ({(todayDate || 1) < 10 ? '0' + (todayDate || 1) : (todayDate || 1)}/{monthsMap[mes]})</p>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
                          Menos
                          <div className="flex gap-1 bg-slate-900/50 px-2 py-1.5 rounded border border-slate-800/50">
                            <div className="w-6 h-3 bg-blue-900 rounded-sm"></div>
                            <div className="w-6 h-3 bg-blue-600 rounded-sm"></div>
                            <div className="w-6 h-3 bg-yellow-500 rounded-sm"></div>
                            <div className="w-6 h-3 bg-red-500 rounded-sm"></div>
                          </div>
                          Mais
                        </div>
                      </div>

                      {/* Fake Heatmap Blocks */}
                      <div className="flex gap-1.5 h-16 mb-6">
                        {[...Array(24)].map((_, idx) => {
                          let bg = "bg-blue-900/60 border border-blue-800/20";
                          if (idx >= 6 && idx <= 15) bg = "bg-blue-600 border border-blue-500/20";
                          if (idx === 12 || idx === 13) bg = "bg-yellow-500 border border-yellow-400/20";
                          if (idx === 14 || idx === 15) bg = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] z-10 scale-y-110";
                          return (
                            <div key={idx} className={`flex-1 ${bg} rounded text-[9px] font-bold text-white flex items-end justify-center pb-2 relative group cursor-pointer hover:opacity-80 transition-all`}>
                              {idx < 10 ? '0' + idx : idx}
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-lg flex gap-4 items-start shadow-inner shadow-red-500/5">
                        <span className="material-symbols-outlined text-red-500 text-[22px] mt-0.5 animate-pulse">error</span>
                        <p className="text-[13px] text-red-200/80 leading-relaxed font-medium">
                          <span className="font-bold text-red-400">Déficit crítico identificado entre 14:00 e 16:00.</span> Apenas 1 colaborador em posto. Risco alto de interrupção operacional.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sugestões Quick Fix Sidebar */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-blue-500 text-xl auto-awesome">auto_awesome</span>
                      <h3 className="text-base font-bold text-white">Sugestões "Quick Fix"</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">
                      Colaboradores em Folga/Descanso (FG/DSR/COM) com competência para cobrir os gaps identificados.
                    </p>

                    {/* Cards Suggestions */}
                    <div className="bg-[#151b2b] border border-slate-800/60 rounded-xl p-5 flex flex-col gap-4 shadow-lg hover:border-slate-700 transition-colors">
                      <div className="flex items-center justify-between pointer-events-none">
                        <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded">Para 15/Nov (T2)</span>
                        <span className="material-symbols-outlined text-slate-500 text-[18px]">more_vert</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded bg-blue-900/50 text-blue-400 font-bold flex items-center justify-center text-sm border border-blue-800/50 shadow-inner">RM</div>
                        <div>
                          <div className="text-sm font-bold text-white tracking-wide">Ricardo Mendes</div>
                          <div className="text-[11px] font-medium text-slate-500 mt-0.5">Última folga: 08/Nov</div>
                        </div>
                      </div>
                      <button className="w-full mt-2 py-2.5 bg-slate-800/50 hover:bg-slate-700/80 transition-colors text-slate-200 text-xs font-bold rounded-lg border border-slate-700 shadow-sm">Convocar de Folga</button>
                    </div>

                    <div className="bg-[#151b2b] border border-slate-800/60 rounded-xl p-5 flex flex-col gap-4 shadow-lg hover:border-slate-700 transition-colors">
                      <div className="flex items-center justify-between pointer-events-none">
                        <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded">Para 15/Nov (T2)</span>
                        <span className="material-symbols-outlined text-slate-500 text-[18px]">more_vert</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded bg-emerald-900/50 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-800/50 shadow-inner">AS</div>
                        <div>
                          <div className="text-sm font-bold text-white tracking-wide">Ana Soares</div>
                          <div className="text-[11px] font-medium text-slate-500 mt-0.5">Última folga: Ontem</div>
                        </div>
                      </div>
                      <button className="w-full mt-2 py-2.5 bg-slate-800/50 hover:bg-slate-700/80 transition-colors text-slate-200 text-xs font-bold rounded-lg border border-slate-700 shadow-sm">Convocar de Folga</button>
                    </div>

                    <div className="bg-[#151b2b] border border-slate-800/60 rounded-xl p-5 flex flex-col gap-4 shadow-lg opacity-60">
                      <div className="flex items-center justify-between pointer-events-none">
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 border border-slate-700 px-2 py-1 rounded">Para 16/Nov (T1)</span>
                        <span className="material-symbols-outlined text-slate-600 text-[18px]">more_vert</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded bg-slate-800/50 text-slate-500 font-bold flex items-center justify-center text-sm border border-slate-700/50 shadow-inner">JL</div>
                        <div>
                          <div className="text-sm font-bold text-slate-300 tracking-wide">Julia Lima</div>
                          <div className="text-[11px] font-medium text-slate-600 mt-0.5">Indisponível (HE Max)</div>
                        </div>
                      </div>
                      <button disabled className="w-full mt-2 py-2.5 bg-[#0f1423] text-slate-600 text-xs font-bold rounded-lg border border-slate-800 cursor-not-allowed">Limite de Horas</button>
                    </div>

                    <button className="text-blue-500 text-sm font-bold hover:text-blue-400 mt-4 flex items-center justify-center gap-2 group">
                      Ver mais sugestões
                      <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Cards inferiores */}
          {activeTab === 'mensal' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200">Resumo de Pessoal</h3>
                  <span className="material-symbols-outlined text-primary">groups</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Total:</span>
                    <span className="font-bold text-slate-900 dark:text-white">43 colaboradores</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Ativos:</span>
                    <span className="font-bold text-green-600">40</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Férias:</span>
                    <span className="font-bold text-amber-600">3 / 3 (limite)</span>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2 mt-2 grid grid-cols-4 gap-2 text-center">
                    <div><p className="text-[10px] text-slate-400 font-bold">T1</p><p className="text-sm font-bold text-slate-900 dark:text-white">20</p></div>
                    <div><p className="text-[10px] text-slate-400 font-bold">T2</p><p className="text-sm font-bold text-slate-900 dark:text-white">4</p></div>
                    <div><p className="text-[10px] text-slate-400 font-bold">T3</p><p className="text-sm font-bold text-slate-900 dark:text-white">12</p></div>
                    <div><p className="text-[10px] text-slate-400 font-bold">T4</p><p className="text-sm font-bold text-slate-900 dark:text-white">4</p></div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200">Alertas de Escala</h3>
                  <span className="material-symbols-outlined text-red-500">warning</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-red-500"></span>
                    Cobertura manhã+tarde abaixo de 25 nos fins de semana.
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-orange-500"></span>
                    3 colaboradores em férias — limite máximo atingido.
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-amber-500"></span>
                    Verificar DSR feminino: 2 domingos/mês não consecutivos.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200">Ações Rápidas</h3>
                  <span className="material-symbols-outlined text-slate-400">offline_bolt</span>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="w-full text-left px-3 py-2 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-primary transition-colors">
                    Replicar escala mês anterior
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-primary transition-colors">
                    Validar todas as folgas
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-primary transition-colors">
                    Verificar DSR feminino
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
