import React from "react";
import { FeatherMenu } from "@subframe/core";
import { navigateTo } from "../hooks/useHashRoute";

const BELONG_LOGO_URL =
  "https://res.cloudinary.com/subframe/image/upload/v1773613307/uploads/11901/j0u9zo01h1selmlc99ko.svg";

const safeAreaStyle: React.CSSProperties = {
  paddingTop: "env(safe-area-inset-top, 0px)",
};

export const Navbar = React.memo(function Navbar() {
  return (
    <nav className="w-full bg-neutral-950" style={safeAreaStyle}>
      <div className="flex h-14 items-center justify-between px-2.5 py-2">
        <FeatherMenu className="text-h2-500 font-h2-500 text-neutral-50" />
        <img
          className="h-6 flex-none object-cover"
          src={BELONG_LOGO_URL}
          alt="Belong"
        />
        <button
          onClick={() => navigateTo("overview")}
          className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-200 transition-colors hover:bg-neutral-700 active:scale-[0.97]"
        >
          Docs
        </button>
      </div>
    </nav>
  );
});
