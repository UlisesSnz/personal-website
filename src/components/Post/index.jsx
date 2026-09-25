import Image from 'next/image';
import { useFormatter, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PortableText } from 'next-sanity';
import AnimatedText from '@/components/Animations/AnimatedText';
import { GithubIcon, Pencil } from '@/components/Shared/Icons';
import Layout from '@/components/Shared/Layout';
import PortableTextComponents from '@/components/Shared/PortableTextComponents ';
import { Toaster } from 'sonner';
import Comments from './Comments';
import TableOfContent from './TableOfContent';
import SharePostLinks from './SharePostLinks';
import fallBackImage from '../../../public/images/profile/developer.png';

const Post = ({
        postId,
        contentType,
        title,
        estimatedReadingTime,
        coverImage,
        headings,
        description,
        githubUrl,
        projectUrl,
        categories,
        slug,
        commentsOrder,
        date,
        shareUrl
    }) => {
    const t = useTranslations();
    const format = useFormatter();
    const imageSrc = coverImage?.image || fallBackImage;
    const imageWidth = coverImage?.imageWidth || 1200;
    const imageHeight = coverImage?.imageHeight || 675;
    const hasHeadings = Array.isArray(headings) && headings.length > 0;
  
    return (
        <>
            <article className="w-full flex flex-col items-center justify-center dark:text-light">
                <Layout className="pt-16">
                    <AnimatedText
                        text={title}
                        className="mb-16 lg:!text-7xl sm:mb-8 sm:!text-6xl xs:!text-4xl"
                    />
                    <div className="flex items-center justify-center sm:flex-wrap">
                        <div className="underline underline-offset-2 sm:mb-2">
                            <Link href="/about" className="flex items-center">
                                <span className="flex font-os font-bold dark:font-semibold text-dark/75 dark:text-light/75">
                                    <Pencil className={"h-auto ml-1 !w-6 md:!w-4"} />{t('Post.author')}
                                </span>
                            </Link>
                        </div>
                        <span className="text-md font-medium mx-8 text-placeholder text-dark/75 dark:text-light/75 sm:mx-4 sm:text-sm sm:mb-2">
                            {t('Post.readingTime', { minutes: estimatedReadingTime })}
                        </span>
                        <span className="text-md font-medium text-placeholder text-dark/75 dark:text-light/75 sm:text-sm sm:mb-2">
                            {t('Post.updated', {
                                date: format.dateTime(new Date(`${date}T00:00:00Z`), 'contentDate'),
                            })}
                        </span>
                        <SharePostLinks
                            title={title}
                            shareUrl={shareUrl}
                            triggerClassName="ml-6 sm:ml-2 sm:mb-2"
                        />
                    </div>
                    <div className="text-md mt-6 mb-8 w-full text-center font-medium capitalize text-placeholder text-dark/75 dark:text-light/75 sm:mt-4 sm:mb-6 sm:text-sm sm:leading-snug">
                        {categories && categories.length > 0 && (
                            <span className="flex flex-wrap justify-center gap-2">
                                {t('Post.categories')}
                                {categories.map(category => (
                                    <Link
                                        key={category.slug}
                                        href={`/search/${category.slug}`}
                                        className="font-semibold capitalize text-primary dark:text-primaryDark underline underline-offset-2"
                                    >
                                        #{category.name}
                                    </Link>
                                ))}
                            </span>
                        )}
                    </div>
                    <figure className="relative aspect-video w-full">
                        <Image
                            src={imageSrc}
                            alt={coverImage?.alt || title}
                            width={imageWidth}
                            height={imageHeight}
                            className="w-full h-auto transform object-center rounded-xl"
                            priority
                            sizes="100vw"
                        />
                    </figure>

                    <div className="grid grid-cols-12 gap-y-8 gap-16 xl:gap-8 md:gap-x-0 mt-8">
                        {hasHeadings && (
                            <div className="col-span-4 lg:col-span-12">
                                <TableOfContent headings={headings} />
                            </div>
                        )}
                        <div className={`min-w-0 w-full font-medium ${hasHeadings ? 'col-span-8 lg:col-span-12' : 'col-span-12'}`}>
                            <PortableText value={description} components={PortableTextComponents} />
                        </div>
                    </div>
                    {(githubUrl && projectUrl) && (
                        <div className="flex flex-col items-end justify-between pl-6 lg:w-full lg:pl-0 lg:pt-6">
                            <div className="mt-16 flex items-end">
                                <a
                                    href={githubUrl}
                                    target="_blank"
                                    className="w-10"
                                >
                                    {" "}
                                    <GithubIcon />{" "}
                                </a>
                                <a
                                    href={projectUrl}
                                    target="_blank"
                                    className="ml-4 rounded-lg bg-dark text-light p-2 px-6 text-lg font-semibold dark:bg-light dark:text-dark
                                    sm:px-4 sm:text-base"
                                >
                                    {t('Projects.viewProject')}
                                </a>
                            </div>
                        </div>
                    )}
                    <Comments postId={postId} contentType={contentType} title={title} slug={slug} commentsOrder={commentsOrder} />
                </Layout>
            </article>
            <Toaster theme='system' duration={3000} />
        </>
    );
}

export default Post;
