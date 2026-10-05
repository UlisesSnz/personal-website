import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import fallbackImage from '../../../public/images/profile/developer.png';
import { useLocale } from 'next-intl';

const FramerImage = motion(Image);

const MovingImg = ({ title, img, link }) => {
    const locale = useLocale();

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const imgRef = useRef(null);
  
    function handleMouse(e) {
      imgRef.current.style.display = "inline-block";
      const offsetX = -100;
      x.set(e.pageX + offsetX);
      y.set(10);
    }
  
    function handleMouseLeave(e) {
      imgRef.current.style.display = "none";
      x.set(0);
      y.set(0);
    }
  
    return (
      <Link href={link}
        onMouseMove={handleMouse}
        onMouseLeave={handleMouseLeave}
      >
        <h2 className="capitalize text-xl font-semibold hover:underline">{title || (locale === 'en' ? 'Untitled draft' : 'Borrador sin título')}</h2>
        <FramerImage
          style={{ x:x, y:y }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity:1, transition:{duration:0.2} }}
          ref={imgRef}
          src={img?.image || fallbackImage}
          width={img?.imageWidth || 1200}
          height={img?.imageHeight || 675}
          alt={title || ''}
          className="z-10 w-96 h-auto hidden absolute rounded-lg md:!hidden"
        />
      </Link>
    )
}

export default MovingImg;
