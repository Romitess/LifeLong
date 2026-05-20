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
      { path: 'admin/categories', redirect: '/admin/basics', meta: { role: 'admin' } },
      { path: 'admin/images', redirect: '/admin/basics', meta: { role: 'admin' } },
      {
        path: 'admin/basics',
        component: () => import('pages/admin/admin-basics-page.vue'),
        meta: { role: 'admin' },
      },
      {
        path: 'admin/courses',
        component: () => import('pages/admin/admin-courses-page.vue'),
        meta: { role: 'admin' },
      },
      {
        path: 'admin/courses/new',
        component: () => import('pages/admin/admin-course-form-page.vue'),
        meta: { role: 'admin' },
      },
      {
        path: 'admin/reports',
        component: () => import('pages/admin/admin-reports-page.vue'),
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
        path: 'instructor/students',
        component: () => import('pages/instructor/instructor-students.vue'),
        meta: { role: 'teach' },
      },
      {
        path: 'instructor/certificates',
        component: () => import('pages/instructor/instructor-certificates.vue'),
        meta: { role: 'teach' },
      },
      {
        path: 'instructor/chat',
        component: () => import('pages/instructor/instructor-learner-chat.vue'),
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
        path: 'finance/receipt-summary',
        component: () => import('pages/finance/finance-receipt-summary-page.vue'),
        meta: { role: 'finance' },
      },
      {
        path: 'finance/source-of-funds-chart',
        component: () => import('pages/finance/finance-source-of-funds-chart-page.vue'),
        meta: { role: 'finance' },
      },
      {
        path: 'finance/payment-import',
        component: () => import('pages/finance/finance-payment-import-page.vue'),
        meta: { role: 'finance' },
      },
      {
        path: 'finance/applicant-search',
        component: () => import('pages/finance/finance-applicant-search-page.vue'),
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
      {
        path: 'central-finance/transactions',
        component: () => import('pages/centralfinance/finance-transactions-page.vue'),
        meta: { role: 'central_finance' },
      },
      {
        path: 'central-finance/daily-report',
        component: () => import('pages/centralfinance/finance-daily-report-page.vue'),
        meta: { role: 'central_finance' },
      },
      {
        path: 'central-finance/faculty-revenue',
        component: () => import('pages/centralfinance/finance-faculty-revenue-report.vue'),
        meta: { role: 'central_finance' },
      },
      { path: 'lifelong2', redirect: '/lifelong2/dashboard', meta: { role: 'lifelong2' } },
      {
        path: 'lifelong2/dashboard',
        component: () => import('pages/lifelong2/lifelong2-dashboard-page.vue'),
        meta: { role: 'lifelong2' },
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
