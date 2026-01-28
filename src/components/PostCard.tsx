import type { FC } from 'hono/jsx'
import type { Post } from '../db'
import { VoteButton } from './VoteButton'

type PostCardProps = {
  post: Post
  voted: boolean
}

const statusLabels: Record<string, string> = {
  open: 'Open',
  planned: 'Planned',
  in_progress: 'In Progress',
  done: 'Done',
  closed: 'Closed',
}

export const PostCard: FC<PostCardProps> = ({ post, voted }) => {
  return (
    <article class="post-card">
      <VoteButton postId={post.id} votes={post.votes} voted={voted} />
      <div class="post-content">
        <h2 class="post-title">{post.title}</h2>
        {post.description && <p class="post-description">{post.description}</p>}
        <div class="post-meta">
          <span class={`status-badge status-${post.status}`}>
            {statusLabels[post.status] || post.status}
          </span>
          <time datetime={post.created_at}>{post.created_at}</time>
        </div>
      </div>
    </article>
  )
}
