import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BiHomeAlt, BiMoney, BiWallet, BiLogOut, BiUser, BiTrendingUp, BiTargetLock, BiTimeFive } from 'react-icons/bi';
import { ReactNode, ElementType } from 'react';

interface SidebarLinkProps {
  to: string;
  icon: ElementType;
  text: string;
}

const SidebarLink = ({ to, icon: Icon, text }: SidebarLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 my-1 rounded-xl transition-all duration-200 ${isActive
        ? 'bg-white/10 text-white font-semibold'
        : 'text-white/60 hover:text-white hover:bg-white/5 font-medium'
        }`}
    >
      <Icon size={20} className={isActive ? 'text-white' : 'text-current'} />
      {text}
    </Link>
  );
};

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-white/20">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-white/10 p-8 flex flex-col fixed h-screen z-50">
        <div className="mb-12 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-[0.7rem] font-light tracking-tighter">
            S|A
          </div>
          <span className="text-lg font-medium tracking-tight">
            Momentum
          </span>
        </div>

        <nav className="flex-1">
          <SidebarLink to="/dashboard" icon={BiHomeAlt} text="Dashboard" />
          <SidebarLink to="/transactions" icon={BiMoney} text="Transactions" />
          <SidebarLink to="/budgets" icon={BiWallet} text="Budgets" />
          <SidebarLink to="/trends" icon={BiTrendingUp} text="Trends" />
          <SidebarLink to="/goals" icon={BiTargetLock} text="Goals" />
          <SidebarLink to="/recurring" icon={BiTimeFive} text="Recurring" />
          <SidebarLink to="/profile" icon={BiUser} text="Profile" />
        </nav>

        <div className="pt-8 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-[0.75rem] text-white/40">Premium Member</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all duration-200 font-medium"
          >
            <BiLogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;