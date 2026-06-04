import { api } from 'src/boot/axios';

export function useMoodleSso() {
  async function getMoodleCourseUrl(
    moodleCourseId: string,
    username: string,
    courseCode?: string,
  ): Promise<string | null> {
    try {
      const { data } = await api.get<{ url: string }>(
        `/api/moodle/course-sso-url/${moodleCourseId}`,
        { params: { username, courseCode } },
      );
      return data.url;
    } catch {
      return null;
    }
  }

  async function getMoodleActivityUrl(
    moodleCourseId: string | number,
    username: string,
    activityUrl: string,
  ): Promise<string | null> {
    try {
      const { data } = await api.get<{ url: string }>(
        `/api/moodle/course-sso-url/${moodleCourseId}`,
        { params: { username, wantsurl: activityUrl } },
      );
      return data.url;
    } catch {
      return null;
    }
  }

  return { getMoodleCourseUrl, getMoodleActivityUrl };
}
