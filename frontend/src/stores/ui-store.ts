import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  // Read initial state from localStorage if available, otherwise default to false
  const getInitialState = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lll-course-fullscreen') === 'true';
    }
    return false;
  };

  const isCourseFullscreen = ref(getInitialState());

  const setCourseFullscreen = (value: boolean) => {
    isCourseFullscreen.value = value;
    if (typeof window !== 'undefined') {
      localStorage.setItem('lll-course-fullscreen', String(value));
    }
  };

  return {
    isCourseFullscreen,
    setCourseFullscreen,
  };
});
