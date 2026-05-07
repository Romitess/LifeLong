<template>
  <q-page class="profile-page">
    <!-- ─── PROFILE HERO ─── -->
    <section class="profile-hero">
      <div class="profile-hero__particles" />
      <div class="profile-hero__overlay" />
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
                  {{ $t('profile.hero.learner') }}
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
              <div v-for="stat in profileStats" :key="stat.label" class="profile-stat-card">
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

    <!-- ─── CONTENT ─── -->
    <section ref="profileContentRef" class="profile-content q-py-xl">
      <div class="section-container">
        <div class="row q-col-gutter-xl">
          <!-- Sidebar Menu -->
          <div class="col-12 col-md-3">
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

              <!-- Student ID Card -->
              <q-separator />
              <div class="q-pa-md">
                <div class="text-caption text-grey-6 q-mb-xs">
                  {{ $t('profile.hero.studentId') }}
                </div>
                <div class="text-weight-bolder text-dark">{{ authStore.user?.studentId }}</div>
                <q-btn
                  flat
                  dense
                  no-caps
                  color="primary"
                  :label="$t('profile.menu.studentCard')"
                  icon="badge"
                  class="q-mt-sm full-width text-left"
                  size="sm"
                  @click="showStudentCardDialog = true"
                />
              </div>
            </q-card>
          </div>

          <!-- Main Content -->
          <div class="col-12 col-md-9">
            <div class="profile-tab-panel">
              <!-- My Courses Tab -->
              <div v-if="activeMenu === 'my-courses'">
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
                <div v-if="filteredRegistrations.length > 0" class="column q-gutter-md">
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
                        @click="goToCourse(entry.registration.courseId)"
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
                          @click="goToCourse(bookmark.courseId)"
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
                        <p class="avatar-preview__eyebrow">Tokyo Mood</p>
                        <h3 class="avatar-preview__title">Live Character Preview</h3>
                      </div>
                      <div class="avatar-preview__stamp">LLL</div>
                    </div>

                    <div class="avatar-preview__stage">
                      <img
                        :src="animeAvatarPreviewUrl"
                        alt="Anime avatar preview"
                        class="avatar-preview__image"
                      />
                    </div>

                    <div class="avatar-preview__footer">
                      <span class="avatar-preview__chip">{{ selectedHairLabel }}</span>
                      <span class="avatar-preview__chip">{{ selectedFaceLabel }}</span>
                      <span class="avatar-preview__chip">{{ selectedOutfitLabel }}</span>
                    </div>
                  </div>

                  <q-card flat bordered class="avatar-editor">
                    <h3 class="text-dark text-h6 text-weight-bold">
                      {{ $t('profile.personal.editAvatar') }}
                    </h3>

                    <div class="editor-grid q-mt-md">
                      <q-select
                        v-model="cartoonAvatar.body"
                        :options="animeBodyOptions"
                        :label="$t('profile.avatar.body')"
                        outlined
                        dense
                        emit-value
                        map-options
                        options-dense
                        dropdown-icon="expand_more"
                        popup-content-class="avatar-select-menu"
                        popup-content-style="max-height: 280px"
                        class="avatar-select"
                      />
                      <q-select
                        v-model="cartoonAvatar.face"
                        :options="animeFaceOptions"
                        :label="$t('profile.avatar.face')"
                        outlined
                        dense
                        emit-value
                        map-options
                        options-dense
                        dropdown-icon="expand_more"
                        popup-content-class="avatar-select-menu"
                        popup-content-style="max-height: 280px"
                        class="avatar-select"
                      />
                      <q-select
                        v-model="cartoonAvatar.hair"
                        :options="animeHairOptions"
                        :label="$t('profile.avatar.hair')"
                        outlined
                        dense
                        emit-value
                        map-options
                        options-dense
                        dropdown-icon="expand_more"
                        popup-content-class="avatar-select-menu"
                        popup-content-style="max-height: 280px"
                        class="avatar-select"
                      />
                      <q-select
                        v-model="cartoonAvatar.hairColor"
                        :options="animeColorOptions"
                        :label="$t('profile.avatar.hairColor')"
                        outlined
                        dense
                        emit-value
                        map-options
                        options-dense
                        dropdown-icon="expand_more"
                        popup-content-class="avatar-select-menu"
                        popup-content-style="max-height: 280px"
                        class="avatar-select"
                      />
                      <q-select
                        v-model="cartoonAvatar.shirt"
                        :options="animeShirtOptions"
                        :label="$t('profile.avatar.shirt')"
                        outlined
                        dense
                        emit-value
                        map-options
                        options-dense
                        dropdown-icon="expand_more"
                        popup-content-class="avatar-select-menu"
                        popup-content-style="max-height: 280px"
                        class="avatar-select"
                      />
                      <q-select
                        v-model="cartoonAvatar.shirtColor"
                        :options="animeColorOptions"
                        :label="$t('profile.avatar.shirtColor')"
                        outlined
                        dense
                        emit-value
                        map-options
                        options-dense
                        dropdown-icon="expand_more"
                        popup-content-class="avatar-select-menu"
                        popup-content-style="max-height: 280px"
                        class="avatar-select"
                      />
                      <q-select
                        v-model="cartoonAvatar.pants"
                        :options="animePantsOptions"
                        :label="$t('profile.avatar.pants')"
                        outlined
                        dense
                        emit-value
                        map-options
                        options-dense
                        dropdown-icon="expand_more"
                        popup-content-class="avatar-select-menu"
                        popup-content-style="max-height: 280px"
                        class="avatar-select"
                      />
                      <q-select
                        v-model="cartoonAvatar.pantsColor"
                        :options="animeColorOptions"
                        :label="$t('profile.avatar.pantsColor')"
                        outlined
                        dense
                        emit-value
                        map-options
                        options-dense
                        dropdown-icon="expand_more"
                        popup-content-class="avatar-select-menu"
                        popup-content-style="max-height: 280px"
                        class="avatar-select"
                      />
                      <q-select
                        v-model="cartoonAvatar.shoes"
                        :options="animeShoesOptions"
                        :label="$t('profile.avatar.shoes')"
                        outlined
                        dense
                        emit-value
                        map-options
                        options-dense
                        dropdown-icon="expand_more"
                        popup-content-class="avatar-select-menu"
                        popup-content-style="max-height: 280px"
                        class="avatar-select full"
                      />
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
                        สรุปคะแนนจากทักษะย่อย {{ allSkillMetrics.length }} ด้าน
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
                        <div class="skill-radar-legend__title">รายการทักษะในกราฟ</div>
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
                                >{{ axis.categoryShortTitle }} •
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

              <!-- Payment & Receipts Tab -->
              <div v-else-if="activeMenu === 'payments'">
                <div class="row items-center justify-between q-mb-lg">
                  <div>
                    <div class="text-h5 text-weight-bolder text-primary">
                      {{ $t('profile.payments.title') }}
                    </div>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      {{ $t('profile.payments.subtitle') }}
                    </div>
                  </div>
                  <q-input
                    v-model="paymentSearch"
                    dense
                    outlined
                    rounded
                    :placeholder="$t('profile.payments.searchPlaceholder')"
                    class="profile-search-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" color="grey-5" />
                    </template>
                  </q-input>
                </div>

                <div v-if="payments.length > 0" class="course-list-header q-mb-sm">
                  <div class="text-caption text-weight-bold text-grey-7">
                    {{ $t('profile.payments.listTitle') }}
                  </div>
                  <q-badge rounded color="primary" :label="payments.length" />
                </div>

                <!-- Payment List -->
                <div v-if="payments.length > 0" class="column q-gutter-md">
                  <q-card
                    v-for="payment in payments"
                    :key="payment.id"
                    flat
                    bordered
                    class="payment-card"
                  >
                    <div class="payment-card__stripe" />

                    <q-card-section class="row items-start q-gutter-md no-wrap q-pl-lg">
                      <div class="payment-card__status-icon">
                        <q-icon name="receipt_long" color="white" size="24px" />
                      </div>

                      <div class="col">
                        <div class="row items-start justify-between no-wrap q-gutter-md">
                          <div class="col">
                            <div
                              class="payment-card__title text-subtitle1 text-weight-bolder text-dark"
                            >
                              {{ payment.courseCode }} :
                              {{
                                getTranslatedCourseTitleByInfo(
                                  payment.courseCode,
                                  payment.courseTitle,
                                )
                              }}
                            </div>
                            <div class="row items-center q-gutter-x-sm q-mt-xs">
                              <q-badge color="positive" class="badge-pill">
                                {{ getPaymentStatusLabel(payment.status) }}
                              </q-badge>
                            </div>
                          </div>
                          <div class="payment-card__amount text-h6 text-weight-bolder text-primary">
                            {{ payment.amount.toLocaleString(locale === 'th' ? 'th-TH' : 'en-US') }}
                            {{ $t('thb') }}
                          </div>
                        </div>

                        <div class="row items-center q-gutter-md q-mt-xs text-caption text-grey-7">
                          <div class="row items-center q-gutter-xs">
                            <q-icon name="event" size="14px" />
                            <span
                              >{{ $t('profile.payments.date') }}
                              {{ formatDate(payment.paymentDate) }}</span
                            >
                          </div>
                          <div class="row items-center q-gutter-xs">
                            <q-icon name="payments" size="14px" />
                            <span>{{ $t('profile.payments.method') }} {{ payment.method }}</span>
                          </div>
                          <div class="row items-center q-gutter-xs">
                            <q-icon name="tag" size="14px" />
                            <span>{{ $t('profile.payments.refId') }} {{ payment.id }}</span>
                          </div>
                        </div>
                      </div>
                    </q-card-section>

                    <q-card-section class="q-pt-none q-pl-lg">
                      <q-separator />
                      <div class="row items-center justify-between q-gutter-sm q-mt-sm q-pb-xs">
                        <div class="row items-center q-gutter-xs text-caption text-grey-6">
                          <q-icon name="receipt" size="14px" color="grey-5" />
                          <span
                            >{{ $t('profile.payments.receiptLabel') }}:
                            {{ payment.receiptId }}</span
                          >
                        </div>
                        <BaseButton
                          color="primary"
                          icon="receipt"
                          :label="$t('profile.payments.viewReceipt')"
                          no-caps
                          hover-lift
                          class="payment-card__action"
                          @click="viewReceipt(payment)"
                        />
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Empty State -->
                <q-card v-else flat class="text-center empty-state-card q-pa-xl">
                  <div class="empty-state-card__icon-wrap q-mx-auto q-mb-lg">
                    <q-icon name="payments" size="48px" color="primary" />
                  </div>
                  <div class="text-h6 text-weight-bolder text-dark">
                    {{ $t('profile.payments.empty') }}
                  </div>
                  <div class="text-body2 text-grey-6 q-mt-sm">
                    {{ $t('profile.payments.emptySub') }}
                  </div>
                </q-card>
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
                @go-to-learning="goToCourse"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── CONFIRM UNREGISTER DIALOG ─── -->
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

    <!-- ─── AVATAR CROP DIALOG ─── -->
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

    <!-- ─── STUDENT CARD DIALOG ─── -->
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

    <!-- ─── FULL AVATAR DIALOG ─── -->
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

    <CourseReceiptDialog
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
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, nextTick } from 'vue';
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
import CourseCoverImage from 'components/course/CourseCoverImage.vue';
import CourseCompletionDocumentActions from 'components/course/CourseCompletionDocumentActions.vue';
import ProfileCourseCard from 'components/profile/ProfileCourseCard.vue';
import {
  useMyRegisteredCourses,
  type RegisteredCourseEntry,
} from 'src/composables/use-my-registered-courses';
import type { Course } from 'src/types/course';
import type { CourseDetail } from 'src/types/course-detail';
import CourseEnrollmentDialog from 'components/course/CourseEnrollmentDialog.vue';
import CourseReceiptDialog from 'components/receipt/CourseReceiptDialog.vue';
import { getCourseDetailById, MOCK_COURSES } from 'src/data/mock-courses';
import { useAuthStore, type User, type UserProfileUpdate } from 'src/stores/auth-store';

interface MenuItem {
  label: string;
  value: string;
  icon: string;
}

interface AvatarOption {
  label: string;
  value: string;
}

interface CartoonAvatarConfig {
  body: string;
  face: string;
  hair: string;
  hairColor: string;
  shirt: string;
  shirtColor: string;
  pants: string;
  pantsColor: string;
  shoes: string;
}

const FULL_AVATAR_STORAGE_KEY = 'lll-profile-avatar-full';
const CARTOON_AVATAR_STORAGE_KEY = 'lll-cartoon-avatar-config';
const DEFAULT_CARTOON_AVATAR: CartoonAvatarConfig = {
  body: 'ขาวอมชมพู',
  face: 'ตาเปล่งประกาย',
  hair: 'ฮิเมะคัต',
  hairColor: 'Midnight Navy',
  shirt: 'เซเลอร์',
  shirtColor: 'Midnight Navy',
  pants: 'กระโปรงพลีต',
  pantsColor: 'Midnight Navy',
  shoes: 'โลฟเฟอร์',
};
const storedCartoonAvatar = getStoredCartoonAvatar();

type ChatMessageSender = 'learner' | 'system';
type ChatMessageStatus = 'sent' | 'read';

interface ChatMessage {
  id: string;
  courseId: string;
  sender: ChatMessageSender;
  body: string;
  sentAt: Date;
  status: ChatMessageStatus;
}

interface StoredChatMessage {
  id: string;
  courseId: string;
  sender: ChatMessageSender;
  body: string;
  sentAt: string;
  status?: ChatMessageStatus;
}

interface SkillMetric {
  id: string;
  shortLabel: string;
  label: string;
  score: number;
}

interface SkillCategory {
  title: string;
  shortTitle: string;
  accent: string;
  items: SkillMetric[];
}

interface SkillRadarMetric extends SkillMetric {
  accent: string;
  categoryShortTitle: string;
}

interface RadarPoint {
  x: number;
  y: number;
}

const CHAT_MESSAGES_STORAGE_KEY = 'lll-instructor-chat-messages';

const { t, locale } = useI18n();
const $q = useQuasar();
const router = useRouter();
const courseRegistrationStore = useCourseRegistrationStore();
const coursePaymentStore = useCoursePaymentStore();
const courseBookmarkStore = useCourseBookmarkStore();
const authStore = useAuthStore();
const {
  myRegistrations,
  myRegisteredCourseEntries,
  getRegistrationByCourseId,
  getRegisteredCourseEntry,
} = useMyRegisteredCourses();

const activeMenu = ref('my-courses');
const profileContentRef = ref<HTMLElement | null>(null);
const courseSearch = ref('');
const savedCourseSearch = ref('');
const paymentSearch = ref('');
const showUnregisterDialog = ref(false);
const showSaveConfirmDialog = ref(false);
const courseToUnregister = ref<CourseRegistration | null>(null);
const saveConfirmTitle = ref('');
const saveConfirmMessage = ref('');
const pendingSaveAction = ref<(() => void) | null>(null);
const avatarInput = ref<HTMLInputElement | null>(null);
const showFullAvatar = ref(false);
const showStudentCardDialog = ref(false);
const fullAvatarUrl = ref(getStoredFullAvatar());
const pendingFullAvatarSrc = ref<string | null>(null);
const isRefreshingBenefits = ref(false);
const isSavingProfile = ref(false);
const benefitsCheckedAt = ref(new Date('2026-04-29T10:52:45+07:00'));
const selectedChatCourseId = ref<string | null>(null);
const chatDraft = ref('');
const chatMessages = ref<ChatMessage[]>(readStoredChatMessages());
const chatMessagesRef = ref<HTMLElement | null>(null);
const savedEnrollmentDialogCourse = ref<CourseDetail | null>(null);
const savedEnrollmentDialogOpenKey = ref(0);

const form = reactive<UserProfileUpdate>({
  firstNameTh: '',
  lastNameTh: '',
  firstNameEn: '',
  lastNameEn: '',
  phone: '',
});

const cartoonAvatar = reactive({
  body: 'ผิวใส',
  face: 'โกรธคลั่ง โมโหสุดขีด',
  hair: 'ช่วงนี้ยุ่ง',
  hairColor: 'ดำทมิฬ',
  shirt: 'ยืดผ่อนคุด',
  shirtColor: 'ดำทมิฬ',
  pants: 'ขาสั้น',
  pantsColor: 'ดำทมิฬ',
  shoes: 'ผ้าใบ',
});

const animeBodyOptions: AvatarOption[] = [
  { label: 'ขาวอมชมพู', value: 'ขาวอมชมพู' },
  { label: 'เบจน้ำผึ้ง', value: 'เบจน้ำผึ้ง' },
  { label: 'โทนอุ่นคาราเมล', value: 'โทนอุ่นคาราเมล' },
];
const animeFaceOptions: AvatarOption[] = [
  { label: 'ตาเปล่งประกาย', value: 'ตาเปล่งประกาย' },
  { label: 'ยิ้มอ่อนโยน', value: 'ยิ้มอ่อนโยน' },
  { label: 'ซึนเดเระ', value: 'ซึนเดเระ' },
];
const animeHairOptions: AvatarOption[] = [
  { label: 'ฮิเมะคัต', value: 'ฮิเมะคัต' },
  { label: 'วูล์ฟคัต', value: 'วูล์ฟคัต' },
  { label: 'ดังโงะทวินบัน', value: 'ดังโงะทวินบัน' },
];
const animeColorOptions: AvatarOption[] = [
  { label: 'Midnight Navy', value: 'Midnight Navy' },
  { label: 'Chestnut Brown', value: 'Chestnut Brown' },
  { label: 'Golden Honey', value: 'Golden Honey' },
  { label: 'Sakura Rose', value: 'Sakura Rose' },
];
const animeShirtOptions: AvatarOption[] = [
  { label: 'เซเลอร์', value: 'เซเลอร์' },
  { label: 'คาร์ดิแกน', value: 'คาร์ดิแกน' },
  { label: 'ฮู้ดดี้', value: 'ฮู้ดดี้' },
];
const animePantsOptions: AvatarOption[] = [
  { label: 'กระโปรงพลีต', value: 'กระโปรงพลีต' },
  { label: 'สแลคเรียบ', value: 'สแลคเรียบ' },
  { label: 'ชอร์ตแคชชวล', value: 'ชอร์ตแคชชวล' },
];
const animeShoesOptions: AvatarOption[] = [
  { label: 'โลฟเฟอร์', value: 'โลฟเฟอร์' },
  { label: 'สนีกเกอร์', value: 'สนีกเกอร์' },
  { label: 'บูตสั้น', value: 'บูตสั้น' },
];

Object.assign(cartoonAvatar, DEFAULT_CARTOON_AVATAR, storedCartoonAvatar);

const cognitiveSkills = computed<SkillMetric[]>(() => [
  {
    id: 'critical-thinking',
    shortLabel: 'Critical Thinking',
    label: t('profile.skills.cognitive.critical'),
    score: 4.4,
  },
  {
    id: 'creative-thinking',
    shortLabel: 'Creative Thinking',
    label: t('profile.skills.cognitive.creative'),
    score: 4.1,
  },
  {
    id: 'learning-to-learn',
    shortLabel: 'Learning to Learn',
    label: t('profile.skills.cognitive.learning'),
    score: 3.8,
  },
]);

const socialSkills = computed<SkillMetric[]>(() => [
  {
    id: 'collaboration',
    shortLabel: 'Collaboration',
    label: t('profile.skills.social.collaboration'),
    score: 4.2,
  },
  {
    id: 'empathy',
    shortLabel: 'Empathy',
    label: t('profile.skills.social.empathy'),
    score: 3.7,
  },
  {
    id: 'responsibility',
    shortLabel: 'Responsibility',
    label: t('profile.skills.social.responsibility'),
    score: 4.0,
  },
]);

const practicalSkills = computed<SkillMetric[]>(() => [
  {
    id: 'digital-literacy',
    shortLabel: 'Digital Literacy',
    label: t('profile.skills.practical.digital'),
    score: 4.5,
  },
  {
    id: 'life-skills',
    shortLabel: 'Life Skills',
    label: t('profile.skills.practical.life'),
    score: 3.6,
  },
  {
    id: 'financial-literacy',
    shortLabel: 'Financial Literacy',
    label: t('profile.skills.practical.financial'),
    score: 3.2,
  },
  {
    id: 'physical-health-literacy',
    shortLabel: 'Physical & Health',
    label: t('profile.skills.practical.physical'),
    score: 3.5,
  },
]);

const skillCategories = computed<SkillCategory[]>(() => [
  {
    title: t('profile.skills.cognitive.title'),
    shortTitle: 'Cognitive',
    accent: '#f5a623',
    items: cognitiveSkills.value,
  },
  {
    title: t('profile.skills.social.title'),
    shortTitle: 'Social',
    accent: '#3aa6b9',
    items: socialSkills.value,
  },
  {
    title: t('profile.skills.practical.title'),
    shortTitle: 'Practical',
    accent: '#49b37d',
    items: practicalSkills.value,
  },
]);

const RADAR_MAX_SCORE = 5;
const RADAR_CENTER_X = 210;
const RADAR_CENTER_Y = 200;
const RADAR_RADIUS = 136;

const allSkillMetrics = computed<SkillRadarMetric[]>(() =>
  skillCategories.value.flatMap((category) =>
    category.items.map((item) => ({
      ...item,
      accent: category.accent,
      categoryShortTitle: category.shortTitle,
    })),
  ),
);

const overallSkillAverage = computed<number>(() => getAverageSkillScore(allSkillMetrics.value));

const skillCategoryAverages = computed(() =>
  skillCategories.value.map((category) => ({
    ...category,
    average: getAverageSkillScore(category.items),
  })),
);

const radarGridPaths = computed(() =>
  Array.from({ length: RADAR_MAX_SCORE }, (_, index) => RADAR_MAX_SCORE - index).map((level) => {
    const points = allSkillMetrics.value.map((_, axisIndex, items) =>
      createRadarPoint(axisIndex, items.length, level),
    );

    return {
      level,
      path: createRadarPath(points),
    };
  }),
);

const radarAxisItems = computed(() =>
  allSkillMetrics.value.map((metric, index, items) => ({
    ...metric,
    index,
    axisPoint: createRadarPoint(index, items.length, RADAR_MAX_SCORE),
    valuePoint: createRadarPoint(index, items.length, metric.score),
    badgePoint: createRadarPoint(index, items.length, RADAR_MAX_SCORE + 0.55),
  })),
);

const radarDataPath = computed(() =>
  createRadarPath(radarAxisItems.value.map((axis) => axis.valuePoint)),
);

const radarScaleLabels = computed(() =>
  Array.from({ length: RADAR_MAX_SCORE }, (_, index) => {
    const level = index + 1;
    return {
      level,
      x: RADAR_CENTER_X + 14,
      y: RADAR_CENTER_Y - (RADAR_RADIUS * level) / RADAR_MAX_SCORE,
    };
  }),
);

function getAverageSkillScore(items: Array<{ score: number }>): number {
  if (items.length === 0) {
    return 0;
  }

  const total = items.reduce((sum, item) => sum + item.score, 0);
  return Number((total / items.length).toFixed(1));
}

function createRadarPoint(index: number, total: number, score: number): RadarPoint {
  if (total === 0) {
    return {
      x: RADAR_CENTER_X,
      y: RADAR_CENTER_Y,
    };
  }

  const angle = -Math.PI / 2 + (index / total) * Math.PI * 2;
  const distance = (score / RADAR_MAX_SCORE) * RADAR_RADIUS;

  return {
    x: RADAR_CENTER_X + Math.cos(angle) * distance,
    y: RADAR_CENTER_Y + Math.sin(angle) * distance,
  };
}

function createRadarPath(points: RadarPoint[]): string {
  if (points.length === 0) {
    return '';
  }

  return `${points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')} Z`;
}

function formatSkillScore(score: number): string {
  return score.toFixed(1);
}

// Crop dialog state
const showCropDialog = ref(false);
const cropImageSrc = ref<string | null>(null);
const cropZoom = ref(1);
const cropOffsetX = ref(0);
const cropOffsetY = ref(0);
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const dragStartOffsetX = ref(0);
const dragStartOffsetY = ref(0);
const cropImage = ref<HTMLImageElement | null>(null);
const naturalWidth = ref(0);
const naturalHeight = ref(0);

const VIEWPORT_SIZE = 280;

const DEFAULT_COVER = {
  icon: 'auto_stories',
  accentColor: '#f5a623',
  backgroundColor: '#1e3a5f',
};

const menuItems = computed<MenuItem[]>(() => [
  { label: t('profile.menu.myCourses'), value: 'my-courses', icon: 'menu_book' },
  { label: t('profile.menu.savedCourses'), value: 'saved-courses', icon: 'bookmark' },
  { label: t('profile.menu.personalInfo'), value: 'personal-info', icon: 'person' },
  { label: t('profile.menu.payments'), value: 'payments', icon: 'receipt_long' },
  { label: t('profile.menu.benefits'), value: 'benefits', icon: 'card_giftcard' },
  { label: t('profile.menu.chat'), value: 'chat', icon: 'chat' },
]);

const payments = computed<CoursePaymentRecord[]>(() => {
  if (!paymentSearch.value) return coursePaymentStore.myPayments;
  const s = paymentSearch.value.toLowerCase();
  return coursePaymentStore.myPayments.filter(
    (p) => p.courseCode.toLowerCase().includes(s) || p.courseTitle.toLowerCase().includes(s),
  );
});
const selectedPayment = ref<CoursePaymentRecord | null>(null);
const showReceiptDialog = ref(false);

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

const selectedHairLabel = computed<string>(() => cartoonAvatar.hair);
const selectedFaceLabel = computed<string>(() => cartoonAvatar.face);
const selectedOutfitLabel = computed<string>(
  () => `${cartoonAvatar.shirt} / ${cartoonAvatar.pants}`,
);
const animeAvatarPreviewUrl = computed<string>(() =>
  createAnimeAvatarDataUrl(cartoonAvatar, 'stage'),
);
const animeAvatarPortraitUrl = computed<string>(() =>
  createAnimeAvatarDataUrl(cartoonAvatar, 'portrait'),
);

watch(activeMenu, () => {
  scrollToProfileContentTop();
});

function viewReceipt(payment: CoursePaymentRecord) {
  selectedPayment.value = payment;
  showReceiptDialog.value = true;
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

function getStoredFullAvatar(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const legacyFullAvatar = window.localStorage.getItem(FULL_AVATAR_STORAGE_KEY) || '';

  if (legacyFullAvatar) {
    window.localStorage.removeItem(FULL_AVATAR_STORAGE_KEY);
  }

  return '';
}

function getStoredCartoonAvatar(): Partial<CartoonAvatarConfig> {
  if (typeof window === 'undefined') {
    return {};
  }

  const stored = window.localStorage.getItem(CARTOON_AVATAR_STORAGE_KEY);
  if (!stored) {
    return {};
  }

  try {
    const parsed = JSON.parse(stored) as Partial<CartoonAvatarConfig>;
    const result: Partial<CartoonAvatarConfig> = {};

    if (typeof parsed.body === 'string') result.body = parsed.body;
    if (typeof parsed.face === 'string') result.face = parsed.face;
    if (typeof parsed.hair === 'string') result.hair = parsed.hair;
    if (typeof parsed.hairColor === 'string') result.hairColor = parsed.hairColor;
    if (typeof parsed.shirt === 'string') result.shirt = parsed.shirt;
    if (typeof parsed.shirtColor === 'string') result.shirtColor = parsed.shirtColor;
    if (typeof parsed.pants === 'string') result.pants = parsed.pants;
    if (typeof parsed.pantsColor === 'string') result.pantsColor = parsed.pantsColor;
    if (typeof parsed.shoes === 'string') result.shoes = parsed.shoes;

    return result;
  } catch (error) {
    console.warn('Failed to parse cartoon avatar config', error);
    window.localStorage.removeItem(CARTOON_AVATAR_STORAGE_KEY);
    return {};
  }
}

function persistCartoonAvatar(config: CartoonAvatarConfig): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(CARTOON_AVATAR_STORAGE_KEY, JSON.stringify(config));
}

function readStoredChatMessages(): ChatMessage[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const rawValue = window.localStorage.getItem(CHAT_MESSAGES_STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const storedMessages = JSON.parse(rawValue) as StoredChatMessage[];
    if (!Array.isArray(storedMessages)) {
      return [];
    }

    const normalizedMessages = storedMessages
      .filter(
        (message) =>
          typeof message.id === 'string' &&
          typeof message.courseId === 'string' &&
          (message.sender === 'learner' || message.sender === 'system') &&
          typeof message.body === 'string' &&
          typeof message.sentAt === 'string' &&
          (message.status === undefined || message.status === 'sent' || message.status === 'read'),
      )
      .map((message) => ({
        ...message,
        sentAt: new Date(message.sentAt),
        status: message.status ?? 'sent',
      }));

    writeStoredChatMessages(normalizedMessages);
    return normalizedMessages;
  } catch {
    return [];
  }
}

function writeStoredChatMessages(messages: ChatMessage[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  const storedMessages: StoredChatMessage[] = messages.map((message) => ({
    ...message,
    sentAt: message.sentAt.toISOString(),
  }));
  window.localStorage.setItem(CHAT_MESSAGES_STORAGE_KEY, JSON.stringify(storedMessages));
}

function pickRandomAvatarOption(options: AvatarOption[]): string {
  return options[Math.floor(Math.random() * options.length)]?.value ?? '';
}

function randomizeCartoonAvatar(): void {
  cartoonAvatar.body = pickRandomAvatarOption(animeBodyOptions);
  cartoonAvatar.face = pickRandomAvatarOption(animeFaceOptions);
  cartoonAvatar.hair = pickRandomAvatarOption(animeHairOptions);
  cartoonAvatar.hairColor = pickRandomAvatarOption(animeColorOptions);
  cartoonAvatar.shirt = pickRandomAvatarOption(animeShirtOptions);
  cartoonAvatar.shirtColor = pickRandomAvatarOption(animeColorOptions);
  cartoonAvatar.pants = pickRandomAvatarOption(animePantsOptions);
  cartoonAvatar.pantsColor = pickRandomAvatarOption(animeColorOptions);
  cartoonAvatar.shoes = pickRandomAvatarOption(animeShoesOptions);
}

function saveCartoonAvatar(): void {
  const snapshot: CartoonAvatarConfig = {
    body: cartoonAvatar.body,
    face: cartoonAvatar.face,
    hair: cartoonAvatar.hair,
    hairColor: cartoonAvatar.hairColor,
    shirt: cartoonAvatar.shirt,
    shirtColor: cartoonAvatar.shirtColor,
    pants: cartoonAvatar.pants,
    pantsColor: cartoonAvatar.pantsColor,
    shoes: cartoonAvatar.shoes,
  };

  persistCartoonAvatar(snapshot);
  authStore.setAvatar(animeAvatarPortraitUrl.value);
  fullAvatarUrl.value = animeAvatarPreviewUrl.value;

  $q.notify({
    type: 'positive',
    message: t('profile.notifications.avatarSaved'),
    position: 'top',
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

function createAnimeAvatarDataUrl(config: CartoonAvatarConfig, mode: 'stage' | 'portrait'): string {
  const svg = createAnimeAvatarSvg(config, mode);
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createAnimeAvatarSvg(config: CartoonAvatarConfig, mode: 'stage' | 'portrait'): string {
  const skinMap: Record<string, string> = {
    ขาวอมชมพู: '#f7d9cf',
    เบจน้ำผึ้ง: '#e8bf98',
    โทนอุ่นคาราเมล: '#d59d77',
  };
  const colorMap: Record<string, string> = {
    'Midnight Navy': '#2d355f',
    'Chestnut Brown': '#6f4a3c',
    'Golden Honey': '#bd9246',
    'Sakura Rose': '#c3618c',
  };
  const eyeMap: Record<string, string> = {
    'Midnight Navy': '#36457a',
    'Chestnut Brown': '#6d4738',
    'Golden Honey': '#a6772a',
    'Sakura Rose': '#92527a',
  };

  const skin = skinMap[config.body] ?? '#f7d9cf';
  const hair = colorMap[config.hairColor] ?? '#2d355f';
  const topColor = colorMap[config.shirtColor] ?? '#2d355f';
  const bottomColor = colorMap[config.pantsColor] ?? '#2d355f';
  const eyeColor = eyeMap[config.hairColor] ?? '#36457a';
  const accent = colorMap[config.shirtColor] ?? '#c3618c';
  const background = mode === 'portrait' ? '#fbf5ff' : '#fff7fb';
  const horizon = mode === 'portrait' ? '#eedff8' : '#f8d9e7';
  const halo = withOpacity(accent, mode === 'portrait' ? 0.22 : 0.28);
  const sparkle = withOpacity('#ffffff', 0.85);
  const portraitScale = mode === 'portrait' ? 1.16 : 1;
  const headY = mode === 'portrait' ? 208 : 186;
  const bodyTop = mode === 'portrait' ? 312 : 300;
  const stageFooter = mode === 'portrait' ? 0 : 1;

  const hairBack = getAnimeHairBack(config.hair, hair);
  const hairFront = getAnimeHairFront(config.hair, hair);
  const face = getAnimeFace(config.face, eyeColor);
  const outfitTop = getAnimeTop(config.shirt, topColor);
  const outfitBottom = mode === 'portrait' ? '' : getAnimeBottom(config.pants, bottomColor);
  const shoes = mode === 'portrait' ? '' : getAnimeShoes(config.shoes, bottomColor);

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 560" role="img" aria-label="Anime avatar">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${background}" />
      <stop offset="100%" stop-color="${withOpacity(accent, 0.14)}" />
    </linearGradient>
    <linearGradient id="dress-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${topColor}" />
      <stop offset="100%" stop-color="${withOpacity(topColor, 0.82)}" />
    </linearGradient>
  </defs>
  <rect width="560" height="560" rx="42" fill="url(#bg-grad)" />
  <circle cx="280" cy="${mode === 'portrait' ? 205 : 168}" r="${mode === 'portrait' ? 128 : 116}" fill="${halo}" />
  <circle cx="434" cy="118" r="28" fill="${withOpacity('#ffffff', 0.78)}" />
  <path d="M0 414 C120 356 208 396 280 372 C350 350 436 372 560 320 V560 H0 Z" fill="${horizon}" />
  ${createSakuraPetal(94, 132, -18, '#ffd9ea')}
  ${createSakuraPetal(452, 162, 14, '#ffc7df')}
  ${createSakuraPetal(124, 404, 22, '#ffd6e7')}
  ${createSakuraPetal(466, 384, -16, '#ffd3e4')}
  <g transform="translate(280 284) scale(${portraitScale}) translate(-280 -284)">
    ${hairBack}
    <ellipse cx="280" cy="${headY}" rx="86" ry="96" fill="${skin}" />
    <ellipse cx="220" cy="${headY + 2}" rx="10" ry="18" fill="${skin}" />
    <ellipse cx="340" cy="${headY + 2}" rx="10" ry="18" fill="${skin}" />
    ${hairFront}
    ${face}
    <rect x="255" y="${bodyTop - 18}" width="50" height="30" rx="18" fill="${skin}" />
    <path d="M194 ${bodyTop + 8} C214 ${bodyTop - 6} 245 ${bodyTop - 18} 280 ${bodyTop - 18} C315 ${bodyTop - 18} 346 ${bodyTop - 6} 366 ${bodyTop + 8} L380 ${bodyTop + 118} C342 ${bodyTop + 148} 316 ${bodyTop + 160} 280 ${bodyTop + 160} C244 ${bodyTop + 160} 218 ${bodyTop + 148} 180 ${bodyTop + 118} Z" fill="url(#dress-grad)" />
    ${outfitTop}
    <path d="M196 ${bodyTop + 18} C168 ${bodyTop + 44} 160 ${bodyTop + 92} 168 ${bodyTop + 138} L194 ${bodyTop + 132} C192 ${bodyTop + 94} 198 ${bodyTop + 56} 218 ${bodyTop + 28} Z" fill="${topColor}" />
    <path d="M364 ${bodyTop + 18} C392 ${bodyTop + 44} 400 ${bodyTop + 92} 392 ${bodyTop + 138} L366 ${bodyTop + 132} C368 ${bodyTop + 94} 362 ${bodyTop + 56} 342 ${bodyTop + 28} Z" fill="${topColor}" />
    <circle cx="176" cy="${bodyTop + 142}" r="18" fill="${skin}" />
    <circle cx="384" cy="${bodyTop + 142}" r="18" fill="${skin}" />
    ${outfitBottom}
    ${shoes}
  </g>
  <circle cx="112" cy="92" r="5" fill="${sparkle}" />
  <circle cx="132" cy="114" r="3" fill="${sparkle}" />
  <circle cx="450" cy="92" r="5" fill="${sparkle}" />
  <circle cx="430" cy="112" r="3" fill="${sparkle}" />
  ${
    stageFooter
      ? `<g opacity="0.86">
    <rect x="42" y="458" width="476" height="62" rx="24" fill="${withOpacity('#ffffff', 0.78)}" />
    <text x="280" y="497" text-anchor="middle" font-size="22" font-family="Arial, sans-serif" fill="#54334a">Tokyo Pop Character Studio</text>
  </g>`
      : ''
  }
</svg>`.trim();
}

function getAnimeHairBack(hairStyle: string, hairColor: string): string {
  if (hairStyle === 'วูล์ฟคัต') {
    return `
      <path d="M176 182 C180 92 230 48 280 48 C330 48 380 92 384 182 L414 260 L368 244 L344 292 L318 246 L280 310 L242 246 L216 292 L192 244 L146 260 Z" fill="${hairColor}" />
    `;
  }

  if (hairStyle === 'ดังโงะทวินบัน') {
    return `
      <circle cx="206" cy="118" r="36" fill="${hairColor}" />
      <circle cx="354" cy="118" r="36" fill="${hairColor}" />
      <path d="M178 184 C182 96 232 54 280 54 C328 54 378 96 382 184 L368 246 C344 230 316 224 280 224 C244 224 216 230 192 246 Z" fill="${hairColor}" />
    `;
  }

  return `
    <path d="M166 186 C170 92 228 48 280 48 C332 48 390 92 394 186 L384 252 L350 222 L344 306 L314 222 L246 222 L216 306 L210 222 L176 252 Z" fill="${hairColor}" />
  `;
}

function getAnimeHairFront(hairStyle: string, hairColor: string): string {
  if (hairStyle === 'วูล์ฟคัต') {
    return `
      <path d="M198 128 C214 82 246 62 280 62 C314 62 346 82 362 128 C336 114 318 116 302 134 C290 150 274 152 260 138 C244 122 224 118 198 128 Z" fill="${hairColor}" />
      <path d="M204 152 C224 168 236 196 236 232 L198 250 C196 214 196 184 204 152 Z" fill="${hairColor}" />
      <path d="M356 152 C364 184 364 214 362 250 L324 232 C324 196 336 168 356 152 Z" fill="${hairColor}" />
    `;
  }

  if (hairStyle === 'ดังโงะทวินบัน') {
    return `
      <path d="M196 128 C214 82 246 62 280 62 C314 62 346 82 364 128 C344 118 326 120 310 138 C296 154 264 154 250 138 C234 120 216 118 196 128 Z" fill="${hairColor}" />
      <rect x="192" y="178" width="28" height="120" rx="14" fill="${hairColor}" />
      <rect x="340" y="178" width="28" height="120" rx="14" fill="${hairColor}" />
    `;
  }

  return `
    <path d="M194 126 C214 80 246 60 280 60 C314 60 346 80 366 126 C346 120 328 126 312 146 C300 162 260 162 248 146 C232 126 214 120 194 126 Z" fill="${hairColor}" />
    <rect x="186" y="174" width="34" height="132" rx="16" fill="${hairColor}" />
    <rect x="340" y="174" width="34" height="132" rx="16" fill="${hairColor}" />
  `;
}

function getAnimeFace(faceStyle: string, eyeColor: string): string {
  if (faceStyle === 'ซึนเดเระ') {
    return `
      <path d="M232 192 L256 184" stroke="#4a2943" stroke-width="6" stroke-linecap="round" />
      <path d="M328 184 L352 192" stroke="#4a2943" stroke-width="6" stroke-linecap="round" />
      <ellipse cx="242" cy="220" rx="22" ry="16" fill="${eyeColor}" />
      <ellipse cx="318" cy="220" rx="22" ry="16" fill="${eyeColor}" />
      <rect x="220" y="206" width="44" height="10" rx="5" fill="#ffffff" opacity="0.68" />
      <rect x="296" y="206" width="44" height="10" rx="5" fill="#ffffff" opacity="0.68" />
      <circle cx="246" cy="222" r="7" fill="#ffffff" opacity="0.92" />
      <circle cx="314" cy="222" r="7" fill="#ffffff" opacity="0.92" />
      <ellipse cx="228" cy="254" rx="20" ry="10" fill="#f4a1b7" opacity="0.5" />
      <ellipse cx="332" cy="254" rx="20" ry="10" fill="#f4a1b7" opacity="0.5" />
      <path d="M272 268 Q280 276 288 268" stroke="#b85974" stroke-width="4" stroke-linecap="round" fill="none" />
    `;
  }

  if (faceStyle === 'ยิ้มอ่อนโยน') {
    return `
      <ellipse cx="244" cy="220" rx="24" ry="20" fill="${eyeColor}" />
      <ellipse cx="316" cy="220" rx="24" ry="20" fill="${eyeColor}" />
      <circle cx="250" cy="214" r="8" fill="#ffffff" opacity="0.96" />
      <circle cx="310" cy="214" r="8" fill="#ffffff" opacity="0.96" />
      <circle cx="256" cy="224" r="4" fill="#ffffff" opacity="0.9" />
      <circle cx="304" cy="224" r="4" fill="#ffffff" opacity="0.9" />
      <ellipse cx="228" cy="252" rx="18" ry="9" fill="#f6b7c8" opacity="0.54" />
      <ellipse cx="332" cy="252" rx="18" ry="9" fill="#f6b7c8" opacity="0.54" />
      <path d="M258 270 Q280 288 302 270" stroke="#b85974" stroke-width="4" stroke-linecap="round" fill="none" />
    `;
  }

  return `
    <ellipse cx="244" cy="218" rx="24" ry="22" fill="${eyeColor}" />
    <ellipse cx="316" cy="218" rx="24" ry="22" fill="${eyeColor}" />
    <circle cx="249" cy="210" r="9" fill="#ffffff" opacity="0.98" />
    <circle cx="311" cy="210" r="9" fill="#ffffff" opacity="0.98" />
    <circle cx="256" cy="226" r="5" fill="#ffffff" opacity="0.92" />
    <circle cx="304" cy="226" r="5" fill="#ffffff" opacity="0.92" />
    <path d="M228 188 Q244 180 258 190" stroke="#5d3552" stroke-width="4" stroke-linecap="round" fill="none" />
    <path d="M302 190 Q316 180 332 188" stroke="#5d3552" stroke-width="4" stroke-linecap="round" fill="none" />
    <ellipse cx="226" cy="252" rx="18" ry="9" fill="#f8c0cf" opacity="0.54" />
    <ellipse cx="334" cy="252" rx="18" ry="9" fill="#f8c0cf" opacity="0.54" />
    <path d="M260 272 Q280 286 300 272" stroke="#b85974" stroke-width="4" stroke-linecap="round" fill="none" />
  `;
}

function getAnimeTop(shirtStyle: string, topColor: string): string {
  if (shirtStyle === 'คาร์ดิแกน') {
    return `
      <path d="M214 332 L252 298 L280 338 L308 298 L346 332 L336 430 C320 438 302 442 280 442 C258 442 240 438 224 430 Z" fill="#fff7ef" />
      <path d="M214 332 L248 300 L256 438 C244 436 234 434 224 430 Z" fill="${withOpacity(topColor, 0.88)}" />
      <path d="M346 332 L312 300 L304 438 C316 436 326 434 336 430 Z" fill="${withOpacity(topColor, 0.88)}" />
      <path d="M266 338 L280 354 L294 338" stroke="#c3618c" stroke-width="8" stroke-linecap="round" fill="none" />
    `;
  }

  if (shirtStyle === 'ฮู้ดดี้') {
    return `
      <path d="M226 310 C238 286 256 274 280 274 C304 274 322 286 334 310 L320 330 C306 318 294 314 280 314 C266 314 254 318 240 330 Z" fill="${withOpacity(topColor, 0.8)}" />
      <circle cx="264" cy="360" r="4" fill="#ffffff" />
      <circle cx="296" cy="360" r="4" fill="#ffffff" />
      <path d="M264 364 L260 392" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
      <path d="M296 364 L300 392" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
      <path d="M244 412 Q280 430 316 412" stroke="${withOpacity('#ffffff', 0.42)}" stroke-width="8" stroke-linecap="round" fill="none" />
    `;
  }

  return `
    <path d="M212 324 L248 292 H312 L348 324 L334 366 C314 352 298 346 280 346 C262 346 246 352 226 366 Z" fill="#ffffff" />
    <path d="M240 298 H320 L350 330 L320 344 Q302 330 280 330 Q258 330 240 344 L210 330 Z" fill="${topColor}" />
    <path d="M260 348 L280 372 L300 348 Z" fill="#f2b7cf" />
  `;
}

function getAnimeBottom(bottomStyle: string, bottomColor: string): string {
  if (bottomStyle === 'สแลคเรียบ') {
    return `
      <path d="M236 456 L272 456 L260 520 H228 Z" fill="${bottomColor}" />
      <path d="M288 456 L324 456 L332 520 H300 Z" fill="${bottomColor}" />
    `;
  }

  if (bottomStyle === 'ชอร์ตแคชชวล') {
    return `
      <path d="M224 430 C246 446 260 452 280 452 C300 452 314 446 336 430 L330 468 C312 480 298 486 280 486 C262 486 248 480 230 468 Z" fill="${bottomColor}" />
      <rect x="236" y="468" width="28" height="54" rx="14" fill="#f3c6a6" />
      <rect x="296" y="468" width="28" height="54" rx="14" fill="#f3c6a6" />
    `;
  }

  return `
    <path d="M224 428 C250 446 264 454 280 454 C296 454 310 446 336 428 L344 462 C326 476 310 484 280 484 C250 484 234 476 216 462 Z" fill="${bottomColor}" />
    <path d="M228 438 L240 486" stroke="${withOpacity('#ffffff', 0.26)}" stroke-width="4" />
    <path d="M248 450 L256 486" stroke="${withOpacity('#ffffff', 0.26)}" stroke-width="4" />
    <path d="M312 450 L304 486" stroke="${withOpacity('#ffffff', 0.26)}" stroke-width="4" />
    <path d="M332 438 L320 486" stroke="${withOpacity('#ffffff', 0.26)}" stroke-width="4" />
    <rect x="238" y="484" width="26" height="40" rx="13" fill="#f3c6a6" />
    <rect x="296" y="484" width="26" height="40" rx="13" fill="#f3c6a6" />
  `;
}

function getAnimeShoes(shoesStyle: string, shoeColor: string): string {
  if (shoesStyle === 'สนีกเกอร์') {
    return `
      <path d="M226 520 H282 C282 536 268 544 244 544 C232 544 224 538 226 520 Z" fill="#ffffff" />
      <path d="M278 520 H334 C336 538 328 544 316 544 C292 544 278 536 278 520 Z" fill="#ffffff" />
      <path d="M230 528 H280" stroke="${shoeColor}" stroke-width="4" stroke-linecap="round" />
      <path d="M282 528 H330" stroke="${shoeColor}" stroke-width="4" stroke-linecap="round" />
    `;
  }

  if (shoesStyle === 'บูตสั้น') {
    return `
      <path d="M230 506 H276 V544 H220 Q220 520 230 506 Z" fill="${shoeColor}" />
      <path d="M286 506 H330 Q340 520 340 544 H284 Z" fill="${shoeColor}" />
    `;
  }

  return `
    <path d="M224 522 H280 Q274 542 246 542 Q222 542 224 522 Z" fill="${shoeColor}" />
    <path d="M280 522 H336 Q338 542 314 542 Q286 542 280 522 Z" fill="${shoeColor}" />
    <circle cx="242" cy="524" r="4" fill="#d8be83" />
    <circle cx="318" cy="524" r="4" fill="#d8be83" />
  `;
}

function createSakuraPetal(x: number, y: number, rotation: number, fill: string): string {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotation})">
      <ellipse cx="-8" cy="0" rx="10" ry="6" fill="${fill}" />
      <ellipse cx="8" cy="0" rx="10" ry="6" fill="${fill}" />
      <ellipse cx="0" cy="-8" rx="6" ry="10" fill="${fill}" />
      <ellipse cx="0" cy="8" rx="6" ry="10" fill="${fill}" />
      <circle cx="0" cy="0" r="4" fill="#ffeef6" />
    </g>
  `;
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

const selectedChatEntry = computed<RegisteredCourseEntry | null>(() => {
  if (myRegisteredCourseEntries.value.length === 0) {
    return null;
  }

  return (
    myRegisteredCourseEntries.value.find(
      (entry) => entry.course.id === selectedChatCourseId.value,
    ) ??
    myRegisteredCourseEntries.value[0] ??
    null
  );
});

const chatThreadMessages = computed<ChatMessage[]>(() => {
  if (!selectedChatEntry.value) {
    return [];
  }

  return chatMessages.value.filter(
    (message) => message.courseId === selectedChatEntry.value?.course.id,
  );
});

const canSendChatMessage = computed<boolean>(
  () => Boolean(selectedChatEntry.value) && chatDraft.value.trim().length > 0,
);

const profileStats = computed(() => [
  {
    label: t('profile.menu.myCourses'),
    value: myRegistrations.value.length,
    icon: 'app_registration',
    color: 'primary',
  },
  {
    label: t('profile.courses.inProgress'),
    value: inProgressCoursesCount.value,
    icon: 'auto_stories',
    color: 'info',
  },
  {
    label: t('learning.completed'),
    value: completedCoursesCount.value,
    icon: 'workspace_premium',
    color: 'positive',
  },
  {
    label: t('creditBank'),
    value: 0,
    icon: 'stars',
    color: 'warning',
  },
]);

const cropImageStyle = computed(() => {
  const scale = cropZoom.value;
  return {
    transform: `translate(${cropOffsetX.value}px, ${cropOffsetY.value}px) scale(${scale})`,
    transformOrigin: 'center center',
  };
});

watch(cropZoom, () => {
  const maxOffset = (VIEWPORT_SIZE / 2) * (1 - 1 / cropZoom.value);
  cropOffsetX.value = Math.max(-maxOffset, Math.min(maxOffset, cropOffsetX.value));
  cropOffsetY.value = Math.max(-maxOffset, Math.min(maxOffset, cropOffsetY.value));
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

watch(
  () => activeMenu.value,
  async (menuValue) => {
    if (menuValue !== 'chat') {
      return;
    }

    await nextTick();
    scrollChatToLatestMessage();
  },
);

watch(selectedChatCourseId, async () => {
  if (activeMenu.value !== 'chat') {
    return;
  }

  await nextTick();
  scrollChatToLatestMessage();
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
  const course = MOCK_COURSES.find((c: Course) => c.code === code);
  return course?.titleEn || title;
}

function getHydratedBookmarkCourse(bookmark: CourseBookmark) {
  const realCourse = MOCK_COURSES.find((c) => c.id === bookmark.courseId);
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
  return course.isFree ? t('free') : `฿${(course.price ?? 0).toLocaleString()}`;
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
    return `${day} ${month} พ.ศ. ${year}`;
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

  return isTh ? `${dateLabel} เวลา ${timeLabel} น.` : `${dateLabel} ${timeLabel}`;
}

function formatChatMessageTime(date: Date): string {
  return date.toLocaleTimeString(locale.value === 'th' ? 'th-TH' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function getChatStatusLabel(status: ChatMessageStatus): string {
  void status;
  return t('profile.chat.statusSent');
}

function getPaymentStatusLabel(status: string): string {
  if (status === 'ชำระเงินสำเร็จ') {
    return t('profile.payments.statusPaid');
  }

  return status;
}

function getChatStatusIcon(status: ChatMessageStatus): string {
  void status;
  return 'done';
}

function isLatestLearnerMessage(message: ChatMessage): boolean {
  const latestLearnerMessage = [...chatThreadMessages.value]
    .reverse()
    .find((chatMessage) => chatMessage.sender === 'learner');

  return latestLearnerMessage?.id === message.id;
}

function goToCourse(courseId: string): void {
  void router.push(`/course/${courseId}/learn`);
}

function selectChatCourse(courseId: string): void {
  selectedChatCourseId.value = courseId;
}

function scrollChatToLatestMessage(): void {
  const messagePanel = chatMessagesRef.value;
  if (!messagePanel) {
    return;
  }

  messagePanel.scrollTop = messagePanel.scrollHeight;
}

async function sendChatMessage(): Promise<void> {
  if (!canSendChatMessage.value || !selectedChatEntry.value) {
    return;
  }

  const now = new Date();
  const selectedCourseId = selectedChatEntry.value.course.id;
  const messageId = `${selectedCourseId}-${now.getTime()}`;
  const nextMessages: ChatMessage[] = [
    ...chatMessages.value,
    {
      id: messageId,
      courseId: selectedCourseId,
      sender: 'learner',
      body: chatDraft.value.trim(),
      sentAt: now,
      status: 'sent',
    },
  ];

  chatMessages.value = nextMessages;
  writeStoredChatMessages(nextMessages);
  chatDraft.value = '';
  await nextTick();
  scrollChatToLatestMessage();
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

function triggerAvatarUpload(): void {
  avatarInput.value?.click();
}

function onAvatarSelected(event: Event): void {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const selectedImage = e.target?.result as string;
    cropImageSrc.value = selectedImage;
    pendingFullAvatarSrc.value = selectedImage;
    cropZoom.value = 1;
    cropOffsetX.value = 0;
    cropOffsetY.value = 0;
    showCropDialog.value = true;
  };
  reader.readAsDataURL(file);
  target.value = '';
}

function onCropImageLoad(): void {
  if (cropImage.value) {
    naturalWidth.value = cropImage.value.naturalWidth;
    naturalHeight.value = cropImage.value.naturalHeight;
  }
}

function onCropMouseDown(e: MouseEvent): void {
  isDragging.value = true;
  dragStartX.value = e.clientX;
  dragStartY.value = e.clientY;
  dragStartOffsetX.value = cropOffsetX.value;
  dragStartOffsetY.value = cropOffsetY.value;
}

function onCropMouseMove(e: MouseEvent): void {
  if (!isDragging.value) return;
  const rawX = dragStartOffsetX.value + (e.clientX - dragStartX.value);
  const rawY = dragStartOffsetY.value + (e.clientY - dragStartY.value);

  const maxOffset = (VIEWPORT_SIZE / 2) * (1 - 1 / cropZoom.value);
  cropOffsetX.value = Math.max(-maxOffset, Math.min(maxOffset, rawX));
  cropOffsetY.value = Math.max(-maxOffset, Math.min(maxOffset, rawY));
}

function onCropMouseUp(): void {
  isDragging.value = false;
}

function onCropTouchStart(e: TouchEvent): void {
  const touch = e.touches[0];
  if (!touch) return;
  isDragging.value = true;
  dragStartX.value = touch.clientX;
  dragStartY.value = touch.clientY;
  dragStartOffsetX.value = cropOffsetX.value;
  dragStartOffsetY.value = cropOffsetY.value;
}

function onCropTouchMove(e: TouchEvent): void {
  if (!isDragging.value) return;
  const touch = e.touches[0];
  if (!touch) return;
  const rawX = dragStartOffsetX.value + (touch.clientX - dragStartX.value);
  const rawY = dragStartOffsetY.value + (touch.clientY - dragStartY.value);

  const maxOffset = (VIEWPORT_SIZE / 2) * (1 - 1 / cropZoom.value);
  cropOffsetX.value = Math.max(-maxOffset, Math.min(maxOffset, rawX));
  cropOffsetY.value = Math.max(-maxOffset, Math.min(maxOffset, rawY));
}

function onCropTouchEnd(): void {
  isDragging.value = false;
}

function onCropWheel(e: WheelEvent): void {
  const delta = e.deltaY > 0 ? -0.05 : 0.05;
  cropZoom.value = Math.max(1, Math.min(3, cropZoom.value + delta));
}

function cancelCrop(): void {
  showCropDialog.value = false;
  cropImageSrc.value = null;
  pendingFullAvatarSrc.value = null;
}

function saveCroppedAvatar(): void {
  if (!cropImageSrc.value) return;

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate how the image is displayed in the viewport
    const aspect = img.naturalWidth / img.naturalHeight;
    let drawW: number;
    let drawH: number;
    if (aspect > 1) {
      drawH = VIEWPORT_SIZE;
      drawW = VIEWPORT_SIZE * aspect;
    } else {
      drawW = VIEWPORT_SIZE;
      drawH = VIEWPORT_SIZE / aspect;
    }

    // The center of the viewport maps to the center of canvas
    const scale = cropZoom.value;
    const scaledW = drawW * scale;
    const scaledH = drawH * scale;

    // Image top-left position in viewport coordinates
    const imgX = (VIEWPORT_SIZE - scaledW) / 2 + cropOffsetX.value;
    const imgY = (VIEWPORT_SIZE - scaledH) / 2 + cropOffsetY.value;

    // Map viewport crop area to canvas
    const ratio = outputSize / VIEWPORT_SIZE;
    const canvasImgX = imgX * ratio;
    const canvasImgY = imgY * ratio;
    const canvasImgW = scaledW * ratio;
    const canvasImgH = scaledH * ratio;

    ctx.drawImage(img, canvasImgX, canvasImgY, canvasImgW, canvasImgH);

    const dataUrl = canvas.toDataURL('image/png');
    authStore.setAvatar(dataUrl);
    fullAvatarUrl.value = dataUrl;

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(FULL_AVATAR_STORAGE_KEY);
    }

    showCropDialog.value = false;
    cropImageSrc.value = null;
    pendingFullAvatarSrc.value = null;
  };
  img.src = cropImageSrc.value;
}
</script>

<style lang="scss" scoped>
// ── Hero ─────────────────────────────────────────────────────
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

// ── Stats Cards ──────────────────────────────────────────────
.profile-stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  backdrop-filter: blur(12px);
  min-width: 140px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.14);
    transform: translateY(-2px);
  }

  &__icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba($primary, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
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
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
    margin-top: 2px;
  }
}

// ── Content ──────────────────────────────────────────────────
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

.profile-tab-panel {
  min-height: 100%;
}

// ── Sidebar Menu ─────────────────────────────────────────────
.profile-menu-card {
  border-radius: 14px !important;
  overflow: hidden;
  position: sticky;
  top: 140px;
  border: 1px solid rgba(17, 24, 39, 0.12) !important; // ปรับความเข้มขอบให้ตรงกับที่อื่น
  box-shadow: 0 4px 20px rgba(17, 24, 39, 0.05) !important;
}

.profile-menu-item {
  border-radius: 10px;
  margin: 2px 8px;
  min-height: 44px;
  padding: 0 10px;
  transition: all 0.2s ease;

  &--active {
    background: rgba($primary, 0.08) !important;
    box-shadow: inset 3px 0 0 $primary;
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
}

// ── Search Input ─────────────────────────────────────────────
.profile-search-input {
  width: 280px;

  :deep(.q-field__control) {
    background: white;
    border-color: rgba(17, 24, 39, 0.08);
  }
}

// ── Course List Header ───────────────────────────────────────
.course-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: white;
  border-radius: 10px;
  border: 1px solid rgba(17, 24, 39, 0.12);
}

.course-action-btn {
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.78rem;

  &--primary {
    box-shadow: 0 2px 10px rgba($primary, 0.3);
  }
}

// ── Empty State ──────────────────────────────────────────────
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

// ── Unregister Dialog ────────────────────────────────────────
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

// ── Student Card Dialog ─────────────────────────────────────
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

// ── Full Avatar Dialog ──────────────────────────────────────
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

// ── Instructor Chat ─────────────────────────────────────────
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

// ── Benefits ────────────────────────────────────────────────
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

// ── Responsive ───────────────────────────────────────────────
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

// ── Crop Dialog ──────────────────────────────────────────────
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
  border: 1px solid rgba(110, 84, 122, 0.12);
  background:
    radial-gradient(circle at top right, rgba(242, 183, 207, 0.32), transparent 28%),
    linear-gradient(180deg, #fffdfd 0%, #fff5fa 100%);
  display: flex;
  flex-direction: column;
  box-shadow: 0 22px 44px rgba(126, 91, 121, 0.08);
}

.avatar-preview__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.avatar-preview__eyebrow {
  margin: 0;
  color: #c3618c;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.avatar-preview__title {
  margin: 8px 0 0;
  color: #2d355f;
  font-size: 1.5rem;
  line-height: 1.15;
}

.avatar-preview__stamp {
  flex-shrink: 0;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(195, 97, 140, 0.2);
  background: rgba(255, 255, 255, 0.74);
  color: #7c4266;
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
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 244, 250, 0.9)), #fff;
  border: 1px solid rgba(110, 84, 122, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-preview__image {
  width: min(100%, 460px);
  aspect-ratio: 1;
  object-fit: contain;
  filter: drop-shadow(0 24px 36px rgba(86, 55, 89, 0.16));
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
  border: 1px solid rgba(110, 84, 122, 0.1);
  color: #5f4a62;
  font-size: 0.84rem;
  font-weight: 700;
}

.avatar-editor {
  background:
    radial-gradient(circle at top right, rgba(245, 166, 35, 0.08), transparent 30%),
    linear-gradient(180deg, #ffffff 0%, #fffdf9 100%);
  padding: 28px;
  border-radius: 24px;
  border: 1px solid rgba(17, 24, 39, 0.06);
  box-shadow: 0 16px 34px rgba(17, 24, 39, 0.05);
}

.avatar-editor h3 {
  margin: 0 0 12px;
}

.avatar-editor__hint {
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(243, 198, 216, 0.18), rgba(255, 244, 250, 0.92));
  color: #74546d;
  font-size: 0.92rem;
  line-height: 1.5;
}

.editor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 12px;
}

.avatar-select {
  :deep(.q-field__control) {
    min-height: 48px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8) inset;
    transition:
      background 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.2s ease;
  }

  :deep(.q-field__control::before) {
    border: 1px solid rgba(110, 84, 122, 0.16);
  }

  :deep(.q-field__control::after) {
    border: 2px solid rgba($primary, 0.62);
  }

  :deep(.q-field__label) {
    color: #7a6572;
    font-size: 0.82rem;
    font-weight: 700;
  }

  :deep(.q-field__native),
  :deep(.q-field__input) {
    color: #2d355f;
    font-size: 0.92rem;
    font-weight: 700;
  }

  :deep(.q-field__append) {
    color: #c3618c;
  }

  &:hover :deep(.q-field__control) {
    background: #ffffff;
    box-shadow:
      0 0 0 3px rgba(245, 166, 35, 0.1),
      0 8px 18px rgba(126, 91, 121, 0.08);
    transform: translateY(-1px);
  }

  &.q-field--focused :deep(.q-field__control) {
    background: #ffffff;
    box-shadow:
      0 0 0 4px rgba(245, 166, 35, 0.14),
      0 10px 22px rgba(126, 91, 121, 0.1);
  }
}

.full {
  grid-column: span 2;
}

:global(.avatar-select-menu) {
  margin-top: 8px;
  padding: 8px;
  border-radius: 16px;
  border: 1px solid rgba(110, 84, 122, 0.12);
  background:
    radial-gradient(circle at top right, rgba(245, 166, 35, 0.1), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #fffdf9 100%);
  box-shadow:
    0 18px 38px rgba(17, 24, 39, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.9) inset;
}

:global(.avatar-select-menu .q-item) {
  min-height: 40px;
  margin: 2px 0;
  border-radius: 12px;
  color: #3c3440;
  font-size: 0.9rem;
  font-weight: 700;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

:global(.avatar-select-menu .q-item:hover) {
  background: rgba(245, 166, 35, 0.12);
  color: #2d355f;
  transform: translateX(2px);
}

:global(.avatar-select-menu .q-item.q-item--active),
:global(.avatar-select-menu .q-item.q-manual-focusable--focused) {
  background: linear-gradient(135deg, rgba(245, 166, 35, 0.22), rgba(243, 198, 216, 0.22));
  color: #2d355f;
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
}

// ── Payment Card ─────────────────────────────────────────────
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
