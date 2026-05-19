import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Download, LogOut, ChevronLeft, ChevronRight, Menu, X,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { USERS } from '../data/mockData';
import { AppModule } from '../types';

const NAV_ITEMS: { label: string; path: string; icon: React.ElementType; module: AppModule | null }[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, module: null },
];

function userColor(id: string): string {
  const colors = ['bg-rose-500', 'bg-teal-500', 'bg-violet-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-orange-500'];
  return colors[id.charCodeAt(id.length - 1) % colors.length];
}

function NavItems({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAppContext();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const canAccess = (module: AppModule | null) =>
    module === null || currentUser.permissions.includes(module);

  return (
    <nav className="space-y-0.5">
      {NAV_ITEMS.map(item => {
        const accessible = canAccess(item.module);
        const active = isActive(item.path);
        return (
          <div key={item.path} className="relative group">
            <button
              onClick={() => {
                if (accessible) {
                  navigate(item.path);
                  onNavigate?.();
                }
              }}
              disabled={!accessible}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 rounded-xl text-sm transition-all ${
                collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
              } ${
                active
                  ? 'bg-rose-50 text-rose-500'
                  : accessible
                  ? 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <item.icon
                size={16}
                className={`flex-shrink-0 ${active ? 'text-rose-500' : accessible ? 'text-gray-400' : 'text-gray-200'}`}
              />
              {!collapsed && (
                <>
                  <span className={`truncate ${active ? 'font-medium' : ''}`}>{item.label}</span>
                  {!accessible && <span className="ml-auto text-[10px] text-gray-300">🔒</span>}
                </>
              )}
            </button>
            {collapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                {item.label}{!accessible && ' 🔒'}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, setCurrentUser } = useAppContext();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage = NAV_ITEMS.find(item =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path)
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Mobile top bar (hidden on md+) ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">F</span>
          </div>
          <span className="text-gray-900 font-bold text-base tracking-tight">Flamingo</span>
        </div>
        <div className={`w-8 h-8 ${userColor(currentUser.id)} rounded-full flex items-center justify-center text-white text-[10px] font-bold`}>
          {currentUser.initials}
        </div>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col overflow-y-auto shadow-2xl z-50">
            {/* Drawer header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-bold">F</span>
                </div>
                <span className="text-gray-900 font-bold text-lg tracking-tight">Flamingo</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* Nav items */}
            <div className="px-4 pt-5 pb-4 flex-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-3 px-2">Main Menu</p>
              <NavItems collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </div>

            {/* Bottom */}
            <div className="px-4 pb-6 border-t border-gray-100 pt-4 space-y-4">
              <button className="w-full flex items-center justify-center gap-2 text-rose-500 text-xs font-medium border border-rose-200 rounded-xl py-2.5 hover:bg-rose-50 transition-colors">
                <Download size={13} />
                Install Flamingo
              </button>
              <div>
                <p className="text-[9px] text-gray-300 uppercase tracking-widest mb-1.5 text-center">Demo — Switch User</p>
                <select
                  value={currentUser.id}
                  onChange={e => {
                    setCurrentUser(USERS.find(u => u.id === e.target.value)!);
                    setMobileOpen(false);
                  }}
                  className="w-full text-xs text-gray-600 border border-gray-200 rounded-xl px-2.5 py-2 bg-white focus:outline-none"
                >
                  {USERS.map(u => (
                    <option key={u.id} value={u.id}>{u.name} · {u.role}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 ${userColor(currentUser.id)} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {currentUser.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{currentUser.organization}</p>
                </div>
                <LogOut size={14} className="text-gray-300 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <div className={`hidden md:flex relative flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-[64px]' : 'w-60'}`}>
        <aside
          className="w-full h-full flex flex-col bg-white border-r border-gray-100 overflow-y-auto overflow-x-hidden"
        >
          {/* Logo */}
          <div className={`py-4 flex items-center border-b border-gray-100 ${collapsed ? 'px-3 justify-center' : 'px-5 justify-between'}`}>
            {collapsed ? (
              <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold">F</span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-bold">F</span>
                </div>
                <span className="text-gray-900 font-bold text-lg tracking-tight">Flamingo</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className={`pt-5 pb-4 flex-1 ${collapsed ? 'px-2' : 'px-4'}`}>
            {!collapsed && (
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-3 px-2">Main Menu</p>
            )}
            <NavItems collapsed={collapsed} />
          </div>

          {/* Bottom — expanded */}
          {!collapsed && (
            <div className="px-4 pb-5 border-t border-gray-100 pt-4 space-y-4">
              <button className="w-full flex items-center justify-center gap-2 text-rose-500 text-xs font-medium border border-rose-200 rounded-xl py-2.5 hover:bg-rose-50 transition-colors">
                <Download size={13} />
                Install Flamingo
              </button>
              <div>
                <p className="text-[9px] text-gray-300 uppercase tracking-widest mb-1.5 text-center">Demo — Switch User</p>
                <select
                  value={currentUser.id}
                  onChange={e => setCurrentUser(USERS.find(u => u.id === e.target.value)!)}
                  className="w-full text-xs text-gray-600 border border-gray-200 rounded-xl px-2.5 py-2 bg-white focus:outline-none"
                >
                  {USERS.map(u => (
                    <option key={u.id} value={u.id}>{u.name} · {u.role}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 ${userColor(currentUser.id)} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {currentUser.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{currentUser.organization}</p>
                </div>
                <button className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Bottom — collapsed */}
          {collapsed && (
            <div className="pb-4 pt-3 border-t border-gray-100 flex flex-col items-center">
              <div className={`w-8 h-8 ${userColor(currentUser.id)} rounded-full flex items-center justify-center text-white text-[10px] font-bold`}>
                {currentUser.initials}
              </div>
            </div>
          )}
        </aside>

        {/* Collapse toggle — outside aside to avoid clipping */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-[72px] w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 shadow-sm hover:shadow-md transition-all z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto bg-gray-50 pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
