'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Feriado {
  id: string;
  date: string;
  name: string;
  tipo?: 'Nacional' | 'Estadual' | 'Municipal' | 'Ponto Facultativo';
}

const feriados2026 = [
  // Nacionais
  { date: '2026-01-01', name: 'Confraternização Universal', tipo: 'Nacional' },
  { date: '2026-04-03', name: 'Sexta-Feira Santa', tipo: 'Nacional' },
  { date: '2026-04-21', name: 'Tiradentes', tipo: 'Nacional' },
  { date: '2026-05-01', name: 'Dia do Trabalho', tipo: 'Nacional' },
  { date: '2026-09-07', name: 'Independência do Brasil', tipo: 'Nacional' },
  { date: '2026-10-12', name: 'Nossa Sra. Aparecida', tipo: 'Nacional' },
  { date: '2026-11-02', name: 'Finados', tipo: 'Nacional' },
  { date: '2026-11-15', name: 'Proclamação da República', tipo: 'Nacional' },
  { date: '2026-11-20', name: 'Consciência Negra', tipo: 'Nacional' },
  { date: '2026-12-25', name: 'Natal', tipo: 'Nacional' },
  // Estaduais RJ
  { date: '2026-02-17', name: 'Carnaval (Feriado Estadual RJ)', tipo: 'Estadual' },
  { date: '2026-04-23', name: 'Dia de São Jorge (RJ)', tipo: 'Estadual' },
  // Municipais Rio de Janeiro
  { date: '2026-01-20', name: 'São Sebastião (RJ)', tipo: 'Municipal' },
  // Pontos Facultativos
  { date: '2026-02-16', name: 'Carnaval (Ponto Facultativo)', tipo: 'Ponto Facultativo' },
  { date: '2026-06-04', name: 'Corpus Christi', tipo: 'Ponto Facultativo' },
];

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState('parametros');
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [novoFeriado, setNovoFeriado] = useState({ date: '', name: '', tipo: 'Nacional' as Feriado['tipo'] });
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('holidays').select('*').order('date');
    if (error) {
      console.error('Erro ao buscar feriados:', error);
    } else if (data) {
      setFeriados(data as Feriado[]);
    }
    setIsLoading(false);
  };

  const handleAddFeriado = async () => {
    if (!novoFeriado.date || !novoFeriado.name) return;
    const { error } = await supabase.from('holidays').insert([{
      date: novoFeriado.date,
      name: novoFeriado.name,
      tipo: novoFeriado.tipo
    }]);

    if (!error) {
      fetchHolidays();
      setNovoFeriado({ date: '', name: '', tipo: 'Nacional' });
      setShowAddForm(false);
    }
  };

  const handleRemoveFeriado = async (id: string) => {
    await supabase.from('holidays').delete().eq('id', id);
    fetchHolidays();
  };

  const handleImportFeriados = async () => {
    setImportStatus('loading');
    const toInsert = feriados2026.map(f => ({ date: f.date, name: f.name, tipo: f.tipo }));
    const { error } = await supabase.from('holidays').upsert(toInsert, { onConflict: 'date' });

    if (error) {
      console.error('Erro ao importar feriados:', error);
      setImportStatus('error');
      alert(`Erro ao importar: ${error.message}`);
    } else {
      setImportStatus('success');
      fetchHolidays();
    }

    setTimeout(() => setImportStatus(null), 3000);
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${day}/${months[parseInt(month) - 1]}/${year}`;
  };

  const getDayOfWeek = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[date.getDay()];
  };

  const tipoColors: Record<string, string> = {
    'Nacional': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Estadual': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Municipal': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Ponto Facultativo': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  const tabs = [
    { id: 'parametros', name: 'Parâmetros', icon: 'tune' },
    { id: 'feriados', name: 'Feriados', icon: 'celebration' },
    { id: 'turnos', name: 'Turnos', icon: 'schedule' },
    { id: 'permissoes', name: 'Permissões', icon: 'group' },
    { id: 'notificacoes', name: 'Notificações', icon: 'notifications_active' },
  ];

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
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3 ${activeTab === tab.id
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                    }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>

            <div className="md:col-span-3 space-y-6">
              {/* ===== ABA PARÂMETROS ===== */}
              {activeTab === 'parametros' && (
                <>
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
                          <input className="sr-only peer" type="checkbox" defaultChecked aria-label="Folga Dominical Obrigatória" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="max-w-[70%]">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Intervalo Interjornada (11h)</p>
                          <p className="text-xs text-slate-500 mt-1">Bloqueia a alocação de turnos com menos de 11 horas de descanso entre jornadas.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input className="sr-only peer" type="checkbox" defaultChecked aria-label="Intervalo Interjornada" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="max-w-[70%]">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Alerta de Hora Extra (&gt;2h/dia)</p>
                          <p className="text-xs text-slate-500 mt-1">Gera alerta visual na grade quando a jornada diária excede 10 horas totais.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input className="sr-only peer" type="checkbox" defaultChecked aria-label="Alerta de Hora Extra" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="max-w-[70%]">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">DSR Feminino (CLT)</p>
                          <p className="text-xs text-slate-500 mt-1">Garante à mulher repouso em pelo menos 2 domingos por mês, nunca consecutivos. DSR/COM podem alternar durante a semana.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input className="sr-only peer" type="checkbox" defaultChecked aria-label="DSR Feminino" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="max-w-[70%]">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">DSR/COM Alternado</p>
                          <p className="text-xs text-slate-500 mt-1">Permite que Descanso Semanal Remunerado e Compensação alternem durante a semana.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input className="sr-only peer" type="checkbox" defaultChecked aria-label="DSR COM Alternado" />
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
                        <label htmlFor="meta" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Meta Mínima Diária (T1+T2)</label>
                        <div className="relative">
                          <input id="meta" title="Meta Mínima Diária (T1+T2)" className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary pl-4 pr-12 py-2 text-sm" type="number" defaultValue={25} />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">colab.</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Abaixo deste valor, a grade indicará status &quot;Crítico&quot;.</p>
                      </div>
                      <div>
                        <label htmlFor="alerta" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Margem de Alerta (T1+T2)</label>
                        <div className="relative">
                          <input id="alerta" title="Margem de Alerta (T1+T2)" className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary pl-4 pr-12 py-2 text-sm" type="number" defaultValue={30} />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">colab.</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Entre a meta mínima e este valor, indicará &quot;Alerta&quot;.</p>
                      </div>
                      <div className="col-span-full">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Limite Máximo de Férias Simultâneas</label>
                        <div className="flex items-center gap-4">
                          <div className="relative flex-1 max-w-[200px]">
                            <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary pl-4 pr-16 py-2 text-sm" type="number" defaultValue={3} aria-label="Limite de férias simultâneas" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">colab.</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">Máximo de colaboradores que podem estar em férias no mesmo mês.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ===== ABA FERIADOS ===== */}
              {activeTab === 'feriados' && (
                <>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                      <h3 className="text-md font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">celebration</span> Calendário de Feriados
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleImportFeriados}
                          disabled={importStatus === 'loading'}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {importStatus === 'loading' ? 'sync' : 'cloud_download'}
                          </span>
                          {importStatus === 'loading' ? 'Importando...' : 'Importar Feriados BR'}
                        </button>
                        <button
                          onClick={() => setShowAddForm(!showAddForm)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">{showAddForm ? 'close' : 'add'}</span>
                          {showAddForm ? 'Cancelar' : 'Novo Feriado'}
                        </button>
                      </div>
                    </div>

                    {importStatus === 'success' && (
                      <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Feriados de 2026 (Nacionais, RJ e Pontos Facultativos) importados com sucesso!</p>
                      </div>
                    )}

                    {showAddForm && (
                      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">edit_calendar</span>
                          Cadastrar Novo Feriado
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label htmlFor="data_feriado" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Data</label>
                            <input
                              id="data_feriado"
                              title="Data do Feriado"
                              type="date"
                              value={novoFeriado.date}
                              onChange={(e) => setNovoFeriado({ ...novoFeriado, date: e.target.value })}
                              className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary py-2 px-3 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Nome do Feriado</label>
                            <input
                              type="text"
                              value={novoFeriado.name}
                              onChange={(e) => setNovoFeriado({ ...novoFeriado, name: e.target.value })}
                              placeholder="Ex: São Jorge"
                              className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary py-2 px-3 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Tipo</label>
                            <select
                              value={novoFeriado.tipo}
                              onChange={(e) => setNovoFeriado({ ...novoFeriado, tipo: e.target.value as Feriado['tipo'] })}
                              className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary py-2 px-3 text-sm"
                              aria-label="Tipo de feriado"
                            >
                              <option value="Nacional">Nacional</option>
                              <option value="Estadual">Estadual</option>
                              <option value="Municipal">Municipal</option>
                              <option value="Ponto Facultativo">Ponto Facultativo</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end mt-4">
                          <button
                            onClick={handleAddFeriado}
                            disabled={!novoFeriado.date || !novoFeriado.name}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <span className="material-symbols-outlined text-[16px]">save</span>
                            Salvar Feriado
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">{feriados.length} feriados cadastrados</span>
                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Ano: 2026</span>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                            <th className="px-4 py-3">Data</th>
                            <th className="px-4 py-3">Dia da Semana</th>
                            <th className="px-4 py-3">Feriado</th>
                            <th className="px-4 py-3">Tipo</th>
                            <th className="px-4 py-3 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                          {feriados.map((feriado) => {
                            const dayOfWeek = getDayOfWeek(feriado.date);
                            const isPast = new Date(feriado.date) < new Date('2026-03-04');
                            return (
                              <tr key={feriado.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isPast ? 'opacity-50' : ''}`}>
                                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white tabular-nums">
                                  {formatDate(feriado.date)}
                                </td>
                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{dayOfWeek}</td>
                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{feriado.name}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${tipoColors[feriado.tipo || 'Nacional']}`}>
                                    {feriado.tipo || 'Nacional'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() => handleRemoveFeriado(feriado.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                    title="Remover feriado"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/20 flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Como funciona?</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        Os feriados cadastrados são automaticamente aplicados na grade de escalas, marcando o dia como <strong>&quot;FR&quot;</strong> (Feriado).
                        Use o botão <strong>&quot;Importar Feriados BR&quot;</strong> para carregar automaticamente todos os feriados nacionais do ano,
                        ou adicione manualmente feriados estaduais e municipais da sua região.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* ===== PLACEHOLDER PARA OUTRAS ABAS ===== */}
              {activeTab === 'turnos' && (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-5xl">schedule</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4">Configuração de Turnos</h3>
                  <p className="text-sm text-slate-500 mt-2">Módulo em desenvolvimento.</p>
                </div>
              )}
              {activeTab === 'permissoes' && (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-5xl">group</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4">Permissões de Acesso</h3>
                  <p className="text-sm text-slate-500 mt-2">Módulo em desenvolvimento.</p>
                </div>
              )}
              {activeTab === 'notificacoes' && (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-5xl">notifications_active</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4">Notificações</h3>
                  <p className="text-sm text-slate-500 mt-2">Módulo em desenvolvimento.</p>
                </div>
              )}

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
