import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className = "" }: MarkdownProps) {
  return (
    <div className={`prose prose-blue max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 mt-6 font-heading">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-bold mb-3 mt-5 font-heading">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-bold mb-3 mt-4 font-heading">{children}</h3>,
          p: ({ children }) => <p className="mb-4 text-gray-700">{children}</p>,
          a: ({ href, children }) => (
            <a href={href} className="text-primary-600 hover:text-primary-700 underline">
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-200 pl-4 py-2 mb-4 italic text-gray-600">
              {children}
            </blockquote>
          ),
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-lg shadow-sm max-w-full h-auto mb-4"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
