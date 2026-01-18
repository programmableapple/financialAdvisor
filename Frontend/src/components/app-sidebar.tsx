import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    BiHomeAlt,
    BiMoney,
    BiWallet,
    BiLogOut,
    BiUser,
    BiTrendingUp,
    BiTargetLock,
    BiTimeFive,
} from 'react-icons/bi';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';

const menuItems = [
    { title: 'Dashboard', url: '/dashboard', icon: BiHomeAlt },
    { title: 'Transactions', url: '/transactions', icon: BiMoney },
    { title: 'Budgets', url: '/budgets', icon: BiWallet },
    { title: 'Trends', url: '/trends', icon: BiTrendingUp },
    { title: 'Goals', url: '/goals', icon: BiTargetLock },
    { title: 'Recurring', url: '/recurring', icon: BiTimeFive },
    { title: 'Profile', url: '/profile', icon: BiUser },
];

export function AppSidebar() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    return (
        <Sidebar>
            {/* Header with Logo */}
            <SidebarHeader>
                <div className="flex items-center gap-3 px-2 py-4">
                    <div className="w-10 h-10 rounded-full border border-sidebar-border flex items-center justify-center text-xs font-light">
                        S|A
                    </div>
                    <span className="text-lg font-medium">Momentum</span>
                </div>
            </SidebarHeader>

            {/* Main Navigation */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={location.pathname === item.url}
                                    >
                                        <Link to={item.url}>
                                            <item.icon size={20} />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer with User Info */}
            <SidebarFooter>
                <SidebarSeparator />
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 px-2 py-3">
                            <Avatar className="w-10 h-10 rounded-full border border-sidebar-border">
                                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
                                    {user?.name?.[0] || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-semibold truncate">{user?.name}</p>

                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <BiLogOut size={20} />
                            <span>Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
