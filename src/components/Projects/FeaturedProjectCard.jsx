'use client';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { GithubIcon } from '../Shared/Icons';
import { useLocale, useTranslations } from 'next-intl';
import fallbackImage from '../../../public/images/profile/developer.png';

const FramerImage = motion(Image);

const FeaturedProjectCard = ({title, slug, summary, img, link, github, categories}) =>{
    const t = useTranslations('Projects');
    const locale = useLocale();
    return(
      <article className="w-full flex items-center justify-between relative rounded-br-2xl
        rounded-3xl border border-solid border-dark bg-light shadow-2xl p-12 dark:bg-dark dark:border-light
        lg:flex-col lg:p-8 xs:rounded-2xl xs:rounded-br-3xl xs:p-4">
        
        <div className="absolute top-0 -right-3 -z-10 w-[100.8%] h-[103%] rounded-[2.5rem] bg-dark dark:bg-light
          rounded-br-3xl xs:-right-2 sm:h-[102%] xs:w-full xs:rounded-[1.5rem]"  
        />
  
        <Link href={`/projects/${slug}`} className="w-1/2 cursor-pointer overflow-hidden rounded-xl lg:w-full">
          <FramerImage src={img?.image || fallbackImage} alt={img?.alt || title || ''} className="w-full h-auto"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
            width={img?.imageWidth || 1200}
            height={img?.imageHeight || 675}
          />
        </Link>
  
        <div className="w-1/2 flex flex-col items-start justify-between pl-6 lg:w-full lg:pl-0 lg:pt-6">
          <div className="flex flex-wrap gap-x-2 gap-y-0 mb-2">
            {categories &&
              categories.filter((category) => category?.slug).map(categy => (
                <Link
                  key={categy.slug}
                  href={`/search/${categy.slug}`}
                  className="hover:underline underline-offset-2 capitalize text-primary font-medium text-xl dark:text-primaryDark xs:text-base">
                  <span>
                    #{categy.name}
                  </span>
                </Link>
              ))
            }
          </div>
          <Link href={`/projects/${slug}`} className="hover:underline underline-offset-2">
            <h2 className="my-2 w-full text-left text-4xl lg:text-3xl sm:text-2xl font-bold dark:text-light">{title || (locale === 'en' ? 'Untitled draft' : 'Borrador sin título')}</h2>
          </Link>
          <p className="my-2 font-medium text-dark dark:text-light sm:text-sm">{summary}</p>
          {(github || link) && (
              <div className="w-full mt-2 flex items-center justify-between">
                {link && (
                  <Link
                    href={link}
                    target="_blank"
                    className="text-lg font-semibold underline sm:pr-4 sm:text-base"
                  >
                    {t('viewProject')}
                  </Link>
                )}
                {github && (
                  <Link
                    href={github}
                    target="_blank"
                    className="w-8 md:w-6"
                  >
                    {" "}
                    <GithubIcon />{" "}
                  </Link>
                )}
              </div>
            )
          }
        </div>
      </article>
    )
}

export default FeaturedProjectCard;
