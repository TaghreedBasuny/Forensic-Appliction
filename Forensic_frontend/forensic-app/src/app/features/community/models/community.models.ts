export interface Post {
  id: number;

  user: {
    id: number;
    name: string;
    image?: string | null;
  };

  content: string;
 created_at: string;
   likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  views_count?: number;

  authorRole?: string;
  // authorAvatar?: string;
}
export interface Comment {
  id: number;
  user_id: number;
  userName: string;
  text: string;
  created_at: string;
}

export interface Article {
  id: number;
  title: string;
  content: string;

  imageUrl?: string | null;

  authorName: string;
  authorRole?: string;

  user_id?: number;
// authorAvatar?: string;
  likes: number;
  comments: number;
  shares: number;
  views_count?: number;
  isLiked: boolean;
  timestamp: string;
}


