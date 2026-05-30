import React from 'react';

// Common shimmering base element
const Shimmer = ({ className }) => (
  <div className={`bg-slate-200/80 animate-pulse rounded-lg ${className}`}></div>
);

export const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden relative pb-20 lg:pb-0">
      {/* Mobile Sticky Header Mock */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 border-b border-slate-100 flex items-center justify-between px-4 z-40 lg:hidden shadow-sm">
        <div className="flex items-center gap-2">
          <Shimmer className="w-6 h-6 rounded-md" />
          <Shimmer className="w-24 h-5" />
        </div>
        <Shimmer className="w-9 h-9 rounded-xl" />
      </header>

      {/* Desktop/Tablet Left Sidebar Mock */}
      <div className="w-64 bg-white/70 border-r border-slate-200/60 h-screen fixed left-0 top-0 flex flex-col p-6 z-50 hidden lg:flex">
        <div className="flex items-center gap-3 mb-10">
          <Shimmer className="w-8 h-8 rounded-lg" />
          <Shimmer className="w-28 h-6" />
        </div>
        <div className="space-y-4 flex-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="flex items-center gap-3 px-4 py-3">
              <Shimmer className="w-5 h-5 rounded-md" />
              <Shimmer className="w-24 h-4" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 px-4 py-3 mt-auto">
          <Shimmer className="w-5 h-5 rounded-md" />
          <Shimmer className="w-20 h-4" />
        </div>
      </div>

      {/* Sticky Bottom Navigation Bar Mock for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 border-t border-slate-100 flex justify-around items-center z-40 lg:hidden shadow-md px-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex flex-col items-center gap-1.5 flex-1">
            <Shimmer className="w-5 h-5 rounded-md" />
            <Shimmer className="w-10 h-2.5" />
          </div>
        ))}
      </nav>

      {/* Main Content Area */}
      <div className="pl-0 lg:pl-64 pt-16 lg:pt-0 transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-10">
          {/* Desktop/Tablet Header Mock */}
          <header className="hidden lg:flex justify-between items-center mb-10 gap-4">
            <div className="space-y-2">
              <Shimmer className="w-48 h-8" />
              <Shimmer className="w-32 h-4" />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right space-y-1.5 hidden md:block">
                <Shimmer className="w-24 h-4 ml-auto" />
                <Shimmer className="w-16 h-3 ml-auto" />
              </div>
              <Shimmer className="w-12 h-12 rounded-xl" />
            </div>
          </header>

          {/* Mobile Screen Page Title Mock */}
          <div className="lg:hidden mb-6 mt-2">
            <Shimmer className="w-36 h-7" />
          </div>

        {/* Dashboard Grid Mock */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <Shimmer className="w-16 h-4" />
                  <Shimmer className="w-12 h-8" />
                </div>
                <Shimmer className="w-10 h-10 rounded-xl" />
              </div>
              <div className="mt-4">
                <Shimmer className="w-28 h-3" />
              </div>
            </div>
          ))}
        </div>

        {/* Large Charts and Alerts Mock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-3xl p-8 min-h-[400px] flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <Shimmer className="w-48 h-6" />
              <Shimmer className="w-24 h-8" />
            </div>
            <div className="flex items-end justify-between gap-3 pt-10 h-48">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <div key={n} className="flex flex-col items-center gap-2 w-full">
                  <Shimmer className="w-full bg-slate-200 rounded-t-xl" style={{ height: `${20 + n * 10}%` }} />
                  <Shimmer className="w-10 h-3" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-6">
            <Shimmer className="w-28 h-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex gap-3 items-start p-3">
                  <Shimmer className="w-3 h-3 rounded-full mt-1" />
                  <div className="space-y-2 flex-1">
                    <Shimmer className="w-full h-4" />
                    <Shimmer className="w-20 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export const TableSkeleton = () => {
  return (
    <div className="bg-white/70 border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/40">
        <Shimmer className="w-32 h-7" />
        <Shimmer className="w-28 h-10 rounded-lg" />
      </div>
      <div className="p-6 space-y-4">
        {/* Table header placeholder */}
        <div className="grid grid-cols-5 gap-4 pb-2 border-b border-slate-100">
          <Shimmer className="w-24 h-4" />
          <Shimmer className="w-16 h-4" />
          <Shimmer className="w-20 h-4" />
          <Shimmer className="w-24 h-4" />
          <Shimmer className="w-28 h-4" />
        </div>
        {/* Table rows placeholders */}
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="grid grid-cols-5 gap-4 py-3 items-center border-b border-slate-100/50 last:border-0">
            <div className="space-y-2 col-span-1">
              <Shimmer className="w-36 h-4" />
              <Shimmer className="w-48 h-3" />
            </div>
            <Shimmer className="w-16 h-6 rounded-md" />
            <Shimmer className="w-24 h-6 rounded-md" />
            <Shimmer className="w-24 h-4" />
            <Shimmer className="w-28 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const TeamSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative">
          <Shimmer className="w-16 h-16 rounded-2xl mb-4" />
          <Shimmer className="w-32 h-5 mb-2" />
          <Shimmer className="w-20 h-4 mb-4" />
          
          <div className="w-full border-t border-slate-100 pt-4 flex justify-between">
            <Shimmer className="w-16 h-4" />
            <Shimmer className="w-20 h-4" />
          </div>
        </div>
      ))}
    </div>
  );
};

