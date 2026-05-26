<template>
  <q-page class="profile-page">
    <!-- โ”€โ”€โ”€ PROFILE HERO โ”€โ”€โ”€ -->
    <section class="profile-hero">
      <div class="profile-hero__particles" />
      <div class="profile-hero__overlay" />
      <GoldenUnderline />
      <div class="section-container profile-hero__content">
        <div class="row items-center justify-between q-col-gutter-lg">
          <!-- Avatar and Name Info -->
          <div class="col-12 col-lg-auto">
            <div class="row items-center no-wrap q-gutter-lg">
              <div class="profile-hero__avatar-wrap">
                <q-avatar
                  size="100px"
                  class="profile-hero__avatar cursor-pointer"
                  @click.stop.prevent="openFullAvatar"
                  @mousedown.stop.prevent
                >
                  <img
                    v-if="currentAvatarUrl"
                    :src="currentAvatarUrl"
                    class="profile-hero__avatar-image"
                    alt="Profile avatar"
                    loading="eager"
                    decoding="sync"
                    @click.stop.prevent="openFullAvatar"
                    @mousedown.stop.prevent
                  />
                  <q-icon v-else name="person" size="56px" color="white" />
                </q-avatar>
                <div
                  class="profile-hero__camera cursor-pointer"
                  @click.stop.prevent="triggerAvatarUpload"
                  @mousedown.stop.prevent
                >
                  <q-icon name="photo_camera" size="16px" color="white" />
                </div>
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/*"
                  style="display: none"
                  @change="onAvatarSelected"
                />
              </div>
              <div class="column">
                <div class="text-overline text-white" style="opacity: 0.6; letter-spacing: 0.12em">
                  {{ heroRoleLabel }}
                </div>
                <div class="text-h4 text-weight-bolder text-white q-mt-xs">
                  {{ authStore.user?.firstNameTh }} {{ authStore.user?.lastNameTh }}
                </div>
                <div class="row items-center q-gutter-sm q-mt-xs">
                  <q-badge rounded color="positive" label="Active" class="text-weight-bold" />
                  <span class="text-body2 text-white" style="opacity: 0.7">
                    {{ $t('profile.hero.studentId') }} : {{ authStore.user?.studentId }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="col-12 col-lg-auto">
            <div class="row q-gutter-md justify-center">
              <div
                v-for="stat in profileStats"
                :key="stat.label"
                class="profile-stat-card"
                :style="stat.tone"
              >
                <div class="profile-stat-card__icon-wrap">
                  <q-icon :name="stat.icon" size="24px" color="white" />
                </div>
                <div class="profile-stat-card__info">
                  <div class="profile-stat-card__value">
                    {{ stat.value }}
                  </div>
                  <div class="profile-stat-card__label">{{ stat.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- โ”€โ”€โ”€ CONTENT โ”€โ”€โ”€ -->
    <section ref="profileContentRef" class="profile-content q-py-xl">
      <div class="section-container">
        <div class="row q-col-gutter-xl">
          <!-- Sidebar Menu -->
          <div v-if="!isTeachingRole" class="col-12 col-md-3">
            <q-card flat bordered class="profile-menu-card">
              <q-list padding>
                <q-item-label
                  header
                  class="text-weight-bold text-grey-8 text-caption"
                  style="letter-spacing: 0.06em"
                >
                  {{ $t('profile.menu.header') }}
                </q-item-label>
                <q-item
                  v-for="menu in menuItems"
                  :key="menu.value"
                  clickable
                  v-ripple
                  :active="activeMenu === menu.value"
                  active-class="profile-menu-item--active"
                  class="profile-menu-item"
                  @click="activeMenu = menu.value"
                >
                  <q-item-section avatar>
                    <q-icon
                      :name="menu.icon"
                      :color="activeMenu === menu.value ? 'primary' : 'grey-6'"
                      size="20px"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label
                      :class="
                        activeMenu === menu.value ? 'text-primary text-weight-bold' : 'text-grey-8'
                      "
                      class="text-body2"
                    >
                      {{ menu.label }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section
                    v-if="menu.value === 'my-courses' && myRegistrations.length > 0"
                    side
                  >
                    <q-badge rounded color="primary" :label="myRegistrations.length" />
                  </q-item-section>
                  <q-item-section
                    v-if="
                      menu.value === 'saved-courses' && courseBookmarkStore.myBookmarks.length > 0
                    "
                    side
                  >
                    <q-badge
                      rounded
                      color="amber-8"
                      :label="courseBookmarkStore.myBookmarks.length"
                    />
                  </q-item-section>
                </q-item>
              </q-list>

              <q-separator />
              <div class="q-pa-md">
                <div class="text-caption text-grey-6 q-mb-xs">
                  {{ $t('profile.hero.studentId') }}
                </div>
                <div class="text-weight-bolder text-dark">{{ authStore.user?.studentId }}</div>
                <q-btn
                  flat
                  no-caps
                  color="primary"
                  :label="$t('profile.menu.studentCard')"
                  icon="badge"
                  class="full-width profile-sidebar-link-btn"
                  align="left"
                  padding="8px 12px"
                  @click="showStudentCardDialog = true"
                />
                <q-btn
                  flat
                  no-caps
                  color="primary"
                  :label="$t('profile.menu.changePassword')"
                  icon="lock_reset"
                  class="full-width profile-sidebar-link-btn"
                  align="left"
                  padding="8px 12px"
                  href="https://myid.buu.ac.th"
                  target="_blank"
                  rel="noopener noreferrer"
                />
                <q-btn
                  flat
                  no-caps
                  color="primary"
                  :label="$t('profile.menu.learnerDocuments')"
                  icon="description"
                  class="full-width profile-sidebar-link-btn"
                  align="left"
                  padding="8px 12px"
                  href="https://drive.google.com/drive/folders/1ZEzkuEd5tVK-9BlTEzflDDS5ibrhOdOi"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              </div>
            </q-card>
          </div>

          <!-- Main Content -->
          <div :class="isTeachingRole ? 'col-12' : 'col-12 col-md-9'">
            <div class="profile-tab-panel">
              <!-- My Courses Tab -->
              <div v-if="isTeachingRole" class="instructor-home-panel">
                <div class="instructor-home-header">
                  <div>
                    <div class="text-h5 text-weight-bolder text-primary">Instructor Overview</div>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      Course summary, teaching tasks, and certificate progress
                    </div>
                  </div>
                  <q-btn
                    unelevated
                    color="primary"
                    icon="menu_book"
                    label="ดูรายวิชาที่รับผิดชอบ"
                    no-caps
                    @click="goToInstructorCourses"
                  />
                </div>

                <div class="instructor-overview-grid">
                  <q-card
                    v-for="item in instructorOverviewCards"
                    :key="item.label"
                    flat
                    bordered
                    class="instructor-overview-card"
                  >
                    <q-icon :name="item.icon" size="26px" :style="{ color: item.color }" />
                    <div>
                      <strong>{{ item.value.toLocaleString('th-TH') }}</strong>
                      <span>{{ item.label }}</span>
                    </div>
                  </q-card>
                </div>

                <div class="instructor-work-grid">
                  <q-card flat bordered class="instructor-work-card">
                    <div class="instructor-work-card__head">
                      <div>
                        <h2>งานที่ต้องทำต่อ</h2>
                        <span>รายการที่ควรจัดการจากรายวิชาที่คุณรับผิดชอบ</span>
                      </div>
                      <q-icon name="task_alt" size="30px" color="primary" />
                    </div>

                    <div class="instructor-task-list">
                      <button
                        type="button"
                        class="instructor-task-item"
                        @click="goToInstructorStudents"
                      >
                        <q-icon name="fact_check" />
                        <div>
                          <strong>ตรวจสอบรายชื่อผู้เรียน</strong>
                          <span
                            >{{ totalInstructorLearners.toLocaleString('th-TH') }} คนในระบบ
                            mockup</span
                          >
                        </div>
                      </button>
                      <button
                        type="button"
                        class="instructor-task-item"
                        @click="goToInstructorLearningResults"
                      >
                        <q-icon name="grading" />
                        <div>
                          <strong>บันทึกผลการเรียน</strong>
                          <span
                            >{{
                              pendingResultCourses.toLocaleString('th-TH')
                            }}
                            รายวิชายังต้องตรวจผล</span
                          >
                        </div>
                      </button>
                      <button
                        type="button"
                        class="instructor-task-item"
                        @click="goToInstructorCertificates"
                      >
                        <q-icon name="workspace_premium" />
                        <div>
                          <strong>สร้าง Certificate</strong>
                          <span
                            >{{
                              certificateReadyLearners.toLocaleString('th-TH')
                            }}
                            คนผ่านเกณฑ์พร้อมออกเอกสาร</span
                          >
                        </div>
                      </button>
                    </div>
                  </q-card>

                  <q-card flat bordered class="instructor-work-card">
                    <div class="instructor-work-card__head">
                      <div>
                        <h2>สถานะ Certificate</h2>
                        <span>ประเมินจากคะแนน mockup สำหรับเตรียม flow เชื่อมต่อ backend</span>
                      </div>
                      <q-icon name="workspace_premium" size="30px" color="amber-8" />
                    </div>

                    <div class="certificate-status-row">
                      <div>
                        <strong>{{ certificateReadyLearners.toLocaleString('th-TH') }}</strong>
                        <span>พร้อมสร้าง</span>
                      </div>
                      <div>
                        <strong>{{ generatedCertificateCount.toLocaleString('th-TH') }}</strong>
                        <span>สร้างแล้ว</span>
                      </div>
                      <div>
                        <strong>{{ pendingCertificateCount.toLocaleString('th-TH') }}</strong>
                        <span>ยังไม่ได้สร้าง</span>
                      </div>
                    </div>
                  </q-card>
                </div>

                <q-card flat bordered class="instructor-course-work-card">
                  <div class="instructor-course-work-card__head">
                    <div>
                      <h2>รายวิชาที่รับผิดชอบ</h2>
                      <span>{{ instructorCourses.length.toLocaleString('th-TH') }} รายวิชา</span>
                    </div>
                    <q-btn
                      flat
                      color="primary"
                      icon-right="arrow_forward"
                      label="ดูทั้งหมด"
                      no-caps
                      @click="goToInstructorCourses"
                    />
                  </div>

                  <div v-if="instructorCourses.length > 0" class="instructor-course-list">
                    <div
                      v-for="course in instructorCoursePreview"
                      :key="course.id"
                      class="instructor-course-item"
                    >
                      <img :src="course.imageUrl" :alt="course.titleEn || course.title" />
                      <div class="instructor-course-item__body">
                        <span>{{ course.code }}</span>
                        <strong>{{ course.titleEn || course.title }}</strong>
                        <div>
                          {{ course.enrolledCount.toLocaleString('th-TH') }}/{{
                            course.maxSeats.toLocaleString('th-TH')
                          }}
                          ผู้เรียน
                        </div>
                      </div>
                      <div class="instructor-course-item__actions">
                        <q-btn
                          dense
                          outline
                          color="primary"
                          icon="edit"
                          label="จัดการ"
                          no-caps
                          @click="goToInstructorCourseWorkspace(course.id)"
                        />
                        <q-btn
                          dense
                          flat
                          color="amber-8"
                          icon="workspace_premium"
                          label="Certificate"
                          no-caps
                          @click="goToInstructorCertificateCourse(course.id)"
                        />
                      </div>
                    </div>
                  </div>

                  <div v-else class="instructor-empty-state">
                    <q-icon name="school" size="44px" color="primary" />
                    <strong>ยังไม่มีรายวิชาที่รับผิดชอบ</strong>
                    <span>
                      เข้าสู่ระบบด้วยบัญชีผู้สอนที่มีรายวิชา หรือให้ผู้ดูแลระบบสร้างรายวิชาให้
                    </span>
                  </div>
                </q-card>
              </div>

              <div v-else-if="activeMenu === 'my-courses'" class="student-course-panel">
                <!-- Section Header -->
                <div class="row items-center justify-between q-mb-lg">
                  <div>
                    <div class="text-h5 text-weight-bolder text-primary">
                      {{ $t('profile.courses.title') }}
                    </div>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      {{ $t('profile.courses.totalCount', { count: myRegistrations.length }) }}
                    </div>
                  </div>
                  <q-input
                    v-model="courseSearch"
                    dense
                    outlined
                    rounded
                    :placeholder="$t('profile.courses.search')"
                    class="profile-search-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" color="grey-5" />
                    </template>
                  </q-input>
                </div>

                <!-- Registered Courses Table Header -->
                <div v-if="filteredRegistrations.length > 0" class="course-list-header q-mb-sm">
                  <div class="text-caption text-weight-bold text-grey-7">
                    {{ $t('profile.courses.registeredTitle') }}
                  </div>
                  <q-badge rounded color="primary" :label="filteredRegistrations.length" />
                </div>

                <!-- Course List -->
                <div v-if="filteredRegistrations.length > 0" class="student-course-list">
                  <ProfileCourseCard
                    v-for="entry in filteredRegistrations"
                    :key="entry.registration.id"
                    :course="entry.course"
                    :course-code="entry.course.code"
                    :title="getTranslatedCourseTitle(entry.course)"
                    :status="entry.course.status"
                    :delivery-modes="entry.course.deliveryModes"
                    :max-seats="entry.course.maxSeats"
                    :enrolled-count="entry.course.enrolledCount"
                    :registered-at-label="`${$t('profile.courses.registeredAt')} ${formatDate(entry.registration.registeredAt)}`"
                    :progress-percent="entry.progress.progressPercent"
                    :progress-detail-label="entry.progress.detailLabel"
                    :progress-status-label="
                      entry.registration.paymentStatus === 'pending'
                        ? $t('courseDetail.pendingPayment')
                        : entry.progress.statusLabel
                    "
                    :progress-color="
                      entry.registration.paymentStatus === 'pending'
                        ? 'warning'
                        : entry.progress.color
                    "
                  >
                    <template #actions>
                      <q-btn
                        outline
                        :color="
                          courseBookmarkStore.isBookmarked(entry.registration.courseId)
                            ? 'negative'
                            : 'primary'
                        "
                        :label="
                          courseBookmarkStore.isBookmarked(entry.registration.courseId)
                            ? $t('profile.courses.unsave')
                            : $t('profile.courses.save')
                        "
                        :icon="
                          courseBookmarkStore.isBookmarked(entry.registration.courseId)
                            ? 'bookmark_remove'
                            : 'bookmark_add'
                        "
                        no-caps
                        size="md"
                        class="course-action-btn"
                        @click="toggleRegisteredCourseBookmark(entry.registration)"
                      />
                      <q-btn
                        outline
                        color="negative"
                        :label="$t('profile.courses.unregister')"
                        icon="cancel"
                        no-caps
                        size="md"
                        class="course-action-btn"
                        @click="promptUnregister(entry.registration)"
                      />
                      <CourseCompletionDocumentActions
                        v-if="entry.progress.isCompleted"
                        :entry="entry"
                      />
                      <q-space />
                      <q-btn
                        flat
                        color="primary"
                        :label="getCoursePriceLabel(entry.course)"
                        icon="local_offer"
                        no-caps
                        size="md"
                        disable
                        class="course-action-btn text-weight-bold"
                      />
                      <q-btn
                        v-if="entry.registration.paymentStatus === 'pending'"
                        unelevated
                        color="primary"
                        :label="$t('enrollment.next')"
                        icon="payment"
                        no-caps
                        size="md"
                        class="course-action-btn course-action-btn--primary"
                        @click="openPendingPayment(entry.registration.courseId)"
                      />
                      <q-btn
                        v-else
                        unelevated
                        color="primary"
                        :label="$t('profile.courses.enterClass')"
                        icon="play_circle"
                        no-caps
                        size="md"
                        class="course-action-btn course-action-btn--primary"
                        @click="
                          goToCourse(
                            entry.registration.courseId,
                            entry.course.code,
                            entry.course.moodleId,
                          )
                        "
                      />
                      <q-btn
                        v-if="
                          entry.registration.paymentStatus === 'paid' &&
                          !entry.course.isFree &&
                          getPaymentForCourse(entry.registration.courseId)
                        "
                        flat
                        color="primary"
                        :label="locale === 'th' ? 'ดาวน์โหลดใบเสร็จ' : 'Receipt'"
                        icon="receipt_long"
                        no-caps
                        size="md"
                        class="course-action-btn"
                        @click="downloadReceiptByCourseId(entry.registration.courseId)"
                      />
                    </template>
                  </ProfileCourseCard>
                </div>

                <!-- Empty State -->
                <q-card v-else flat class="text-center empty-state-card q-pa-xl">
                  <div class="empty-state-card__icon-wrap q-mx-auto q-mb-lg">
                    <q-icon name="school" size="48px" color="primary" />
                  </div>
                  <div class="text-h6 text-weight-bolder text-dark">
                    {{ $t('profile.courses.empty') }}
                  </div>
                  <div
                    class="text-body2 text-grey-6 q-mt-sm"
                    style="max-width: 340px; margin: 0 auto"
                  >
                    {{ $t('profile.courses.emptySub') }}
                  </div>
                  <q-btn
                    unelevated
                    rounded
                    color="primary"
                    :label="$t('profile.courses.explore')"
                    icon="explore"
                    no-caps
                    class="q-mt-xl"
                    padding="sm xl"
                    @click="router.push('/short-courses')"
                  />
                </q-card>
              </div>

              <!-- Saved Courses Tab -->
              <div v-else-if="activeMenu === 'saved-courses'">
                <!-- Section Header -->
                <div class="row items-center justify-between q-mb-lg">
                  <div>
                    <div class="text-h5 text-weight-bolder text-primary">
                      {{ $t('profile.courses.savedTitle') }}
                    </div>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      {{
                        $t('profile.courses.savedTotalCount', {
                          count: courseBookmarkStore.myBookmarks.length,
                        })
                      }}
                    </div>
                  </div>
                  <q-input
                    v-model="savedCourseSearch"
                    dense
                    outlined
                    rounded
                    :placeholder="$t('profile.courses.savedSearch')"
                    class="profile-search-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" color="grey-5" />
                    </template>
                  </q-input>
                </div>

                <!-- Saved Courses List Header -->
                <div v-if="filteredSavedCourses.length > 0" class="course-list-header q-mb-sm">
                  <div class="text-caption text-weight-bold text-grey-7">
                    {{ $t('profile.courses.savedTitle') }}
                  </div>
                  <q-badge rounded color="primary" :label="filteredSavedCourses.length" />
                </div>

                <!-- Saved Courses List -->
                <div v-if="filteredSavedCourses.length > 0" class="column q-gutter-md">
                  <ProfileCourseCard
                    v-for="bookmark in filteredSavedCourses"
                    :key="bookmark.courseId"
                    :course="getHydratedBookmarkCourse(bookmark)"
                    :course-code="bookmark.courseCode"
                    :title="getTranslatedCourseTitle(getHydratedBookmarkCourse(bookmark))"
                    :status="getHydratedBookmarkCourse(bookmark).status"
                    :delivery-modes="getHydratedBookmarkCourse(bookmark).deliveryModes"
                    :max-seats="getHydratedBookmarkCourse(bookmark).maxSeats"
                    :enrolled-count="getHydratedBookmarkCourse(bookmark).enrolledCount"
                    :registered-at-label="getSavedCourseRegisteredAtLabel(bookmark.courseId)"
                    :progress-percent="
                      getSavedCourseProgress(bookmark.courseId)?.progressPercent ?? null
                    "
                    :progress-detail-label="
                      getSavedCourseProgress(bookmark.courseId)?.detailLabel ?? ''
                    "
                    :progress-status-label="
                      getSavedCourseProgress(bookmark.courseId)?.statusLabel ?? ''
                    "
                    :progress-color="getSavedCourseProgress(bookmark.courseId)?.color ?? 'primary'"
                  >
                    <template #actions>
                      <template v-if="courseRegistrationStore.isRegistered(bookmark.courseId)">
                        <q-btn
                          outline
                          color="negative"
                          :label="$t('profile.courses.unsave')"
                          icon="bookmark_remove"
                          no-caps
                          size="md"
                          class="course-action-btn"
                          @click="courseBookmarkStore.removeBookmark(bookmark.courseId)"
                        />
                        <q-btn
                          outline
                          color="negative"
                          :label="$t('profile.courses.unregister')"
                          icon="cancel"
                          no-caps
                          size="md"
                          class="course-action-btn"
                          @click="promptUnregisterFromSaved(bookmark)"
                        />
                        <CourseCompletionDocumentActions
                          v-if="getCompletedCourseEntry(bookmark.courseId)"
                          :entry="getCompletedCourseEntry(bookmark.courseId)!"
                        />
                        <q-space />
                        <q-btn
                          flat
                          color="primary"
                          :label="getCoursePriceLabel(getHydratedBookmarkCourse(bookmark))"
                          icon="local_offer"
                          no-caps
                          size="md"
                          disable
                          class="course-action-btn text-weight-bold"
                        />
                        <q-btn
                          v-if="
                            getRegistrationByCourseId(bookmark.courseId)?.paymentStatus ===
                            'pending'
                          "
                          unelevated
                          color="primary"
                          :label="$t('enrollment.next')"
                          icon="payment"
                          no-caps
                          size="md"
                          class="course-action-btn course-action-btn--primary"
                          @click="openPendingPayment(bookmark.courseId)"
                        />
                        <q-btn
                          v-else
                          unelevated
                          color="primary"
                          :label="$t('profile.courses.enterClass')"
                          icon="play_circle"
                          no-caps
                          size="md"
                          class="course-action-btn course-action-btn--primary"
                          @click="
                            goToCourse(
                              bookmark.courseId,
                              bookmark.courseCode,
                              getHydratedBookmarkCourse(bookmark).moodleId,
                            )
                          "
                        />
                      </template>
                      <template v-else>
                        <q-btn
                          outline
                          color="negative"
                          :label="$t('profile.courses.unsave')"
                          icon="bookmark_remove"
                          no-caps
                          size="md"
                          class="course-action-btn"
                          @click="courseBookmarkStore.removeBookmark(bookmark.courseId)"
                        />
                        <q-space />
                        <q-btn
                          flat
                          color="primary"
                          :label="getCoursePriceLabel(getHydratedBookmarkCourse(bookmark))"
                          icon="local_offer"
                          no-caps
                          size="md"
                          disable
                          class="course-action-btn text-weight-bold"
                        />
                        <BaseButton
                          :color="getSavedCourseAction(bookmark).color"
                          :label="getSavedCourseAction(bookmark).label"
                          :icon="getSavedCourseAction(bookmark).icon"
                          :disable="getSavedCourseAction(bookmark).disabled"
                          no-caps
                          size="md"
                          class="course-action-btn"
                          @click="onSavedCourseEnroll(bookmark)"
                        />
                      </template>
                    </template>
                  </ProfileCourseCard>
                </div>

                <!-- Empty State -->
                <q-card v-else flat class="text-center empty-state-card q-pa-xl">
                  <div class="empty-state-card__icon-wrap q-mx-auto q-mb-lg">
                    <q-icon name="bookmark" size="48px" color="amber-8" />
                  </div>
                  <div class="text-h6 text-weight-bolder text-dark">
                    {{ $t('profile.courses.savedEmpty') }}
                  </div>
                  <div
                    class="text-body2 text-grey-6 q-mt-sm"
                    style="max-width: 340px; margin: 0 auto"
                  >
                    {{ $t('profile.courses.savedEmptySub') }}
                  </div>
                  <q-btn
                    unelevated
                    rounded
                    color="primary"
                    :label="$t('profile.courses.explore')"
                    icon="explore"
                    no-caps
                    class="q-mt-xl"
                    padding="sm xl"
                    @click="router.push('/short-courses')"
                  />
                </q-card>
              </div>

              <!-- Personal Info Tab -->
              <div v-else-if="activeMenu === 'personal-info'">
                <div class="row items-center justify-between q-mb-lg">
                  <div>
                    <div class="text-h5 text-weight-bolder text-primary">
                      {{ $t('profile.personal.title') }}
                    </div>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      {{ $t('profile.personal.subtitle') }}
                    </div>
                  </div>
                </div>

                <q-card flat class="profile-form bg-transparent">
                  <h3>{{ $t('profile.personal.title') }}</h3>

                  <p class="student-id">
                    {{ $t('profile.hero.studentId') }} :: {{ authStore.user?.studentId }}
                  </p>

                  <div class="form-grid">
                    <div>
                      <label>{{ $t('profile.personal.firstNameTh') }}</label>
                      <q-input v-model="form.firstNameTh" outlined dense />
                    </div>

                    <div>
                      <label>{{ $t('profile.personal.lastNameTh') }}</label>
                      <q-input v-model="form.lastNameTh" outlined dense />
                    </div>

                    <div>
                      <label>{{ $t('profile.personal.firstNameEn') }}</label>
                      <q-input v-model="form.firstNameEn" outlined dense />
                    </div>

                    <div>
                      <label>{{ $t('profile.personal.lastNameEn') }}</label>
                      <q-input v-model="form.lastNameEn" outlined dense />
                    </div>

                    <div>
                      <label>{{ $t('profile.personal.phone') }}</label>
                      <q-input
                        v-model="form.phone"
                        outlined
                        dense
                        :placeholder="$t('profile.personal.phone')"
                      />
                    </div>
                  </div>

                  <BaseButton
                    color="primary"
                    :label="$t('profile.personal.save')"
                    no-caps
                    hover-lift
                    class="save-btn"
                    :loading="isSavingProfile"
                    :disable="isSavingProfile"
                    @click="confirmSavePersonalInfo"
                  />
                </q-card>

                <q-separator class="q-my-xl" />

                <!-- Avatar section -->
                <section class="avatar-section">
                  <div class="avatar-preview shadow-1">
                    <div class="avatar-preview__header">
                      <div>
                        <p class="avatar-preview__eyebrow">LLL Character Lab</p>
                        <h3 class="avatar-preview__title">Live Avatar Preview</h3>
                      </div>
                      <div class="avatar-preview__stamp">PROFILE</div>
                    </div>

                    <div class="avatar-preview__stage">
                      <img
                        :src="avatarPreviewUrl"
                        alt="Avatar preview"
                        class="avatar-preview__image"
                      />
                    </div>

                    <div class="avatar-preview__footer">
                      <span class="avatar-preview__chip">{{ selectedSkinLabel }}</span>
                      <span class="avatar-preview__chip">{{ selectedEyesLabel }}</span>
                      <span class="avatar-preview__chip">{{ selectedTopLabel }}</span>
                      <span class="avatar-preview__chip">{{ selectedAccessoryLabel }}</span>
                    </div>
                  </div>

                  <q-card flat bordered class="avatar-editor">
                    <h3 class="text-dark text-h6 text-weight-bold">
                      {{ $t('profile.personal.editAvatar') }}
                    </h3>

                    <div class="avatar-editor__tabs q-mt-md">
                      <q-tabs
                        v-model="activeAvatarTab"
                        dense
                        inline-label
                        indicator-color="primary"
                        active-color="primary"
                        class="avatar-editor__tab-bar"
                      >
                        <q-tab name="skin" icon="face_3" />
                        <q-tab name="face" icon="visibility" />
                        <q-tab name="hair" icon="content_cut" />
                        <q-tab name="accessory" icon="styler" />
                        <q-tab name="top" icon="checkroom" />
                        <q-tab name="background" icon="crop_landscape" />
                      </q-tabs>

                      <q-tab-panels
                        v-model="activeAvatarTab"
                        animated
                        class="avatar-editor__panels bg-transparent"
                      >
                        <q-tab-panel name="skin" class="avatar-editor__panel">
                          <section class="avatar-control-card">
                            <div class="avatar-control-card__header">
                              <h4>{{ $t('profile.avatar.body') }}</h4>
                              <span>{{ selectedSkinLabel }}</span>
                            </div>
                            <div class="avatar-swatch-grid">
                              <button
                                v-for="option in skinToneOptions"
                                :key="option.value"
                                type="button"
                                class="avatar-swatch"
                                :class="{
                                  'avatar-swatch--active': cartoonAvatar.body === option.value,
                                }"
                                :style="{ '--avatar-swatch-color': option.swatch || '#e5e7eb' }"
                                :aria-label="option.label"
                                @click="cartoonAvatar.body = option.value"
                              />
                            </div>
                          </section>

                          <section class="avatar-control-card">
                            <div class="avatar-control-card__header">
                              <h4>{{ $t('profile.avatar.pants') }}</h4>
                              <span>{{ selectedBodyLabel }}</span>
                            </div>
                            <div class="avatar-tile-grid avatar-tile-grid--quad">
                              <button
                                v-for="option in bodyStyleOptions"
                                :key="option.value"
                                type="button"
                                class="avatar-tile avatar-tile--body"
                                :class="{
                                  'avatar-tile--active': cartoonAvatar.pants === option.value,
                                }"
                                @click="cartoonAvatar.pants = option.value"
                              >
                                <img
                                  :src="createAvatarOptionPreview({ pants: option.value })"
                                  :alt="option.label"
                                  class="avatar-tile__preview"
                                />
                                <strong>{{ option.label }}</strong>
                              </button>
                            </div>
                          </section>
                        </q-tab-panel>

                        <q-tab-panel name="face" class="avatar-editor__panel">
                          <section class="avatar-control-card">
                            <div class="avatar-control-card__header">
                              <h4>Eye color</h4>
                              <span>{{ selectedEyeColorLabel }}</span>
                            </div>
                            <div class="avatar-swatch-grid">
                              <button
                                v-for="option in eyeColorOptions"
                                :key="option.value"
                                type="button"
                                class="avatar-swatch"
                                :class="{
                                  'avatar-swatch--active': cartoonAvatar.eyeColor === option.value,
                                }"
                                :style="{ '--avatar-swatch-color': option.swatch || '#e5e7eb' }"
                                :aria-label="option.label"
                                @click="cartoonAvatar.eyeColor = option.value"
                              />
                            </div>
                          </section>

                          <section class="avatar-control-card">
                            <div class="avatar-control-card__header">
                              <h4>Expression</h4>
                              <span>{{ selectedEyesLabel }}</span>
                            </div>
                            <div class="avatar-tile-grid avatar-tile-grid--quad">
                              <button
                                v-for="option in eyeOptions"
                                :key="option.value"
                                type="button"
                                class="avatar-tile"
                                :class="{
                                  'avatar-tile--active': cartoonAvatar.face === option.value,
                                }"
                                @click="cartoonAvatar.face = option.value"
                              >
                                <img
                                  :src="createAvatarOptionPreview({ face: option.value })"
                                  :alt="option.label"
                                  class="avatar-tile__preview avatar-tile__preview--face"
                                />
                                <strong>{{ option.label }}</strong>
                              </button>
                            </div>
                          </section>
                        </q-tab-panel>

                        <q-tab-panel name="hair" class="avatar-editor__panel">
                          <section class="avatar-control-card">
                            <div class="avatar-control-card__header">
                              <h4>{{ $t('profile.avatar.hair') }}</h4>
                              <span>{{ selectedHairLabel }}</span>
                            </div>
                            <div class="avatar-tile-grid avatar-tile-grid--quad">
                              <button
                                v-for="option in hairStyleOptions"
                                :key="option.value"
                                type="button"
                                class="avatar-tile"
                                :class="{
                                  'avatar-tile--active': cartoonAvatar.hair === option.value,
                                }"
                                @click="cartoonAvatar.hair = option.value"
                              >
                                <img
                                  :src="createAvatarOptionPreview({ hair: option.value })"
                                  :alt="option.label"
                                  class="avatar-tile__preview avatar-tile__preview--face"
                                />
                                <strong>{{ option.label }}</strong>
                              </button>
                            </div>
                          </section>

                          <section class="avatar-control-card">
                            <div class="avatar-control-card__header">
                              <h4>{{ $t('profile.avatar.hairColor') }}</h4>
                              <span>{{ selectedHairColorLabel }}</span>
                            </div>
                            <div class="avatar-swatch-grid">
                              <button
                                v-for="option in hairColorOptions"
                                :key="option.value"
                                type="button"
                                class="avatar-swatch"
                                :class="{
                                  'avatar-swatch--active': cartoonAvatar.hairColor === option.value,
                                }"
                                :style="{ '--avatar-swatch-color': option.swatch || '#e5e7eb' }"
                                :aria-label="option.label"
                                @click="cartoonAvatar.hairColor = option.value"
                              />
                            </div>
                          </section>
                        </q-tab-panel>

                        <q-tab-panel name="accessory" class="avatar-editor__panel">
                          <section class="avatar-control-card">
                            <div class="avatar-control-card__header">
                              <h4>Accessory color</h4>
                              <span>{{ selectedAccessoryColorLabel }}</span>
                            </div>
                            <div class="avatar-swatch-grid">
                              <button
                                v-for="option in accessoryColorOptions"
                                :key="option.value"
                                type="button"
                                class="avatar-swatch"
                                :class="{
                                  'avatar-swatch--active':
                                    cartoonAvatar.accessoryColor === option.value,
                                }"
                                :style="{ '--avatar-swatch-color': option.swatch || '#e5e7eb' }"
                                :aria-label="option.label"
                                @click="cartoonAvatar.accessoryColor = option.value"
                              />
                            </div>
                          </section>

                          <section class="avatar-control-card">
                            <div class="avatar-control-card__header">
                              <h4>{{ $t('profile.avatar.shoes') }}</h4>
                              <span>{{ selectedAccessoryLabel }}</span>
                            </div>
                            <div class="avatar-tile-grid avatar-tile-grid--quad">
                              <button
                                v-for="option in accessoryOptions"
                                :key="option.value"
                                type="button"
                                class="avatar-tile"
                                :class="{
                                  'avatar-tile--active': cartoonAvatar.shoes === option.value,
                                }"
                                @click="cartoonAvatar.shoes = option.value"
                              >
                                <img
                                  :src="createAvatarOptionPreview({ shoes: option.value })"
                                  :alt="option.label"
                                  class="avatar-tile__preview avatar-tile__preview--face"
                                />
                                <strong>{{ option.label }}</strong>
                              </button>
                            </div>
                          </section>
                        </q-tab-panel>

                        <q-tab-panel name="top" class="avatar-editor__panel">
                          <section class="avatar-control-card">
                            <div class="avatar-control-card__header">
                              <h4>{{ $t('profile.avatar.shirt') }}</h4>
                              <span>{{ selectedTopLabel }}</span>
                            </div>
                            <div class="avatar-tile-grid avatar-tile-grid--quad">
                              <button
                                v-for="option in topStyleOptions"
                                :key="option.value"
                                type="button"
                                class="avatar-tile avatar-tile--body"
                                :class="{
                                  'avatar-tile--active': cartoonAvatar.shirt === option.value,
                                }"
                                @click="cartoonAvatar.shirt = option.value"
                              >
                                <img
                                  :src="createAvatarOptionPreview({ shirt: option.value })"
                                  :alt="option.label"
                                  class="avatar-tile__preview"
                                />
                                <strong>{{ option.label }}</strong>
                              </button>
                            </div>
                          </section>

                          <section class="avatar-control-card">
                            <div class="avatar-control-card__header">
                              <h4>{{ $t('profile.avatar.shirtColor') }}</h4>
                              <span>{{ selectedTopColorLabel }}</span>
                            </div>
                            <div class="avatar-swatch-grid">
                              <button
                                v-for="option in topColorOptions"
                                :key="option.value"
                                type="button"
                                class="avatar-swatch"
                                :class="{
                                  'avatar-swatch--active':
                                    cartoonAvatar.shirtColor === option.value,
                                }"
                                :style="{ '--avatar-swatch-color': option.swatch || '#e5e7eb' }"
                                :aria-label="option.label"
                                @click="cartoonAvatar.shirtColor = option.value"
                              />
                            </div>
                          </section>
                        </q-tab-panel>

                        <q-tab-panel name="background" class="avatar-editor__panel">
                          <section class="avatar-control-card">
                            <div class="avatar-control-card__header">
                              <h4>{{ $t('profile.avatar.pantsColor') }}</h4>
                              <span>{{ selectedBackdropLabel }}</span>
                            </div>
                            <div class="avatar-swatch-grid">
                              <button
                                v-for="option in backdropOptions"
                                :key="option.value"
                                type="button"
                                class="avatar-swatch avatar-swatch--large"
                                :class="{
                                  'avatar-swatch--active':
                                    cartoonAvatar.pantsColor === option.value,
                                }"
                                :style="{ '--avatar-swatch-color': option.swatch || '#e5e7eb' }"
                                :aria-label="option.label"
                                @click="cartoonAvatar.pantsColor = option.value"
                              />
                            </div>
                          </section>
                        </q-tab-panel>
                      </q-tab-panels>
                    </div>
                    <div class="avatar-editor__hint">
                      {{ $t('profile.avatar.hint') }}
                    </div>

                    <q-btn
                      outline
                      :label="$t('profile.avatar.random')"
                      class="full-width q-mt-md"
                      color="grey-7"
                      @click="randomizeCartoonAvatar"
                    />
                    <BaseButton
                      color="primary"
                      :label="$t('profile.personal.save')"
                      no-caps
                      hover-lift
                      class="full-width q-mt-sm"
                      @click="confirmSaveCartoonAvatar"
                    />
                  </q-card>
                </section>

                <q-separator class="q-my-xl" />

                <!-- Skill Mapping -->
                <section class="skill-section">
                  <p class="orange-text text-weight-bold">
                    {{ $t('profile.personal.skillMapping') }}
                  </p>
                  <h2 class="text-dark">{{ $t('profile.personal.skillMappingTitle') }}</h2>
                  <p class="text-grey-7">
                    {{ $t('profile.personal.skillMappingSub') }}
                  </p>

                  <div class="skill-radar-card shadow-1">
                    <div class="skill-radar-card__meta">
                      <div>
                        <p class="skill-radar-card__eyebrow">Skill Spider</p>
                        <div class="skill-radar-card__average">
                          {{ formatSkillScore(overallSkillAverage) }}
                          <span>/{{ RADAR_MAX_SCORE }}</span>
                        </div>
                      </div>
                      <div class="skill-radar-card__meta-copy">
                        Skill summary across {{ allSkillMetrics.length }} areas
                      </div>
                    </div>

                    <div class="skill-radar-card__chips">
                      <div
                        v-for="category in skillCategoryAverages"
                        :key="category.shortTitle"
                        class="skill-radar-chip"
                      >
                        <span
                          class="skill-radar-chip__dot"
                          :style="{ backgroundColor: category.accent }"
                        />
                        <span>{{ category.shortTitle }}</span>
                        <strong
                          >{{ formatSkillScore(category.average) }}/{{ RADAR_MAX_SCORE }}</strong
                        >
                      </div>
                    </div>

                    <div class="skill-radar-layout">
                      <div class="skill-radar-figure">
                        <svg
                          class="skill-radar-svg"
                          viewBox="0 0 420 420"
                          role="img"
                          aria-label="Skill spider chart"
                        >
                          <defs>
                            <linearGradient
                              id="skill-radar-fill"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="100%"
                            >
                              <stop offset="0%" stop-color="#f5a623" stop-opacity="0.34" />
                              <stop offset="100%" stop-color="#3aa6b9" stop-opacity="0.16" />
                            </linearGradient>
                          </defs>

                          <path
                            v-for="grid in radarGridPaths"
                            :key="`grid-${grid.level}`"
                            :d="grid.path"
                            class="skill-radar-svg__grid"
                          />
                          <line
                            v-for="axis in radarAxisItems"
                            :key="`axis-${axis.id}`"
                            :x1="RADAR_CENTER_X"
                            :y1="RADAR_CENTER_Y"
                            :x2="axis.axisPoint.x"
                            :y2="axis.axisPoint.y"
                            class="skill-radar-svg__axis"
                          />
                          <path :d="radarDataPath" class="skill-radar-svg__area" />
                          <path :d="radarDataPath" class="skill-radar-svg__outline" />

                          <circle cx="210" cy="200" r="38" class="skill-radar-svg__center" />
                          <text x="210" y="190" class="skill-radar-svg__center-label">AVG</text>
                          <text x="210" y="216" class="skill-radar-svg__center-value">
                            {{ formatSkillScore(overallSkillAverage) }}
                          </text>

                          <text
                            v-for="scale in radarScaleLabels"
                            :key="`scale-${scale.level}`"
                            :x="scale.x"
                            :y="scale.y"
                            class="skill-radar-svg__scale"
                          >
                            {{ scale.level }}
                          </text>

                          <g v-for="axis in radarAxisItems" :key="axis.id">
                            <circle
                              :cx="axis.valuePoint.x"
                              :cy="axis.valuePoint.y"
                              r="5.5"
                              class="skill-radar-svg__point"
                            />
                            <g :transform="`translate(${axis.badgePoint.x} ${axis.badgePoint.y})`">
                              <circle
                                r="13"
                                class="skill-radar-svg__badge"
                                :style="{ fill: axis.accent }"
                              />
                              <text class="skill-radar-svg__badge-label">
                                {{ axis.index + 1 }}
                              </text>
                            </g>
                          </g>
                        </svg>
                      </div>

                      <div class="skill-radar-legend">
                        <div class="skill-radar-legend__title">Skill list</div>
                        <div class="skill-radar-legend__items">
                          <div
                            v-for="axis in radarAxisItems"
                            :key="`legend-${axis.id}`"
                            class="skill-radar-legend__item"
                          >
                            <span
                              class="skill-radar-legend__index"
                              :style="{ backgroundColor: axis.accent }"
                            >
                              {{ axis.index + 1 }}
                            </span>
                            <div class="skill-radar-legend__copy">
                              <strong>{{ axis.shortLabel }}</strong>
                              <span
                                >{{ axis.categoryShortTitle }} -
                                {{ formatSkillScore(axis.score) }}/5</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- Score Cards -->
                <section class="score-section">
                  <h2 class="text-dark">{{ $t('profile.personal.currentSkills') }}</h2>

                  <div class="score-grid">
                    <div
                      v-for="cat in skillCategories"
                      :key="cat.title"
                      class="skill-card shadow-1"
                      :style="{ '--skill-card-accent': cat.accent }"
                    >
                      <div class="skill-card__header">
                        <h3>{{ cat.title }}</h3>
                        <div class="skill-card__badge">
                          {{ formatSkillScore(getAverageSkillScore(cat.items)) }}/{{
                            RADAR_MAX_SCORE
                          }}
                        </div>
                      </div>
                      <div class="skill-inner">
                        <div v-for="item in cat.items" :key="item.id" class="skill-item">
                          <strong class="text-dark">{{ item.label }}</strong>
                          <div class="score-box">
                            <div class="score-box__track">
                              <div
                                class="score-box__fill"
                                :style="{ width: `${(item.score / RADAR_MAX_SCORE) * 100}%` }"
                              />
                            </div>
                            <span class="score-box__value">
                              {{ formatSkillScore(item.score) }}/{{ RADAR_MAX_SCORE }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <!-- Benefits Tab -->
              <div v-else-if="activeMenu === 'benefits'">
                <div class="row items-center justify-between q-mb-lg benefits-section-header">
                  <div>
                    <div class="text-h5 text-weight-bolder text-primary">
                      {{ $t('profile.benefits.title') }}
                    </div>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      {{ $t('profile.benefits.subtitle') }}
                    </div>
                  </div>

                  <BaseButton
                    color="primary"
                    icon="refresh"
                    :label="$t('profile.benefits.refresh')"
                    no-caps
                    hover-lift
                    :loading="isRefreshingBenefits"
                    @click="refreshBenefits"
                  />
                </div>

                <q-card flat bordered class="benefits-check-card">
                  <div class="benefits-check-card__stripe" />
                  <q-card-section class="q-pa-lg">
                    <div class="benefits-check-card__eyebrow">
                      {{ $t('profile.benefits.status') }}
                    </div>
                    <div class="text-h6 text-weight-bolder text-dark q-mt-sm">
                      {{ $t('profile.benefits.verified') }}
                    </div>
                    <div class="text-body1 text-grey-8 q-mt-md">
                      {{ $t('profile.benefits.citizenId') }}
                      <span class="text-weight-bold">{{ maskedCitizenId }}</span>
                      {{ $t('profile.benefits.accountFor') }}
                      <span class="text-weight-bold">{{
                        locale === 'th' ? studentFullNameTh : studentFullNameEn
                      }}</span>
                    </div>

                    <div class="benefits-check-card__verified row items-center q-gutter-sm q-mt-lg">
                      <q-icon name="check_circle" color="positive" size="24px" />
                      <div class="text-weight-bold text-dark">
                        {{ activeBenefitLabel }}
                      </div>
                    </div>
                  </q-card-section>

                  <q-separator />

                  <q-card-section class="benefits-check-card__footer q-pa-md">
                    <div class="row items-center q-col-gutter-md">
                      <div class="col-12 col-md">
                        <div
                          class="row items-center q-gutter-sm text-deep-orange-8 text-weight-bold"
                        >
                          <q-icon name="schedule" size="20px" />
                          <span
                            >{{ $t('profile.benefits.checkedAt') }}
                            {{ benefitsCheckedAtLabel }}</span
                          >
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Instructor Chat Tab -->
              <div v-else-if="activeMenu === 'chat'">
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

                <div
                  v-if="myRegisteredCourseEntries.length > 0"
                  class="row q-col-gutter-lg chat-layout"
                >
                  <div class="col-12 col-md-4">
                    <div class="course-list-header q-mb-sm">
                      <div class="text-caption text-weight-bold text-grey-7">
                        {{ $t('profile.chat.coursePicker') }}
                      </div>
                      <q-badge rounded color="primary" :label="myRegisteredCourseEntries.length" />
                    </div>

                    <div class="column q-gutter-sm chat-course-list">
                      <q-card
                        v-for="entry in myRegisteredCourseEntries"
                        :key="entry.registration.id"
                        flat
                        bordered
                        class="chat-course-card cursor-pointer"
                        :class="{
                          'chat-course-card--active': selectedChatCourseId === entry.course.id,
                        }"
                        @click="selectChatCourse(entry.course.id)"
                      >
                        <div class="chat-course-card__stripe" />
                        <q-card-section class="row items-start no-wrap q-gutter-md q-pa-md">
                          <div class="chat-course-card__thumb">
                            <CourseCoverImage
                              :course="entry.course"
                              fill
                              instant
                              loading="eager"
                              class="chat-course-card__cover"
                            />
                          </div>

                          <div class="col">
                            <div class="text-caption text-grey-6">{{ entry.course.code }}</div>
                            <div class="chat-course-card__title text-weight-bolder text-dark">
                              {{ getTranslatedCourseTitle(entry.course) }}
                            </div>
                            <div
                              class="row items-center q-gutter-xs q-mt-sm text-caption text-grey-6"
                            >
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
                            <div class="text-caption text-grey-6">
                              {{ $t('profile.chat.roomTitle') }}
                            </div>
                            <div class="text-subtitle1 text-weight-bolder text-dark">
                              {{ selectedChatEntry?.course.code }} :
                              {{
                                selectedChatEntry
                                  ? getTranslatedCourseTitle(selectedChatEntry.course)
                                  : ''
                              }}
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
                            v-if="message.sender === 'system'"
                            size="34px"
                            color="blue-grey-1"
                            text-color="blue-grey-8"
                          >
                            <q-icon name="support_agent" size="20px" />
                          </q-avatar>

                          <div class="chat-message__bubble">
                            <div class="chat-message__body">{{ message.body }}</div>
                            <div class="chat-message__time">
                              {{ formatChatMessageTime(message.sentAt) }}
                            </div>
                            <div
                              v-if="message.sender === 'learner' && isLatestLearnerMessage(message)"
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

              <!-- Enrollment Dialog for Saved Courses -->
              <CourseEnrollmentDialog
                :course="savedEnrollmentDialogCourse"
                :open-key="savedEnrollmentDialogOpenKey"
                @enrolled="onSavedCourseEnrolled"
                @go-to-learning="(id) => goToCourse(id, savedEnrollmentDialogCourse?.code)"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- โ”€โ”€โ”€ CONFIRM UNREGISTER DIALOG โ”€โ”€โ”€ -->
    <q-dialog v-model="showUnregisterDialog" transition-show="scale" transition-hide="scale">
      <q-card class="modern-card unregister-dialog-card">
        <q-card-section class="q-pa-xl text-center">
          <div class="unregister-icon-wrap q-mx-auto q-mb-lg">
            <q-icon name="warning_amber" size="40px" color="negative" />
          </div>
          <div class="text-h6 text-weight-bolder text-dark">
            {{ $t('profile.dialogs.unregisterTitle') }}
          </div>
          <div class="text-grey-7 q-mt-sm">{{ $t('profile.dialogs.unregisterSub') }}</div>
          <div v-if="courseToUnregister" class="q-mt-md q-pa-sm bg-grey-1 rounded-borders">
            <div class="text-weight-bold text-dark">
              {{
                getTranslatedCourseTitleByInfo(
                  courseToUnregister.courseCode,
                  courseToUnregister.courseTitle,
                )
              }}
            </div>
            <div class="text-caption text-grey-6">{{ courseToUnregister.courseCode }}</div>
          </div>
          <div
            class="text-caption text-negative q-mt-md row items-center justify-center q-gutter-xs"
          >
            <q-icon name="info" size="14px" />
            <span>{{ $t('profile.dialogs.irreversible') }}</span>
          </div>
        </q-card-section>

        <q-card-actions class="unregister-dialog-card__actions q-px-lg q-pb-lg">
          <BaseButton
            outline
            :label="$t('profile.dialogs.notNow')"
            color="grey-7"
            no-caps
            class="unregister-dialog-card__button"
            @click="cancelUnregister"
          />
          <BaseButton
            :label="$t('profile.dialogs.confirmUnregister')"
            color="negative"
            no-caps
            class="unregister-dialog-card__button"
            @click="confirmUnregister"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- โ”€โ”€โ”€ AVATAR CROP DIALOG โ”€โ”€โ”€ -->
    <q-dialog
      v-model="showSaveConfirmDialog"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card class="modern-card unregister-dialog-card">
        <q-card-section class="q-pa-xl text-center">
          <div class="unregister-icon-wrap q-mx-auto q-mb-lg">
            <q-icon name="save" size="36px" color="amber-8" />
          </div>
          <div class="text-h6 text-weight-bolder text-dark">
            {{ saveConfirmTitle }}
          </div>
          <div class="text-grey-7 q-mt-sm">{{ saveConfirmMessage }}</div>
        </q-card-section>

        <q-card-actions class="unregister-dialog-card__actions q-px-lg q-pb-lg">
          <BaseButton
            outline
            :label="$t('profile.dialogs.notNow')"
            color="grey-7"
            no-caps
            class="unregister-dialog-card__button"
            @click="cancelSaveConfirmation"
          />
          <BaseButton
            :label="$t('profile.personal.save')"
            color="amber-6"
            no-caps
            class="unregister-dialog-card__button"
            @click="confirmSaveConfirmation"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showCropDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card class="crop-dialog">
        <q-card-section class="crop-dialog__header q-pa-md row items-center">
          <q-icon name="crop" size="24px" color="primary" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-bold">{{ $t('profile.dialogs.cropAvatar') }}</div>
          <q-space />
          <q-btn flat round dense icon="close" color="grey-7" @click="cancelCrop" />
        </q-card-section>

        <q-card-section class="crop-dialog__body q-pa-none">
          <div
            ref="cropArea"
            class="crop-dialog__viewport"
            @mousedown="onCropMouseDown"
            @mousemove="onCropMouseMove"
            @mouseup="onCropMouseUp"
            @mouseleave="onCropMouseUp"
            @touchstart.prevent="onCropTouchStart"
            @touchmove.prevent="onCropTouchMove"
            @touchend="onCropTouchEnd"
            @wheel.prevent="onCropWheel"
          >
            <div class="crop-dialog__image-container">
              <img
                v-if="cropImageSrc"
                ref="cropImage"
                :src="cropImageSrc"
                class="crop-dialog__image"
                :style="cropImageStyle"
                draggable="false"
                @load="onCropImageLoad"
              />
            </div>
            <div class="crop-dialog__circle-mask" />
          </div>
        </q-card-section>

        <q-card-section class="q-px-lg q-py-md">
          <div class="row items-center q-gutter-sm">
            <q-icon name="photo_size_select_small" color="grey-6" size="20px" />
            <q-slider
              v-model="cropZoom"
              :min="1"
              :max="3"
              :step="0.01"
              color="primary"
              class="col"
            />
            <q-icon name="photo_size_select_large" color="grey-6" size="20px" />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-lg q-pb-lg">
          <q-btn flat :label="$t('quiz.cancel')" color="grey-7" no-caps @click="cancelCrop" />
          <q-btn
            unelevated
            rounded
            :label="$t('profile.dialogs.saveAvatar')"
            color="primary"
            icon="save"
            no-caps
            padding="sm lg"
            @click="saveCroppedAvatar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- โ”€โ”€โ”€ STUDENT CARD DIALOG โ”€โ”€โ”€ -->
    <q-dialog v-model="showStudentCardDialog" transition-show="scale" transition-hide="scale">
      <q-card class="student-card-dialog">
        <q-card-section class="student-card-dialog__content">
          <q-btn
            flat
            round
            dense
            icon="close"
            color="grey-7"
            class="student-card-dialog__close"
            v-close-popup
          />

          <div class="student-card-dialog__brand-row">
            <img
              src="~assets/brand/buu-lll-logo.png"
              class="student-card-dialog__logo"
              alt="BUU LLL logo"
              loading="eager"
              decoding="sync"
            />
            <q-badge rounded color="positive" class="student-card-dialog__status">
              Active Learner
            </q-badge>
          </div>

          <div class="student-card-dialog__header text-center">
            <div class="text-h5 text-weight-bolder text-dark">
              {{ $t('profile.menu.studentCard') }}
            </div>
            <div class="student-card-dialog__title-en">Lifelong Learning Burapha University</div>
            <div class="student-card-dialog__student-code">
              {{ $t('profile.hero.studentId') }} {{ authStore.user?.studentId }}
            </div>
          </div>

          <div class="student-card-dialog__body">
            <div class="student-card-dialog__avatar-shell">
              <q-avatar size="150px" class="student-card-dialog__avatar">
                <img
                  v-if="currentAvatarUrl"
                  :src="currentAvatarUrl"
                  class="student-card-dialog__avatar-image"
                  alt="Profile avatar"
                  loading="eager"
                  decoding="sync"
                />
                <q-icon v-else name="person" size="84px" color="white" />
              </q-avatar>
            </div>

            <div class="student-card-dialog__details">
              <div class="student-card-dialog__detail-row">
                <span>{{ $t('profile.personal.firstNameTh') }}</span>
                <strong>{{ studentFullNameTh }}</strong>
              </div>
              <div class="student-card-dialog__detail-row">
                <span>Name</span>
                <strong>{{ studentFullNameEn }}</strong>
              </div>
              <div class="student-card-dialog__detail-row">
                <span>USERNAME</span>
                <strong>{{ authStore.user?.email }}</strong>
              </div>
              <div class="student-card-dialog__detail-row">
                <span>Faculty</span>
                <strong>{{ authStore.user?.faculty }}</strong>
              </div>
            </div>
          </div>

          <div class="student-card-dialog__footer">
            <span>{{ $t('registrationDate') }} {{ learnerRegisteredDate }}</span>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- โ”€โ”€โ”€ FULL AVATAR DIALOG โ”€โ”€โ”€ -->
    <q-dialog v-model="showFullAvatar" transition-show="scale" transition-hide="scale">
      <q-card class="full-avatar-dialog">
        <q-btn
          flat
          round
          dense
          icon="close"
          color="white"
          class="full-avatar-dialog__close"
          v-close-popup
        />
        <img
          v-if="displayAvatarUrl"
          :src="displayAvatarUrl"
          class="full-avatar-dialog__image"
          alt="Profile image"
        />
        <q-icon v-else name="person" size="160px" color="white" class="q-pa-xl" />
      </q-card>
    </q-dialog>

    <ReceiptCard
      ref="receiptDialogRef"
      v-model="showReceiptDialog"
      :receipt-id="receiptId"
      :issued-at="selectedPayment?.paymentDate ?? null"
      :customer-name="receiptCustomerName"
      :customer-tax-id="selectedPayment?.taxId ?? ''"
      :customer-address="selectedPayment?.customerAddress ?? ''"
      :show-customer="true"
      :course-title="
        getTranslatedCourseTitleByInfo(selectedPayment?.courseCode, selectedPayment?.courseTitle)
      "
      :course-code="selectedPayment?.courseCode || ''"
      :amount="selectedPayment?.amount ?? 0"
      :is-copy="false"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, nextTick, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  useCourseRegistrationStore,
  type CourseRegistration,
} from 'src/stores/course-registration-store';
import { useCoursePaymentStore, type CoursePaymentRecord } from 'src/stores/course-payment-store';
import { useCourseBookmarkStore, type CourseBookmark } from 'src/stores/course-bookmark-store';
import BaseButton from 'components/base/BaseButton.vue';
import GoldenUnderline from 'src/components/common/GoldenUnderline.vue';
import ProfileCourseCard from 'components/profile/ProfileCourseCard.vue';
import CourseCompletionDocumentActions from 'components/course/CourseCompletionDocumentActions.vue';
import {
  useMyRegisteredCourses,
  type RegisteredCourseEntry,
} from 'src/composables/use-my-registered-courses';
import type { Course } from 'src/types/course';
import type { CourseDetail } from 'src/types/course-detail';
import CourseEnrollmentDialog from 'components/course/CourseEnrollmentDialog.vue';
import ReceiptCard from 'components/receipt/receipt-card.vue';
import { useAuthStore, type User, type UserProfileUpdate } from 'src/stores/auth-store';
import { useCourseStore } from 'src/stores/course-store';

import { useProfileAvatar } from 'src/composables/use-profile-avatar';
import {
  useProfileSkills,
  RADAR_MAX_SCORE,
  RADAR_CENTER_X,
  RADAR_CENTER_Y,
} from 'src/composables/use-profile-skills';
import { useAvatarCrop } from 'src/composables/use-avatar-crop';
import { useProfileChat } from 'src/composables/use-profile-chat';
import { useProfileNavigation } from 'src/composables/use-profile-navigation';

interface ProfileStatCardItem {
  label: string;
  value: number;
  icon: string;
  tone: Record<string, string>;
}

interface MenuItem {
  label: string;
  value: string;
  icon: string;
}

const { t, locale } = useI18n();
const $q = useQuasar();
const router = useRouter();
const courseRegistrationStore = useCourseRegistrationStore();
const coursePaymentStore = useCoursePaymentStore();
const courseBookmarkStore = useCourseBookmarkStore();
const authStore = useAuthStore();
const courseStore = useCourseStore();
courseStore.init();
const {
  myRegistrations,
  myRegisteredCourseEntries,
  getRegistrationByCourseId,
  getRegisteredCourseEntry,
} = useMyRegisteredCourses();

const isTeachingRole = computed(
  () => authStore.user?.role === 'teach' || authStore.user?.role === 'instructor',
);
const activeMenu = ref('my-courses');
const profileContentRef = ref<HTMLElement | null>(null);
const courseSearch = ref('');
const savedCourseSearch = ref('');
const showUnregisterDialog = ref(false);
const showSaveConfirmDialog = ref(false);
const courseToUnregister = ref<CourseRegistration | null>(null);
const saveConfirmTitle = ref('');
const saveConfirmMessage = ref('');
const pendingSaveAction = ref<(() => void) | null>(null);
const showFullAvatar = ref(false);
const showStudentCardDialog = ref(false);
const pendingFullAvatarSrc = ref<string | null>(null);
const isRefreshingBenefits = ref(false);
const isSavingProfile = ref(false);
const benefitsCheckedAt = ref(new Date('2026-04-29T10:52:45+07:00'));
const savedEnrollmentDialogCourse = ref<CourseDetail | null>(null);
const savedEnrollmentDialogOpenKey = ref(0);

const form = reactive<UserProfileUpdate>({
  firstNameTh: '',
  lastNameTh: '',
  firstNameEn: '',
  lastNameEn: '',
  phone: '',
});

const {
  activeAvatarTab,
  fullAvatarUrl,
  cartoonAvatar,
  skinToneOptions,
  eyeColorOptions,
  eyeOptions,
  hairStyleOptions,
  hairColorOptions,
  topStyleOptions,
  topColorOptions,
  bodyStyleOptions,
  backdropOptions,
  accessoryColorOptions,
  accessoryOptions,
  selectedSkinLabel,
  selectedEyeColorLabel,
  selectedEyesLabel,
  selectedHairLabel,
  selectedHairColorLabel,
  selectedTopLabel,
  selectedTopColorLabel,
  selectedBodyLabel,
  selectedBackdropLabel,
  selectedAccessoryColorLabel,
  selectedAccessoryLabel,
  avatarPreviewUrl,
  createAvatarOptionPreview,
  randomizeCartoonAvatar,
  saveCartoonAvatar,
} = useProfileAvatar();

const {
  skillCategories,
  allSkillMetrics,
  overallSkillAverage,
  skillCategoryAverages,
  radarGridPaths,
  radarAxisItems,
  radarDataPath,
  radarScaleLabels,
  formatSkillScore,
  getAverageSkillScore,
} = useProfileSkills();

const {
  showCropDialog,
  cropImageSrc,
  cropZoom,
  cropImage,
  avatarInput,
  cropImageStyle,
  triggerAvatarUpload,
  onAvatarSelected,
  onCropImageLoad,
  onCropMouseDown,
  onCropMouseMove,
  onCropMouseUp,
  onCropTouchStart,
  onCropTouchMove,
  onCropTouchEnd,
  onCropWheel,
  cancelCrop,
  saveCroppedAvatar,
} = useAvatarCrop(fullAvatarUrl, pendingFullAvatarSrc);

const {
  selectedChatCourseId,
  chatDraft,
  chatMessagesRef,
  selectedChatEntry,
  chatThreadMessages,
  canSendChatMessage,
  sendChatMessage,
  selectChatCourse,
  formatChatMessageTime,
  getChatStatusLabel,
  getChatStatusIcon,
  isLatestLearnerMessage,
} = useProfileChat(myRegistrations, myRegisteredCourseEntries, activeMenu);

const {
  goToCourse,
  goToInstructorCourses,
  goToInstructorStudents,
  goToInstructorLearningResults,
  goToInstructorCertificates,
  goToInstructorCourseWorkspace,
  goToInstructorCertificateCourse,
} = useProfileNavigation();

const DEFAULT_COVER = {
  icon: 'auto_stories',
  accentColor: '#f5a623',
  backgroundColor: '#1e3a5f',
};

const menuItems = computed<MenuItem[]>(() => [
  { label: t('profile.menu.myCourses'), value: 'my-courses', icon: 'menu_book' },
  { label: t('profile.menu.savedCourses'), value: 'saved-courses', icon: 'bookmark' },
  { label: t('profile.menu.personalInfo'), value: 'personal-info', icon: 'person' },
  { label: t('profile.menu.benefits'), value: 'benefits', icon: 'card_giftcard' },
  { label: t('profile.menu.chat'), value: 'chat', icon: 'chat' },
]);

const selectedPayment = ref<CoursePaymentRecord | null>(null);
const showReceiptDialog = ref(false);
const receiptDialogRef = ref<InstanceType<typeof ReceiptCard> | null>(null);

const receiptId = computed(() => selectedPayment.value?.receiptId || '');
const receiptCustomerName = computed(() => {
  if (selectedPayment.value?.customerName) {
    return selectedPayment.value.customerName;
  }

  const thaiName = `${form.firstNameTh} ${form.lastNameTh}`.trim();
  const englishName = `${form.firstNameEn} ${form.lastNameEn}`.trim();

  if (locale.value === 'th') {
    return thaiName || englishName;
  }

  return englishName || thaiName;
});

const currentAvatarUrl = computed<string>(() => authStore.user?.avatar || '');
const displayAvatarUrl = computed<string>(() => fullAvatarUrl.value || currentAvatarUrl.value);
const studentFullNameTh = computed<string>(() =>
  `${authStore.user?.firstNameTh ?? ''} ${authStore.user?.lastNameTh ?? ''}`.trim(),
);
const studentFullNameEn = computed<string>(() =>
  `${authStore.user?.firstNameEn ?? ''} ${authStore.user?.lastNameEn ?? ''}`.trim(),
);
const learnerRegisteredDate = computed<string>(() =>
  formatThaiBuddhistDate('2026-04-27T00:00:00+07:00'),
);
const activeBenefitLabel = computed<string>(() => t('profile.benefits.activeStudent'));
const benefitsCheckedAtLabel = computed<string>(() => formatThaiDateTime(benefitsCheckedAt.value));
const maskedCitizenId = computed<string>(() => '121990096xxxx');

const heroRoleLabel = computed(() => {
  if (authStore.user?.role === 'admin') return t('profile.roles.admin');
  if (authStore.user?.role === 'teach' || authStore.user?.role === 'instructor')
    return t('profile.roles.instructor');
  if (authStore.user?.role === 'finance') return t('profile.roles.finance');
  if (authStore.user?.role === 'central_finance') return t('profile.roles.central_finance');
  return t('profile.hero.learner');
});

watch(activeMenu, () => {
  scrollToProfileContentTop();
});

async function downloadReceipt(payment: CoursePaymentRecord) {
  selectedPayment.value = payment;
  await nextTick();
  if (receiptDialogRef.value) {
    receiptDialogRef.value.downloadReceiptPdf();
  }
}

function getPaymentForCourse(courseId: string): CoursePaymentRecord | undefined {
  return coursePaymentStore.myPayments.find((p) => p.courseId === courseId);
}

async function downloadReceiptByCourseId(courseId: string) {
  const payment = getPaymentForCourse(courseId);
  if (payment) {
    await downloadReceipt(payment);
  }
}

function openPendingPayment(courseId: string): void {
  const course = getCourseDetailById(courseId);
  if (course) {
    savedEnrollmentDialogCourse.value = course;
    savedEnrollmentDialogOpenKey.value += 1;
  }
}

function getHeaderHeight(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  const headerElement = document.querySelector<HTMLElement>('.q-header');
  return headerElement?.offsetHeight ?? 0;
}

function scrollToProfileContentTop(): void {
  if (typeof window === 'undefined' || !profileContentRef.value) {
    return;
  }

  void nextTick(() => {
    if (!profileContentRef.value) {
      return;
    }

    const headerHeight = getHeaderHeight();
    const sectionTop = profileContentRef.value.getBoundingClientRect().top + window.scrollY;
    const targetTop = Math.max(0, sectionTop - headerHeight - 8);

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth',
    });
  });
}

function openSaveConfirmationDialog(title: string, message: string, onConfirm: () => void): void {
  saveConfirmTitle.value = title;
  saveConfirmMessage.value = message;
  pendingSaveAction.value = onConfirm;
  showSaveConfirmDialog.value = true;
}

function cancelSaveConfirmation(): void {
  showSaveConfirmDialog.value = false;
  pendingSaveAction.value = null;
}

function confirmSaveConfirmation(): void {
  const action = pendingSaveAction.value;
  showSaveConfirmDialog.value = false;
  pendingSaveAction.value = null;
  action?.();
}

function confirmSaveCartoonAvatar(): void {
  openSaveConfirmationDialog(
    t('profile.dialogs.confirmAvatarTitle'),
    t('profile.dialogs.confirmAvatarSub'),
    () => saveCartoonAvatar(),
  );
}

function confirmSavePersonalInfo(): void {
  if (isSavingProfile.value) {
    return;
  }

  if (
    !authStore.user ||
    !form.firstNameTh.trim() ||
    !form.lastNameTh.trim() ||
    !form.firstNameEn.trim() ||
    !form.lastNameEn.trim()
  ) {
    savePersonalInfo();
    return;
  }

  openSaveConfirmationDialog(
    t('profile.dialogs.confirmProfileTitle'),
    t('profile.dialogs.confirmProfileSub'),
    () => savePersonalInfo(),
  );
}

function refreshBenefits(): void {
  if (isRefreshingBenefits.value) {
    return;
  }

  isRefreshingBenefits.value = true;

  window.setTimeout(() => {
    benefitsCheckedAt.value = new Date();
    isRefreshingBenefits.value = false;
    $q.notify({
      type: 'positive',
      message: t('profile.notifications.benefitsRefreshed'),
      position: 'top',
    });
  }, 500);
}

const filteredRegistrations = computed<RegisteredCourseEntry[]>(() => {
  if (!courseSearch.value.trim()) {
    return myRegisteredCourseEntries.value;
  }
  const keyword = courseSearch.value.toLowerCase();
  return myRegisteredCourseEntries.value.filter(
    (entry) =>
      entry.course.title.toLowerCase().includes(keyword) ||
      entry.course.code.toLowerCase().includes(keyword),
  );
});

const inProgressCoursesCount = computed<number>(
  () =>
    myRegisteredCourseEntries.value.filter(
      (entry) => entry.progress.progressPercent > 0 && !entry.progress.isCompleted,
    ).length,
);

const completedCoursesCount = computed<number>(
  () => myRegisteredCourseEntries.value.filter((entry) => entry.progress.isCompleted).length,
);

const instructorCourses = computed<Course[]>(() =>
  courseStore.getInstructorCourses(authStore.user),
);

const activeInstructorCoursesCount = computed<number>(
  () => instructorCourses.value.filter((course) => course.isActive).length,
);

const totalInstructorLearners = computed<number>(() =>
  instructorCourses.value.reduce((sum, course) => sum + course.enrolledCount, 0),
);

const pendingResultCourses = computed<number>(
  () => instructorCourses.value.filter((course) => course.enrolledCount > 0).length,
);

function getCertificateReadyCount(course: Course): number {
  if (course.enrolledCount <= 0) return 0;

  return Array.from({ length: course.enrolledCount }, (_, index): number => {
    const score = (course.id.charCodeAt(0) * 13 + index * 11) % 101;
    return score >= 60 ? 1 : 0;
  }).reduce((sum, value) => sum + value, 0);
}

const certificateReadyLearners = computed<number>(() =>
  instructorCourses.value.reduce((sum, course) => sum + getCertificateReadyCount(course), 0),
);

const generatedCertificateCount = computed<number>(() =>
  Math.floor(certificateReadyLearners.value * 0.35),
);

const pendingCertificateCount = computed<number>(() =>
  Math.max(0, certificateReadyLearners.value - generatedCertificateCount.value),
);

const instructorCoursePreview = computed<Course[]>(() => instructorCourses.value.slice(0, 4));

const instructorOverviewCards = computed(() => [
  {
    label: 'รายวิชาทั้งหมด',
    value: instructorCourses.value.length,
    icon: 'menu_book',
    color: '#F5A623',
  },
  {
    label: 'รายวิชาที่เปิดสอน',
    value: activeInstructorCoursesCount.value,
    icon: 'campaign',
    color: '#31B7C8',
  },
  {
    label: 'ผู้เรียนรวม',
    value: totalInstructorLearners.value,
    icon: 'groups',
    color: '#49B37D',
  },
  {
    label: 'พร้อมออก Certificate',
    value: certificateReadyLearners.value,
    icon: 'workspace_premium',
    color: '#5B7CFA',
  },
]);

function buildProfileStatTone(accent: string): Record<string, string> {
  return {
    '--profile-stat-accent': accent,
    '--profile-stat-accent-strong': withOpacity(accent, 0.88),
    '--profile-stat-border': withOpacity(accent, 0.34),
    '--profile-stat-surface': withOpacity(accent, 0.18),
    '--profile-stat-surface-hover': withOpacity(accent, 0.26),
    '--profile-stat-shadow': withOpacity(accent, 0.22),
  };
}

const profileStats = computed<ProfileStatCardItem[]>(() => {
  if (isTeachingRole.value) {
    return [
      {
        label: 'รายวิชาทั้งหมด',
        value: instructorCourses.value.length,
        icon: 'app_registration',
        tone: buildProfileStatTone('#F5A623'),
      },
      {
        label: 'กำลังเปิดสอน',
        value: activeInstructorCoursesCount.value,
        icon: 'auto_stories',
        tone: buildProfileStatTone('#31B7C8'),
      },
      {
        label: 'ผู้เรียนรวม',
        value: totalInstructorLearners.value,
        icon: 'groups',
        tone: buildProfileStatTone('#49B37D'),
      },
      {
        label: 'รอออก Certificate',
        value: pendingCertificateCount.value,
        icon: 'workspace_premium',
        tone: buildProfileStatTone('#5B7CFA'),
      },
    ];
  }

  return [
    {
      label: t('profile.menu.myCourses'),
      value: myRegistrations.value.length,
      icon: 'app_registration',
      tone: buildProfileStatTone('#F5A623'),
    },
    {
      label: t('profile.courses.inProgress'),
      value: inProgressCoursesCount.value,
      icon: 'auto_stories',
      tone: buildProfileStatTone('#31B7C8'),
    },
    {
      label: t('learning.completed'),
      value: completedCoursesCount.value,
      icon: 'workspace_premium',
      tone: buildProfileStatTone('#49B37D'),
    },
    {
      label: t('creditBank'),
      value: 0,
      icon: 'stars',
      tone: buildProfileStatTone('#5B7CFA'),
    },
  ];
});

watch(
  myRegistrations,
  (registrations) => {
    if (registrations.length === 0) {
      selectedChatCourseId.value = null;
      return;
    }

    const hasSelectedCourse = registrations.some(
      (registration) => registration.courseId === selectedChatCourseId.value,
    );
    if (!hasSelectedCourse) {
      selectedChatCourseId.value = registrations[0]?.courseId ?? null;
    }
  },
  { immediate: true },
);

onMounted(() => {
  // Sync registrations to make sure we have their enrollIds
  if (myRegistrations.value && myRegistrations.value.length > 0) {
    myRegistrations.value.forEach((reg) => {
      if (reg.courseCode && reg.courseId) {
        void courseRegistrationStore.syncEnrollmentFromApi(reg.courseCode, reg.courseId);
      }
    });
  }
});

watch(
  () => authStore.user,
  (user) => {
    syncFormWithUser(user);
  },
  { immediate: true },
);

function syncFormWithUser(user: User | null): void {
  form.firstNameTh = user?.firstNameTh ?? '';
  form.lastNameTh = user?.lastNameTh ?? '';
  form.firstNameEn = user?.firstNameEn ?? '';
  form.lastNameEn = user?.lastNameEn ?? '';
  form.phone = user?.phone ?? '';
}

function getTranslatedCourseTitle(course: { title: string; titleEn?: string }): string {
  if (locale.value === 'th') return course.title;
  return course.titleEn || course.title;
}

function getTranslatedCourseTitleByInfo(code?: string, title?: string): string {
  if (!code || !title) return title || '';
  if (locale.value === 'th') return title;

  // Try to find the course by code to get the English title
  const course = courseStore.courses.find((c: Course) => c.code === code);
  return course?.titleEn || title;
}

function getHydratedBookmarkCourse(bookmark: CourseBookmark) {
  const realCourse = courseStore.courses.find((c) => c.id === bookmark.courseId);
  return {
    ...realCourse,
    title: bookmark.courseTitle,
    imageUrl: bookmark.courseImageUrl || realCourse?.imageUrl || '',
    cover: bookmark.courseCover || realCourse?.cover || DEFAULT_COVER,
    status: realCourse?.status || '',
    deliveryModes: realCourse?.deliveryModes || ([] as string[]),
    isFree: realCourse?.isFree ?? false,
    price: realCourse?.price ?? 0,
    maxSeats: realCourse?.maxSeats ?? 0,
    enrolledCount: realCourse?.enrolledCount ?? 0,
    registrationStartDate: realCourse?.registrationStartDate || '',
    registrationEndDate: realCourse?.registrationEndDate || '',
  };
}

function getCoursePriceLabel(
  course: Pick<Course, 'isFree' | 'price'> | { isFree?: boolean; price?: number },
): string {
  return course.isFree ? t('free') : `THB ${(course.price ?? 0).toLocaleString()}`;
}

function getSavedCourseRegisteredAtLabel(courseId: string): string {
  const registration = getRegistrationByCourseId(courseId);
  if (!registration) {
    return '';
  }

  return `${t('profile.courses.registeredAt')} ${formatDate(registration.registeredAt)}`;
}

function getSavedCourseProgress(courseId: string): RegisteredCourseEntry['progress'] | null {
  const entry = getRegisteredCourseEntry(courseId);

  if (!entry) {
    return null;
  }

  return entry.progress;
}

function getCompletedCourseEntry(courseId: string): RegisteredCourseEntry | null {
  const entry = getRegisteredCourseEntry(courseId);

  if (!entry?.progress.isCompleted) {
    return null;
  }

  return entry;
}

function toggleRegisteredCourseBookmark(registration: CourseRegistration): void {
  const courseDetail = getCourseDetailById(registration.courseId);
  if (!courseDetail) {
    return;
  }

  courseBookmarkStore.toggleBookmark(courseDetail);
}

const filteredSavedCourses = computed(() => {
  const query = savedCourseSearch.value.toLowerCase().trim();
  if (!query) return courseBookmarkStore.myBookmarks;
  return courseBookmarkStore.myBookmarks.filter(
    (b) =>
      b.courseTitle.toLowerCase().includes(query) || b.courseCode.toLowerCase().includes(query),
  );
});

interface SavedCourseAction {
  label: string;
  icon: string;
  color: string;
  disabled: boolean;
}

function parseLocalDate(dateText: string): Date {
  const [year, month, day] = dateText.split('-').map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
}

function getEndOfLocalDate(dateText: string): Date {
  const date = parseLocalDate(dateText);
  date.setHours(23, 59, 59, 999);
  return date;
}

function getSavedCourseAction(bookmark: CourseBookmark): SavedCourseAction {
  const hydrated = getHydratedBookmarkCourse(bookmark);

  // Check registration window
  if (hydrated.registrationStartDate && hydrated.registrationEndDate) {
    const today = new Date();
    const start = parseLocalDate(hydrated.registrationStartDate);
    const end = getEndOfLocalDate(hydrated.registrationEndDate);

    if (today < start) {
      return {
        label: t('courseDetail.regUpcoming'),
        icon: 'schedule',
        color: 'grey-7',
        disabled: true,
      };
    }
    if (today > end) {
      return {
        label: t('courseDetail.regClosed'),
        icon: 'event_busy',
        color: 'grey-7',
        disabled: true,
      };
    }
  }

  // Check if full
  if (hydrated.enrolledCount >= hydrated.maxSeats && hydrated.maxSeats > 0) {
    return { label: t('courseDetail.seatsFull'), icon: 'block', color: 'grey-7', disabled: true };
  }

  return {
    label: t('courseDetail.enrollNow'),
    icon: 'how_to_reg',
    color: 'primary',
    disabled: false,
  };
}

function onSavedCourseEnroll(bookmark: CourseBookmark): void {
  const action = getSavedCourseAction(bookmark);
  if (action.disabled) return;

  const courseDetail = getCourseDetailById(bookmark.courseId);
  if (!courseDetail) return;

  savedEnrollmentDialogCourse.value = courseDetail;
  savedEnrollmentDialogOpenKey.value += 1;
}

function onSavedCourseEnrolled(): void {
  // Enrollment is handled by the dialog component
  // The UI will reactively update because courseRegistrationStore state changed
}

function promptUnregisterFromSaved(bookmark: CourseBookmark): void {
  // Find the matching registration to reuse the existing unregister dialog
  const reg = myRegistrations.value.find((r) => r.courseId === bookmark.courseId);
  if (reg) {
    promptUnregister(reg);
  }
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(locale.value === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatThaiBuddhistDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (locale.value === 'th') {
    const day = date.toLocaleDateString('th-TH', { day: 'numeric' });
    const month = date.toLocaleDateString('th-TH', { month: 'long' });
    const year = date.getFullYear() + 543;
    return `${day} ${month} B.E. ${year}`;
  }
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatThaiDateTime(date: Date): string {
  const isTh = locale.value === 'th';
  const dateLabel = date.toLocaleDateString(isTh ? 'th-TH' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeLabel = date.toLocaleTimeString(isTh ? 'th-TH' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return isTh ? `${dateLabel} at ${timeLabel}` : `${dateLabel} ${timeLabel}`;
}

function savePersonalInfo(): void {
  if (!authStore.user) {
    $q.notify({
      type: 'negative',
      message: t('profile.notifications.userNotFound'),
      position: 'top',
    });
    return;
  }

  const payload: UserProfileUpdate = {
    firstNameTh: form.firstNameTh.trim(),
    lastNameTh: form.lastNameTh.trim(),
    firstNameEn: form.firstNameEn.trim(),
    lastNameEn: form.lastNameEn.trim(),
    phone: form.phone.trim(),
  };

  if (!payload.firstNameTh || !payload.lastNameTh || !payload.firstNameEn || !payload.lastNameEn) {
    $q.notify({
      type: 'warning',
      message: t('profile.notifications.nameRequired'),
      position: 'top',
    });
    return;
  }

  isSavingProfile.value = true;

  try {
    authStore.updateProfile(payload);
    syncFormWithUser(authStore.user);

    $q.notify({
      type: 'positive',
      message: t('profile.notifications.profileSaved'),
      position: 'top',
    });
  } catch (error) {
    console.error('Failed to save personal info', error);
    $q.notify({
      type: 'negative',
      message: t('profile.notifications.profileSaveFailed'),
      position: 'top',
    });
  } finally {
    isSavingProfile.value = false;
  }
}

function promptUnregister(registration: CourseRegistration): void {
  courseToUnregister.value = registration;
  showUnregisterDialog.value = true;
}

function cancelUnregister(): void {
  showUnregisterDialog.value = false;
  courseToUnregister.value = null;
}

function confirmUnregister(): void {
  if (courseToUnregister.value) {
    courseRegistrationStore.unregisterCourse(courseToUnregister.value.courseId);
  }
  showUnregisterDialog.value = false;
  courseToUnregister.value = null;
}

function openFullAvatar(): void {
  showFullAvatar.value = true;
}

function withOpacity(hexColor: string, opacity: number): string {
  const hex = hexColor.replace('#', '');
  const normalized =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => char + char)
          .join('')
      : hex;
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function getCourseDetailById(courseId: string): CourseDetail | null {
  return courseStore.getCourseDetailById(courseId) ?? null;
}
</script>

<style lang="scss" scoped>
// โ”€โ”€ Hero โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
.profile-hero {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #234e70 100%);
  padding: 0;
  overflow: hidden;

  &__particles {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 15% 25%, rgba($primary, 0.3), transparent 40%),
      radial-gradient(circle at 85% 75%, rgba(35, 78, 112, 0.4), transparent 40%),
      radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.04), transparent 60%);
    z-index: 0;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.015) 0px,
        rgba(255, 255, 255, 0.015) 1px,
        transparent 1px,
        transparent 48px
      ),
      repeating-linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.015) 0px,
        rgba(255, 255, 255, 0.015) 1px,
        transparent 1px,
        transparent 48px
      );
    z-index: 0;
  }

  &__content {
    position: relative;
    z-index: 1;
    padding: 52px 24px 44px;
  }

  &__avatar-wrap {
    position: relative;
    z-index: 2;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05);

      .profile-hero__camera {
        opacity: 1;
        transform: scale(1);
      }
    }
  }

  &__avatar {
    background: linear-gradient(135deg, rgba($primary, 0.5), rgba(35, 78, 112, 0.6));
    border: 3px solid rgba(255, 255, 255, 0.25);
    overflow: hidden;
    position: relative;
    z-index: 2;
  }

  &__avatar-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__camera {
    position: absolute;
    bottom: 2px;
    right: 2px;
    z-index: 3;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: $primary;
    border: 2px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.85;
    transform: scale(0.9);
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}

.profile-stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  background: linear-gradient(
    135deg,
    var(--profile-stat-surface, rgba(255, 255, 255, 0.1)) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  border: 1px solid var(--profile-stat-border, rgba(255, 255, 255, 0.14));
  border-radius: 14px;
  backdrop-filter: blur(12px);
  min-width: 140px;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(
      135deg,
      var(--profile-stat-surface-hover, rgba(255, 255, 255, 0.16)) 0%,
      rgba(255, 255, 255, 0.1) 100%
    );
    transform: translateY(-2px);
  }

  &:hover &__icon-wrap {
    transform: scale(1.08);
  }

  &__icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(
      135deg,
      var(--profile-stat-accent, #{$primary}) 0%,
      var(--profile-stat-accent-strong, rgba($primary, 0.88)) 100%
    );
    box-shadow: 0 12px 24px var(--profile-stat-shadow, rgba($primary, 0.22));
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.24s ease;
  }

  &__info {
    display: flex;
    flex-direction: column;
  }

  &__value {
    font-size: 1.6rem;
    font-weight: 800;
    line-height: 1;
    color: white;
  }

  &__label {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.72);
    font-weight: 600;
    margin-top: 4px;
  }
}

// โ”€โ”€ Content โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
.profile-page {
  min-height: calc(100vh - 68px);
  display: flex;
  flex-direction: column;
}

.profile-content {
  background: #f8f6f1;
  min-height: 60vh;
  flex: 1;
}

.profile-content :deep(.row.q-col-gutter-xl) {
  margin-left: -22px;
  margin-right: -22px;
}

.profile-content :deep(.row.q-col-gutter-xl > *) {
  padding-left: 22px;
  padding-right: 22px;
}

.profile-tab-panel {
  min-height: 100%;
}

.instructor-home-panel {
  display: grid;
  gap: 18px;
}

.instructor-home-header,
.instructor-work-card,
.instructor-course-work-card,
.instructor-overview-card {
  border-radius: 16px !important;
  background: #ffffff;
}

.instructor-home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.instructor-overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.instructor-overview-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-color: rgba(17, 24, 39, 0.08) !important;

  strong,
  span {
    display: block;
  }

  strong {
    color: #101828;
    font-size: 1.45rem;
    line-height: 1;
  }

  span {
    margin-top: 4px;
    color: #667085;
    font-size: 0.82rem;
    font-weight: 700;
  }
}

.instructor-work-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 18px;
}

.instructor-work-card,
.instructor-course-work-card {
  padding: 18px;
  border-color: rgba(17, 24, 39, 0.08) !important;
}

.instructor-work-card__head,
.instructor-course-work-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  h2 {
    margin: 0 0 4px;
    color: #101828;
    font-size: 1.1rem;
    font-weight: 800;
  }

  span {
    color: #667085;
    font-size: 0.85rem;
  }
}

.instructor-task-list {
  display: grid;
  gap: 10px;
}

.instructor-task-item {
  display: grid;
  grid-template-columns: 38px 1fr;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(245, 166, 35, 0.2);
  border-radius: 12px;
  color: #344054;
  background: #fffaf2;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: rgba(245, 166, 35, 0.48);
    transform: translateY(-1px);
  }

  .q-icon {
    color: $primary;
    font-size: 22px;
  }

  strong,
  span {
    display: block;
  }

  strong {
    color: #101828;
    font-size: 0.95rem;
  }

  span {
    margin-top: 2px;
    color: #667085;
    font-size: 0.82rem;
  }
}

.certificate-status-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  div {
    padding: 14px 10px;
    border-radius: 12px;
    background: #f8fafc;
    text-align: center;
  }

  strong,
  span {
    display: block;
  }

  strong {
    color: #101828;
    font-size: 1.35rem;
  }

  span {
    color: #667085;
    font-size: 0.8rem;
    font-weight: 700;
  }
}

.instructor-course-list {
  display: grid;
  gap: 12px;
}

.instructor-course-item {
  display: grid;
  grid-template-columns: 88px 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 12px;
  border: 1px solid #e4e9f2;
  border-radius: 14px;
  background: #fbfdff;

  img {
    width: 88px;
    height: 62px;
    border-radius: 10px;
    object-fit: cover;
  }
}

.instructor-course-item__body {
  min-width: 0;

  span,
  strong,
  div {
    display: block;
  }

  span {
    color: $primary;
    font-size: 0.8rem;
    font-weight: 800;
  }

  strong {
    margin-top: 2px;
    color: #101828;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  div {
    margin-top: 4px;
    color: #667085;
    font-size: 0.82rem;
  }
}

.instructor-course-item__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.instructor-empty-state {
  display: grid;
  place-items: center;
  gap: 8px;
  min-height: 220px;
  color: #667085;
  text-align: center;

  strong {
    color: #101828;
    font-size: 1.1rem;
  }
}

// โ”€โ”€ Sidebar Menu โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
.profile-menu-card {
  border-radius: 14px !important;
  overflow: hidden;
  position: sticky;
  top: 140px;
  min-height: 490px;
  background: #ffffff;
  border: 1px solid rgba(17, 24, 39, 0.12) !important; // Keep the border visible against the light card background.
  box-shadow: 0 12px 30px rgba(17, 24, 39, 0.06) !important;
}

.profile-menu-card--empty {
  min-height: 490px;
}

.profile-menu-item {
  border-radius: 10px;
  margin: 4px 8px;
  min-height: 48px;
  padding: 0 12px;
  transition: all 0.2s ease;

  &--active {
    background: rgba($primary, 0.08) !important;
    box-shadow: inset 4px 0 0 $primary;
  }

  &:hover {
    background: rgba($primary, 0.04);
  }

  :deep(.q-item__section--avatar) {
    min-width: 34px;
    padding-right: 10px;
  }

  :deep(.q-item__section--main) {
    min-width: 0;
  }

  :deep(.q-item__label) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.profile-menu-item__wrap-label) {
    overflow: visible;
    text-overflow: initial;
    white-space: normal;
    line-height: 1.35;
  }
}

.profile-sidebar-link-btn {
  border-radius: 10px;
  margin: 4px 8px;
  min-height: 56px;
  transition: all 0.2s ease;
}

.profile-sidebar-link-btn:hover {
  background: rgba($primary, 0.04);
}

.profile-sidebar-link-btn :deep(.q-btn__content) {
  width: 100%;
  justify-content: flex-start;
  font-size: 0.95rem;
  font-weight: 500;
}

.profile-sidebar-link-btn :deep(.q-icon) {
  font-size: 20px;
}

.profile-sidebar-link-btn :deep(.on-left) {
  margin-right: 10px;
}

// โ”€โ”€ Search Input โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
.student-course-panel {
  max-width: 1004px;
}

.profile-search-input {
  width: 310px;

  :deep(.q-field__control) {
    background: white;
    border-color: rgba(17, 24, 39, 0.08);
    min-height: 44px;
    box-shadow: 0 5px 16px rgba(17, 24, 39, 0.03);
  }
}

// โ”€โ”€ Course List Header โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
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

.student-course-list {
  display: grid;
  gap: 18px;
}

.course-action-btn {
  min-height: 40px;
  border-radius: 10px !important;
  font-weight: 800;
  font-size: 0.82rem;
  padding: 0 16px !important;

  &--primary {
    min-width: 116px;
    border: 0 !important;
    box-shadow: 0 7px 18px rgba($primary, 0.24) !important;
  }
}

// โ”€โ”€ Empty State โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
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

// โ”€โ”€ Unregister Dialog โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
.modern-card {
  border-radius: 18px !important;
  overflow: hidden;
}

.unregister-dialog-card {
  width: 440px;
  max-width: 92vw;

  &__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  &__button {
    width: 100%;
    min-height: 44px;
    padding-inline: 12px;
  }

  &__actions :deep(.q-btn) {
    width: 100%;
    min-height: 46px;
  }

  &__actions :deep(.q-btn__content) {
    width: 100%;
    justify-content: center;
    white-space: nowrap;
  }
}

.unregister-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(#c62828, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

// โ”€โ”€ Student Card Dialog โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
.student-card-dialog {
  width: 860px;
  max-width: 95vw;
  border-radius: 22px !important;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(17, 24, 39, 0.24) !important;

  &__content {
    position: relative;
    padding: 34px 38px 28px;
    background:
      radial-gradient(circle at 88% 18%, rgba($primary, 0.18), transparent 30%),
      linear-gradient(135deg, #ffffff 0%, #fffaf0 46%, #f7fafc 100%);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 8px;
      background: linear-gradient(180deg, $primary, #c4850e);
    }
  }

  &__close {
    position: absolute;
    top: 18px;
    right: 18px;
    z-index: 2;
  }

  &__brand-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-right: 44px;
  }

  &__logo {
    display: block;
    width: 210px;
    height: 58px;
    object-fit: contain;
  }

  &__status {
    padding: 6px 12px;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  &__header {
    margin-top: 10px;
  }

  &__title-en {
    color: $secondary;
    font-size: 1.35rem;
    font-weight: 800;
    line-height: 1.2;
    margin-top: 2px;
  }

  &__student-code {
    color: #4b5563;
    font-size: 1.05rem;
    font-weight: 600;
    margin-top: 18px;
  }

  &__body {
    display: grid;
    grid-template-columns: 220px 1fr;
    align-items: center;
    gap: 34px;
    margin-top: 34px;
  }

  &__avatar-shell {
    display: flex;
    justify-content: center;
  }

  &__avatar {
    background: linear-gradient(135deg, rgba($secondary, 0.9), rgba($primary, 0.9));
    border: 5px solid white;
    box-shadow:
      0 0 0 1px rgba($primary, 0.2),
      0 16px 34px rgba(17, 24, 39, 0.18);
    overflow: hidden;
  }

  &__avatar-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__details {
    display: grid;
    gap: 12px;
    padding: 22px 24px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(17, 24, 39, 0.08);
  }

  &__detail-row {
    display: grid;
    grid-template-columns: 120px 1fr;
    align-items: baseline;
    gap: 16px;
    color: #111827;

    span {
      color: #6b7280;
      font-weight: 700;
    }

    strong {
      font-size: 1.05rem;
      font-weight: 800;
      word-break: break-word;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    margin-top: 32px;
    padding-top: 18px;
    border-top: 1px dashed rgba(17, 24, 39, 0.18);
    color: #374151;
    font-size: 1rem;
    font-weight: 700;
  }
}

// โ”€โ”€ Full Avatar Dialog โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
.full-avatar-dialog {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 92vw;
  max-height: 92vh;
  padding: 16px;
  border-radius: 24px !important;
  background: rgba(15, 23, 42, 0.88) !important;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35) !important;
  overflow: visible;

  &__close {
    position: absolute;
    top: -12px;
    right: -12px;
    z-index: 2;
    background: rgba(17, 24, 39, 0.82);
  }

  &__image {
    display: block;
    max-width: min(720px, 86vw);
    max-height: 86vh;
    border-radius: 0;
    object-fit: contain;
  }
}

// โ”€โ”€ Instructor Chat โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
.chat-layout {
  align-items: stretch;
}

.chat-course-list {
  max-height: 520px;
  overflow-y: auto;
  padding-right: 4px;
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
    background: linear-gradient(135deg, rgba($secondary, 0.9), rgba($primary, 0.9));
    overflow: hidden;
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
}

// โ”€โ”€ Benefits โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
.benefits-section-header {
  gap: 16px;
}

.benefits-check-card {
  position: relative;
  border-radius: 14px !important;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;
  overflow: hidden;
  transition:
    box-shadow 0.3s ease,
    transform 0.3s ease,
    border-color 0.3s ease;

  &:hover {
    box-shadow: 0 10px 25px rgba(245, 166, 35, 0.2) !important;
    transform: translateY(-3px);
    border-color: rgba($primary, 0.55) !important;
  }

  &__stripe {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 4px;
    background: linear-gradient(180deg, $primary, #c4850e);
  }

  &__eyebrow {
    color: $primary;
    font-size: 0.9rem;
    font-weight: 800;
  }

  &__verified {
    padding: 12px 14px;
    border-radius: 12px;
    background: rgba(33, 186, 69, 0.08);
    border: 1px solid rgba(33, 186, 69, 0.14);
  }

  &__footer {
    background: #fbfcfd;
  }
}

// โ”€โ”€ Responsive โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
@media (max-width: 767px) {
  .profile-hero__content {
    padding: 36px 16px 32px;
  }

  .profile-stat-card {
    padding: 10px 14px;
    min-width: 120px;

    &__value {
      font-size: 1.2rem;
    }

    &__icon-wrap {
      width: 36px;
      height: 36px;
    }
  }

  .profile-search-input {
    width: 100%;
    margin-top: 12px;
  }

  .benefits-section-header {
    align-items: stretch;
    flex-direction: column;

    .base-button {
      width: 100%;
    }
  }

  .chat-course-list {
    max-height: none;
    overflow: visible;
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

  .student-card-dialog {
    &__content {
      padding: 28px 20px 22px;
    }

    &__brand-row {
      align-items: flex-start;
      flex-direction: column;
      padding-right: 36px;
    }

    &__logo {
      width: 180px;
      height: 52px;
    }

    &__title-en {
      font-size: 1.05rem;
    }

    &__body {
      grid-template-columns: 1fr;
      gap: 22px;
      margin-top: 24px;
    }

    &__details {
      padding: 18px;
    }

    &__detail-row {
      grid-template-columns: 1fr;
      gap: 2px;
    }

    &__footer {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }
  }
}

// โ”€โ”€ Crop Dialog โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
.crop-dialog {
  width: 400px;
  max-width: 95vw;
  border-radius: 18px !important;
  overflow: hidden;

  &__header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__viewport {
    position: relative;
    width: 100%;
    height: 320px;
    background: #1a1a2e;
    overflow: hidden;
    cursor: grab;
    user-select: none;

    &:active {
      cursor: grabbing;
    }
  }

  &__image-container {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__image {
    width: 280px;
    height: 280px;
    object-fit: cover;
    pointer-events: none;
    will-change: transform;
  }

  &__circle-mask {
    position: absolute;
    inset: 0;
    pointer-events: none;
    // Dark overlay with transparent circle in center
    background: radial-gradient(
      circle 140px at center,
      transparent 139px,
      rgba(0, 0, 0, 0.65) 140px
    );

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 280px;
      height: 280px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
    }
  }
}

/* Friend's Profile CSS */
.profile-form {
  padding: 32px 36px 36px;
  border-radius: 20px !important;
  background: linear-gradient(180deg, #ffffff 0%, #fffdf7 100%) !important;
  border: 1px solid rgba(17, 24, 39, 0.08) !important;
  box-shadow: 0 14px 32px rgba(17, 24, 39, 0.05);
}

.profile-form h3 {
  color: #ff9800;
  font-size: 26px;
  margin-top: 0;
  margin-bottom: 18px;
  font-weight: bold;
}

.student-id {
  font-weight: 600;
  margin-bottom: 30px;
  font-size: 1rem;
  color: #52606d;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px 40px;
}

.form-grid label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #374151;
}

.save-btn {
  margin-top: 30px;
  min-width: 140px;
  min-height: 46px;
  border-radius: 12px;
}

.skill-section {
  margin-top: 20px;
  text-align: center;
  padding: 10px 0 20px;
}

.orange-text {
  color: #ff9800;
  text-align: left;
  margin-bottom: 8px;
}

.green-text {
  color: #00a65a;
  font-weight: 700;
}

.skill-section h2,
.score-section h2 {
  font-size: 30px;
  font-weight: bold;
  margin: 16px 0;
}

.skill-radar-card {
  margin-top: 25px;
  padding: 28px;
  border-radius: 28px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background:
    radial-gradient(circle at top right, rgba(245, 166, 35, 0.12), transparent 24%),
    linear-gradient(180deg, #ffffff 0%, #fffdf7 100%);
  box-shadow: 0 22px 44px rgba(17, 24, 39, 0.07);
}

.skill-radar-card__meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  text-align: left;
}

.skill-radar-card__eyebrow {
  margin: 0 0 8px;
  color: #f5a623;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.skill-radar-card__average {
  color: #10223c;
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1;

  span {
    color: #64748b;
    font-size: 1rem;
    margin-left: 6px;
  }
}

.skill-radar-card__meta-copy {
  max-width: 220px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(245, 166, 35, 0.08);
  color: #6b7280;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.5;
  text-align: left;
}

.skill-radar-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.skill-radar-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(17, 24, 39, 0.08);
  color: #334155;
  font-size: 0.88rem;
  font-weight: 700;

  strong {
    color: #10223c;
  }
}

.skill-radar-chip__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skill-radar-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
  gap: 24px;
  align-items: center;
  margin-top: 24px;
}

.skill-radar-figure {
  padding: 18px;
  border-radius: 24px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background:
    radial-gradient(circle at center, rgba(58, 166, 185, 0.06), transparent 48%),
    linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

.skill-radar-svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.skill-radar-svg__grid {
  fill: none;
  stroke: rgba(30, 58, 95, 0.12);
  stroke-width: 1;
}

.skill-radar-svg__axis {
  stroke: rgba(30, 58, 95, 0.16);
  stroke-width: 1;
}

.skill-radar-svg__area {
  fill: url(#skill-radar-fill);
}

.skill-radar-svg__outline {
  fill: none;
  stroke: #1e3a5f;
  stroke-width: 3;
  stroke-linejoin: round;
}

.skill-radar-svg__point {
  fill: #ffffff;
  stroke: #f5a623;
  stroke-width: 3;
}

.skill-radar-svg__center {
  fill: rgba(255, 255, 255, 0.96);
  stroke: rgba(30, 58, 95, 0.12);
  stroke-width: 2;
}

.skill-radar-svg__center-label,
.skill-radar-svg__center-value,
.skill-radar-svg__badge-label,
.skill-radar-svg__scale {
  text-anchor: middle;
  dominant-baseline: middle;
}

.skill-radar-svg__center-label {
  fill: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.skill-radar-svg__center-value {
  fill: #10223c;
  font-size: 1.25rem;
  font-weight: 800;
}

.skill-radar-svg__badge {
  stroke: #ffffff;
  stroke-width: 3;
  filter: drop-shadow(0 8px 14px rgba(17, 24, 39, 0.12));
}

.skill-radar-svg__badge-label {
  fill: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
}

.skill-radar-svg__scale {
  fill: #94a3b8;
  font-size: 0.7rem;
  font-weight: 700;
}

.skill-radar-legend {
  padding: 18px 18px 20px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.08);
  text-align: left;
}

.skill-radar-legend__title {
  color: #10223c;
  font-size: 0.98rem;
  font-weight: 800;
}

.skill-radar-legend__items {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.skill-radar-legend__item {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.skill-radar-legend__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 800;
  box-shadow: 0 8px 16px rgba(17, 24, 39, 0.12);
}

.skill-radar-legend__copy {
  display: grid;
  gap: 2px;

  strong {
    color: #10223c;
    font-size: 0.92rem;
    line-height: 1.35;
  }

  span {
    color: #64748b;
    font-size: 0.82rem;
    line-height: 1.4;
  }
}

.score-section {
  padding: 30px 0;
  text-align: center;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 30px;
}

.skill-card {
  background: linear-gradient(155deg, var(--skill-card-accent, #90d2b1) 0%, #1d4d59 100%);
  padding: 24px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 18px 36px rgba(17, 24, 39, 0.08);
}

.skill-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.skill-card h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #fff;
  line-height: 1.4;
}

.skill-card__badge {
  flex-shrink: 0;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 800;
}

.skill-inner {
  background: white;
  padding: 20px;
  text-align: left;
  border-radius: 16px;
  flex: 1;
}

.skill-item {
  margin-bottom: 24px;

  strong {
    display: block;
    line-height: 1.6;
  }
}

.skill-item:last-child {
  margin-bottom: 0;
}

.score-box {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.score-box__track {
  flex: 1;
  height: 12px;
  border-radius: 999px;
  background: #e8eef0;
  overflow: hidden;
}

.score-box__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--skill-card-accent, #49b37d) 0%, #1e3a5f 100%);
}

.score-box__value {
  min-width: 64px;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 800;
  text-align: right;
}

/* Avatar Editor CSS */
.avatar-section {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 28px;
}

.avatar-preview {
  min-height: 640px;
  padding: 24px;
  border-radius: 24px;
  border: 1px solid rgba(58, 86, 122, 0.12);
  background:
    radial-gradient(circle at top right, rgba(123, 174, 224, 0.22), transparent 28%),
    radial-gradient(circle at bottom left, rgba(255, 208, 129, 0.2), transparent 34%),
    linear-gradient(180deg, #fffdf8 0%, #f5fbff 100%);
  display: flex;
  flex-direction: column;
  box-shadow: 0 22px 44px rgba(58, 86, 122, 0.08);
}

.avatar-preview__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.avatar-preview__eyebrow {
  margin: 0;
  color: #3d80c4;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.avatar-preview__title {
  margin: 8px 0 0;
  color: #28435f;
  font-size: 1.5rem;
  line-height: 1.15;
}

.avatar-preview__stamp {
  flex-shrink: 0;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(61, 128, 196, 0.2);
  background: rgba(255, 255, 255, 0.74);
  color: #41688f;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.avatar-preview__stage {
  flex: 1;
  min-height: 0;
  margin-top: 18px;
  padding: 18px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(239, 248, 255, 0.92)), #fff;
  border: 1px solid rgba(58, 86, 122, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-preview__image {
  width: min(100%, 460px);
  aspect-ratio: 1;
  object-fit: contain;
  filter: drop-shadow(0 24px 36px rgba(58, 86, 122, 0.16));
}

.avatar-preview__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.avatar-preview__chip {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(58, 86, 122, 0.1);
  color: #45607a;
  font-size: 0.84rem;
  font-weight: 700;
}

.avatar-editor {
  background:
    radial-gradient(circle at top right, rgba(123, 174, 224, 0.12), transparent 30%),
    radial-gradient(circle at bottom left, rgba(255, 210, 126, 0.12), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #fffdf8 100%);
  padding: 28px;
  border-radius: 24px;
  border: 1px solid rgba(17, 24, 39, 0.06);
  box-shadow: 0 16px 34px rgba(17, 24, 39, 0.05);
}

.avatar-editor h3 {
  margin: 0 0 12px;
}

.avatar-editor__tabs {
  border-radius: 20px;
  border: 1px solid rgba(58, 86, 122, 0.12);
  background: rgba(255, 255, 255, 0.9);
  overflow: hidden;
}

.avatar-editor__tab-bar {
  border-bottom: 1px solid rgba(58, 86, 122, 0.12);
  padding: 6px 8px 0;
}

.avatar-editor__tab-bar :deep(.q-tab) {
  min-height: 68px;
  padding: 0 10px;
  color: #a0a8b3;
}

.avatar-editor__tab-bar :deep(.q-tab__icon) {
  font-size: 1.7rem;
}

.avatar-editor__tab-bar :deep(.q-tab--active) {
  color: #2ea7ff;
}

.avatar-editor__panels {
  min-height: 280px;
  max-height: 640px;
}

.avatar-editor__panel {
  padding: 18px;
  display: grid;
  gap: 14px;
  max-height: 640px;
  overflow-y: auto;
}

.avatar-editor__hint {
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(123, 174, 224, 0.18), rgba(255, 248, 226, 0.92));
  color: #536d87;
  font-size: 0.92rem;
  line-height: 1.5;
}

.avatar-editor__sections {
  display: grid;
  gap: 14px;
}

.avatar-control-card {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(58, 86, 122, 0.1);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 24px rgba(35, 63, 96, 0.05);
}

.avatar-control-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.avatar-control-card__header h4 {
  margin: 0;
  color: #28435f;
  font-size: 0.95rem;
  font-weight: 800;
}

.avatar-control-card__header span {
  color: #6a7f93;
  font-size: 0.82rem;
  font-weight: 700;
}

.avatar-swatch-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}

.avatar-swatch {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  border: 2px solid rgba(58, 86, 122, 0.12);
  background: #fff;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.avatar-swatch::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 12px;
  background: var(--avatar-swatch-color);
}

.avatar-swatch:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(58, 86, 122, 0.12);
}

.avatar-swatch--active {
  border-color: #5ab7ff;
  box-shadow: 0 0 0 4px rgba(90, 183, 255, 0.18);
}

.avatar-swatch--large {
  aspect-ratio: 1.25;
}

.avatar-tile-grid {
  display: grid;
  gap: 10px;
}

.avatar-tile-grid--triple {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.avatar-tile-grid--quad {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.avatar-tile {
  min-height: 92px;
  padding: 10px 8px;
  border: 2px solid rgba(58, 86, 122, 0.1);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfe 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.avatar-tile strong {
  color: #45607a;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1.15;
  text-align: center;
}

.avatar-tile__preview {
  width: 86px;
  height: 86px;
  object-fit: contain;
  border-radius: 14px;
}

.avatar-tile__preview--face {
  width: 72px;
  height: 72px;
}

.avatar-tile:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(58, 86, 122, 0.1);
}

.avatar-tile--active {
  border-color: #5ab7ff;
  background: linear-gradient(180deg, #ffffff 0%, #edf7ff 100%);
  box-shadow: 0 0 0 4px rgba(90, 183, 255, 0.16);
}

.avatar-eye-glyph,
.avatar-hair-glyph,
.avatar-top-glyph,
.avatar-body-glyph,
.avatar-accessory-glyph {
  position: relative;
  display: block;
}

.avatar-eye-glyph {
  width: 48px;
  height: 28px;
}

.avatar-eye-glyph::before,
.avatar-eye-glyph::after {
  content: '';
  position: absolute;
  top: 4px;
  width: 16px;
  height: 20px;
  border-radius: 50%;
  background: #414141;
}

.avatar-eye-glyph::before {
  left: 6px;
}

.avatar-eye-glyph::after {
  right: 6px;
}

.avatar-eye-glyph[data-style='calm']::before,
.avatar-eye-glyph[data-style='calm']::after {
  border-radius: 14px 14px 18px 18px;
}

.avatar-eye-glyph[data-style='focused']::before,
.avatar-eye-glyph[data-style='focused']::after {
  transform: rotate(-10deg);
}

.avatar-hair-glyph {
  width: 54px;
  height: 34px;
  border-radius: 18px 18px 12px 12px;
  background: #6f4a3c;
}

.avatar-hair-glyph[data-style='sweep'] {
  clip-path: polygon(10% 45%, 24% 10%, 44% 18%, 58% 0%, 76% 18%, 92% 46%, 82% 100%, 18% 100%);
}

.avatar-hair-glyph[data-style='wave'] {
  border-radius: 20px;
}

.avatar-top-glyph,
.avatar-body-glyph {
  width: 46px;
  height: 34px;
  background: #a777bc;
}

.avatar-top-glyph[data-style='apron'] {
  border-radius: 14px 14px 10px 10px;
}

.avatar-top-glyph[data-style='cape'] {
  clip-path: polygon(14% 24%, 36% 0%, 64% 0%, 86% 24%, 100% 100%, 0% 100%);
}

.avatar-top-glyph:not([data-style='apron']):not([data-style='cape']) {
  border-radius: 10px 10px 14px 14px;
}

.avatar-body-glyph[data-style='square'] {
  border-radius: 10px;
}

.avatar-body-glyph[data-style='hero'] {
  clip-path: polygon(18% 0%, 82% 0%, 100% 100%, 0% 100%);
}

.avatar-body-glyph:not([data-style='square']):not([data-style='hero']) {
  border-radius: 18px 18px 10px 10px;
}

.avatar-accessory-glyph {
  width: 54px;
  height: 26px;
}

.avatar-accessory-glyph::before,
.avatar-accessory-glyph::after {
  content: '';
  position: absolute;
}

.avatar-accessory-glyph[data-style='clean']::before {
  inset: 8px 16px;
  border-radius: 999px;
  border: 3px dashed rgba(83, 102, 125, 0.45);
}

.avatar-accessory-glyph[data-style='glasses']::before,
.avatar-accessory-glyph[data-style='glasses']::after {
  top: 3px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 4px solid #53667d;
}

.avatar-accessory-glyph[data-style='glasses']::before {
  left: 6px;
}

.avatar-accessory-glyph[data-style='glasses']::after {
  right: 6px;
}

.avatar-accessory-glyph[data-style='beanie']::before {
  inset: 0;
  border-radius: 18px 18px 8px 8px;
  background: #6f4a3c;
}

.avatar-accessory-glyph[data-style='beanie']::after {
  left: 8px;
  right: 8px;
  top: 12px;
  height: 6px;
  border-radius: 999px;
  background: #f2d39f;
}

@media (max-width: 1024px) {
  .profile-form {
    padding: 24px;
  }

  .skill-radar-card {
    padding: 22px 18px;
  }

  .skill-radar-card__meta,
  .skill-radar-layout {
    grid-template-columns: 1fr;
    display: grid;
  }

  .skill-radar-card__meta-copy {
    max-width: none;
  }

  .score-grid,
  .form-grid,
  .avatar-section {
    grid-template-columns: 1fr;
  }

  .avatar-preview {
    min-height: 0;
  }

  .avatar-swatch-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .avatar-tile-grid--triple,
  .avatar-tile-grid--quad {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

// โ”€โ”€ Payment Card โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
.payment-card {
  position: relative;
  border-radius: 14px !important;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;
  overflow: hidden;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: rgba($primary, 0.45) !important;
    box-shadow: 0 8px 24px rgba(245, 166, 35, 0.14) !important;
    transform: translateY(-2px);
  }

  &__stripe {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, $primary, #c4850e);
    border-radius: 4px 0 0 4px;
  }

  &__status-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, $primary, #c4850e);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(245, 166, 35, 0.22);
  }

  &__title {
    line-height: 1.4;
  }

  &__amount {
    flex-shrink: 0;
    white-space: nowrap;
  }

  &__action {
    min-height: 40px;
    padding-inline: 18px;
  }
}

@media (min-width: 1024px) {
  .profile-page {
    min-height: calc(100vh - 112px);
  }
}
</style>
