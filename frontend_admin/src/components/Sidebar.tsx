import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  PieChart, 
  LogOut, 
  FileText,
  ShoppingBag,
  HelpCircle
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
}

const SidebarItem = ({ icon, label, to, active }: SidebarItemProps) => {
  return (
    <li>
      <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-primary text-primary-content shadow-lg shadow-primary/20' 
          : 'hover:bg-base-200 text-base-content/70 hover:text-primary'
      }`}>
        <span className="w-5 h-5">{icon}</span>
        <span className="font-medium">{label}</span>
      </Link>
    </li>
  );
};

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-72 h-screen bg-base-100 border-r border-base-200 flex flex-col sticky top-0">
      <div className="p-6 mb-8 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center text-white shadow-lg">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-base-content leading-none">Affiliate</h1>
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary opacity-80">Admin Console</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto">
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest mb-4 px-4">Management</p>
        <ul className="space-y-1 mb-8">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            to="/" 
            active={location.pathname === '/'} 
          />
          <SidebarItem 
            icon={<ShoppingBag size={20} />} 
            label="Product Import" 
            to="/products/import" 
            active={location.pathname === '/products/import'} 
          />
          <SidebarItem icon={<Users size={20} />} label="Affiliates" to="/affiliates" />
          <SidebarItem icon={<PieChart size={20} />} label="Analytics" to="/analytics" />
          <SidebarItem icon={<FileText size={20} />} label="Reports" to="/reports" />
        </ul>

        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest mb-4 px-4">System Settings</p>
        <ul className="space-y-1">
          <SidebarItem icon={<Settings size={20} />} label="Settings" to="/settings" />
          <SidebarItem icon={<HelpCircle size={20} />} label="Support" to="/support" />
        </ul>
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-base-200/50 p-4 rounded-2xl mb-4 border border-base-200">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-10">
                <span className="text-xs">AD</span>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">Admin User</p>
              <p className="text-[10px] text-base-content/50 truncate">admin@example.com</p>
            </div>
          </div>
        </div>
        <button className="btn btn-ghost btn-block justify-start gap-3 text-error hover:bg-error/10 hover:text-error rounded-xl">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
