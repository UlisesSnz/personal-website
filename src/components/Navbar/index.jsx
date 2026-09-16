'use client';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createRoot } from 'react-dom/client';
import Logo from './Logo';
import { MoonIcon, SunIcon } from '../Shared/Icons';
import { motion } from 'framer-motion';
import useThemeSwitcher from '../Hooks/useThemeSwitcher';
import CustomLink from './CustomLink';
import CustomMobileLink from './CustomMobileLink';
import SocialLinks from './SocialLinks';
import MobileSocialLinks from './MobileSocialLinks';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = ({ englishEnabled = false }) => {
    const t = useTranslations('Navigation');
    const [mode, setMode] = useThemeSwitcher();
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef(null);
    const router = useRouter();

    const handleClick = useCallback(() => {
        setIsOpen(prevIsOpen => !prevIsOpen);
    }, []);

    useEffect(() => {
        const modalContainer = document.getElementById('modal');;
        if (isOpen) {
            document.body.classList.add('overflow-y-hidden');
            if (!rootRef.current) {
                rootRef.current = createRoot(modalContainer);
            }
            const modalDiv = (
                <div 
                    className="z-100 fixed top-0 left-0 bottom-0 right-0 inline-block bg-dark/50 font-os backdrop-blur-[2px]"
                    onClick={handleClick}
                />
            );
            rootRef.current.render(modalDiv);
        } else{
            document.body.classList.remove('overflow-y-hidden');
            if (rootRef.current) {
                rootRef.current.unmount();
                rootRef.current = null;
            }
        } 
        return () => {
            document.body.classList.remove('overflow-y-hidden');
            if (rootRef.current) {
                rootRef.current.unmount();
                rootRef.current = null;
            }
        };
    }, [isOpen, handleClick]);

    useEffect(() => {
        const handleHashChange = () => {
          if (window.location.hash) {
            router.push(window.location.pathname + window.location.hash);
          }
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => {
          window.removeEventListener('hashchange', handleHashChange);
        };
    }, [router]);

    return (
        <header
            className="w-full px-32 py-8 font-medium flex items-center justify-between dark:text-light z-10 lg:px-16 md:px-12 sm:px-8"
        >
            <div className="mr-10 md:mr-0">
                <Logo />
            </div>
            <div className="w-full flex justify-between items-center lg:hidden">
                <nav>
                    <CustomLink href="/" title={t('home')} className="mr-4" />
                    <CustomLink href="/contact" title={t('contact')} className="mx-4" />
                    <CustomLink href="/projects" title={t('projects')} className="mx-4" />
                    <CustomLink href="/blog" title={t('blog')} className="ml-4" />
                </nav>
            
                <nav className="flex items-center justify-center flex-wrap">
                    <SocialLinks />

                    <span
                        aria-hidden="true"
                        className="mx-3 h-5 w-px shrink-0 bg-dark/30 dark:bg-light/30"
                    />

                    {englishEnabled && (
                        <Suspense fallback={null}>
                            <LanguageSwitcher />
                        </Suspense>
                    )}

                    <button
                        onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
                        aria-label={t('switchTheme', { mode: t(mode === 'light' ? 'dark' : 'light') })}
                        className={`ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full p-1
                                ${mode === 'light' ? 'bg-dark text-light' : 'bg-light text-dark'}
                        `}
                    >
                        {
                            mode === 'dark'
                            ? <SunIcon className={"fill-dark"} />
                            : <MoonIcon className={"fill-dark"} />
                        }
                    </button>

                </nav>
            </div>

            <button className="flex-col justify-center items-center hidden lg:flex mt-0" onClick={handleClick} aria-label={isOpen ? t('closeMenu') : t('openMenu')}>
                <span className={`bg-dark dark:bg-light block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
                <span className={`bg-dark dark:bg-light block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`bg-dark dark:bg-light block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
            </button>

            {
                isOpen ?
            
                <motion.div
                    initial={{scale:0, opacity:0, x: '-50%', y: '-50%'}}
                    animate={{scale:1, opacity:1}}
                    className="min-w-[80vw] flex flex-col justify-between z-30 items-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    bg-dark/90 dark:bg-light/75 rounded-lg backdrop-blur-md py-12"
                >
                    <nav className="flex items-center flex-col justify-center">
                        <CustomMobileLink href="/" title={t('home')} toggle={handleClick} />
                        <CustomMobileLink href="/contact" title={t('contact')} toggle={handleClick} />
                        <CustomMobileLink href="/projects" title={t('projects')} toggle={handleClick} />
                        <CustomMobileLink href="/blog" title={t('blog')} toggle={handleClick} />
                    </nav>
                
                    <nav className="flex items-center justify-center flex-wrap mt-2">
                        <MobileSocialLinks />

                        <span
                            aria-hidden="true"
                            className="mx-3 h-5 w-px shrink-0 bg-light/40 dark:bg-dark/40 sm:mx-1"
                        />

                        {englishEnabled && (
                            <Suspense fallback={null}>
                                <LanguageSwitcher className="sm:mx-1 sm:h-7 sm:w-7" />
                            </Suspense>
                        )}

                        <button
                            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
                            aria-label={t('switchTheme', { mode: t(mode === 'light' ? 'dark' : 'light') })}
                            className={`ml-3 sm:ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full p-1 sm:h-7 sm:w-7
                                ${mode === 'light' ? 'bg-dark text-light' : 'bg-light text-dark'}
                        `}
                        >
                            {
                                mode === 'dark'
                                ? <SunIcon className={"fill-dark"} />
                                : <MoonIcon className={"fill-dark"} />
                            }
                        </button>

                    </nav>
                </motion.div>

                : null
            }
        </header>
    );
}

export default Navbar;
