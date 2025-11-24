// components/GlobalMarkdown.tsx
"use client";

import ReactMarkdown, { Options } from "react-markdown";
import remarkGfm from "remark-gfm"; // [추가] GFM 플러그인 임포트

// 모든 마크다운에 공통으로 적용할 CSS 클래스
const CONTAINER_CLASS =
  "w-full max-w-full overflow-hidden text-gray-800 leading-7 prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert";

// 모든 마크다운에 공통으로 적용할 인라인 스타일
const CONTAINER_STYLE = {
  wordBreak: "break-word" as const,
  overflowWrap: "anywhere" as const,
};

interface GlobalMarkdownProps extends Options {
  className?: string;
}

export const GlobalMarkdown = ({
  children,
  className,
  ...props
}: GlobalMarkdownProps) => {
  // components prop을 여기서 정의하여 전역적으로 적용되게 합니다.
  const customComponents: Options['components'] = {
    p: ({ ...rest }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className="mb-2 whitespace-pre-wrap" {...rest} />
    ),
    a: ({ ...rest }: React.HTMLAttributes<HTMLAnchorElement>) => (
      <a
        className="text-blue-500 hover:underline break-all"
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      />
    ),
    pre: ({ ...rest }: React.HTMLAttributes<HTMLPreElement>) => (
      <pre
        className="bg-gray-100 dark:bg-gray-800 rounded p-2 my-2 overflow-x-auto whitespace-pre-wrap break-all"
        {...rest}
      />
    ),
    code: ({ ...rest }: React.HTMLAttributes<HTMLElement>) => (
      <code
        className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 break-all whitespace-pre-wrap font-mono text-sm"
        {...rest}
      />
    ),
    ul: ({ ...rest }: React.HTMLAttributes<HTMLUListElement>) => (
      <ul className="list-disc pl-5 mb-2 space-y-1" {...rest} />
    ),
    ol: ({ ...rest }: React.HTMLAttributes<HTMLOListElement>) => (
      <ol className="list-decimal pl-5 mb-2 space-y-1" {...rest} />
    ),
    h1: ({ ...rest }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className="text-2xl font-bold mt-4 mb-2" {...rest} />
    ),
    h2: ({ ...rest }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 className="text-xl font-bold mt-3 mb-2" {...rest} />
    ),
    blockquote: ({ ...rest }: React.HTMLAttributes<HTMLQuoteElement>) => (
      <blockquote
        className="border-l-4 border-gray-300 pl-4 italic my-2 text-gray-600"
        {...rest}
      />
    ),
    table: ({ ...rest }: React.HTMLAttributes<HTMLTableElement>) => (
      <div className="my-4 w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table
          className="w-full text-sm text-left text-gray-500 dark:text-gray-400"
          {...rest}
        />
      </div>
    ),
    thead: ({ ...rest }: React.HTMLAttributes<HTMLTableSectionElement>) => (
      <thead
        className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 font-medium"
        {...rest}
      />
    ),
    tbody: ({ ...rest }: React.HTMLAttributes<HTMLTableSectionElement>) => (
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...rest} />
    ),
    tr: ({ ...rest }: React.HTMLAttributes<HTMLTableRowElement>) => (
      <tr className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" {...rest} />
    ),
    th: ({ ...rest }: React.HTMLAttributes<HTMLTableCellElement>) => (
      <th scope="col" className="px-4 py-3 border-r border-gray-200 dark:border-gray-700 last:border-r-0" {...rest} />
    ),
    td: ({ ...rest }: React.HTMLAttributes<HTMLTableCellElement>) => (
      <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-700 last:border-r-0 break-words" {...rest} />
    ),
    del: ({ ...rest }: React.HTMLAttributes<HTMLElement>) => (
      <del className="line-through text-gray-500 dark:text-gray-400" {...rest} />
    ),
    input: ({ ...rest }: React.InputHTMLAttributes<HTMLInputElement>) => {
      if (rest.type === 'checkbox') {
         return <input type="checkbox" className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800" {...rest} disabled={true} />
      }
      return <input {...rest} />;
    },
  };

  const mergedComponents = { ...customComponents, ...(props.components || {}) };

  return (
    <div
      className={`${CONTAINER_CLASS} ${className || ""}`}
      style={CONTAINER_STYLE}
    >
      <ReactMarkdown
        // [추가] remarkPlugins에 GFM 플러그인 적용
        // 외부에서 전달된 플러그인이 있다면 병합합니다.
        remarkPlugins={[remarkGfm, ...(props.remarkPlugins || [])]}
        components={mergedComponents}
        {...props}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};