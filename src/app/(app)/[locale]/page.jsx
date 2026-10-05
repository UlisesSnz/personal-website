import Layout from '@/components/Shared/Layout';
import Image from 'next/image';
import profilePic from '../../../../public/images/profile/developer.png'
import AnimatedText from '@/components/Animations/AnimatedText';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { LinkArrow } from '@/components/Shared/Icons';
import HireMe from '@/components/Home/HireMe';
import lighBulb from '../../../../public/images/svgs/spotlight.svg';
import { getProfile } from '@/sanity/sanity.query';
import { getStaticPageMetadata } from '@/utils/seoMetadata';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return getStaticPageMetadata('home', locale);
}

export default async function Home({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('Home');
    const profile = await getProfile(locale);

    if (!profile) notFound();
    
    return (
        <main className="flex items-center text-dark w-full min-h-screen dark:text-light sm:items-start">
            <Layout className="!pt-0 md:!pt-14 sm:!pt-14">
                <div className="flex items-center justify-between w-full lg:flex-col">
                    <div className="w-1/2 md:w-full">
                        <Image src={profilePic} alt={t('developerAlt')} className="w-full h-auto lg:hidden md:inline-block md:w-full"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                        />
                    </div>
                        <div className="w-1/2 flex flex-col items-center self-center lg:w-full lg:text-center">
                            <AnimatedText text={profile.headline || (locale === 'en' ? 'Draft profile' : 'Perfil en borrador')} className="!text-6xl !text-left
                            xl:!text-5xl lg:!text-center lg:!text-6xl md:!text-5xl sm:!text-3xl"
                            />
                            <p className="my-4 text-base font-medium md:text-sm sm:text-xs">
                                {profile.shortBiography}
                            </p>
                            <div className="flex items-center self-start mt-2 lg:self-center">
                                {profile.resumeURL && <a
                                    href={`${profile.resumeURL}?dl=${encodeURIComponent(profile.fullName || 'Resume')} - Resume.pdf`}
                                    aria-label={t('downloadResume')}
                                    className="flex items-center bg-dark text-light p-2.5 px-6 rounded-lg text-lg
                                    font-semibold hover:bg-light hover:text-dark border-2 border-solid border-transparent hover:border-dark
                                    dark:bg-light dark:text-dark hover:dark:bg-dark hover:dark:text-light hover:dark:border-light
                                    md:p-2 md:px-4 md:text-base"
                                >
                                    {t('resume')} <LinkArrow className={"h-auto ml-1 !w-6 md:!w-4"} />
                                </a>}
                                <Link
                                    href="/contact"
                                    className="ml-4 text-lg font-medium capitalize text-dark underline dark:text-light md:text-base hidden lg:flex"
                                >
                                    {t('contact')}
                                </Link>
                            </div>
                        </div>
                </div>
            </Layout>

            <HireMe />

            <div className="absolute right-8 bottom-16 inline-block w-24 md:hidden">
                <Image src={lighBulb} alt={t('ideaAlt')} className="w-full h-auto" />
            </div>
        </main>
    )
}
