'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'All campaigns', href: '#campaigns' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'FAQs', href: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#E4F3FF]  ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[90px] items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-[50px] w-[50px] items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">D</span>
            </div>
            <span className="hidden font-semibold sm:inline-block">LOGO</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-base font-normal text-[#131313] hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4 ">
            <Button variant="ghost" size="sm" className='text-base font-normal leading-[150%] hover:bg-none'>
              Sign in
            </Button>
            <Button size="sm" className="bg-[#0024DA] hover:bg-[#0024DA]/90 text-base font-normal leading-[150%] h-[48px]">
              Start fundraising
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="flex flex-col gap-4 mt-8 text-base font-normal leading-[150%]">
                {navLinks.map((link) => (
                  <SheetClose key={link.label} asChild>
                    <Link
                      href={link.href}
                      className="text-base font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <div className="mt-6 flex flex-col gap-3 border-t pt-6">
                  <Button variant="outline" className="w-full">
                    Sign in
                  </Button>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Start fundraising
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
