<template>
  <div>
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bolder text-primary">
          {{ $t('profile.chat.title') }}
        </div>
        <div class="text-caption text-grey-6 q-mt-xs">
          {{ $t('profile.chat.subtitle') }}
        </div>
      </div>
    </div>

    <div v-if="myRegisteredCourseEntries.length > 0" class="row q-col-gutter-lg chat-layout">
      <div class="col-12 col-md-4">
        <div class="course-list-header q-mb-sm">
          <div class="text-caption text-weight-bold text-grey-7">
            {{ $t('profile.chat.coursePicker') }}
          </div>
          <q-badge rounded color="primary" :label="myRegisteredCourseEntries.length" />
        </div>

        <div class="chat-course-list">
          <q-card
            v-for="entry in sortedCourseEntries"
            :key="entry.registration.id"
            flat
            bordered
            class="chat-course-card cursor-pointer"
            :class="{ 'chat-course-card--active': selectedChatCourseId === entry.course.id }"
            @click="selectChatCourse(entry.course.id)"
          >
            <div class="chat-course-card__stripe" />
            <q-card-section
              class="row items-start q-gutter-md q-pa-md"
              style="min-width: 0; overflow: hidden"
            >
              <div class="chat-course-card__thumb">
                <CourseCoverImage
                  :course="entry.course"
                  fill
                  instant
                  loading="eager"
                  class="chat-course-card__cover"
                />
              </div>

              <div class="col" style="min-width: 0; overflow: hidden">
                <div class="row items-center justify-between no-wrap q-gutter-xs">
                  <div class="text-caption text-grey-6">{{ entry.course.code }}</div>
                  <q-badge
                    v-if="
                      entry.registration.enrollId &&
                      unreadByEnrollId[entry.registration.enrollId]! > 0
                    "
                    rounded
                    color="primary"
                    :label="unreadByEnrollId[entry.registration.enrollId]"
                  />
                </div>
                <div class="chat-course-card__title text-weight-bolder text-dark">
                  {{ getTranslatedCourseTitle(entry.course) }}
                </div>
                <div class="row items-center q-gutter-xs q-mt-sm text-caption text-grey-6">
                  <q-icon name="event" size="14px" />
                  <span>{{ formatDate(entry.registration.registeredAt) }}</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="col-12 col-md-8">
        <q-card flat bordered class="chat-thread-card column no-wrap">
          <q-card-section class="chat-thread-card__header q-pa-md">
            <div class="row items-center no-wrap q-gutter-md">
              <div class="chat-thread-card__course-thumb">
                <CourseCoverImage
                  v-if="selectedChatEntry"
                  :course="selectedChatEntry.course"
                  fill
                  instant
                  loading="eager"
                />
              </div>
              <div class="col">
                <div class="text-caption text-grey-6">{{ $t('profile.chat.roomTitle') }}</div>
                <div class="text-subtitle1 text-weight-bolder text-dark">
                  {{ selectedChatEntry?.course.code }} :
                  {{ selectedChatEntry ? getTranslatedCourseTitle(selectedChatEntry.course) : '' }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  {{ $t('profile.chat.roomHint') }}
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <div ref="chatMessagesRef" class="chat-thread-card__messages col">
            <div v-if="chatThreadMessages.length === 0" class="chat-empty-state">
              <div class="empty-state-card__icon-wrap q-mx-auto q-mb-md">
                <q-icon name="forum" size="42px" color="primary" />
              </div>
              <div class="text-subtitle1 text-weight-bolder text-dark">
                {{ $t('profile.chat.emptyThreadTitle') }}
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">
                {{ $t('profile.chat.emptyThreadSub') }}
              </div>
            </div>

            <div
              v-for="message in chatThreadMessages"
              :key="message.id"
              class="chat-message"
              :class="`chat-message--${message.sender}`"
            >
              <q-avatar
                v-if="message.sender === 'instructor' || message.sender === 'system'"
                size="34px"
                class="chat-message__avatar--instructor"
              >
                <q-icon name="support_agent" size="20px" color="blue-grey-8" />
              </q-avatar>

              <div class="chat-message__bubble">
                <div class="chat-message__body">{{ message.body }}</div>
                <div class="chat-message__time">
                  {{ formatChatMessageTime(message.sentAt) }}
                </div>
                <div
                  v-if="
                    message.sender === 'learner' &&
                    (message.status === 'read' || isLatestLearnerMessage(message))
                  "
                  class="chat-message__status"
                  :class="`chat-message__status--${message.status}`"
                >
                  <q-icon :name="getChatStatusIcon(message.status)" size="13px" />
                  <span>{{ getChatStatusLabel(message.status) }}</span>
                </div>
              </div>

              <q-avatar
                v-if="message.sender === 'learner'"
                size="34px"
                class="chat-message__avatar"
              >
                <img
                  v-if="currentAvatarUrl"
                  :src="currentAvatarUrl"
                  class="chat-message__avatar-image"
                  alt="Profile avatar"
                  loading="eager"
                  decoding="sync"
                />
                <q-icon v-else name="person" size="20px" color="white" />
              </q-avatar>
            </div>
          </div>

          <q-separator />

          <q-card-section class="chat-thread-card__composer q-pa-md">
            <div class="row items-start q-gutter-sm no-wrap">
              <q-input
                v-model="chatDraft"
                outlined
                dense
                class="col chat-input"
                :placeholder="$t('profile.chat.inputPlaceholder')"
                @keydown.enter.exact.prevent="sendChatMessage"
              >
                <template #prepend>
                  <q-icon name="chat_bubble_outline" color="grey-5" />
                </template>
              </q-input>
              <BaseButton
                color="primary"
                icon="send"
                :label="$t('profile.chat.send')"
                no-caps
                :disable="!canSendChatMessage"
                @click="sendChatMessage"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card v-else flat class="text-center empty-state-card q-pa-xl">
      <div class="empty-state-card__icon-wrap q-mx-auto q-mb-lg">
        <q-icon name="forum" size="48px" color="primary" />
      </div>
      <div class="text-h6 text-weight-bolder text-dark">
        {{ $t('profile.chat.noCourseTitle') }}
      </div>
      <div class="text-body2 text-grey-6 q-mt-sm">
        {{ $t('profile.chat.noCourseSub') }}
      </div>
      <BaseButton
        color="primary"
        :label="$t('profile.courses.explore')"
        icon="explore"
        no-caps
        hover-lift
        class="q-mt-xl"
        @click="router.push('/short-courses')"
      />
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import BaseButton from 'components/base/BaseButton.vue';
import CourseCoverImage from 'components/course/CourseCoverImage.vue';
import { useMyRegisteredCourses } from 'src/composables/use-my-registered-courses';
import { useProfileChat } from 'src/composables/use-profile-chat';

defineProps<{
  currentAvatarUrl: string;
}>();

const { locale } = useI18n();
const router = useRouter();
const { myRegistrations, myRegisteredCourseEntries } = useMyRegisteredCourses();

const {
  selectedChatCourseId,
  chatDraft,
  chatMessagesRef,
  selectedChatEntry,
  chatThreadMessages,
  canSendChatMessage,
  unreadByEnrollId,
  lastMessageAt,
  sendChatMessage,
  selectChatCourse,
  formatChatMessageTime,
  getChatStatusLabel,
  getChatStatusIcon,
  isLatestLearnerMessage,
} = useProfileChat(myRegistrations, myRegisteredCourseEntries);

const sortedCourseEntries = computed(() =>
  [...myRegisteredCourseEntries.value].sort((a, b) => {
    const ta = lastMessageAt.value[a.registration.enrollId ?? 0] ?? 0;
    const tb = lastMessageAt.value[b.registration.enrollId ?? 0] ?? 0;
    return tb - ta;
  }),
);

function getTranslatedCourseTitle(course: { title: string; titleEn?: string }): string {
  if (locale.value === 'th') return course.title;
  return course.titleEn || course.title;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(locale.value === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
</script>

<style lang="scss" scoped>
.chat-layout {
  align-items: stretch;
}

.chat-course-list {
  display: block !important;
  max-height: 520px;
  height: 520px;
  overflow-x: hidden;
  overflow-y: auto;
  padding-right: 4px;

  > * + * {
    margin-top: 8px;
  }
}

.chat-course-card {
  position: relative;
  border-radius: 14px !important;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;
  overflow: hidden;
  background: #ffffff;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: rgba($primary, 0.3) !important;
    box-shadow: 0 12px 24px rgba(17, 24, 39, 0.08);
  }

  &--active {
    border-color: rgba($primary, 0.38) !important;
    box-shadow: 0 10px 20px rgba(17, 24, 39, 0.08);
  }

  &__stripe {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 4px;
    background: linear-gradient(180deg, $primary, #c4850e);
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &:hover &__stripe,
  &--active &__stripe {
    opacity: 1;
  }

  &__thumb {
    width: 96px;
    height: 60px;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &__cover {
    width: 100%;
    height: 100%;
  }

  &__title {
    display: -webkit-box;
    overflow: hidden;
    line-height: 1.35;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.chat-thread-card {
  height: 500px;
  min-height: 500px;
  border-radius: 14px !important;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;
  overflow: hidden;

  &__header,
  &__composer {
    background: white;
    flex-shrink: 0;
  }

  &__course-thumb {
    width: 92px;
    height: 58px;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &__messages {
    min-height: 0;
    flex: 1 1 auto;
    overflow-y: auto;
    background:
      radial-gradient(circle at 90% 8%, rgba($primary, 0.08), transparent 30%),
      linear-gradient(180deg, #fbfcfd 0%, #f6f8f8 100%);
    padding: 20px;
  }
}

.chat-empty-state {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.chat-message {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 16px;

  &--learner {
    justify-content: flex-end;

    .chat-message__bubble {
      background: linear-gradient(135deg, $primary, #f8c94a);
      color: #1f2937;
      border-bottom-right-radius: 4px;
    }
  }

  &--instructor,
  &--system {
    justify-content: flex-start;

    .chat-message__bubble {
      background: white;
      color: #1f2937;
      border-bottom-left-radius: 4px;
      border: 1px solid rgba(17, 24, 39, 0.08);
    }
  }

  &__avatar {
    background: linear-gradient(135deg, rgba($primary, 0.15), rgba($secondary, 0.15));
    overflow: hidden;
  }

  &__avatar--instructor {
    overflow: hidden;
    background: linear-gradient(135deg, rgba($primary, 0.15), rgba($secondary, 0.15));

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__avatar-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__bubble {
    max-width: min(78%, 520px);
    padding: 10px 14px;
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(17, 24, 39, 0.08);
  }

  &__body {
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
  }

  &__time {
    margin-top: 4px;
    font-size: 0.62rem;
    color: rgba(31, 41, 55, 0.48);
    text-align: right;
  }

  &__status {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    margin-top: 2px;
    color: rgba(31, 41, 55, 0.45);
    font-size: 0.62rem;
    font-weight: 400;
    line-height: 1.2;

    &--read {
      color: rgba(25, 118, 210, 0.68);
    }
  }
}

.chat-input {
  :deep(.q-field__control) {
    min-height: 44px;
    background: #fff;
  }

  // Use a SINGLE border (the :before outline) at a constant 2px, and disable the
  // :after focus overlay entirely — that overlay was drawing a second line and the
  // 1px → 2px shift. Focus just recolors the one border to primary.
  :deep(.q-field__control:before) {
    border: 2px solid rgba(0, 0, 0, 0.14);
  }

  :deep(.q-field__control:after) {
    display: none;
  }

  &.q-field--focused :deep(.q-field__control:before) {
    border-color: var(--q-primary);
  }
}

.course-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 8px 18px;
  background: white;
  border-radius: 10px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  box-shadow: 0 6px 18px rgba(17, 24, 39, 0.03);
}

.empty-state-card {
  border-radius: 20px !important;
  background:
    radial-gradient(circle at 50% 0%, rgba($primary, 0.04), transparent 60%), white !important;
  border: 2px dashed rgba($primary, 0.15) !important;
  padding: 48px 24px !important;

  &__icon-wrap {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    background: rgba($primary, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 767px) {
  .chat-course-list {
    display: block !important;
    max-height: 360px;
    height: 360px;
    overflow-x: hidden;
    overflow-y: auto;
    padding-right: 0;
  }

  .chat-thread-card {
    height: auto;
    min-height: 0;

    &__messages {
      height: 320px;
      max-height: 320px;
      flex: 0 0 auto;
    }
  }

  .chat-message__bubble {
    max-width: 82%;
  }
}
</style>
