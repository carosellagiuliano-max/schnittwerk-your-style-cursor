import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Instagram, Phone, ShoppingCart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppointmentBookingDialog } from '@/components/booking/appointment-booking-dialog';
import LoginModal from '@/components/auth/LoginModal';
import ShopDialog from '@/components/booking/shop-dialog';
import CartDialog from '@/components/booking/cart-dialog';
import VanessaProfileDialog from '@/components/booking/vanessa-profile-dialog';
import { useCart } from '@/contexts/cart-context';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();

  const navItems = [
    { href: '/leistungen', label: 'Leistungen & Preise' },
    { href: '/galerie', label: 'Galerie' },
    { href: '/ueber-uns', label: 'Über uns & Kontakt' },
  ];

  return (
    <nav className="bg-accent/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex flex-col items-center">
              <span className="text-2xl font-heading font-bold text-primary">
                SCHNITTWERK
              </span>
              <span className="text-[10px] font-heading text-foreground tracking-wide text-center">
                BY VANESSA CAROSELLA
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-foreground hover:text-primary transition-elegant text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
              <VanessaProfileDialog>
                <button className="text-foreground hover:text-primary transition-elegant text-sm font-medium">
                  Team
                </button>
              </VanessaProfileDialog>
              <ShopDialog>
                <button className="text-foreground hover:text-primary transition-elegant text-sm font-medium">
                  Shop
                </button>
              </ShopDialog>
            </div>
          </div>

          {/* Desktop CTA & Social */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="https://www.instagram.com/schnittwerksg/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-elegant"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="tel:+41788508595"
              className="text-muted-foreground hover:text-primary transition-elegant"
            >
              <Phone className="h-5 w-5" />
            </a>
            <CartDialog>
              <button className="relative text-muted-foreground hover:text-primary transition-elegant">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </CartDialog>
            <LoginModal>
              <Button 
                size="sm" 
                className="bg-black text-white hover:bg-gray-800"
              >
                Login
              </Button>
            </LoginModal>
            <AppointmentBookingDialog>
              <Button 
                size="sm" 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Termin buchen
              </Button>
            </AppointmentBookingDialog>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-secondary transition-elegant"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-accent/98 backdrop-blur-md">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-secondary transition-elegant rounded-md"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <VanessaProfileDialog>
              <button 
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-secondary transition-elegant rounded-md w-full text-left"
                onClick={() => setIsOpen(false)}
              >
                Team
              </button>
            </VanessaProfileDialog>
            <ShopDialog>
              <button 
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-secondary transition-elegant rounded-md w-full text-left"
                onClick={() => setIsOpen(false)}
              >
                Shop
              </button>
            </ShopDialog>
            <div className="px-3 py-2 space-y-2">
              <div className="flex items-center space-x-4">
                <a
                  href="https://www.instagram.com/schnittwerksg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-elegant"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="tel:+41788508595"
                  className="text-muted-foreground hover:text-primary transition-elegant"
                >
                  <Phone className="h-5 w-5" />
                </a>
                <CartDialog>
                  <button className="relative text-muted-foreground hover:text-primary transition-elegant">
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </button>
                </CartDialog>
              </div>
              <AppointmentBookingDialog>
                <Button 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setIsOpen(false)}
                >
                  Termin buchen
                </Button>
              </AppointmentBookingDialog>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;