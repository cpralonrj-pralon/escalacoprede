'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileHeader() {
    const [isOpen, setIsOpen] = useState(false);
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
        <>
            {/* Mobile Top Bar */}
            <header className="lg:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="bg-primary rounded-lg p-1.5 shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-white text-xl">layers</span>
                    </div>
                    <h1 className="text-slate-900 dark:text-slate-100 text-sm font-bold tracking-tight">Sistame Escala</h1>
                </div>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
                    title={isOpen ? "Fechar" : "Menu"}
                >
                    <span className="material-symbols-outlined text-2xl">
                        {isOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </header>

            {/* Mobile Menu Overlay (Drawer) */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary rounded-lg p-1.5">
                            <span className="material-symbols-outlined text-white text-xl">layers</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">Menu</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-160px)]">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-3'
                                    }`}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                <span className="text-sm">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                    <div className="flex items-center gap-3 p-2">
                        <div className="w-10 h-10 rounded-full bg-primary-dim flex items-center justify-center text-primary font-bold">AD</div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Admin User</p>
                            <p className="text-[10px] text-slate-500 truncate lowercase">admin@sistame.com</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
