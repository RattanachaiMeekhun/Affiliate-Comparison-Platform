import React from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  MoreVertical
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, change, isPositive, icon }: StatCardProps) => (
  <div className="bg-base-100 p-6 rounded-3xl border border-base-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
        isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
      }`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}
      </div>
    </div>
    <h3 className="text-sm font-semibold text-base-content/50 uppercase tracking-widest">{title}</h3>
    <p className="text-3xl font-black text-base-content tracking-tight mt-1">{value}</p>
  </div>
);

const TransactionRow = ({ name, email, amount, status, date }: any) => (
  <tr className="border-b-base-200 border-none group hover:bg-base-200/40 transition-colors">
    <td className="py-4">
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            {name.charAt(0)}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold group-hover:text-primary transition-colors">{name}</p>
          <p className="text-[10px] text-base-content/40 uppercase tracking-widest leading-none mt-1">{email}</p>
        </div>
      </div>
    </td>
    <td className="py-4 font-semibold text-sm">
      {date}
    </td>
    <td className="py-4">
      <div className={`badge badge-sm border-none font-bold capitalize ${
        status === 'completed' ? 'badge-success/10 text-success' : 
        status === 'pending' ? 'badge-warning/10 text-warning' : 'badge-error/10 text-error'
      }`}>
        {status}
      </div>
    </td>
    <td className="py-4 text-right">
      <span className="font-black text-sm text-base-content">{amount}</span>
    </td>
    <td className="py-4 text-center">
      <button className="btn btn-ghost btn-xs btn-circle group-hover:bg-primary group-hover:text-white transition-all">
        <ChevronRight size={14} />
      </button>
    </td>
  </tr>
);

export const Dashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value="$128,430" 
          change="+12.5%" 
          isPositive={true}
          icon={<DollarSign size={24} />}
        />
        <StatCard 
          title="Active Users" 
          value="45,210" 
          change="+18.2%" 
          isPositive={true}
          icon={<Users size={24} />}
        />
        <StatCard 
          title="Conversions" 
          value="1,240" 
          change="-4.3%" 
          isPositive={false}
          icon={<TrendingUp size={24} />}
        />
        <StatCard 
          title="Affiliate Payouts" 
          value="$9,120" 
          change="+2.4%" 
          isPositive={true}
          icon={<DollarSign size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-base-100 rounded-3xl border border-base-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Recent Transactions</h3>
              <p className="text-sm text-base-content/50">Manage and monitor all latest affiliate activities</p>
            </div>
            <button className="btn btn-ghost btn-sm rounded-xl">View Records</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-base-content/40 uppercase tracking-widest text-[10px] border-none">
                  <th className="font-bold">Affiliate</th>
                  <th className="font-bold">Date</th>
                  <th className="font-bold">Status</th>
                  <th className="text-right font-bold">Amount</th>
                  <th className="text-center font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="mt-4">
                <TransactionRow name="John Affiliate" email="john@example.com" date="Oct 12, 2023" status="completed" amount="$1,240.00" />
                <TransactionRow name="Sarah Marketing" email="sarah@example.com" date="Oct 11, 2023" status="pending" amount="$850.50" />
                <TransactionRow name="Dev Studio" email="dev@example.com" date="Oct 10, 2023" status="completed" amount="$3,100.00" />
                <TransactionRow name="Alex Brand" email="alex@example.com" date="Oct 09, 2023" status="failed" amount="$420.00" />
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-primary/20 group">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex justify-between items-start mb-12">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
                <TrendingUp size={28} />
              </div>
              <button className="btn btn-ghost btn-circle btn-sm bg-white/10 border-white/10 hover:bg-white/20">
                <MoreVertical size={16} />
              </button>
            </div>
            
            <h3 className="text-2xl font-black mb-2 tracking-tight">Performance Summary</h3>
            <p className="text-primary-content/80 text-sm mb-12 leading-relaxed">Your affiliate network performance has improved by 24% this month. Great job!</p>
            
            <div className="mt-auto pt-8 border-t border-white/10">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary-content/60">Estimated Profit</p>
                  <p className="text-4xl font-black mt-2 tracking-tight">$42,910.00</p>
                </div>
                <button className="btn btn-white bg-white text-primary border-none hover:bg-base-200 shadow-xl shadow-black/10 rounded-xl font-bold px-6">
                  Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
