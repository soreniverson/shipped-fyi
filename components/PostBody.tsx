import { MDXRemote } from 'next-mdx-remote/rsc'
import Image from 'next/image'

interface PostBodyProps {
  content: string
}

// Custom components for MDX rendering with refined typography
const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="text-2xl sm:text-3xl font-semibold text-sand-900 mt-10 mb-4 leading-tight tracking-tight"
      {...props}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-xl sm:text-2xl font-semibold text-sand-900 mt-10 mb-4 leading-tight tracking-tight"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-lg sm:text-xl font-semibold text-sand-900 mt-8 mb-3 leading-snug"
      {...props}
    />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className="text-base font-semibold text-sand-900 mt-6 mb-2"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="text-sand-700 leading-[1.8] mb-5 text-[15px] sm:text-base"
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="text-sand-700 mb-5 ml-1 space-y-2 text-[15px] sm:text-base"
      {...props}
    />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="text-sand-700 mb-5 ml-1 space-y-2 list-decimal list-outside pl-5 text-[15px] sm:text-base"
      {...props}
    />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-[1.7] pl-1 relative before:content-['•'] before:absolute before:-left-4 before:text-sand-400 [ol_&]:before:content-none [ol_&]:pl-0" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-sand-900 underline decoration-sand-300 underline-offset-2 hover:decoration-sand-500 transition-colors"
      {...props}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-2 border-sand-300 pl-5 my-6 text-sand-600 italic text-[15px] sm:text-base leading-[1.7]"
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    // Check if this is inline code (not inside a pre)
    const isInline = typeof props.children === 'string'
    if (isInline) {
      return (
        <code
          className="bg-sand-100 text-sand-800 px-1.5 py-0.5 rounded text-[13px] sm:text-sm font-mono"
          {...props}
        />
      )
    }
    return <code className="text-sm font-mono" {...props} />
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="bg-sand-900 text-sand-100 p-4 rounded-lg overflow-x-auto my-6 text-[13px] sm:text-sm font-mono leading-relaxed"
      {...props}
    />
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="border-sand-200 my-10" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-sand-900" {...props} />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic text-sand-700" {...props} />
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="rounded-lg my-6 w-full"
      alt={props.alt || ''}
      {...props}
    />
  ),
  // For next/image usage in MDX
  Image: (props: React.ComponentProps<typeof Image>) => (
    <Image className="rounded-lg my-6" {...props} />
  ),
}

export function PostBody({ content }: PostBodyProps) {
  return (
    <article className="prose-shipped max-w-none">
      <MDXRemote source={content} components={components} />
    </article>
  )
}
