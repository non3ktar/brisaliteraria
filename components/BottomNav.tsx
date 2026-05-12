'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Library, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Início', icon: Home, path: '/' },
    { label: 'Biblioteca', icon: Library, path: '/biblioteca' },
    { label: 'Admin', icon: Settings, path: '/admin' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[var(--color-white)] border-t border-[var(--color-primary)]/15 z-[100] px-6">
      <div className="max-w-md mx-auto h-full flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} className="relative flex flex-col items-center gap-1 group">
              <div className={`p-2 rounded-2xl transition-all duration-300 ${
                isActive ? 'text-[var(--color-accent)] bg-[var(--color-surface)]' : 'text-[var(--color-muted)] hover:text-[var(--color-primary)]'
              }`}>
                <item.icon size={24} strokeWidth={1.5} />
              </div>
              <span className={`text-[10px] font-bold tracking-wider uppercase transition-colors ${
                isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute -top-1 w-1 h-1 rounded-full bg-[var(--color-accent)]"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
