"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary to-background py-12 sm:py-16 lg:py-24">
      <div className="mx-auto container px-8 sm:px-6 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col justify-center pl-5">
            <h1 className="text-[33px] sm:text-[38px] lg:text-[48px] font-medium leading-[150%] ">
              Empowering schools. Inspiring generosity.
            </h1>
            <p className="mt-6 text-lg text-foreground/70 leading-relaxed text-balance">
              Every donation helps schools, students, and communities reach
              their goals. Join us in making fundraising simple, transparent,
              and impactful.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-[#7DBAED] hover:bg-[#7DBAED]/90 gap-3 rounded-full px-6 h-[51px] text-white text-base font-semibold"
              >
                Donate now
                <span className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative h-64 sm:h-96 lg:h-full flex items-center justify-center">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <div className="relative w-full h-64 sm:h-96 lg:h-[500px]">
      <Image
        src="/images/image 3.png"
        alt="Hero Image"
        fill
        className="object-cover"
        priority
        quality={100}
      />
    </div>
  );
}
