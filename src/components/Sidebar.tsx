import type { User } from "../dummy";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  navItems: NavItem[];
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  user,
  activeTab,
  onTabChange,
  navItems,
  onLogout,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const roleColor =
    user.role === "admin"
      ? "bg-violet-600"
      : user.role === "staff"
        ? "bg-teal-600"
        : "bg-[#1A3A5C]";

  const roleLabel =
    user.role === "admin"
      ? "Administrator"
      : user.role === "staff"
        ? "Hall Staff"
        : "Student";

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-950/45 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col min-h-screen shrink-0 transition-transform duration-200 md:translate-x-0 md:max-lg:w-20 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#0F1B2D", color: "#E5EAF2" }}
      >
        {/* Hall branding */}
        <div
          className="px-5 py-5 border-b md:max-lg:px-3"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="w-7 h-7 rounded flex items-center justify-center shrink-0 text-white text-xs font-bold"
              style={{
                backgroundColor: "#0E7C7B",
                fontFamily: "var(--font-display)",
              }}
            >
              KH
            </div>
            <span
              className="text-sm font-semibold leading-tight md:max-lg:hidden"
              style={{ fontFamily: "var(--font-display)", color: "#E5EAF2" }}
            >
              Kabi Kazi Nazrul Islam Hall
            </span>
          </div>
          <p
            className="text-xs md:max-lg:hidden"
            style={{ color: "#6B8099", marginLeft: "35px" }}
          >
            Complaint Portal
          </p>
        </div>

        {/* User card */}
        <div
          className="px-4 py-4 border-b md:max-lg:px-3"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 ${roleColor}`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0 md:max-lg:hidden">
              <p
                className="text-sm font-semibold truncate"
                style={{ fontFamily: "var(--font-display)", color: "#E5EAF2" }}
              >
                {user.name}
              </p>
              <p
                className="text-xs"
                style={{ color: "#6B8099", fontFamily: "var(--font-mono)" }}
              >
                {roleLabel} · {user.id}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto md:max-lg:px-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose?.();
                }}
                title={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors text-left md:max-lg:justify-center md:max-lg:px-2 ${
                  isActive ? "text-white" : "hover:bg-white/5"
                }`}
                style={{
                  backgroundColor: isActive ? "#0E7C7B" : undefined,
                  color: isActive ? "#fff" : "#A0B0C4",
                  fontFamily: "var(--font-body)",
                }}
              >
                <span className="shrink-0 w-4 h-4 flex items-center justify-center">
                  {item.icon}
                </span>
                <span className="md:max-lg:hidden">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5 md:max-lg:px-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors hover:bg-white/5 md:max-lg:justify-center md:max-lg:px-2"
            title="Sign out"
            style={{ color: "#6B8099" }}
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
