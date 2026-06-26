import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore, type User } from 'src/stores/auth-store';

/**
 * Maps the authenticated user's role to the workspace label shown in the page
 * hero eyebrow, so each role's pages read consistently (e.g. admin →
 * "Admin Workspace", instructor → "Instructor Workspace").
 */
const WORKSPACE_LABEL_BY_ROLE: Record<User['role'], string> = {
  student: 'Learner Workspace',
  staff: 'Staff Workspace',
  external: 'Learner Workspace',
  instructor: 'Instructor Workspace',
  teach: 'Instructor Workspace',
  admin: 'Admin Workspace',
  finance: 'Finance Workspace',
  central_finance: 'Central Finance Workspace',
  lifelong2: 'BUU Lifelong Workspace',
};

const FALLBACK_WORKSPACE_LABEL = 'BUU Lifelong Workspace';

/**
 * Provides the workspace eyebrow label derived from the current user's role.
 * Reusable across role landing pages as they adopt the role-based eyebrow.
 */
export function useWorkspaceEyebrow() {
  const { user } = storeToRefs(useAuthStore());

  const workspaceEyebrow = computed<string>(() => {
    const role = user.value?.role;
    return role ? WORKSPACE_LABEL_BY_ROLE[role] : FALLBACK_WORKSPACE_LABEL;
  });

  return { workspaceEyebrow };
}
