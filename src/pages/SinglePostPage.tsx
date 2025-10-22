import DefaultLayout from "../components/DefaultLayout.tsx";
import { Document } from '@contentful/rich-text-types';
import { useEffect, useState } from "react";
import { getPostBySlug } from "../services/contentful.ts";
import { useParams } from "react-router-dom";
import { RichTextRenderer } from "../components/contentful/richt-text-render/RichTextRenderer.tsx";


interface BlogPostFields {
  category: string;
  title: string;
  date: string;
  timeToReading: number;
  slug: string;
  preview: string;
  content: Document;
  cover?: {
    fields: {
      file: {
        url: string;
      };
    };
  };
}

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className = "" }: SkeletonProps) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const ArticleSkeleton = () => (
  <DefaultLayout hasNavBar={true}>
    <section className="mt-28 h-full px-8 lg:mx-auto lg:max-w-5xl lg:px-0 lg:mt-36">
      <article className="leading-[125%] pb-24">
        <header className="space-y-4 flex flex-col mb-10 lg:px-40">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-3/4" />
        </header>
        <div className="lg:px-40 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="lg:px-40 mt-10 mb-16">
          <Skeleton className="h-3 w-48" />
        </div>
        <main className="space-y-6 ">
          <Skeleton className="h-64 lg:h-96 w-full" />
          <div className="space-y-4 lg:px-40">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="space-y-4 lg:px-40">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
      </article>
    </section>
  </DefaultLayout>
);


const usePost = (slug: string | undefined) => {
  const [post, setPost] = useState<BlogPostFields | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await getPostBySlug("blogPost", slug);
        setPost(response as unknown as BlogPostFields);
      } catch (err) {
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  return { post, loading, error };
};


const SinglePostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { loading, error, post } = usePost(slug);

  const postDate = post?.date ? new Date(post.date).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) : '';

  const timeToReadingPost = post?.timeToReading && post.timeToReading > 1 ? `${post.timeToReading} minuti di lettura` : '1 minuto di lettura';


  if (loading) return <ArticleSkeleton />;

  if (error) return (
    <DefaultLayout hasNavBar={true}>
      <section className="mt-28 h-full px-8 lg:mx-auto lg:max-w-5xl lg:px-0 lg:mt-36">
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center space-y-4">
            <div className="text-6xl">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900">Errore nel caricamento</h2>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Riprova
            </button>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );

  return (
    <DefaultLayout hasNavBar={true}>
      <section className="mt-28 h-full px-8 lg:mx-auto lg:max-w-5xl lg:px-0 lg:mt-36">
        <article className="leading-[125%] pb-24">
          <header className="space-y-4 flex flex-col mb-10 lg:px-40">
            <span className="text-primary uppercase">{post?.category}</span>
            <h1 className="text-balance text-4xl">
              {post?.title}
            </h1>
          </header>
          <p className="leading-[125%] lg:px-40">
            {post?.preview}
          </p>
          <p className="text-secondary text-sm mt-10 mb-16 lg:px-40">{postDate && postDate} {timeToReadingPost && ` - ${timeToReadingPost}`}</p>
          <main>
            {post?.content && <RichTextRenderer content={post.content} />}
          </main>
        </article>
      </section>
    </DefaultLayout>
  );
};

export default SinglePostPage;