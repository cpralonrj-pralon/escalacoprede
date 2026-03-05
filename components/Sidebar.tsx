'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', href: '/' },
    { name: 'Cadastro', icon: 'person_add', href: '/cadastro' },
    { name: 'Férias', icon: 'beach_access', href: '/ferias' },
    { name: 'Escala', icon: 'calendar_month', href: '/escalas' },
    { name: 'Validação', icon: 'fact_check', href: '/validacao' },
    { name: 'Configuração', icon: 'settings', href: '/configuracoes' },
  ];

  return (
    <aside className="hidden lg:flex w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex-col shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary rounded-lg p-1.5">
          <span className="material-symbols-outlined text-white text-2xl">layers</span>
        </div>
        <div>
          <h1 className="text-slate-900 dark:text-slate-100 text-base font-bold leading-none">Sistame Escala</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Gestão de Escalas</p>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-dim flex items-center justify-center text-primary font-bold text-xs">AD</div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">Admin User</p>
            <p className="text-xs text-slate-500 truncate">admin@sistame.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
