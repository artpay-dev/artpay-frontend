import { useEffect, useState, useRef } from "react";
import { getEntriesByType } from "../services/contentful.ts";
import { Grid, Skeleton, useMediaQuery, useTheme } from "@mui/material";
import { Link } from "react-router-dom";

interface Author {
  avatar: string;
  name: string;
  lastName: string;
}

interface PostListItem {
  title: string;
  preview: string;
  cover: string;
  slug: string;
  author: Author;
  category: string;
}

interface ContentfulAsset {
  fields: {
    file: {
      url: string;
    };
  };
}

interface ContentfulAuthor {
  fields: {
    name?: string;
    lastName?: string;
    avatar?: ContentfulAsset;
  };
}

interface ContentfulPost {
  category?: string;
  title?: string;
  preview?: string;
  slug?: string;
  cover?: ContentfulAsset;
  author?: ContentfulAuthor;
}

const transformPost = (post: ContentfulPost): PostListItem => {
  const avatarUrl = post.author?.fields?.avatar?.fields?.file?.url
    ? `https:${post.author.fields.avatar.fields.file.url}`
    : "";

  const title = post.title || "Untitled";
  const preview = post.preview || "";
  const cover = post.cover?.fields?.file?.url ? `https:${post.cover.fields.file.url}` : "";
  const slug = post.slug || title.toLowerCase().replace(/\s+/g, "-");
  const category = post.category || '';

  const author: Author = {
    name: post.author?.fields?.name || "Anonymous",
    lastName: post.author?.fields?.lastName || "",
    avatar: avatarUrl,
  };

  return { title, preview, cover, slug, author, category };
};

const transformPostList = (rawPosts: ContentfulPost[]): PostListItem[] => {
  return rawPosts.map(transformPost);
};

interface PostCardProps {
  post: PostListItem;
}

function PostCard({ post }: PostCardProps) {
  return (
    <li className="w-80 md:w-90  flex flex-col h-full">
      <div className="mb-4 h-72  flex-shrink-0">
        {post.cover && (
          <Link to={`/guide/${post.slug}`}>
            <img
              src={post.cover}
              alt={`Cover for ${post.title}`}
              className="object-cover w-full h-full rounded-[16px]"
              loading="lazy"
            />
          </Link>
        )}
      </div>

      <div className="flex flex-col h-full">
        <div className="mb-3">
          <span className="text-primary uppercase text-sm font-medium">{post.category}</span>
        </div>

        <div className="mb-3 flex items-start">
          <h3 className="text-tertiary text-xl leading-tight line-clamp-2">{post.title}</h3>
        </div>

        <div className="flex-grow flex flex-col justify-between">
          <div className="mb-4">
            <p className="text-secondary leading-relaxed text-sm line-clamp-3">{post.preview}</p>
          </div>

          <div className="mt-auto">
            <div className="mb-4">
              <p className="text-xs text-secondary">
                By {post.author.name} {post.author.lastName}
              </p>
            </div>

            <Link to={`/guide/${post.slug}`} className="inline-block hover:underline transition-all duration-200 text-sm">
              Leggi di più <span className="text-primary">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

function PostListSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="min-w-80 max-w-80 flex flex-col space-y-4">
          <Skeleton variant="rectangular" className="w-full rounded-[4px]" height={192} />
          <div className="flex flex-col space-y-2">
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="90%" height={24} />
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="80%" height={16} />
            <div className="flex items-center mt-4 justify-between">
              <Skeleton variant="text" width={80} height={16} />
              <Skeleton variant="text" width={60} height={16} />
            </div>
          </div>
        </li>
      ))}
    </>
  );
}

export function PostList() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Drag-to-scroll functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current || !isDesktop) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.userSelect = 'none';
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
      scrollRef.current.style.userSelect = 'auto';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
    }
  };

  // Global mouseup event to handle drag end when mouse is released outside component
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getEntriesByType("blogPost");
        const transformedPosts = transformPostList(response);
        setPosts(transformedPosts.slice(0, 6));
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (error) {
    return (
      <Grid px={0} container>
        <Grid xs={12} sx={{ maxWidth: "100%", py: { xs: 3, md: 6 }, px: { xs: 4, md: 0 } }} item>
          <div className="text-center text-red-500">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">
              Riprova
            </button>
          </div>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid px={0} container>
      <Grid xs={12} sx={{ width: "100%", py: 5, px: { xs: 0, md: 0 } }}>
        <div 
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            cursor: isDesktop ? 'grab' : 'default'
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <ul className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
            {loading ? <PostListSkeleton /> : posts.map((post) => <PostCard key={post.slug} post={post} />)}
          </ul>
        </div>
      </Grid>
    </Grid>
  );
}