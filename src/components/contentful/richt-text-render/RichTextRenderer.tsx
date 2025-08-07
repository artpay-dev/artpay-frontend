import {
  BLOCKS,
  INLINES,
  MARKS,
  Document,
} from '@contentful/rich-text-types';
import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer';
import './style.css'

type Props = {
  content: Document;
};

export const RichTextRenderer = ({ content }: Props) => {
  const options: Options = {
    renderMark: {
      [MARKS.BOLD]: (text) => <strong>{text}</strong>,
      [MARKS.ITALIC]: (text) => <em>{text}</em>,
      [MARKS.UNDERLINE]: (text) => <u>{text}</u>,
      [MARKS.CODE]: (text) => <code className="bg-gray-100 px-1 rounded">{text}</code>,
    },
    renderNode: {
      [BLOCKS.HEADING_1]: (_, children) => <h1 className="text-4xl font-semibold my-6 lg:px-40">{children}</h1>,
      [BLOCKS.HEADING_2]: (_, children) => <h2 className="text-balance text-3xl mt-16 mb-10 lg:px-40">{children}</h2>,
      [BLOCKS.HEADING_3]: (_, children) => <h3 className="text-2xl text-balance mt-10 mb-3 lg:px-40">{children}</h3>,
      [BLOCKS.HEADING_4]: (_, children) => <h3 className="text-xl text-balance mt-10 mb-3 lg:px-40">{children}</h3>,
      [BLOCKS.PARAGRAPH]: (_, children) => <p className="text-base leading-[125%] mb-6 lg:px-40">{children}</p>,
      [BLOCKS.QUOTE]: (_, children) => <blockquote className="border-l-4 pl-4 italic my-4 lg:ml-40">{children}</blockquote>,
      [BLOCKS.HR]: () => <hr className="my-8 border-t border-transparent" />,
      [BLOCKS.UL_LIST]: (_, children) => <ul className="pl-6 my-2 space-y-4 lg:ml-40">{children}</ul>,
      [BLOCKS.OL_LIST]: (_, children) => <ol className="list-decimal pl-6 my-2 space-y-4 lg:px-40">{children}</ol>,
      [BLOCKS.LIST_ITEM]: (_, children) => <li className={'before:text-[#6576EE] before:content-["•"] relative before:absolute before:-top-1/2 before:-left-2 before:text-3xl ps-4 leading-[115%]'}>{children}</li>,

      [BLOCKS.EMBEDDED_ASSET]: (node) => {
        const { file, title } = node.data.target.fields;
        const imageUrl = file.url.startsWith('//') ? `https:${file.url}` : file.url;
        return (
          <div className="my-4">
            <img
              width={600}
              height={400}
              src={imageUrl}
              alt={title || ''}
              className="w-full h-full aspect-video object-cover rounded"
            />
          </div>
        );
      },

      [INLINES.HYPERLINK]: (node, children) => (
        <a
          href={node.data.uri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          {children}
        </a>
      ),
    },
  };

  return <div>{documentToReactComponents(content, options)}</div>;
};
