import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BiHomeAlt, BiMoney, BiWallet, BiLogOut, BiUser,
  BiTrendingUp, BiTargetLock, BiTimeFive, BiMenu, BiX,
  BiChevronLeft, BiChevronRight
} from 'react-icons/bi';
import { ReactNode, ElementType, useState, useEffect } from 'react';

interface SidebarLinkProps {
  to: string;
  icon: ElementType;
  text: string;
  isCollapsed: boolean;
}

const SidebarLink = ({ to, icon: Icon, text, isCollapsed }: SidebarLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      title={isCollapsed ? text : ""}
      className={`flex items-center gap-3 px-4 py-3 my-1 rounded-xl transition-all duration-200 ${isActive
        ? 'bg-white/10 text-white font-semibold'
        : 'text-white/60 hover:text-white hover:bg-white/5 font-medium'
        } ${isCollapsed ? 'justify-center px-2' : ''}`}
    >
      <Icon size={20} className={isActive ? 'text-white' : 'text-current'} />
      {!isCollapsed && <span className="truncate">{text}</span>}
    </Link>
  );
};

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsMobileMenuOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
  const mainPadding = isMobile ? 'ml-0' : (isCollapsed ? 'ml-20' : 'ml-64');

  return (
    <div className="flex min-h-screen bg-transparent text-white selection:bg-white/20">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-lg border-b border-white/10 flex items-center justify-between px-6 z-40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg border border-white/30 flex items-center justify-center text-[0.6rem] font-light tracking-tighter">
              S|A
            </div>
            <span className="text-sm font-medium tracking-tight">Momentum</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <BiX size={24} /> : <BiMenu size={24} />}
          </button>
        </header>
      )}

      {/* Sidebar Overlay (Mobile) */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${sidebarWidth} bg-black border-r border-white/10 flex flex-col fixed h-screen z-50
        transition-all duration-300 ease-in-out
        ${isMobile ? (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        ${isCollapsed ? 'p-4' : 'p-8'}
      `}>
        <div className={`mb-12 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-[0.7rem] font-light tracking-tighter shrink-0">
            S|A
          </div>
          {!isCollapsed && <span className="text-lg font-medium tracking-tight truncate">Momentum</span>}
        </div>

        {/* Collapse Toggle (Desktop) */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 bg-black border border-white/10 rounded-full p-1 text-white/60 hover:text-white transition-colors"
          >
            {isCollapsed ? <BiChevronRight size={16} /> : <BiChevronLeft size={16} />}
          </button>
        )}

        <nav className="flex-1 space-y-1">
          <SidebarLink to="/dashboard" icon={BiHomeAlt} text="Dashboard" isCollapsed={isCollapsed} />
          <SidebarLink to="/transactions" icon={BiMoney} text="Transactions" isCollapsed={isCollapsed} />
          <SidebarLink to="/budgets" icon={BiWallet} text="Budgets" isCollapsed={isCollapsed} />
          <SidebarLink to="/trends" icon={BiTrendingUp} text="Trends" isCollapsed={isCollapsed} />
          <SidebarLink to="/goals" icon={BiTargetLock} text="Goals" isCollapsed={isCollapsed} />
          <SidebarLink to="/recurring" icon={BiTimeFive} text="Recurring" isCollapsed={isCollapsed} />
          <SidebarLink to="/profile" icon={BiUser} text="Profile" isCollapsed={isCollapsed} />
        </nav>

        <div className={`pt-8 border-t border-white/10 ${isCollapsed ? 'px-0' : 'px-1'}`}>
          <div className={`flex items-center gap-3 mb-6 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm shrink-0">
              {user?.name?.[0] || 'U'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-[0.75rem] text-white/40">Premium Member</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all duration-200 font-medium ${isCollapsed ? 'justify-center px-2' : ''}`}
            title={isCollapsed ? "Sign Out" : ""}
          >
            <BiLogOut size={20} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-8 lg:p-12 transition-all duration-300 ease-in-out ${mainPadding} ${isMobile ? 'pt-24' : ''}`}>
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;