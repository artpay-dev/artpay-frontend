import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Typography } from "@mui/material";
import { useData } from "../hoc/DataProvider.tsx";
import { Post } from "../types/post.ts";
import sanitizeHtml from "sanitize-html";

export interface ContentPageProps {
  slug: string;
}

const ContentPage: React.FC<ContentPageProps> = ({ slug }) => {
  const [ready, setReady] = useState(false);
  const [pageContent, setPageContent] = useState<Post>();
  const data = useData();

  useEffect(() => {
    if (ready) {
      setReady(false);
    }
    data.getPageBySlug(slug).then((page) => {
      setPageContent(page);
      setReady(true);
    });
  }, [data, slug]);

  return (
    <DefaultLayout pb={3} pageLoading={!ready} hasNavBar={false}>
      <Box sx={{ pt: { xs: 8, sm: 12, md: 16 }, pb: 6, px: { xs: 3, md: 10, lg: 14 } }}>
        <Typography variant="h1">{pageContent?.title?.rendered || ""}</Typography>
        <Box
          className="styled-page"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(pageContent?.content?.rendered || "", {
              allowedTags: [
                "address",
                "article",
                "aside",
                "footer",
                "header",
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
                "hgroup",
                "main",
                "nav",
                "section",
                "blockquote",
                "dd",
                "div",
                "dl",
                "dt",
                "figcaption",
                "figure",
                "hr",
                "li",
                "main",
                "ol",
                "p",
                "pre",
                "ul",
                "a",
                "abbr",
                "b",
                "bdi",
                "bdo",
                "br",
                "cite",
                "code",
                "data",
                "dfn",
                "em",
                "i",
                "kbd",
                "mark",
                "q",
                "rb",
                "rp",
                "rt",
                "rtc",
                "ruby",
                "s",
                "samp",
                "small",
                "span",
                "strong",
                "sub",
                "sup",
                "time",
                "u",
                "var",
                "wbr",
                "caption",
                "col",
                "colgroup",
                "table",
                "tbody",
                "td",
                "tfoot",
                "th",
                "thead",
                "tr",
                "img"
              ]
            })
          }}></Box>
      </Box>
    </DefaultLayout>
  );
};

export default ContentPage;
