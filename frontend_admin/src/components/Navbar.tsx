import React from 'react';
import { 
  Bell, 
  Search, 
  Moon, 
  Sun,
  Maximize,
  LayoutGrid
} from 'lucide-react';

export const Navbar = () => {
  return (
    <header className="navbar bg-base-100/80 backdrop-blur-md sticky top-0 z-30 border-b border-base-200 px-6 py-4">
      <div className="flex-1 gap-4">
        <div className="hidden lg:flex flex-col">
          <h2 className="text-sm font-semibold text-base-content/40 uppercase tracking-widest leading-none mb-1">
            Overview
          </h2>
          <h1 className="text-xl font-bold text-base-content tracking-tight">Dashboard Statistics</h1>
        </div>
        
        <div className="flex-1 max-w-md ml-8 relative hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30" />
          <input 
            type="text" 
            placeholder="Search analytics, users, settings..." 
            className="input input-bordered w-full pl-12 bg-base-200/50 border-none focus:ring-2 focus:ring-primary/20 transition-all rounded-xl h-11" 
          />
        </div>
      </div>

      <div className="flex-none gap-3">
        <button className="btn btn-ghost btn-circle btn-sm hover:bg-base-200 transition-colors">
          <LayoutGrid size={20} className="text-base-content/70" />
        </button>
        
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm hover:bg-base-200 transition-colors relative">
            <Bell size={20} className="text-base-content/70" />
            <span className="badge badge-primary badge-xs absolute top-1 right-1 border-none shadow-sm shadow-primary/30"></span>
          </label>
          <div tabIndex={0} className="dropdown-content z-[1] menu p-4 shadow-xl bg-base-100 border border-base-200 rounded-2xl w-80 mt-4">
            <h3 className="font-bold text-lg mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                  <Maximize size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">System Performance</p>
                  <p className="text-xs text-base-content/60 mt-1">CPU usage is normal at 42%.</p>
                </div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm btn-block mt-4 text-primary">View all</button>
          </div>
        </div>

        <button className="btn btn-ghost btn-circle btn-sm hover:bg-base-200 transition-colors">
          <Sun size={20} className="text-base-content/70" />
        </button>

        <div className="dropdown dropdown-end ml-2 group">
          <label tabIndex={0} className="flex items-center gap-3 cursor-pointer py-1.5 px-3 rounded-xl hover:bg-base-200 transition-all duration-300">
            <div className="avatar">
              <div className="w-9 rounded-xl ring ring-primary ring-offset-base-100 ring-offset-2 ring-opacity-20">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Avatar" />
              </div>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-bold leading-none">Admin Profile</p>
              <p className="text-[10px] text-base-content/50 uppercase tracking-widest mt-1">Super Admin</p>
            </div>
          </label>
          <ul tabIndex={0} className="mt-4 z-[1] p-2 shadow-2xl menu menu-sm dropdown-content bg-base-100 border border-base-200 rounded-2xl w-52 overflow-hidden">
            <li><a className="py-2.5 rounded-lg">Profile Settings</a></li>
            <li><a className="py-2.5 rounded-lg">Help Center</a></li>
            <div className="divider my-1 opacity-50"></div>
            <li><a className="py-2.5 rounded-lg text-error hover:bg-error/10">Sign Out</a></li>
          </ul>
        </div>
      </div>
    </header>
  );
};
