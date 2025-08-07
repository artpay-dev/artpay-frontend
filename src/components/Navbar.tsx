import { useState } from "react";
import Logo from "./icons/Logo";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { Link, NavLink } from "react-router-dom";
import MenuIcon from "./icons/MenuIcon.tsx";

type MenuLinks = {
  label: string;
  href: string;
  requireAuth: boolean;
};

const menuLinks: MenuLinks[] = [
  { label: "Chi siamo", href: "/chi-siamo", requireAuth: false },
  { label: "Guide", href: "/guide", requireAuth: false },
];

const Navbar: React.FC = () => {
  const auth = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };

  const closeMenu = () => setIsMenuOpen(false);

  const filteredLinks = menuLinks.filter(link => 
    auth.isAuthenticated || !link.requireAuth
  );


  return (
    <header className="fixed w-full z-20 top-6 px-6 md:px-12">
      <nav className="px-6 py-3 md:py-4.5 custom-navbar bg-white w-full max-w-7xl mx-auto rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 me-4">
              <Logo />
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {filteredLinks.map((link, index) => (
                <NavLink
                  key={index}
                  to={link.href}
                  className="px-4 py-2 rounded-full text-tertiary hover:bg-gray-50 transition-colors"
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="md:hidden p-2"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <MenuIcon className="cursor-pointer" />
            </button>
            <Link to="https://gallerie.artpay.art" className="hidden md:block text-secondary underline underline-offset-2 whitespace-nowrap">
              Sei una galleria?
            </Link>
          </div>
        </div>

        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen 
              ? "max-h-48 opacity-100 mt-4" 
              : "max-h-0 opacity-0 mt-0"
          }`}
        >
          <div className="flex flex-col space-y-2 pb-4">
            {filteredLinks.map((link, index) => (
              <NavLink
                key={index}
                to={link.href}
                className="md:px-4 py-3 rounded-lg text-tertiary hover:bg-gray-50 transition-colors"
                onClick={closeMenu}
              >
                {link.label}
              </NavLink>
            ))}
            <Link to="https://gallerie.artpay.art" className={'text-secondary mt-4 underline underline-offset-2'}>
              Sei una galleria?
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;