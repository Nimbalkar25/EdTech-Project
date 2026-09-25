import React from 'react';
import CodeBlockSection from './CodeBlockSection';
import HeroSection from './HeroSection';

const codeBlockLines = (
  <>
    <div className="text-[#FFD60A]">&lt;!DOCTYPE html&gt;</div>
    <div className="text-white">&lt;html&gt;</div>
    <div className="text-white">head&gt;&lt;title&gt;Example&lt;/</div>
    <div>
      <span className="text-white">title&gt;&lt;link</span>{' '}
      <span className="text-[#EF476F]">rel=</span>
      <span className="text-[#EF476F]">&quot;stylesheet&quot;</span>{' '}
      <span className="text-[#EF476F]">href=&quot;styles.css&quot;&gt;</span>
    </div>
    <div className="text-white">/head&gt;</div>
    <div className="text-white">body&gt;</div>
    <div>
      <span className="text-white">h1&gt;&lt;</span>
      <span className="text-[#EF476F]">ahref=&quot;/&quot;&gt;</span>
      <span className="text-white">Header</span>
      <span className="text-[#EF476F]">&lt;/a&gt;</span>
    </div>
    <div className="text-white">/h1&gt;</div>
    <div>
      <span className="text-white">nav&gt;&lt;</span>
      <span className="text-[#EF476F]">ahref=&quot;one/&quot;&gt;</span>
      <span className="text-[#EF476F]">One</span>
      <span className="text-white">&lt;/a&gt;&lt;</span>
      <span className="text-[#EF476F]">ahref=&quot;two/&quot;&gt;Two&lt;/</span>
    </div>
    <div>
      <span className="text-[#EF476F]">a&gt;&lt;ahref=&quot;three/&quot;&gt;Three&lt;/a&gt;</span>
    </div>
    <div className="text-white">/nav&gt;</div>
  </>
);



const Home = () => {
  return (
    <div className="flex flex-col bg-[#000814] text-white">
      <HeroSection />

      {/* Block 1: Right Terminal with Yellow + Red/Coral highlights */}
      <CodeBlockSection
        position="lg:flex-row"
        heading={
          <h2>
            Unlock your{' '}
            <span className="bg-[linear-gradient(118.19deg,#1FA2FF_-3.62%,#12D8FA_50.44%,#A6FFCB_104.51%)] bg-clip-text text-transparent">
              coding potential
            </span>{' '}
            with our online courses.
          </h2>
        }
        subheading="Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."
        btn1={{ text: 'Try it Yourself', arrow: true }}
        btn2={{ text: 'Learn More' }}
        codeLines={codeBlockLines}
        glowGradient="linear-gradient(123.77deg, #8A2BE2 -6.46%, #FFA500 59.04%, #F8F8FF 124.53%)"
        glowPosition="-top-10 -left-6"
      />

      {/* Block 2: Inverted (Terminal Left) with Cyan highlights */}
      <CodeBlockSection
        position="lg:flex-row-reverse"
        heading={
          <h2>
            Start{' '}
            <span className="bg-[linear-gradient(118.19deg,#1FA2FF_-3.62%,#12D8FA_50.44%,#A6FFCB_104.51%)] bg-clip-text text-transparent">
              coding in seconds
            </span>
          </h2>
        }
        subheading="Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."
        btn1={{ text: 'Continue Lesson', arrow: true }}
        btn2={{ text: 'Learn More' }}
        codeLines={codeBlockLines}
        glowGradient="linear-gradient(118.19deg, #1FA2FF -3.62%, #12D8FA 50.44%, #A6FFCB 104.51%)"
        glowPosition="-top-10 -left-6"
      />
    </div>
  );
};

export default Home;