<template>
  <div v-if="learnerProfile" class="hero-learner-profile">
    <!-- Animated background gradient -->
    <div class="hero-learner-profile__bg">
      <div class="hero-learner-profile__bg-gradient" />
      <div class="hero-learner-profile__bg-pattern" />
    </div>

    <!-- Main content container -->
    <div class="hero-learner-profile__container">
      <!-- Left side: Welcome message & status -->
      <div class="hero-learner-profile__welcome">
        <div class="hero-learner-profile__badge">
          <q-icon name="star" />
          <span>Student Spotlight</span>
        </div>

        <h1 class="hero-learner-profile__title">{{ learnerProfile.name }}</h1>

        <p class="hero-learner-profile__subtitle">
          {{ learnerProfile.statusNote }}
        </p>

        <div class="hero-learner-profile__status-group">
          <q-badge
            rounded
            color="positive"
            text-color="white"
            class="hero-learner-profile__status-badge"
          >
            {{ learnerProfile.statusLabel }}
          </q-badge>
          <q-badge
            rounded
            color="primary"
            text-color="white"
            class="hero-learner-profile__status-badge"
          >
            {{ learnerProfile.attendanceRate }}% Attendance
          </q-badge>
        </div>

        <q-btn
          class="hero-learner-profile__cta"
          color="positive"
          size="lg"
          label="Continue Learning"
          icon-right="arrow_forward"
          unelevated
          no-caps
          @click="$emit('continue-learning')"
        />
      </div>

      <!-- Right side: Profile card -->
      <div class="hero-learner-profile__card-wrapper">
        <div class="hero-learner-profile__card">
          <!-- Card top: Avatar + Identity -->
          <div class="hero-learner-profile__card-header">
            <q-avatar size="80px" class="hero-learner-profile__avatar">
              <img :src="learnerProfile.avatarUrl" :alt="learnerProfile.name" />
            </q-avatar>

            <div class="hero-learner-profile__identity">
              <h2 class="hero-learner-profile__name">{{ learnerProfile.name }}</h2>
              <div class="hero-learner-profile__meta">
                {{ learnerProfile.faculty }} • {{ learnerProfile.courseCode }}
              </div>
              <div class="hero-learner-profile__status-note">
                {{ learnerProfile.statusNote }}
              </div>
            </div>

            <!-- Course badge -->
            <div v-if="learnerProfile.courseImageUrl" class="hero-learner-profile__course-badge">
              <img
                :src="learnerProfile.courseImageUrl"
                :alt="learnerProfile.courseTitle"
                class="hero-learner-profile__course-image"
              />
            </div>
          </div>

          <!-- Metrics: Streak, XP, Level -->
          <div class="hero-learner-profile__metrics">
            <div class="hero-learner-profile__metric-item">
              <div class="hero-learner-profile__metric-icon fire">
                <q-icon name="local_fire_department" size="20px" />
              </div>
              <div class="hero-learner-profile__metric-info">
                <div class="hero-learner-profile__metric-value">
                  {{ learnerProfile.streakDays }} days
                </div>
                <div class="hero-learner-profile__metric-label">Streak</div>
              </div>
            </div>

            <div class="hero-learner-profile__metric-divider" />

            <div class="hero-learner-profile__metric-item">
              <div class="hero-learner-profile__metric-icon star">
                <q-icon name="stars" size="20px" />
              </div>
              <div class="hero-learner-profile__metric-info">
                <div class="hero-learner-profile__metric-value">
                  {{ formatXp(learnerProfile.xp) }} XP
                </div>
                <div class="hero-learner-profile__metric-label">
                  Level {{ learnerProfile.level }}
                </div>
              </div>
            </div>

            <div class="hero-learner-profile__metric-divider" />

            <div class="hero-learner-profile__metric-item">
              <div class="hero-learner-profile__metric-icon level">
                <span class="hero-learner-profile__metric-badge">
                  {{ learnerProfile.level }}
                </span>
              </div>
              <div class="hero-learner-profile__metric-info">
                <div class="hero-learner-profile__metric-value">
                  {{ learnerProfile.level }}
                </div>
                <div class="hero-learner-profile__metric-label">Level</div>
              </div>
            </div>
          </div>

          <!-- Progress section -->
          <div class="hero-learner-profile__progress-section">
            <div class="hero-learner-profile__progress-header">
              <span>Learning Progress</span>
              <strong>
                {{ learnerProfile.completedLessons }}/{{ learnerProfile.totalLessons }} Lessons
              </strong>
            </div>
            <q-linear-progress
              rounded
              size="12px"
              color="positive"
              track-color="grey-3"
              :value="learnerProfile.completedLessons / learnerProfile.totalLessons"
              class="hero-learner-profile__progress-bar"
            />
            <div class="hero-learner-profile__progress-percent">
              {{
                Math.round((learnerProfile.completedLessons / learnerProfile.totalLessons) * 100)
              }}% Complete
            </div>
          </div>

          <!-- Achievement badge (optional) -->
          <div class="hero-learner-profile__achievement">
            <q-icon
              name="emoji_events"
              size="24px"
              class="hero-learner-profile__achievement-icon"
            />
            <span class="hero-learner-profile__achievement-text">
              Keep your {{ learnerProfile.streakDays }}-day streak going!
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Decorative elements -->
    <div class="hero-learner-profile__decoration decoration-1" />
    <div class="hero-learner-profile__decoration decoration-2" />
  </div>
</template>

<script setup lang="ts">
interface LearnerProfile {
  name: string;
  faculty: string;
  courseCode: string;
  courseTitle: string;
  courseImageUrl: string;
  avatarUrl: string;
  statusLabel: string;
  statusNote: string;
  attendanceRate: number;
  streakDays: number;
  xp: number;
  level: number;
  completedLessons: number;
  totalLessons: number;
}

interface Props {
  learnerProfile: LearnerProfile | null;
}

defineProps<Props>();

defineEmits<{
  'continue-learning': [];
}>();

function formatXp(value: number): string {
  return value.toLocaleString('en-US');
}
</script>

<style lang="scss" scoped>
.hero-learner-profile {
  position: relative;
  width: 100%;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);

  &__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  &__bg-gradient {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
    animation: gradientShift 8s ease-in-out infinite;
  }

  &__bg-pattern {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(
        0deg,
        transparent 24%,
        rgba(255, 255, 255, 0.05) 25%,
        rgba(255, 255, 255, 0.05) 26%,
        transparent 27%,
        transparent 74%,
        rgba(255, 255, 255, 0.05) 75%,
        rgba(255, 255, 255, 0.05) 76%,
        transparent 77%,
        transparent
      ),
      linear-gradient(
        90deg,
        transparent 24%,
        rgba(255, 255, 255, 0.05) 25%,
        rgba(255, 255, 255, 0.05) 26%,
        transparent 27%,
        transparent 74%,
        rgba(255, 255, 255, 0.05) 75%,
        rgba(255, 255, 255, 0.05) 76%,
        transparent 77%,
        transparent
      );
    background-size: 50px 50px;
    opacity: 0.3;
  }

  &__container {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    width: 100%;
    max-width: 1400px;
    padding: 56px 48px;
    align-items: center;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
      gap: 32px;
      padding: 40px 32px;
    }

    @media (max-width: 640px) {
      padding: 32px 20px;
      gap: 24px;
    }
  }

  &__welcome {
    color: #ffffff;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 999px;
    width: fit-content;
    font-size: 13px;
    font-weight: 600;
    color: #fbbf24;

    :deep(.q-icon) {
      font-size: 16px;
    }
  }

  &__title {
    font-size: clamp(32px, 8vw, 56px);
    font-weight: 800;
    line-height: 1.1;
    margin: 0;
    letter-spacing: -1px;
    background: linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &__subtitle {
    font-size: 18px;
    color: #cbd5e1;
    margin: 0;
    line-height: 1.6;
  }

  &__status-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__status-badge {
    font-size: 13px;
    font-weight: 600;
  }

  &__cta {
    align-self: flex-start;
    margin-top: 16px;
    padding: 14px 32px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: capitalize;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(16, 185, 129, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }

  // Card styling
  &__card-wrapper {
    perspective: 1000px;
  }

  &__card {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(251, 191, 36, 0.2);
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      border-color: rgba(251, 191, 36, 0.4);
      box-shadow: 0 16px 48px rgba(251, 191, 36, 0.15);
      transform: translateY(-4px);
    }

    @media (max-width: 1024px) {
      padding: 28px;
    }

    @media (max-width: 640px) {
      padding: 20px;
    }
  }

  &__card-header {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    gap: 20px;
    align-items: start;
    margin-bottom: 28px;
    padding-bottom: 28px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  &__avatar {
    box-shadow: 0 8px 24px rgba(251, 191, 36, 0.2);
    border: 2px solid rgba(251, 191, 36, 0.3);
  }

  &__identity {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__name {
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }

  &__meta {
    font-size: 14px;
    color: #94a3b8;
  }

  &__status-note {
    font-size: 13px;
    color: #cbd5e1;
    font-style: italic;
  }

  &__course-badge {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }

  &__course-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  // Metrics section
  &__metrics {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 28px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;

    @media (max-width: 640px) {
      flex-direction: column;
      gap: 16px;
    }
  }

  &__metric-item {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  &__metric-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    font-weight: 700;

    &.fire {
      background: rgba(217, 119, 6, 0.2);
      color: #d97706;
    }

    &.star {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }

    &.level {
      background: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }
  }

  &__metric-badge {
    font-size: 20px;
    color: inherit;
  }

  &__metric-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__metric-value {
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
  }

  &__metric-label {
    font-size: 12px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__metric-divider {
    width: 1px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);

    @media (max-width: 640px) {
      display: none;
    }
  }

  // Progress section
  &__progress-section {
    margin-bottom: 20px;
  }

  &__progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;

    span {
      color: #cbd5e1;
    }

    strong {
      color: #ffffff;
      font-weight: 700;
    }
  }

  &__progress-bar {
    margin-bottom: 8px;
  }

  &__progress-percent {
    font-size: 12px;
    color: #10b981;
    font-weight: 600;
    text-align: right;
  }

  // Achievement section
  &__achievement {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
    border-radius: 12px;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  &__achievement-icon {
    color: #fbbf24;
    flex-shrink: 0;
  }

  &__achievement-text {
    color: #e5e7eb;
    font-size: 14px;
    font-weight: 500;
  }

  // Decorations
  &__decoration {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    opacity: 0.1;
  }
}

// Animations
@keyframes gradientShift {
  0%,
  100% {
    background: radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
  }
  50% {
    background: radial-gradient(circle at 80% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 50%);
  }
}

.decoration-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #fbbf24 0%, transparent 70%);
  top: -200px;
  right: -200px;
}

.decoration-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
  bottom: -150px;
  left: -150px;
}
</style>
