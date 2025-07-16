
import { Link, useLocation } from 'react-router-dom';
import { DarkModeToggle } from './DarkModeToggle';
import { SearchInput } from './SearchInput';
import { getNavigationItems } from '@/config/navigation';

export function Header() {
  const navLinks = getNavigationItems();
  const location = useLocation();

  return (
    <header className="relative safe-area-extend-top py-1 sm:py-1.5 lg:py-2 border-b-2 border-border sticky top-0 z-40 bg-surface-card backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-surface-card/60 safe-area-bg-seamless shadow-[0_6px_0px_theme(colors.shadow-hard)]">
      <div 
        className="absolute inset-0 bg-surface-card -z-10 safe-area-extend-top"
      />
      <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-jersey font-bold text-text-primary leading-none pr-4">
          <span className="block md:hidden text-2xl sm:text-3xl">LEVEL ONE Radiology</span>
          <div className="hidden md:block leading-snug">
            <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">LEVEL ONE</span>
            <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mt-[-0.3em]">Radiology</span>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          <nav className="flex items-center h-5 space-x-3 lg:space-x-4">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`relative group text-xl lg:text-2xl leading-none font-jersey25 transition-all duration-150 ease-out ${
                    isActive 
                      ? 'text-text-primary border-2 border-border bg-surface-card px-3 py-1 shadow-[6px_6px_0px_theme(colors.shadow-hard)]' 
                      : 'text-text-secondary hover:text-text-primary hover:-translate-y-[1px]'
                  }`}
                >
                  <span className={`mr-1 transition-opacity duration-150 ease-out ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  } text-text-primary`}>[</span>
                  {link.name}
                  <span className={`ml-1 transition-opacity duration-150 ease-out ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  } text-text-primary`}>]</span>
                </Link>
              );
            })}
          </nav>
          <SearchInput />
          <DarkModeToggle />
        </div>

        <div className="md:hidden flex items-center gap-x-2">
          <SearchInput />
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
