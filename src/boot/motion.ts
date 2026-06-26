import { defineBoot } from '#q-app/wrappers';
import { MotionPlugin } from '@vueuse/motion';
import { autoAnimatePlugin } from '@formkit/auto-animate/vue';

export default defineBoot(({ app }) => {
  app.use(MotionPlugin);
  app.use(autoAnimatePlugin);
});
