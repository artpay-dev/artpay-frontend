import { useEffect, useState } from "react";
import { getEntriesByType } from "../services/contentful.ts";
import { Grid, Skeleton } from "@mui/material";
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
    <li className="max-w-96 flex flex-col h-full">
      <div className="mb-4 h-auto max-h-72 flex-shrink-0">
        {post.cover && (
          <Link to={`/guide/${post.slug}`}>
            <img
              src={post.cover}
              alt={`Cover for ${post.title}`}
              className="object-cover w-full h-full rounded-[16px] aspect-square"
              loading="lazy"
            />
          </Link>
        )}
      </div>

      <div className="flex flex-col h-full">
        <div className="mb-4">
          <span className="text-primary uppercase text-sm font-medium">{post.category}</span>
        </div>

        <div className="mb-4 flex items-start">
          <h3 className="text-tertiary text-2xl leading-tight">{post.title}</h3>
        </div>

        <div className="flex-grow flex flex-col justify-between">
          <div className="mb-4">
            <p className="text-secondary leading-relaxed">{post.preview}</p>
          </div>

          <div className="mt-auto">
            <div className="mb-12">
              <p className="text-sm text-secondary">
                By {post.author.name} {post.author.lastName}
              </p>
            </div>

            <Link to={`/guide/${post.slug}`} className="inline-block hover:underline transition-all duration-200 ">
              Leggi di più <span className="text-primary">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

function PostGridSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="max-w-60 flex flex-col space-y-4">
          <Skeleton variant="rectangular" className="aspect-video w-full rounded-2xl" height={135} />
          <div className="flex flex-col space-y-2">
            <Skeleton variant="text" width="80%" height={32} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="60%" height={20} />
            <div className="flex items-center mt-4 justify-between">
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width={80} height={20} />
              </div>
              <Skeleton variant="text" width={40} height={20} />
            </div>
          </div>
        </li>
      ))}
    </>
  );
}

export function PostGrid() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getEntriesByType("blogPost");
        setPosts(transformPostList(response));
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
      <Grid xs={12} sx={{ maxWidth: "100%", overflow: "auto", py: 5, px: { xs: 0, md: 0 } }} item>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {loading ? <PostGridSkeleton /> : posts.map((post) => <PostCard key={post.slug} post={post} />)}
        </ul>
      </Grid>
    </Grid>
  );
}
