import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Key,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  UserCircle2,
  CreditCard,
  ArrowDownUp,
  ListChecks,
  ShoppingCart,
  Wallet,
  Package2
} from 'lucide-react';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { 
    icon: ArrowDownUp,
    label: 'Financeiro',
    children: [
      { icon: ShoppingCart, label: 'Vendas', path: '/sales' },
      { icon: Wallet, label: 'Contas a Receber', path: '/accounts-receivable' },
      { icon: ArrowDownUp, label: 'Tipos de Movimento', path: '/movement-types' },
      { icon: ListChecks, label: 'Status de Movimento', path: '/movement-statuses' },
      { icon: CreditCard, label: 'Métodos de Pagamento', path: '/payment-methods' },
    ]
  },
  {
    icon: Users,
    label: 'Cadastros',
    children: [
      { icon: UserCircle2, label: 'Pessoas', path: '/persons' },
      { icon: Users, label: 'Usuários', path: '/users' },
      { icon: Key, label: 'Licenças', path: '/licenses' },
      { icon: Package2, label: 'Serviços', path: '/services' },
    ]
  },
  { icon: Settings, label: 'Configurações', path: '/settings' }
];

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const location = useLocation();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    document.documentElement.style.setProperty(
      '--sidebar-width',
      !isCollapsed ? '4.5rem' : '16rem'
    );
  };

  const isActiveRoute = (path?: string) => {
    if (!path) return false;
    return location.pathname.startsWith(path);
  };

  const isActiveParent = (item: MenuItem) => {
    if (!item.children) return false;
    return item.children.some(child => isActiveRoute(child.path));
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = isActiveRoute(item.path);
    const isParentActive = isActiveParent(item);
    const isExpanded = expandedItem === item.label;

    if (item.children) {
      return (
        <div key={item.label}>
          <button
            onClick={() => setExpandedItem(isExpanded ? null : item.label)}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
              isParentActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="font-medium flex-1 text-left">{item.label}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </>
            )}
          </button>
          {!isCollapsed && isExpanded && (
            <div className="ml-4 pl-4 border-l border-gray-200 space-y-2 mt-2">
              {item.children.map(child => renderMenuItem(child))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path || '#'}
        onClick={() => setIsMobileOpen(false)}
        className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
          isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        {!isCollapsed && (
          <span className="font-medium">{item.label}</span>
        )}
      </Link>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-3 left-4 z-20 p-2 rounded-lg bg-white shadow-sm border border-gray-200"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        bg-white border-r border-gray-200 h-screen fixed left-0 top-0 pt-16
        transition-all duration-300 ease-in-out z-10
        ${isCollapsed ? 'w-[4.5rem]' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <nav className="p-4 space-y-2">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>

        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm hover:bg-gray-50"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>
    </>
  );
};