import React from 'react'
import frame23 from "../../assets/Frame 23.png"

const CommonImage = ({image,addCss}) => {
  return (
           <div className="relative hidden w-full items-center justify-center md:max-w-[330px] lg:flex xl:w-1/2 xl:max-w-[500px]">

          {/* Main frame */}
          <img
            src={frame23}
            alt="StudyNotion"
            className="h-auto w-full max-w-[450px] object-contain"
          />

          {/* People frame */}
          <img
            src={image}
            alt="People learning"
            className={`absolute xl:bottom-[6%] right-[10%] md:bottom-[10%] md:right-[10%] md:w-[95%] xl:w-[90%] object-contain ${addCss}`}
          />

        </div>
  )
}

export default CommonImage
