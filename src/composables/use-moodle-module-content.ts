import { ref } from 'vue';
import { api } from 'src/boot/axios';

export interface MoodleModuleFile {
  type: string;
  filename: string;
  fileurl: string;
  mimetype: string | null;
}

export interface MoodleModuleContent {
  id: number;
  name: string;
  modname: string;
  description: string | null;
  contents: MoodleModuleFile[];
  url: string | null;
}

/**
 * ดึงเนื้อหาของ Moodle module เดียว (description HTML + ไฟล์แนบ) เพื่อ render แบบ native ในแอป.
 * ตรงกับ DTO ของ backend endpoint GET /api/moodle/moodle-module/:moodleCourseId/:moduleId (Task 3a).
 * การ sanitize/แสดงผลอยู่ที่ผู้เรียก (Task 3c) — composable นี้ทำแค่ fetch + state.
 */
export function useMoodleModuleContent() {
  const content = ref<MoodleModuleContent | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchModule(
    moodleCourseId: number | string,
    moduleId: number | string,
  ): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<MoodleModuleContent>(
        `/api/moodle/moodle-module/${moodleCourseId}/${moduleId}`,
      );
      content.value = data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
      content.value = null;
    } finally {
      loading.value = false;
    }
  }

  return { content, loading, error, fetchModule };
}
