import slugify from 'slugify';
import { useTranslations } from 'next-intl';
import { stegaClean } from 'next-sanity';

const nestHeadings = (blocks) => {
    const treeNodes = [];
    const stack = [];

    blocks.forEach(block => {
        if(!block.style || !block.children) return;

        const level = parseInt(block.style.replace('h', ''), 10);

        const text = block.children.map(child => stegaClean(child.text || '')).join(' ') || 'Intitulado';

        const treeNode = {
            slug: slugify(text, { lower:true }),
            text,
            level,
            children: [],
        }

        while(stack.length > 0) {
            const topStack = stack[stack.length - 1];

            if(topStack && topStack.level < level) break;

            stack.pop();
        }

        if(stack.length > 0) {
            const parentNode = stack[stack.length - 1]?.node;

            if(parentNode && !parentNode.children) {
                parentNode.children = [];
            }
            parentNode?.children?.push(treeNode);
        } else {
            treeNodes.push(treeNode);
        }

        stack.push({ node: treeNode, level });
    });

    return treeNodes;
}

const RenderTableOfContent = ({ elements, className }) => {
    return (
        <ul className={`mt-4 text-base ${className}`}>
            {elements.map(element => (
                <li key={element.slug} className="py-1">
                    <a
                        href={`#${element.slug}`}
                        data-level={element.level}
                        className="
                            data-[level='2']:pl-0 data-[level='2']:pt-2
                            data-[level='2']:border-t border-solid border-dark/40 dark:border-light/40
                            data-[level='3']:pl-4
                            sm:data-[level='3']:pl-6
                            flex items-center justify-start
                        "
                    >
                        {
                            element.level == 3 ? (
                                <span className="flex w-1 h-1 rounded-full bg-dark dark:bg-light mr-2">
                                    &nbsp;
                                </span>
                            ) : null
                        }
                        <span className="hover:underline">{element.text}</span>
                    </a>
                    {
                        element.children &&
                        element.children.length > 0 &&
                        <RenderTableOfContent elements={element.children} className="!mt-0" />
                    }
                </li>
            ))}
        </ul>
    )
}

const TableOfContent = ({ headings }) => {
    const t = useTranslations('Post');
    if (!Array.isArray(headings) || headings.length === 0) return null;

    return (
        <details className="border-[1px] border-solid border-dark dark:border-light
            rounded-xl p-4 sticky top-6 max-h-[80vh] overflow-hidden overflow-y-auto"
            open
        >
            <summary className="text-lg font-bold cursor-pointer">
                {t('tableOfContents')}
            </summary>
            <RenderTableOfContent elements={nestHeadings(headings)} />
        </details>
    )
  
}

export default TableOfContent;
