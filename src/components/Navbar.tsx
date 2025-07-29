import React from "react";
import Logo from "./icons/Logo";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { Link, NavLink } from "react-router-dom";


const Navbar: React.FC = () => {
  const auth = useAuth();

  type MenuLinks = {
    label: string;
    href: string;
    requireAuth: boolean;
  };

  const menuLinks: MenuLinks[] = [
    { label: "Chi siamo", href: "/chi-siamo", requireAuth: false },
    { label: "Guide", href: "/guide", requireAuth: false },
  ];

  return (
    <header className={"fixed w-full z-20 top-6 px-6 flex items-center gap-8 justify-between md:px-12"}>
        <nav className={"px-6 py-4.5 custom-navbar flex justify-center md:justify-start items-center bg-white space-x-4 w-full max-w-7xl mx-auto"}>
          <Link to={'/'}>
            <Logo />
          </Link>
          <div className={'ms-4'}>
            {menuLinks
              .filter((l) => auth.isAuthenticated || !l.requireAuth)
              .map((link, i) => {
                return (
                  <NavLink key={i} to={link.href} className={'hover:bg-[#f5f5f5] px-4 py-2 rounded-full text-tertiary transition-all'}>
                    {link.label}
                  </NavLink>
                );
              })}
          </div>
        </nav>
    </header>
  );
};

export default Navbar;