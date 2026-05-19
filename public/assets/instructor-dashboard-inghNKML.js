const refreshUrl = `/?chunk-refresh=${Date.now()}#/instructor/dashboard`;

window.location.replace(refreshUrl);

export default {
  name: 'StaleInstructorDashboardRedirect',
  template: '<div></div>',
};
