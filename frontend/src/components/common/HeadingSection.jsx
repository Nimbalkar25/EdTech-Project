import React from 'react'

const HeadingSection = ({
    title,
    description,
    highlight
}) => {
    return (
        <div className="flex w-full flex-col gap-3">
            <h1 className="text-[26px] font-semibold leading-[34px] text-[#F1F2FF] 
                     sm:text-[28px] sm:leading-[36px] 
                     lg:text-[30px] lg:leading-[38px]">
                {title}
            </h1>

            <p className="text-[16px] font-normal leading-6 text-[rgba(175,178,191,1)] 
                    sm:text-[17px] sm:leading-[24px] 
                    lg:text-[18px] lg:leading-[26px]">
                {description}{" "}
                {highlight && (
                    <span className="font-['Edu_SA_Beginner'] text-[15px] font-bold leading-6 text-[rgba(71,165,197,1)] sm:text-[16px]">
                        {highlight}
                    </span>
                )}
            </p>
        </div>
    )
}

export default HeadingSection
