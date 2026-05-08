import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/main-layout.vue'),
    children: [
      { path: '', redirect: '/main', meta: { public: true } },
      { path: 'main', component: () => import('pages/main-page.vue'), meta: { public: true } },
      {
        path: 'course/:id',
        component: () => import('pages/course-detail-page.vue'),
        meta: { public: true },
      },
      {
        path: 'course/:id/learn',
        component: () => import('pages/course-learning-page.vue'),
      },
      {
        path: 'course/:id/video/:videoId',
        component: () => import('pages/course-video-page.vue'),
      },
      {
        path: 'course/:id/grades',
        component: () => import('pages/course-grades-page.vue'),
      },
      {
        path: 'course/:id/quiz/:quizId',
        component: () => import('pages/course-quiz-page.vue'),
      },
      {
        path: 'course-home',
        component: () => import('pages/course-home-page.vue'),
      },
      {
        path: 'short-courses',
        component: () => import('pages/short-courses-page.vue'),
        meta: { public: true },
      },
      { path: 'profile', component: () => import('pages/profile-page.vue') },
      { path: 'admin', redirect: '/admin/dashboard', meta: { role: 'admin' } },
      {
        path: 'admin/dashboard',
        component: () => import('pages/admin/admin-dashboard-page.vue'),
        meta: { role: 'admin' },
      },
      {
        path: 'admin/categories',
        component: () => import('pages/admin/admin-categories-page.vue'),
        meta: { role: 'admin' },
      },
      {
        path: 'admin/images',
        component: () => import('pages/admin/admin-images-page.vue'),
        meta: { role: 'admin' },
      },
      {
        path: 'admin/basics',
        component: () => import('pages/admin/admin-basics-page.vue'),
        meta: { role: 'admin' },
      },
      {
        path: 'notifications',
        component: () => import('pages/instructor/instructor-notifications.vue'),
      },
      {
        path: 'instructor/dashboard',
        component: () => import('pages/instructor/instructor-dashboard.vue'),
        meta: { role: 'teach' },
      },
      {
        path: 'instructor/courses',
        component: () => import('pages/instructor/instructor-course-management.vue'),
        meta: { role: 'teach' },
      },
      {
        path: 'instructor/create-course',
        component: () => import('pages/instructor/instructor-course-creation.vue'),
        meta: { role: 'teach' },
      },
      {
        path: 'instructor/students',
        component: () => import('pages/instructor/instructor-students.vue'),
        meta: { role: 'teach' },
      },
      {
        path: 'instructor/notifications',
        component: () => import('pages/instructor/instructor-notifications.vue'),
        meta: { role: 'teach' },
      },
      {
        path: 'instructor/grading',
        component: () => import('pages/instructor/instructor-grading.vue'),
        meta: { role: 'instructor' },
      },
      {
        path: 'finance/dashboard',
        component: () => import('pages/finance/finance-dashboard-page.vue'),
        meta: { role: 'finance' },
      },
      {
        path: 'finance/receipts',
        component: () => import('pages/finance/finance-receipts-page.vue'),
        meta: { role: 'finance' },
      },
      {
        path: 'central-finance/dashboard',
        component: () => import('pages/centralfinance/finance-dashboard-page.vue'),
        meta: { role: 'central_finance' },
      },
      {
        path: 'central-finance/fund-sources',
        component: () => import('pages/centralfinance/finance-fund-sources-page.vue'),
        meta: { role: 'central_finance' },
      },
      {
        path: 'central-finance/fund-sources/add',
        component: () => import('pages/centralfinance/finance-add-fund-source-page.vue'),
        meta: { role: 'central_finance' },
      },
    ],
  },
  {
    path: '/login',
    component: () => import('layouts/fullscreen-layout.vue'),
    meta: { public: true },
    children: [{ path: '', component: () => import('pages/login-page.vue') }],
  },
  {
    path: '/login-forget',
    component: () => import('layouts/fullscreen-layout.vue'),
    meta: { public: true },
    children: [{ path: '', component: () => import('pages/login-user-forget.vue') }],
  },

  {
    path: '/register',
    component: () => import('layouts/fullscreen-layout.vue'),
    meta: { public: true },
    children: [{ path: '', component: () => import('pages/register-page.vue') }],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
