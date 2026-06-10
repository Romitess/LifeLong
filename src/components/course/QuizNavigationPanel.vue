<template>
  <aside class="quiz-nav" aria-label="การนำทางแบบทดสอบ">
    <div class="quiz-nav__title">การนำทาง</div>

    <div class="quiz-nav__grid">
      <button
        v-for="q in questions"
        :key="q.slot"
        type="button"
        class="quiz-nav__cell"
        :class="cellClass(q)"
        :aria-label="cellAriaLabel(q)"
        :aria-current="q.page === currentPage ? 'true' : undefined"
        @click="emit('jump', q.page)"
      >
        <span class="quiz-nav__num">{{ q.number }}</span>
        <q-icon v-if="q.flagged" name="flag" size="12px" class="quiz-nav__flag" />
      </button>
    </div>

    <!-- Legend -->
    <div class="quiz-nav__legend">
      <span class="quiz-nav__legend-item"
        ><i class="quiz-nav__dot quiz-nav__dot--answered" />ตอบแล้ว</span
      >
      <span class="quiz-nav__legend-item"><i class="quiz-nav__dot" />ยังไม่ตอบ</span>
    </div>

    <BaseButton
      class="quiz-nav__finish full-width"
      color="positive"
      no-caps
      unelevated
      icon="flag"
      label="จบการทำแบบทดสอบ"
      :loading="loading"
      @click="emit('finish')"
    />
  </aside>
</template>

<script setup lang="ts">
import BaseButton from 'components/base/BaseButton.vue';
import type { QuizSummaryQuestion } from 'src/composables/use-moodle-quiz';

const props = defineProps<{
  questions: QuizSummaryQuestion[];
  currentPage: number;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'jump', page: number): void;
  (e: 'finish'): void;
}>();

// Moodle's `stateclass`: 'notyetanswered'/'invalid'/'' = not answered;
// 'answered'/'complete'/graded states = answered.
const NOT_ANSWERED = new Set(['notyetanswered', 'invalid', 'todo', '']);

function isAnswered(q: QuizSummaryQuestion): boolean {
  return !NOT_ANSWERED.has(q.state);
}

function cellClass(q: QuizSummaryQuestion): Record<string, boolean> {
  return {
    'quiz-nav__cell--answered': isAnswered(q),
    'quiz-nav__cell--current': q.page === props.currentPage,
    'quiz-nav__cell--flagged': q.flagged,
  };
}

function cellAriaLabel(q: QuizSummaryQuestion): string {
  const parts = [`ข้อ ${q.number}`, isAnswered(q) ? 'ตอบแล้ว' : 'ยังไม่ตอบ'];
  if (q.flagged) parts.push('ปักธง');
  if (q.page === props.currentPage) parts.push('ข้อปัจจุบัน');
  return parts.join(', ');
}
</script>

<style lang="scss" scoped>
.quiz-nav {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
  padding: 20px;

  &__title {
    font-size: 0.9rem;
    font-weight: 700;
    color: rgba(15, 23, 42, 0.85);
    margin-bottom: 14px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 8px;
    margin-bottom: 16px;
  }

  &__cell {
    position: relative;
    aspect-ratio: 1;
    min-height: 40px;
    border: 1.5px solid rgba(15, 23, 42, 0.18);
    border-radius: 10px;
    background: #fff;
    color: rgba(15, 23, 42, 0.6);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition:
      background 0.15s ease,
      border-color 0.15s ease,
      transform 0.1s ease;

    &:hover {
      background: rgba(247, 208, 70, 0.12);
    }
    &:focus-visible {
      outline: 2px solid var(--q-primary);
      outline-offset: 2px;
    }
    &:active {
      transform: scale(0.94);
    }

    // Answered: filled accent
    &--answered {
      background: var(--q-primary);
      border-color: var(--q-primary);
      color: rgba(15, 23, 42, 0.85);
    }

    // Current question: strong ring
    &--current {
      border-color: var(--q-primary);
      box-shadow: 0 0 0 2px rgba(247, 208, 70, 0.45);
    }
  }

  &__num {
    line-height: 1;
  }

  &__flag {
    position: absolute;
    top: 2px;
    right: 2px;
    color: var(--q-negative);
  }

  &__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
    font-size: 0.72rem;
    color: rgba(15, 23, 42, 0.55);
  }
  &__legend-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  &__dot {
    width: 12px;
    height: 12px;
    border-radius: 4px;
    border: 1.5px solid rgba(15, 23, 42, 0.18);
    background: #fff;
    &--answered {
      background: var(--q-primary);
      border-color: var(--q-primary);
    }
  }
}

// Mobile: panel sits above the question, grid scrolls horizontally if long
@media (max-width: 1023px) {
  .quiz-nav {
    padding: 16px;
    &__grid {
      grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
    }
  }
}
</style>
