import { Dna } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
        
        {/* Medical Image Background with Dark Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=2000&auto=format&fit=crop" 
            alt="Medical Research"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
        </div>

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 shadow-lg backdrop-blur-sm border border-white/10">
            <Dna className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">TuberCool</span>
        </div>
        
        <div className="relative z-10">
          <blockquote className="text-3xl font-medium leading-relaxed text-white drop-shadow-md">
            "Early diagnosis saves lives. Our AI-assisted platform helps clinicians across Southeastern Nigeria make faster, more accurate TB diagnoses."
          </blockquote>
          <p className="mt-6 text-sm font-medium text-slate-300">
            Data from 6 University Teaching Hospitals · 2010–2026
          </p>
        </div>
        
        <div className="relative z-10 flex flex-wrap gap-8 text-sm font-bold tracking-wider text-slate-400">
          <span className="hover:text-white transition-colors">ABUTH</span>
          <span className="hover:text-white transition-colors">UNTH</span>
          <span className="hover:text-white transition-colors">FNSH</span>
          <span className="hover:text-white transition-colors">FMCO</span>
          <span className="hover:text-white transition-colors">IMSUTH</span>
          <span className="hover:text-white transition-colors">EBSUTH</span>
        </div>
      </div>
      {/* Right panel */}
      <div className="relative flex flex-1 items-center justify-center p-8 lg:bg-white">
        
        {/* Mobile-only Background Image */}
        <div className="absolute inset-0 block lg:hidden">
          <img 
            src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=2000&auto=format&fit=crop" 
            alt="Medical Background"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
        </div>

        {/* Mobile Logo (Top Left) */}
        <div className="absolute left-6 top-8 z-10 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 shadow-lg backdrop-blur-sm border border-white/10">
            <Dna className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">TuberCool</span>
        </div>

        {/* Form Container (Card on mobile, flat on desktop) */}
        <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-black/5 lg:p-0 lg:shadow-none lg:ring-0 lg:bg-transparent">
          {children}
        </div>
      </div>
    </div>
  );
}
