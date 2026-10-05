import AnimatedText from '@/components/Animations/AnimatedText';
import Layout from '@/components/Shared/Layout';
import Image from 'next/image';
import Skills from '@/components/About/Skills';
import Experience from '@/components/About/Experience';
import Education from '@/components/About/Education';
import AnimatedNumbers from '@/components/About/AnimatedNumbers';
import { getEducation, getJob, getProfile } from '@/sanity/sanity.query';
import { PortableText } from 'next-sanity';
import PortableTextComponents from '@/components/Shared/PortableTextComponents ';
import { getStaticPageMetadata } from '@/utils/seoMetadata';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import fallbackImage from '../../../../../public/images/profile/developer.png';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return getStaticPageMetadata('about', locale);
}

const about = async ({ params }) => {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('About');
    const [profile, job, education] = await Promise.all([
        getProfile(locale),
        getJob(locale),
        getEducation(locale),
    ]);

    if (!profile) notFound();

    return (
        <main className="flex w-full flex-col items-center justify-center dark:text-light">
            <Layout className="pt-16">
                <AnimatedText text={t('title')} className="mb-16 lg:!text-7xl sm:!text-6xl xs:!text-4xl sm:mb-8" />
                    <>
                        <div className="grid w-full grid-cols-8 gap-16 sm:gap-8">
                            <div className="col-span-3 flex flex-col items-start justify-start xl:col-span-4 md:order-2 md:col-span-8">
                                <h2 className="mb-4 text-lg font-bold uppercase text-dark/75 dark:text-light/75">{t('biography')}</h2>
                                <div className="font-medium">
                                    <PortableText value={profile.fullBiography || []} components={PortableTextComponents} />
                                </div>
                            </div>

                            <div className="col-span-3 relative h-max rounded-2xl border-2 border-solid
                                border-dark bg-light p-8 dark:bg-dark dark:border-light xl:col-span-4
                                md:order-1 md:col-span-8"
                            >
                                <div className="absolute top-0 -right-3 -z-10 w-[102%] h-[103%] rounded-[2rem] rounded-br-3xl bg-dark dark:bg-light" />
                                <Image
                                    src={profile.profileImage?.image || fallbackImage}
                                    alt={profile.profileImage?.alt || profile.fullName || ''}
                                    className="w-full h-auto rounded-2xl"
                                    priority
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    width={profile.profileImage?.imageWidth || 1200}
                                    height={profile.profileImage?.imageHeight || 675}
                                />
                            </div>

                            <div className="col-span-2 flex flex-col items-end justify-between xl:col-span-8 xl:flex-row xl:items-center md:order-3">
                                <div className="flex flex-col items-end justify-center xl:items-center">
                                    <span className="inline-block text-7xl font-bold md:text-6xl sm:text-5xl xs:text-4xl">
                                        <AnimatedNumbers value={profile.developerStatistic?.programmingLanguagesLearned || 0} />+
                                    </span>
                                    <h2 className="text-lg font-medium capitalize text-dark/75 dark:text-light/75 xl:text-center md:text-lg
                                        sm:text-base xs:text-sm">
                                        {t('programmingLanguages')}
                                    </h2>
                                </div>
                                <div className="flex flex-col items-end justify-center xl:items-center">
                                    <span className="inline-block text-7xl font-bold md:text-6xl sm:text-5xl xs:text-4xl">
                                        <AnimatedNumbers value={profile.developerStatistic?.completedProjects || 0} />+
                                    </span>
                                    <h2 className="text-lg font-medium capitalize text-dark/75 dark:text-light/75 xl:text-center md:text-lg
                                        sm:text-base xs:text-sm">
                                        {t('completedProjects')}
                                    </h2>
                                </div>
                                <div className="flex flex-col items-end justify-center xl:items-center">
                                    <span className="inline-block text-7xl font-bold md:text-6xl sm:text-5xl xs:text-4xl">
                                        <AnimatedNumbers value={profile.developerStatistic?.technologiesLearned || 0} />+
                                    </span>
                                    <h2 className="text-lg font-medium capitalize text-dark/75 dark:text-light/75 xl:text-center md:text-lg
                                        sm:text-base xs:text-sm">
                                        {t('technologies')}
                                    </h2>
                                </div>
                            </div>
                        </div>
                        <Skills skills={profile.skills} />
                    </>
                <Experience job={job} />
                <Education education={education} />
            </Layout>
        </main>
    )
}

export default about;
