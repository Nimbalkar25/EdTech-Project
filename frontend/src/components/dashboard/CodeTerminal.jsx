const CodeTerminal = ({
  codeLines,
  glowGradient,
  glowPosition = '-top-10 -left-10',
  lineCount = 11,
}) => {
  return (
    <div className="group relative flex w-full justify-center">
      {/* Glow blooms brighter & scales on card hover */}
      <div
        className={`absolute ${glowPosition} h-[260px] w-[370px] rounded-full opacity-30 blur-[68px] pointer-events-none z-0 transition-all duration-500 group-hover:opacity-60 group-hover:scale-110`}
        style={{ background: glowGradient }}
      />

      {/* Terminal lifts up slightly and sharpens border on hover */}
      <div className="relative z-10 w-full max-w-[500px] border border-[#2C333F]/70 bg-[#0E1A2D]/40 backdrop-blur-md rounded-lg p-4 flex flex-row gap-4 font-mono text-[13px] sm:text-[14px] leading-6 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.08)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-[#2C333F] group-hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)]">
        
        {/* Line Numbers */}
        <div className="flex flex-col select-none text-[#424854] text-right font-medium pr-3 border-r border-[#2C333F]/50 transition-colors duration-200 group-hover:text-[#6E727F]">
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i + 1}>{i + 1}</span>
          ))}
        </div>

        {/* Code Content */}
        <div className="w-full font-semibold overflow-x-auto">
          {codeLines}
        </div>
      </div>
    </div>
  );
};

export default CodeTerminal;