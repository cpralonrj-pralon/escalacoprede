'use client';
import { useState, useEffect, Fragment } from 'react';
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

const SHIFT_DURATIONS: Record<string, number> = {
  'T1': 8.8,
  'T2': 8.8,
  'T3': 8.8,
  'T4': 8.8,
  'FG': 0,
  'FE': 0,
  'FF': 0,
  'FR': 0,
  'COM': 0,
};

export default function Escalas() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'mensal' | 'semanal' | 'ajustes'>('mensal');
  const [mes, setMes] = useState('Março');
  const [ano, setAno] = useState('2026');

  const [todayDate, setTodayDate] = useState<number | null>(null);
  const [todayMonthStr, setTodayMonthStr] = useState<string | null>(null);
  const [todayYearStr, setTodayYearStr] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [feriadosMes, setFeriadosMes] = useState<number[]>([]);
  const [manualEdits, setManualEdits] = useState<Record<string, string>>({});
  const [conflicts, setConflicts] = useState<{ empName: string; day: number; rest: number }[]>([]);
  const [coverageDeficits, setCoverageDeficits] = useState<number[]>([]);

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

  // ===== DATA FETCHING =====

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data: emps } = await supabase.from('employees').select('*').order('name');
      if (emps) setEmployees(emps as Employee[]);

      const monthNum = monthsMap[mes];
      const startDate = `${ano}-${monthNum}-01`;
      const endDate = `${ano}-${monthNum}-${String(numDays).padStart(2, '0')}`;

      const { data: edits } = await supabase.from('scale_edits').select('*').gte('date', startDate).lte('date', endDate);
      if (edits) {
        const map: Record<string, string> = {};
        edits.forEach((e: any) => {
          const d = parseInt(e.date.split('-')[2]);
          map[`${e.employee_id}-${ano}-${monthNum}-${d}`] = e.shift_value;
        });
        setManualEdits(map);
      }

      const { data: holidays } = await supabase.from('holidays').select('date').gte('date', startDate).lte('date', endDate);
      if (holidays) setFeriadosMes(holidays.map((h: any) => parseInt(h.date.split('-')[2])));

      setIsLoading(false);
    };
    fetchData();
  }, [mes, ano, numDays]);

  useEffect(() => {
    const now = new Date();
    setTodayDate(now.getDate());
    const mStr = Object.keys(monthsMap).find(k => parseInt(monthsMap[k]) === now.getMonth() + 1) || 'Março';
    setTodayMonthStr(mStr);
    setTodayYearStr(now.getFullYear().toString());
    if (!selectedDay) setSelectedDay(now.getDate());
  }, []);

  // ===== HANDLERS =====

  const handleDragStart = (e: React.DragEvent, empId: string) => {
    e.dataTransfer.setData('text/plain', empId);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDrop = async (e: React.DragEvent, newShift: string) => {
    e.preventDefault();
    setIsDragging(false);
    const empId = e.dataTransfer.getData('text/plain');
    if (!empId) return;

    setEmployees(prev => prev.map(emp => emp.id === empId ? { ...emp, shift: newShift as ShiftType } : emp));
    await supabase.from('employees').update({ shift: newShift }).eq('id', empId);
  };

  const handleManualEdit = async (empId: string, day: number, newVal: string) => {
    const monthNum = monthsMap[mes];
    const key = `${empId}-${ano}-${monthNum}-${day}`;
    const date = `${ano}-${monthNum}-${String(day).padStart(2, '0')}`;

    setManualEdits(prev => {
      const next = { ...prev };
      if (newVal === 'AUTO') delete next[key];
      else next[key] = newVal;
      return next;
    });

    if (newVal === 'AUTO') {
      await supabase.from('scale_edits').delete().match({ employee_id: empId, date });
    } else {
      await supabase.from('scale_edits').upsert({ employee_id: empId, date, shift_value: newVal });
    }
  };

  const handlePrevMonth = () => {
    const monthList = Object.keys(monthsMap);
    const currIdx = monthList.indexOf(mes);
    if (currIdx > 0) setMes(monthList[currIdx - 1]);
    else { setMes(monthList[11]); setAno(String(parseInt(ano) - 1)); }
  };

  const handleNextMonth = () => {
    const monthList = Object.keys(monthsMap);
    const currIdx = monthList.indexOf(mes);
    if (currIdx < 11) setMes(monthList[currIdx + 1]);
    else { setMes(monthList[0]); setAno(String(parseInt(ano) + 1)); }
  };

  // ===== CORE SCALE LOGIC =====

  const getCell = (emp: Employee, day: number): { val: CellValue, bg: string } => {
    const mNum = monthsMap[mes];
    const key = `${emp.id}-${ano}-${mNum}-${day}`;

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

  const getEmployeeMonthStats = (emp: Employee) => {
    let worked = 0, dsr = 0, com = 0, fer = 0;
    for (let d = 1; d <= numDays; d++) {
      const { val } = getCell(emp, d);
      if (['T1', 'T2', 'T3', 'T4'].includes(val)) worked++;
      else if (val === 'FG') dsr++;
      else if (['FF', 'COM', 'FR'].includes(val)) com++;
      else if (val === 'FE') fer++;
    }
    return { worked, dsr, com, fer, totalOff: dsr + com + fer };
  };

  const getWeeklyHours = (emp: Employee, dayInWeek: number) => {
    const dateObj = new Date(parseInt(ano), parseInt(monthsMap[mes]) - 1, dayInWeek || 1);
    const dayOfWeek = dateObj.getDay(); // 0 = Domingo
    // Converte para Segunda-Domingo (BR Standard)
    const diffToMon = (dayOfWeek + 6) % 7;

    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = dayInWeek - diffToMon + i;
      if (d >= 1 && d <= numDays) {
        const { val } = getCell(emp, d);
        total += SHIFT_DURATIONS[val] || 0;
      }
    }
    return Math.round(total * 10) / 10;
  };

  const getMonthlyHours = (emp: Employee) => {
    let total = 0;
    for (let d = 1; d <= numDays; d++) {
      const { val } = getCell(emp, d);
      total += SHIFT_DURATIONS[val] || 0;
    }
    return Math.round(total * 10) / 10;
  };

  const getStats = (dayNum: number) => {
    const stats = { total: 0, ativos: 0, ferias: 0, fg: 0, ff: 0, com: 0, t1: 0, t2: 0, t3: 0, t4: 0 };
    employees.forEach(emp => {
      stats.total++;
      const { val } = getCell(emp, dayNum);
      if (val === 'FE') stats.ferias++;
      else if (val === 'FG') stats.fg++;
      else if (val === 'FF') stats.ff++;
      else {
        stats.ativos++;
        if (val === 'T1') stats.t1++;
        else if (val === 'T2') stats.t2++;
        else if (val === 'T3') stats.t3++;
        else if (val === 'T4') stats.t4++;
      }
    });
    return stats;
  };

  // Interjornada e Cobertura
  useEffect(() => {
    // 1. Conflitos Legais
    const newConflicts: { empName: string; day: number; rest: number }[] = [];
    employees.forEach(emp => {
      for (let d = 1; d < numDays; d++) {
        const tEnd = SHIFT_HOURS[getCell(emp, d).val]?.end || 0;
        const tStart = SHIFT_HOURS[getCell(emp, d + 1).val]?.start || 0;
        if (tEnd > 0 && tStart > 0) {
          const rest = (24 - (tEnd % 24)) + tStart;
          if (rest < 11 && rest > 0) newConflicts.push({ empName: emp.name, day: d + 1, rest: Math.round(rest * 10) / 10 });
        }
      }
    });
    setConflicts(newConflicts);

    // 2. Déficits de Cobertura
    const deficits: number[] = [];
    days.forEach(d => {
      const stats = getStats(d);
      const count = stats.t1 + stats.t2 + stats.t3;
      const wd = (d - 1 + firstDayOfWeek) % 7;
      const isWeekday = wd !== 0 && wd !== 6;
      const isH = feriadosMes.includes(d);

      if (count < 25 && isWeekday && !isH) {
        deficits.push(d);
      }
    });
    setCoverageDeficits(deficits);
  }, [manualEdits, employees, numDays, mes, ano, firstDayOfWeek, feriadosMes]);

  const filteredEmployees = employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const shiftGroups: { label: string; shift: ShiftType; emps: Employee[] }[] = [
    { label: 'T1 (06:00-15:48)', shift: 'T1', emps: filteredEmployees.filter(e => e.shift === 'T1' && e.status !== 'ferias') },
    { label: 'T2 (13:00-22:48)', shift: 'T2', emps: filteredEmployees.filter(e => e.shift === 'T2' && e.status !== 'ferias') },
    { label: 'T3 (14:00-23:48)', shift: 'T3', emps: filteredEmployees.filter(e => e.shift === 'T3' && e.status !== 'ferias') },
    { label: 'T4 (22:00-06:35)', shift: 'T4', emps: filteredEmployees.filter(e => e.shift === 'T4' && e.status !== 'ferias') },
  ];

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#0f1423] text-white">Carregando Escala...</div>;

  return (
    <div className="flex flex-col h-screen bg-[#0b0f1a]">
      {/* HEADER PREMIUM */}
      <header className="h-16 bg-[#0f1423]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 shrink-0 sticky top-0 z-[100]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <span className="material-symbols-outlined text-white text-[20px]">calendar_today</span>
          </div>
          <h2 className="text-lg font-black text-white tracking-tight">Sistame Escala <span className="text-blue-500">4.0</span></h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
            <input
              type="text"
              placeholder="Pesquisar colaborador..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-1.5 border border-white/10 rounded-xl text-xs bg-white/5 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all w-64"
            />
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 p-1">
            <button onClick={handlePrevMonth} className="p-1 px-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">◀</button>
            <div className="px-3 text-xs font-black text-white min-w-[100px] text-center">{mes} {ano}</div>
            <button onClick={handleNextMonth} className="p-1 px-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">▶</button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto custom-scrollbar p-8 pt-4">
        {/* TOP KPIs: Utilização da Força de Trabalho (Ported from Dashboard) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {/* Card Total (Geral) */}
          <div className="bg-[#0f1423] p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group">
            <div className={`absolute -top-4 -right-4 w-20 h-20 ${getStats(todayDate || 1).t1 + getStats(todayDate || 1).t2 + getStats(todayDate || 1).t3 < 25 ? 'bg-red-600/10 animate-pulse' : 'bg-blue-600/5'} rounded-full blur-2xl`}></div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Utilização Total</h4>
              {getStats(todayDate || 1).t1 + getStats(todayDate || 1).t2 + getStats(todayDate || 1).t3 < 25 && (
                <span className="flex items-center gap-1 text-[8px] font-black text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-full border border-red-500/20 animate-pulse">
                  <span className="material-symbols-outlined text-[10px]">warning</span> DÉFICIT
                </span>
              )}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-black text-white tracking-tighter">
                  {getStats(todayDate || 1).ativos} <span className="text-slate-700 text-lg">/ {employees.length}</span>
                </div>
                <div className="text-[10px] font-black text-blue-500 mt-1 uppercase tracking-tighter">Colaboradores Hoje</div>
              </div>
              <div className="bg-blue-500/10 text-blue-500 font-black text-[14px] px-2 py-1 rounded-lg border border-blue-500/20">
                {Math.round((getStats(todayDate || 1).ativos / (employees.length || 1)) * 100)}%
              </div>
            </div>
          </div>

          {/* Cards por Turno */}
          {['T1', 'T2', 'T3', 'T4'].map((t) => {
            const stats = getStats(todayDate || 1);
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

        {/* TABS DE NAVEGAÇÃO */}
        <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-2xl w-fit border border-white/10">
          <button onClick={() => setActiveTab('mensal')} className={`py-2 px-6 text-xs font-black rounded-xl transition-all ${activeTab === 'mensal' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}>ESCALA MENSAL</button>
          <button onClick={() => setActiveTab('ajustes')} className={`py-2 px-6 text-xs font-black rounded-xl transition-all ${activeTab === 'ajustes' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}>VALIDAÇÃO</button>
        </div>

        {activeTab === 'mensal' && (
          <div className="space-y-8">
            <div className="bg-[#0f1423] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="sticky left-0 z-30 bg-[#0f1423] px-4 py-4 text-left border-r border-white/5 min-w-[240px] text-slate-500 font-black uppercase tracking-widest text-[9px]">Colaborador</th>
                      <th className="px-2 py-4 border-r border-white/5 text-slate-500 font-black uppercase tracking-widest text-[9px] min-w-[40px]">TR</th>
                      <th className="px-2 py-4 border-r border-white/5 text-slate-500 font-black uppercase tracking-widest text-[9px] min-w-[40px]">FG</th>
                      <th className="px-2 py-4 border-r border-white/5 text-slate-500 font-black uppercase tracking-widest text-[9px] min-w-[60px]">Hrs S</th>
                      <th className="px-2 py-4 border-r border-white/5 text-slate-500 font-black uppercase tracking-widest text-[9px] min-w-[60px]">Hrs M</th>
                      {days.map(d => {
                        const wd = (d - 1 + firstDayOfWeek) % 7;
                        const isWE = wd === 0 || wd === 6;
                        const isH = feriadosMes.includes(d);
                        const isToday = d === todayDate && mes === todayMonthStr && ano === todayYearStr;
                        const isSelected = d === selectedDay;

                        return (
                          <th
                            key={d}
                            onClick={() => setSelectedDay(d)}
                            className={`px-1 py-3 min-w-[34px] border-r border-white/5 text-center transition-all relative cursor-pointer group hover:bg-white/[0.05] ${isSelected ? 'bg-blue-600/10' : ''} ${isH ? 'bg-red-500/20 text-red-500' : isWE ? 'bg-white/[0.03]' : ''}`}
                          >
                            {isToday && (
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-red-500 animate-bounce pointer-events-none">
                                <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                              </div>
                            )}
                            <div className={`transition-all font-black text-[11px] mb-0.5 ${isSelected ? 'text-blue-500 scale-110' : 'text-white'}`}>{d}</div>
                            <div className={`text-[8px] uppercase font-bold transition-colors ${isSelected ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'}`}>{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'][wd]}</div>
                            {isSelected && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {shiftGroups.map(group => (
                      <Fragment key={group.shift}>
                        <tr className="bg-white/[0.01] font-black text-slate-500 uppercase tracking-widest text-[9px]"
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => handleDrop(e, group.shift)}>
                          <td colSpan={5 + days.length} className="px-4 py-2 sticky left-0 z-20 bg-[#0f1423] border-y border-white/5 flex items-center gap-2">
                            <span className="w-1.5 h-4 rounded-full bg-blue-500/50"></span>
                            {group.label} <span className="text-blue-500/50 ml-2">— {group.emps.length} MEMBROS</span>
                          </td>
                        </tr>
                        {group.emps.map(emp => (
                          <tr key={emp.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="sticky left-0 z-20 bg-[#0f1423] px-4 py-2.5 border-r border-white/5">
                              <div draggable onDragStart={e => handleDragStart(e, emp.id)} className="flex items-center gap-3 cursor-grab group-active:cursor-grabbing">
                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-slate-400 text-[10px]">
                                  {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <span className="text-slate-200 font-black tracking-wide text-[11px]">{emp.name}</span>
                              </div>
                            </td>
                            <td className="text-center bg-white/[0.02] font-bold text-blue-400 border-r border-white/5">{getEmployeeMonthStats(emp).worked}</td>
                            <td className="text-center bg-white/[0.02] font-bold text-emerald-400 border-r border-white/5">{getEmployeeMonthStats(emp).totalOff}</td>
                            <td className={`text-center bg-white/[0.02] font-black border-r border-white/5 ${getWeeklyHours(emp, selectedDay || todayDate || 1) > 44 ? 'text-red-500' : 'text-slate-400'}`}>
                              {getWeeklyHours(emp, selectedDay || todayDate || 1)}h
                            </td>
                            <td className={`text-center bg-white/[0.02] font-black border-r border-white/5 ${getMonthlyHours(emp) > 220 ? 'text-red-500' : 'text-slate-400'}`}>
                              {getMonthlyHours(emp)}h
                            </td>
                            {days.map(d => {
                              const { val, bg } = getCell(emp, d);
                              return (
                                <td key={d} className="p-1 border-r border-white/5 text-center relative group/cell min-w-[34px]">
                                  <div className={`w-full h-7 rounded-lg flex items-center justify-center text-white font-black text-[10px] shadow-sm transition-transform group-hover/cell:scale-105 ${bg}`}>
                                    {val}
                                  </div>
                                  <select
                                    title="Ajuste manual de escala"
                                    className={`absolute inset-0 opacity-0 cursor-pointer z-10 ${isDragging ? 'pointer-events-none' : ''}`}
                                    value={manualEdits[`${emp.id}-${ano}-${monthsMap[mes]}-${d}`] || 'AUTO'}
                                    onChange={e => handleManualEdit(emp.id, d, e.target.value)}
                                  >
                                    <option value="AUTO" className="bg-[#0f1423] text-white">Automático</option>
                                    <option value="T1" className="bg-[#0f1423] text-white">T1</option>
                                    <option value="T2" className="bg-[#0f1423] text-white">T2</option>
                                    <option value="T3" className="bg-[#0f1423] text-white">T3</option>
                                    <option value="T4" className="bg-[#0f1423] text-white">T4</option>
                                    <option value="FG" className="bg-[#0f1423] text-white">FG (Folga)</option>
                                    <option value="FE" className="bg-[#0f1423] text-white">FE (Férias)</option>
                                  </select>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </Fragment>
                    ))}

                    {/* TOTALIZADORES INTEGRADOS NA TABELA (PERFEITAMENTE ALINHADOS) */}
                    <tr className="bg-blue-600/[0.05] border-t-2 border-blue-500/20">
                      <td colSpan={5} className="sticky left-0 z-30 bg-[#0f1423] px-4 py-4 border-r border-white/5 font-black text-blue-400 tracking-widest text-[9px] uppercase">Efetivo Manhã+Tarde</td>
                      {days.map(d => {
                        const count = getStats(d).t1 + getStats(d).t2 + getStats(d).t3;
                        const isLow = count < 25 && !feriadosMes.includes(d) && (d - 1 + firstDayOfWeek) % 7 !== 0 && (d - 1 + firstDayOfWeek) % 7 !== 6;
                        return <td key={d} className={`text-center font-black text-[12px] ${isLow ? 'text-red-500' : 'text-blue-400'}`}>{count}</td>;
                      })}
                    </tr>
                    <tr className="bg-emerald-600/[0.05]">
                      <td colSpan={5} className="sticky left-0 z-30 bg-[#0f1423] px-4 py-4 border-r border-white/5 font-black text-emerald-400 tracking-widest text-[9px] uppercase">Em Folga (Total)</td>
                      {days.map(d => {
                        const s = getStats(d);
                        const totalOff = s.fg + s.ff + s.ferias;
                        return <td key={d} className="text-center font-black text-[12px] text-emerald-400">{totalOff}</td>;
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* CARDS DE RESUMO E ALERTAS RESTAURADOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0f1423] p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-all"></div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-white text-xs uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Resumo de Pessoal
                  </h3>
                  <span className="material-symbols-outlined text-blue-500 text-[20px]">groups</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-tight">Total Staff:</span>
                    <span className="font-black text-white">{employees.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-tight">Ativos Hoje:</span>
                    <span className="font-black text-emerald-400">{getStats(todayDate || 1).ativos}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-tight">Em Férias:</span>
                    <span className="font-black text-blue-400">{employees.filter(e => e.status === 'ferias').length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0f1423] p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group border-red-500/10">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/10 transition-all"></div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-white text-xs uppercase tracking-widest flex items-center gap-2 text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Alertas Críticos
                  </h3>
                  <span className="material-symbols-outlined text-red-500 text-[20px]">warning</span>
                </div>
                <div className="space-y-3">
                  {conflicts.length > 0 || coverageDeficits.length > 0 ? (
                    <>
                      {conflicts.length > 0 && (
                        <p className="text-[10px] text-red-200/60 font-medium leading-relaxed bg-red-500/5 p-2 rounded-xl border border-red-500/10 flex gap-2">
                          <span className="material-symbols-outlined text-[14px] text-red-500">priority_high</span>
                          {conflicts.length} violações de interjornada (11h).
                        </p>
                      )}
                      {coverageDeficits.length > 0 && (
                        <p className="text-[10px] text-orange-200/60 font-medium leading-relaxed bg-orange-500/5 p-2 rounded-xl border border-orange-500/10 flex gap-2">
                          <span className="material-symbols-outlined text-[14px] text-orange-500">warning</span>
                          {coverageDeficits.length} dias com efetivo abaixo de 25.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-[10px] text-emerald-400/60 font-medium leading-relaxed bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10">
                      Nenhuma violação legal detectada. Escala saudável.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-[#0f1423] p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-all"></div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-white text-xs uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Ações de Sistema
                  </h3>
                  <span className="material-symbols-outlined text-slate-500 text-[20px]">bolt</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <button className="w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black text-blue-500 uppercase tracking-widest transition-all">REPLICAR ESCALA</button>
                  <button className="w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black text-emerald-500 uppercase tracking-widest transition-all">VALIDAR TUDO</button>
                </div>
              </div>

            </div>

          </div>
        )}

        {activeTab === 'ajustes' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#0f1423] p-8 rounded-3xl border border-white/5 shadow-2xl relative">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Meta Diária (Uteis)</h4>
                <div className="text-4xl font-black text-white tracking-tighter">25 / <span className="text-slate-700">30</span></div>
                <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: '83%' }}></div>
                </div>
              </div>
              <div className="bg-[#0f1423] p-8 rounded-3xl border border-white/5 shadow-2xl relative border-red-500/20">
                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-4">Alertas Legais</h4>
                <div className="text-4xl font-black text-red-500 tracking-tighter">{conflicts.length}</div>
                <p className="text-[11px] text-slate-500 font-bold mt-3 uppercase tracking-wider">Violações Interjornada</p>
              </div>
            </div>

            {conflicts.length > 0 && (
              <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-3xl">
                <h4 className="font-black text-red-400 uppercase tracking-[0.1em] text-xs mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  Déficits de Descanso Identificados
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {conflicts.map((c, i) => (
                    <div key={i} className="bg-[#0f1423]/50 border border-white/5 p-4 rounded-2xl flex flex-col gap-1">
                      <span className="text-white font-black text-[11px]">{c.empName}</span>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-bold text-[9px]">DIA {c.day < 10 ? '0' + c.day : c.day}</span>
                        <span className="text-red-500 font-black text-[10px]">{c.rest}h descanso</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 10px; width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; border: 2px solid #0f1423; }
        
        /* Fix para visibilidade do select em modo escuro */
        select option {
          background-color: #0f1423 !important;
          color: white !important;
          padding: 10px;
        }
        
        select:focus {
          outline: none;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
