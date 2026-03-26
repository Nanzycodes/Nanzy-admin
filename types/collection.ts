export type ContentType = "video" | "article" | "livestream" | "influencer_content";

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  video: "Video",
  article: "Article",
  livestream: "Livestream",
  influencer_content: "Influencer",
};

/** Video / Influencer content */
export interface VideoContentItem {
  content_type: "video" | "influencer_content";
  id: number;
  video?: string;
  thumbnail: string | null;
  caption: string;
  tags: string;
  ar_link: string | null;
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

/** Article content */
export interface ArticleContentItem {
  content_type: "article";
  id: string;
  title: string;
  summary: string;
  article_content: string;
  thumbnail: string | null;
  author_name: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

/** Livestream product */
export interface LivestreamProduct {
  id: string;
  product: number;
  product_details: {
    id: number;
    title: string;
    image: string | null;
    price: string;
    creator_name: string;
  };
  starting_bid_price: string;
  is_active: boolean;
  highest_bid_amount: string | null;
  highest_bidder: string | null;
  remaining_time: number;
}

/** Livestream content */
export interface LivestreamContentItem {
  content_type: "livestream";
  id: string;
  creator: number;
  creator_name: string;
  creator_email: string;
  creator_image: string;
  name: string;
  is_active: boolean;
  has_bidding: boolean;
  started_at: string;
  ended_at: string | null;
  products: LivestreamProduct[];
  active_participants_count: number;
  created_at: string;
  updated_at: string;
}

export type ContentItem = VideoContentItem | ArticleContentItem | LivestreamContentItem;

/** Display title for any content type */
export function getContentTitle(item: ContentItem): string {
  if (item.content_type === "article") return item.title;
  if (item.content_type === "livestream") return item.name;
  return item.caption;
}

/** Creator/author label for any content type */
export function getContentCreator(item: ContentItem): string {
  if (item.content_type === "article") return item.author_name;
  if (item.content_type === "livestream") return item.creator_name;
  return "";
}

export interface PaginatedContentList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ContentItem[];
}
