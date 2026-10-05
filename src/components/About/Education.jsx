'use client';
import { useRef } from 'react';
import Lilcon from './Lilcon';
import { motion, useScroll } from 'framer-motion';
import { useTranslations } from 'next-intl';

const Details = ({ type, time, place, info, certificate }) => {
  const t = useTranslations('About');
  const ref = useRef(null)

  return (
    <li ref={ref} className="my-8 first:mt-0 last:mb-0 w-[60%] mx-auto flex flex-col items-center justify-between md:w-[80%]">
      
      <Lilcon reference={ref} />

      <motion.div initial={{ y:50 }} whileInView={{ y:0 }} transition={{ duration:0.5, type:"spring", }}>
        <h3 className="capitalize font-bold text-2xl sm:text-xl xs:text-lg">
          {type}
        </h3>
        <span className="capitalize font-medium text-dark/75 dark:text-light/75 xs:text-sm">
          {time} | {place} {certificate ? <a href={certificate} target='_blank'>| <span className='underline underline-offset-2'>{t('certificate')}</span></a> : ''}
        </span>
        <p className="font-medium w-full md:text-sm">
          {info}
        </p>
      </motion.div>
    </li>
  )
}

const Education = ({ education }) => {
  const t = useTranslations('About');
  const ref = useRef(null);
  
  const {scrollYProgress} = useScroll({
    target: ref,
    offset: ["start end", "center start"]
  });
  
  return (
    <div className="my-64 md:my-32">
      <h2 className="font-bold text-8xl mb-16 w-full text-center md:text-6xl xs:text-4xl">
        {t('education')}
      </h2>

      <div ref={ref} className="w-[75%] mx-auto relative lg:w-[90%] md:w-full">

        <motion.div
          style={{ scaleY: scrollYProgress }}
          className="absolute left-9 top-0 w-[4px] h-full bg-dark origin-top dark:bg-light
            md:w-[2px] md:left-[30px] xs:left-[20px]"
          />

        <ul className="w-full flex flex-col items-start justify-between ml-4 xs:ml-2">
          {education && education.map(data => (
            <Details
              key={data._id}
              type={data.name}
              time={data.years?.endYear
                ? `${data.years.startYear}-${data.years.endYear}`
                : `${data.years?.startYear || ''}`
              }
              place={data.studyCenter}
              info={data.description}
              certificate={data.certificateURL}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Education;
