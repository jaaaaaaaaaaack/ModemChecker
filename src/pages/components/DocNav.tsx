import { useEffect, useState } from "react";
import { navigateTo, useHashRoute } from "../../hooks/useHashRoute";

const BELONG_LOGO_URL =
  "https://res.cloudinary.com/subframe/image/upload/v1773613307/uploads/11901/j0u9zo01h1selmlc99ko.svg";

const NAV_LINKS = [
  { route: "overview" as const, label: "Overview" },
  { route: "technical" as const, label: "Technical" },
  { route: "widget" as const, label: "Live Demo" },
] as const;

export function DocNav() {
  const currentRoute = useHashRoute();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-shadow duration-200 ${
        scrolled ? "shadow-md" : ""
      }`}
      style={{
        backgroundColor: "rgba(248, 248, 246, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-[780px] items-center justify-between px-6">
        <button
          onClick={() => navigateTo("widget")}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          <img className="h-5 flex-none" src={BELONG_LOGO_URL} alt="Belong" />
        </button>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ route, label }) => (
            <button
              key={route}
              onClick={() => navigateTo(route)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                currentRoute === route
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
