import { FeatherMenu, FeatherSearch } from "@subframe/core";

const BELONG_LOGO_URL =
  "https://res.cloudinary.com/subframe/image/upload/v1773613307/uploads/11901/j0u9zo01h1selmlc99ko.svg";

export function Navbar() {
  return (
    <nav
      className="w-full bg-neutral-950"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="flex h-14 items-center justify-between px-2.5 py-2">
        <FeatherMenu className="text-h2-500 font-h2-500 text-neutral-50" />
        <img
          className="h-6 flex-none object-cover"
          src={BELONG_LOGO_URL}
          alt="Belong"
        />
        <FeatherSearch className="text-h2-500 font-h2-500 text-neutral-50" />
      </div>
    </nav>
  );
}
