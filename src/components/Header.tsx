
import { Link } from 'react-router-dom';
import { DarkModeToggle } from './DarkModeToggle';
import { SearchInput } from './SearchInput';
import { getNavigationItems } from '@/config/navigation';

export function Header() {
  const navLinks = getNavigationItems();

  return (
    <header className="relative safe-area-extend-top py-1 sm:py-1.5 lg:py-2 border-b-2 border-border sticky top-0 z-40 bg-surface-card backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-surface-card/60 safe-area-bg-seamless">
      <div 
        className="absolute inset-0 bg-surface-card/90 -z-10 safe-area-extend-top"
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
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="relative group text-xl lg:text-2xl leading-none font-jersey25 text-text-secondary hover:text-text-primary transition-colors duration-75 ease-in-out"
              >
                <span className="opacity-0 group-hover:opacity-100 mr-1 text-text-primary">[</span>
                {link.name}
                <span className="opacity-0 group-hover:opacity-100 ml-1 text-text-primary">]</span>
              </Link>
            ))}
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
