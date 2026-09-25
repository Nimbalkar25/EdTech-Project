import React from 'react';
import { ArrowRight } from 'lucide-react';
import CodeTerminal from './CodeTerminal';

const CodeBlockSection = ({
  position = 'lg:flex-row',
  heading,
  subheading,
  btn1 = { text: 'Try it Yourself', arrow: true },
  btn2 = { text: 'Learn More' },
  codeLines,
  glowGradient,
  glowPosition,
}) => {
  return (
    <div className="w-full bg-[#000814] font-['Inter'] text-white py-12 px-6 sm:px-12 lg:px-24 flex justify-center">
      <div
        className={`mx-auto flex w-full max-w-[1240px] flex-col ${position} items-center justify-between gap-12 lg:gap-20`}
      >
        {/* Content Column */}
        <div className="flex w-full flex-col gap-4 lg:w-[48%]">
          <div className="text-[32px] sm:text-[36px] font-semibold text-white leading-[1.25] tracking-tight">
            {heading}
          </div>

          <p className="text-[16px] font-medium text-[#838894] leading-relaxed max-w-[480px]">
            {subheading}
          </p>

          <div className="mt-6 flex flex-row items-center gap-6">
            {btn1 && (
              <button
                onClick={btn1.onClick}
                className="group flex items-center gap-2 rounded-lg bg-[#FFD60A] px-6 py-3 font-semibold text-black transition-all duration-200 hover:scale-95 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.51)] active:shadow-none cursor-pointer"
              >
                <span>{btn1.text}</span>
                {btn1.arrow && (
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                )}
              </button>
            )}

            {btn2 && (
              <button
                onClick={btn2.onClick}
                className="rounded-lg bg-[#161D29] px-6 py-3 font-semibold text-[#F1F2FF] transition-all duration-200 hover:scale-95 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] active:shadow-none cursor-pointer"
              >
                {btn2.text}
              </button>
            )}
          </div>
        </div>

        {/* Code Terminal Column */}
        <div className="w-full lg:w-[48%] flex justify-center">
          <CodeTerminal
            codeLines={codeLines}
            glowGradient={glowGradient}
            glowPosition={glowPosition}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeBlockSection;