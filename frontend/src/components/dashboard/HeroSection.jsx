import { ArrowRight } from 'lucide-react';
import React from 'react';
import heroVideo from "../../assets/heroSection_video.mp4";

const HeroSection = () => {
    return (
        <div className='font-["Inter"] px-6 sm:px-12 lg:px-35'>
            <div className='flex w-full flex-col items-center mt-15 px-4 sm:px-12 lg:px-25 gap-3'>
                <button className='flex mb-4 rounded-[500px] p-2 px-3 gap-1.25 bg-[rgba(22,29,41,1)] text-[rgba(153,157,170,1)] items-center shadow-[inset_0px_-1px_0px_0px_rgba(255,255,255,0.18)]'>
                    Become an Instructor <span><ArrowRight size={15} /></span>
                </button>
                <h1 className='text-[36px] font-semibold text-white text-center'>
                    Empower Your Future with <span className='bg-[linear-gradient(118.19deg,#1FA2FF_-3.62%,#12D8FA_50.44%,#A6FFCB_104.51%)] bg-clip-text text-transparent'
                    >Coding Skills</span>
                </h1>
                <p className='text-[rgba(131,136,148,1)] font-medium text-[16px] text-center max-w-[850px]'>
                    With our online coding courses, you can learn at your own pace, from anywhere in the world, and get access to a wealth of resources, including hands-on projects, quizzes, and personalized feedback from instructors.
                </p>

                <div className='flex gap-6 mt-2'>
                    <button className='bg-[rgba(255,214,10,1)] rounded-lg py-3 px-6 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.51)] font-semibold text-black cursor-pointer hover:scale-95 transition-all duration-200'>Learn More</button>
                    <button className='bg-[rgba(22,29,41,1)] rounded-lg py-3 px-6 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] text-[rgba(241,242,255,1)] font-semibold cursor-pointer hover:scale-95 transition-all duration-200'>Book a Demo</button>
                </div>
            </div>

            {/* Video Section with Blue Ambient Glow + White Offset Shadow */}
            <div className='relative w-full my-12 flex flex-col items-center max-w-[1035px] mx-auto'>

                {/* ================= THIS IS THE BLUE GLOW ================= */}
                <div
                    className='w-[60%] h-[180px] -mb-28 rounded-full 
               bg-[radial-gradient(ellipse_at_center,_#1FA2FF_0%,_#12D8FA_40%,_transparent_75%)] 
               blur-[70px] opacity-60 pointer-events-none'
                />
                {/* ========================================================= */}

                {/* Video container with white offset border */}
                <div className='relative z-10 w-full shadow-[20px_20px_0px_0px_rgba(245,245,245,1)]'>                   
                     <video
                    src={heroVideo}
                    autoPlay
                    loop
                    muted
                    defaultMuted
                    playsInline
                    className="w-full h-auto object-cover"
                />
                </div>
            </div>
        </div>
    );
};

export default HeroSection;