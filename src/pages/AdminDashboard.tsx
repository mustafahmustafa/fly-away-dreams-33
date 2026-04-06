import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import SkyVoyLogo from "@/components/SkyVoyLogo";
import SectionFormEditor from "@/components/admin/SectionFormEditor";

const SECTIONS = [
  { key: "hero", label: "Hero Section" },
  { key: "deals", label: "Deals" },
  { key: "features", label: "Features" },
  { key: "how_it_works", label: "How It Works" },
  { key: "cta", label: "CTA / Newsletter" },
  { key: "trust_bar", label: "Trust Bar" },
  { key: "navbar", label: "Navbar" },
  { key: "footer", label: "Footer" },
  { key: "about", label: "About Page" },
  { key: "hotels_page", label: "Hotels Page" },
];

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAdmin();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="text-foreground/50">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-midnight">
      {/* Admin header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-5 md:px-8 h-[60px] bg-[rgba(5,10,26,0.95)] backdrop-blur-xl border-b border-foreground/[0.08]">
        <div className="flex items-center gap-3">
          <SkyVoyLogo height={28} />
          <span className="text-xs font-medium text-primary bg-primary/10 border border-primary/25 rounded-pill px-2.5 py-0.5">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground/50">{user?.email}</span>
          <button
            onClick={() => { signOut(); navigate("/admin/login"); }}
            className="text-sm text-foreground/50 hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-[220px] min-h-[calc(100vh-60px)] border-r border-foreground/[0.08] p-4 space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                activeSection === s.key
                  ? "bg-primary/15 text-foreground font-medium"
                  : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              {s.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 p-8 max-w-[900px] overflow-y-auto max-h-[calc(100vh-60px)]">
          <SectionFormEditor sectionKey={activeSection} sectionLabel={SECTIONS.find((s) => s.key === activeSection)?.label ?? activeSection} />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
