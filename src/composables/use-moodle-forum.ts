import { ref } from 'vue';
import { api } from 'src/boot/axios';

export interface ForumInfo {
  id: number;
  coursemodule: number;
  name: string;
  type: string;
  intro: string | null;
}

export interface ForumDiscussionSummary {
  id: number;
  subject: string;
  authorName: string;
  authorPictureUrl: string | null;
  created: number;
  numReplies: number;
  pinned: boolean;
  locked: boolean;
  canReply: boolean;
}

export interface ForumPost {
  id: number;
  parentId: number | null;
  hasParent: boolean;
  subject: string;
  message: string | null;
  authorName: string;
  authorPictureUrl: string | null;
  created: number;
  canReply: boolean;
}

export interface ForumDiscussionThread {
  discussionId: number;
  subject: string;
  posts: ForumPost[];
}

export function useMoodleForum() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function run<T>(fn: () => Promise<T>): Promise<T | null> {
    loading.value = true;
    error.value = null;
    try {
      return await fn();
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
      return null;
    } finally {
      loading.value = false;
    }
  }

  function getForum(
    moodleCourseId: number | string,
    moduleId: number | string,
  ): Promise<{ forum: ForumInfo; discussions: ForumDiscussionSummary[] } | null> {
    return run(async () => {
      const { data } = await api.get<{
        forum: ForumInfo;
        discussions: ForumDiscussionSummary[];
      }>(`/api/moodle/forum/${moodleCourseId}/module/${moduleId}`);
      return data;
    });
  }

  function getDiscussion(discussionId: number | string): Promise<ForumDiscussionThread | null> {
    return run(async () => {
      const { data } = await api.get<ForumDiscussionThread>(
        `/api/moodle/forum/discussion/${discussionId}`,
      );
      return data;
    });
  }

  function replyToPost(
    discussionId: number | string,
    parentPostId: number,
    message: string,
  ): Promise<{ postId: number } | null> {
    return run(async () => {
      const { data } = await api.post<{ postId: number }>(
        `/api/moodle/forum/discussion/${discussionId}/reply`,
        { parentPostId, message },
      );
      return data;
    });
  }

  function createDiscussion(
    moodleCourseId: number | string,
    moduleId: number | string,
    subject: string,
    message: string,
  ): Promise<{ discussionId: number } | null> {
    return run(async () => {
      const { data } = await api.post<{ discussionId: number }>(
        `/api/moodle/forum/${moodleCourseId}/module/${moduleId}/discussion`,
        { subject, message },
      );
      return data;
    });
  }

  return { loading, error, getForum, getDiscussion, replyToPost, createDiscussion };
}
