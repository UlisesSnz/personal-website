'use client';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { GithubIcon } from '../Shared/Icons';
import { useLocale, useTranslations } from 'next-intl';
import fallbackImage from '../../../public/images/profile/developer.png';

const FramerImage = motion(Image);

const PostCard = ({title, summary, categories, img, link, github }) => {
    const t = useTranslations('Post');
    const locale = useLocale();
    return(
      <article
        className="w-full flex flex-col items-center justify-center rounded-2xl
        border border-solid border-dark bg-light p-6 relative dark:bg-dark dark:border-light xs:p-4"
      >
        
        <div className="absolute top-0 -right-3 -z-10 w-[101%] h-[103%] rounded-[2rem] bg-dark
          rounded-br-3xl dark:bg-light md:-right-2 md:w-[101%] xs:h-[102%] xs:rounded-[1.5rem]"  
        />
        
        <Link href={link} className="w-full cursor-pointer overflow-hidden rounded-lg">
          <FramerImage src={img?.image || fallbackImage} width={img?.imageWidth || 1200} height={img?.imageHeight || 675} alt={title || ''} className="w-full h-auto"
            whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}
          />
        </Link>
  
        <div className="w-full flex flex-col items-start justify-between mt-4">
          <div className="flex flex-wrap gap-x-2 gap-y-0 mb-2">
            {categories &&
              categories.filter((category) => category?.slug).map(categy => (
                <Link
                  key={categy.slug}
                  href={`/search/${categy.slug}`}
                  className="hover:underline underline-offset-2 capitalize text-primary font-medium dark:text-primaryDark text-base md:text-sm">
                  <span>
                    #{categy.name}
                  </span>
                </Link>
              ))
            }
          </div>
          <Link href={link} className="hover:underline underline-offset-2">
            <h2 className="my-2 w-full text-left text-3xl font-bold lg:text-2xl">{title || (locale === 'en' ? 'Untitled draft' : 'Borrador sin título')}</h2>
          </Link>
          <p className="my-2 font-medium text-dark dark:text-light sm:text-sm">{summary}</p>
          <div className="w-full mt-2 flex items-center justify-between">
            <Link href={link} className="text-lg font-semibold underline underline-offset-2 md:text-base">
              {t('continueReading')}
            </Link>
            {github && (
              <Link
                href={github}
                target="_blank"
                className="w-7 md:w-5"
              >
                <GithubIcon />{" "}
              </Link>
            )}
          </div>
        </div>
      </article>
    )
}

export default PostCard;
