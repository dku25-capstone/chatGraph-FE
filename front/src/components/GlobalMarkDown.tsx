// components/GlobalMarkdown.tsx
"use client"; // 만약 클라이언트 컴포넌트로 사용해야 한다면 추가

import ReactMarkdown, { Options } from "react-markdown";

// 모든 마크다운에 공통으로 적용할 CSS 클래스 (Tailwind 예시)
const CONTAINER_CLASS = "w-full max-w-full overflow-hidden text-gray-800 leading-7 prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert";

// 모든 마크다운에 공통으로 적용할 인라인 스타일
const CONTAINER_STYLE = {
  wordBreak: "break-word" as const,
  overflowWrap: "anywhere" as const,
};

// 커스텀 컴포넌트 정의 (기존 ReactMarkdown의 props를 상속받음)
interface GlobalMarkdownProps extends Options {
  className?: string; // 컨테이너에 추가적인 클래스가 필요할 경우를 위해
}

export const GlobalMarkdown = ({ children, className, ...props }: GlobalMarkdownProps) => {
  // components prop을 여기서 정의하여 전역적으로 적용되게 합니다.
  const customComponents = {
    // 1. 문단(p)
    p: ({ node, ...rest }: any) => (
      <p className="mb-2 whitespace-pre-wrap" {...rest} />
    ),
    // 2. 링크(a)
    a: ({ node, ...rest }: any) => (
      <a
        className="text-blue-500 hover:underline break-all"
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      />
    ),
    // 3. 코드 블록(pre)
    pre: ({ node, ...rest }: any) => (
      <pre
        className="bg-gray-100 dark:bg-gray-800 rounded p-2 my-2 overflow-x-auto whitespace-pre-wrap break-all"
        {...rest}
      />
    ),
    // 4. 인라인 코드(code)
    code: ({ node, ...rest }: any) => (
      <code
        className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 break-all whitespace-pre-wrap font-mono text-sm"
        {...rest}
      />
    ),
    // 리스트 스타일
    ul: ({ node, ...rest }: any) => (
      <ul className="list-disc pl-5 mb-2 space-y-1" {...rest} />
    ),
    ol: ({ node, ...rest }: any) => (
      <ol className="list-decimal pl-5 mb-2 space-y-1" {...rest} />
    ),
    // 필요한 경우 추가 컴포넌트 정의 (h1, h2, blockquote 등)
    h1: ({ node, ...rest }: any) => <h1 className="text-2xl font-bold mt-4 mb-2" {...rest} />,
    h2: ({ node, ...rest }: any) => <h2 className="text-xl font-bold mt-3 mb-2" {...rest} />,
    blockquote: ({ node, ...rest }: any) => (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2 text-gray-600" {...rest} />
    ),
  };

  // 전달받은 components prop이 있다면 병합합니다 (개별 사용 시 오버라이드 가능하도록)
  const mergedComponents = { ...customComponents, ...(props.components || {}) };

  return (
    <div
      className={`${CONTAINER_CLASS} ${className || ""}`} // 기본 클래스 + 추가 클래스 병합
      style={CONTAINER_STYLE}
    >
      <ReactMarkdown components={mergedComponents} {...props}>
        {children}
      </ReactMarkdown>
    </div>
  );
};