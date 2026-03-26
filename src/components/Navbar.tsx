import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FeatherMenu, FeatherSearch } from "@subframe/core";

const BELONG_LOGO_URL =
  "https://res.cloudinary.com/subframe/image/upload/v1773613307/uploads/11901/j0u9zo01h1selmlc99ko.svg";

const safeAreaStyle: React.CSSProperties = {
  paddingTop: "env(safe-area-inset-top, 0px)",
};

const NAV_ITEMS = [
  { path: "/", label: "Compatibility checker" },
  { path: "/setup", label: "Setup guide" },
];

export const Navbar = React.memo(function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen]);

  return (
    <nav className="w-full bg-neutral-950 sticky top-0 z-50" style={safeAreaStyle}>
      <div className="flex h-14 items-center justify-between px-2.5 py-2">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center justify-center h-10 w-10"
            aria-label="Navigation menu"
            aria-expanded={menuOpen}
          >
            <FeatherMenu className="text-h2-500 font-h2-500 text-neutral-50" />
          </button>
          {menuOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-neutral-200 py-1 z-50 overflow-hidden">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-body-bold font-body-bold transition-colors ${
                      isActive
                        ? "text-brand-700 bg-brand-50"
                        : "text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <img
          className="ml-5 h-6 flex-none object-cover mobile:absolute mobile:left-1/2 mobile:-translate-x-1/2 mobile:ml-0"
          src={BELONG_LOGO_URL}
          alt="Belong"
        />
        <div className="flex items-center justify-center h-10 w-10">
          <FeatherSearch className="text-h2-500 font-h2-500 text-neutral-50" />
        </div>
      </div>
    </nav>
  );
});
