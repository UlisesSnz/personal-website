import AddComment from "./AddComment";
import ShowComments from "./ShowComments";
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';

const Comments = ({ postId, contentType, title, slug }) => {
    const t = useTranslations('Comments');
    return (
        <div className="my-64 md:my-32">
            <h2 className="font-bold text-8xl mb-16 w-full text-center md:text-6xl xs:text-4xl">
                {t('title')}
            </h2>
            <AddComment
                postId={postId}
                postTitle={title}
                contentType={contentType}
                slug={slug}
            />
            <Suspense fallback={null}>
                <ShowComments postId={postId} contentType={contentType} slug={slug} />
            </Suspense>
        </div>
    )
}

export default Comments;
