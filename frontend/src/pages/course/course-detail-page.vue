<template>
  <q-page>
    <!-- ─── LOADING STATE ─── -->
    <BaseSpinner v-if="isLoading" :message="$t('loadingCourse')" />

    <!-- ─── ERROR STATE ─── -->
    <div v-else-if="error" class="error-state column items-center justify-center q-py-xl">
      <q-icon name="cloud_off" size="4rem" color="grey-4" class="q-mb-md" />
      <div class="text-h6 text-grey-7">{{ error }}</div>
      <q-btn
        flat
        no-caps
        :label="$t('retry')"
        color="primary"
        class="q-mt-lg"
        icon="refresh"
        @click="fetchCourseDetail"
      />
    </div>

    <!-- ─── COURSE DETAIL ─── -->
    <template v-else-if="course">
      <!-- Hero Banner -->
      <section class="detail-hero">
        <div class="detail-hero__overlay" />
        <CourseCoverImage :course="course" fill class="detail-hero__bg" />
        <div class="detail-hero__content section-container">
          <div class="detail-hero__info">
            <div class="detail-hero__badges row q-gutter-xs q-mb-sm">
              <q-badge
                v-if="course.deliveryModes.length > 0"
                :color="getFirstModeColor(course.deliveryModes)"
                class="badge-pill-lg"
              >
                {{
                  course.deliveryModes.map((mode) => getTranslatedDeliveryMode(mode)).join(' / ')
                }}
              </q-badge>
              <q-badge color="amber-9" class="badge-pill-lg">
                {{ getTranslatedCertType(course) }}
              </q-badge>
              <q-badge v-if="course.creditHours > 0" color="deep-purple-6" class="badge-pill-lg">
                {{ $t('creditBank') }} {{ course.creditHours }} {{ $t('credits') }}
              </q-badge>
            </div>
            <div class="detail-hero__code">{{ course.code }}</div>
            <h1 class="detail-hero__title">{{ getTranslatedTitle(course) }}</h1>
            <div class="detail-hero__meta row items-center q-gutter-md q-mt-sm">
              <div class="row items-center q-gutter-xs">
                <q-icon name="school" size="18px" />
                <span>{{ getTranslatedFaculty(course) }}</span>
              </div>
              <div class="row items-center q-gutter-xs">
                <q-icon name="visibility" size="18px" />
                <span
                  >{{ course.views.toLocaleString(locale === 'th' ? 'th-TH' : 'en-US') }}
                  {{ $t('views') }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Info Bar -->
      <section class="quick-info-bar">
        <div class="section-container">
          <div class="row q-col-gutter-md justify-center">
            <div class="col-auto">
              <div class="quick-info-item">
                <q-icon name="event" size="22px" color="primary" />
                <div>
                  <div class="quick-info-item__label">{{ $t('coursePeriod') }}</div>
                  <div class="quick-info-item__value">
                    {{ getTranslatedRegStart(course) }} – {{ getTranslatedRegEnd(course) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-auto">
              <div class="quick-info-item">
                <q-icon name="schedule" size="22px" color="primary" />
                <div>
                  <div class="quick-info-item__label">{{ $t('totalHours') }}</div>
                  <div class="quick-info-item__value">
                    {{ course.totalHours || '—' }}{{ course.totalHours ? ' ' + $t('hours') : '' }}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-auto">
              <div class="quick-info-item">
                <q-icon name="people" size="22px" color="primary" />
                <div>
                  <div class="quick-info-item__label">{{ $t('enrolled') }}</div>
                  <div class="quick-info-item__value">
                    {{ course.enrolledCount }}{{ course.maxSeats ? `/${course.maxSeats}` : '' }}
                    {{ $t('seats') }}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-auto">
              <div class="quick-info-item">
                <q-icon name="payments" size="22px" color="primary" />
                <div>
                  <div class="quick-info-item__label">{{ $t('price') }}</div>
                  <div class="quick-info-item__value">
                    <span
                      v-if="effectivePrice !== null ? effectiveIsFree : course.isFree"
                      class="text-positive text-weight-bold"
                    >{{
                      $t('free')
                    }}</span>
                    <span v-else class="text-negative text-weight-bold"
                      >{{
                        (effectivePrice ?? course.price).toLocaleString(
                          locale === 'th' ? 'th-TH' : 'en-US',
                        )
                      }}
                      {{ $t('thb') }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Content -->
      <section class="detail-content q-py-xl">
        <div class="section-container">
          <div class="row q-col-gutter-xl">
            <!-- Left Column -->
            <div class="col-xs-12 col-md-8">
              <!-- Description -->
              <q-card flat bordered class="detail-card q-mb-lg">
                <q-card-section>
                  <div class="detail-card__header">
                    <q-icon name="description" size="24px" color="primary" />
                    <h2 class="detail-card__title">{{ $t('courseDescription') }}</h2>
                  </div>
                  <p class="detail-card__text q-mt-md q-pa-md">
                    {{ getTranslatedDescription(course) }}
                  </p>
                </q-card-section>
              </q-card>

              <!-- Objectives -->
              <q-card flat bordered class="detail-card q-mb-lg">
                <q-card-section>
                  <div class="detail-card__header">
                    <q-icon name="flag" size="24px" color="primary" />
                    <h2 class="detail-card__title">{{ $t('objectives') }}</h2>
                  </div>
                  <q-list v-if="getTranslatedObjectives(course).length > 0" class="q-mt-md">
                    <q-item
                      v-for="(obj, idx) in getTranslatedObjectives(course)"
                      :key="idx"
                      class="objective-item"
                    >
                      <q-item-section avatar>
                        <div class="objective-number">{{ idx + 1 }}</div>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-body2 text-dark">{{ obj }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>

                  <!-- Placeholder when no objectives yet -->
                  <div v-else class="q-mt-md q-pa-md objectives-pending">
                    <span class="text-body2">
                      {{
                        locale === 'th'
                          ? 'วัตถุประสงค์จะประกาศให้ทราบในภายหลัง'
                          : 'Learning objectives will be announced soon'
                      }}
                    </span>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Applicant Requirements -->
              <q-card flat bordered class="detail-card q-mb-lg">
                <q-card-section>
                  <div class="detail-card__header">
                    <q-icon name="how_to_reg" size="24px" color="primary" />
                    <h2 class="detail-card__title">
                      {{
                        locale === 'th' ? 'เงื่อนไขคุณสมบัติของผู้สมัคร' : 'Applicant Requirements'
                      }}
                    </h2>
                  </div>

                  <!-- Sub-section: Precondition -->
                  <div class="q-mt-md">
                    <div class="applicant-req__subtitle">
                      <span class="text-subtitle2 text-weight-bold text-dark">
                        {{
                          locale === 'th'
                            ? 'ความรู้พื้นฐานหรือเงื่อนไขที่ผู้สมัครควรมีก่อนเข้าเรียน'
                            : 'Prerequisites / Prior Knowledge'
                        }}
                      </span>
                    </div>
                    <div class="q-mt-sm q-pl-sm">
                      <template v-if="course.precondition && course.precondition.trim()">
                        <div
                          v-for="(line, idx) in course.precondition
                            .split('\n')
                            .filter((l) => l.trim())"
                          :key="`precondition-${idx}`"
                          class="applicant-req__item row items-start q-mb-xs"
                        >
                          <span class="text-body2 text-grey-9">{{ line.trim() }}</span>
                        </div>
                      </template>
                      <!-- <div v-else class="row items-center q-gutter-xs text-grey-6">
                        <q-icon name="remove" size="18px" color="grey-5" />
                        <span class="text-body2">-</span>
                      </div> -->
                    </div>
                  </div>

                  <q-separator class="q-my-md" />

                  <!-- Sub-section: Property -->
                  <div>
                    <div class="applicant-req__subtitle">
                      <span class="text-subtitle2 text-weight-bold text-dark">
                        {{ locale === 'th' ? 'คุณสมบัติของผู้สมัคร' : 'Applicant Qualifications' }}
                      </span>
                    </div>
                    <div class="q-mt-sm q-pl-sm">
                      <template v-if="course.property && course.property.trim()">
                        <div
                          v-for="(line, idx) in course.property.split('\n').filter((l) => l.trim())"
                          :key="`property-${idx}`"
                          class="applicant-req__item row items-start q-mb-xs"
                        >
                          <span class="text-body2 text-grey-9">{{ line.trim() }}</span>
                        </div>
                      </template>
                      <!-- <div v-else class="row items-center q-gutter-xs text-grey-6">
                        <q-icon name="remove" size="18px" color="grey-5" />
                        <span class="text-body2">-</span>
                      </div> -->
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Syllabus -->
              <q-card flat bordered class="detail-card q-mb-lg">
                <q-card-section>
                  <div class="detail-card__header">
                    <q-icon name="menu_book" size="24px" color="primary" />
                    <h2 class="detail-card__title">{{ $t('courseSyllabus') }}</h2>
                  </div>
                  <q-list separator class="q-mt-md">
                    <!-- DB Chapters -->
                    <template v-if="dbChapters && dbChapters.length > 0">
                      <q-expansion-item
                        v-for="chapter in dbChapters"
                        :key="chapter.id"
                        :label="` ${chapter.name}`"
                        header-class="syllabus-header"
                        expand-icon-class="text-primary"
                      >
                        <q-card class="syllabus-content">
                          <q-card-section class="q-py-md">
                            <div class="text-body2 text-grey-8">
                              <div
                                v-if="chapter.subchapters && chapter.subchapters.length > 0"
                                class="subchapter-container"
                              >
                                <div
                                  v-for="(sub, subIdx) in chapter.subchapters"
                                  :key="sub.id"
                                  class="subchapter-item flex items-start no-wrap"
                                >
                                  <div class="subchapter-item__index">
                                    {{ subIdx + 1 }}
                                  </div>
                                  <div class="subchapter-item__text text-body2 text-grey-9">
                                    {{ sub.subject }}
                                  </div>
                                </div>
                              </div>
                              <div v-else class="text-grey-5 text-italic q-py-xs">
                                {{
                                  locale === 'th'
                                    ? 'ไม่มีรายละเอียดหัวข้อย่อย'
                                    : 'No subchapters available'
                                }}
                              </div>

                              <div
                                v-if="chapter.hour"
                                class="q-mt-md text-caption text-grey-6 flex items-center"
                              >
                                <q-icon
                                  name="schedule"
                                  size="16px"
                                  color="primary"
                                  class="q-mr-xs"
                                />
                                {{ $t('totalHours') || 'เวลาเรียน' }}: {{ chapter.hour }}
                                {{ $t('hours') || 'ชั่วโมง' }}
                              </div>
                            </div>
                          </q-card-section>
                        </q-card>
                      </q-expansion-item>
                    </template>
                    <!-- Fallback to Mock Syllabus if no DB chapters are loaded -->
                    <template v-else>
                      <q-expansion-item
                        v-for="item in course.syllabus"
                        :key="item.week"
                        :label="`${$t('week')} ${item.week}: ${getTranslatedTopic(item)}`"
                        header-class="syllabus-header"
                        expand-icon-class="text-primary"
                      >
                        <q-card class="syllabus-content">
                          <q-card-section class="q-py-md">
                            <div class="text-body2 text-grey-8">
                              {{ getTranslatedSyllabusDesc(item) }}
                            </div>
                          </q-card-section>
                        </q-card>
                      </q-expansion-item>
                    </template>
                  </q-list>
                </q-card-section>
              </q-card>

              <!-- Evaluation and Score Criteria -->
              <q-card flat bordered class="detail-card q-mb-lg">
                <q-card-section>
                  <div class="detail-card__header">
                    <q-icon name="assignment_turned_in" size="24px" color="primary" />
                    <h2 class="detail-card__title">
                      {{
                        locale === 'th'
                          ? 'เกณฑ์การวัดและประเมินผล'
                          : 'Evaluation and Score Criteria'
                      }}
                    </h2>
                  </div>

                  <div class="q-mt-md">
                    <div class="evaluation-rules q-pa-md">
                      <div
                        class="text-body2 text-grey-9"
                        style="white-space: pre-line; line-height: 1.6"
                      >
                        {{
                          course.evaluationText ||
                          (locale === 'th'
                            ? 'ไม่มีรายละเอียดเกณฑ์การวัดและการประเมินผล'
                            : 'No evaluation details provided')
                        }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Target Audience -->
              <q-card
                v-if="course?.targets && course.targets.length > 0"
                flat
                bordered
                class="detail-card q-mb-lg"
              >
                <q-card-section>
                  <div class="detail-card__header">
                    <q-icon name="groups" size="24px" color="primary" />
                    <h2 class="detail-card__title">
                      {{ locale === 'th' ? 'กลุ่มเป้าหมายที่เข้ารับการศึกษา' : 'Target Audience' }}
                    </h2>
                  </div>

                  <div class="q-mt-md">
                    <q-list class="info-list">
                      <q-item
                        v-for="target in course.targets"
                        :key="target.id"
                        class="objective-item"
                        style="padding: 8px 0"
                      >
                        <q-item-section avatar>
                          <q-icon name="check_circle" color="primary" size="20px" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-body2 text-grey-9 text-weight-medium">
                            {{ target.targetName }}
                            <span v-if="target.subtargetName" class="text-primary text-weight-bold">
                              {{ target.subtargetName }}
                            </span>
                            <span v-if="target.other" class="text-grey-6 text-italic">
                              ({{ target.other }})
                            </span>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Schedule -->
              <q-card flat bordered class="detail-card q-mb-lg">
                <q-card-section>
                  <div class="detail-card__header">
                    <q-icon name="calendar_month" size="24px" color="primary" />
                    <h2 class="detail-card__title">
                      {{ $t('schedule') }}
                    </h2>
                  </div>
                  <div class="q-mt-md">
                    <div
                      v-if="course?.teachTime && course.teachTime.trim()"
                      class="text-body2 text-grey-9 q-pa-md"
                    >
                      {{ course.teachTime }}
                    </div>
                    <!-- Placeholder when no schedule details yet -->
                    <div v-else class="q-pa-md objectives-pending">
                      <span class="text-body2 text-grey-9">
                        {{
                          locale === 'th'
                            ? 'ไม่มีรายละเอียดตารางเรียน'
                            : 'No schedule details provided'
                        }}
                      </span>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
              <!-- Privilege -->
              <q-card flat bordered class="detail-card q-mb-lg">
                <q-card-section>
                  <div class="detail-card__header">
                    <q-icon name="school" size="24px" color="primary" />
                    <h2 class="detail-card__title">
                      {{
                        locale === 'th'
                          ? 'สิทธิประโยชน์ของผู้สำเร็จหลักสูตรนี้'
                          : 'Benefits of Completing this Course'
                      }}
                    </h2>
                  </div>
                  <div class="q-mt-md">
                    <div
                      v-if="course?.privilege && course.privilege.trim()"
                      class="text-body2 text-grey-9 q-pa-md"
                    >
                      {{ course.privilege }}
                    </div>
                    <!-- Placeholder when no privilege yet -->
                    <div v-else class="q-pa-md objectives-pending">
                      <span class="text-body2">
                        {{
                          locale === 'th'
                            ? 'ไม่มีสิทธิประโยชน์เพิ่มเติมสำหรับหลักสูตรนี้'
                            : 'No additional benefits are available for this course'
                        }}
                      </span>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Right Column (Sidebar) -->
            <div class="col-xs-12 col-md-4 detail-sidebar">
              <!-- Course Preview -->
              <q-card
                v-if="course.previewVideoUrl"
                flat
                bordered
                class="course-preview-card q-mb-lg"
              >
                <div
                  class="course-preview-card__frame"
                  @mouseenter="showPreviewControls"
                  @mouseleave="hidePreviewControls"
                  @focusin="showPreviewControls"
                  @focusout="hidePreviewControls"
                >
                  <iframe
                    v-if="isYoutubeVideoUrl(course.previewVideoUrl)"
                    class="course-preview-card__video"
                    :src="getYoutubeEmbedUrl(course.previewVideoUrl, previewControlsVisible)"
                    title="Course preview"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowfullscreen
                  />
                  <video
                    v-else
                    class="course-preview-card__video"
                    :src="course.previewVideoUrl"
                    :poster="course.previewPosterUrl || course.imageUrl"
                    autoplay
                    muted
                    loop
                    :controls="previewControlsVisible"
                    playsinline
                    preload="metadata"
                  />
                  <span class="course-preview-card__shade" />
                </div>
              </q-card>

              <!-- Enroll CTA Card -->
              <q-card flat bordered class="enroll-card q-mb-lg">
                <q-card-section class="enroll-card__top">
                  <div
                    v-if="effectivePrice !== null ? effectiveIsFree : course.isFree"
                    class="enroll-card__price text-positive"
                  >
                    {{ $t('free') }}
                  </div>
                  <div v-else class="enroll-card__price">
                    {{
                      (effectivePrice ?? course.price).toLocaleString(
                        locale === 'th' ? 'th-TH' : 'en-US',
                      )
                    }}
                    <span class="enroll-card__currency">{{ $t('thb') }}</span>
                  </div>
                  <div class="enroll-card__seats q-mt-xs">
                    <q-icon name="people" size="16px" class="q-mr-xs" />
                    {{ $t('enrolled') }} {{ course.enrolledCount
                    }}{{ course.maxSeats ? `/${course.maxSeats}` : '' }}
                  </div>
                  <q-linear-progress
                    :value="enrollmentRatio"
                    :color="progressColor"
                    track-color="grey-3"
                    class="q-mt-sm"
                    rounded
                    size="8px"
                  />
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <q-btn
                    unelevated
                    :color="enrollmentAction.color"
                    :label="enrollmentAction.label"
                    class="full-width enroll-btn q-mb-sm"
                    :icon="enrollmentAction.icon"
                    :disable="enrollmentAction.disabled"
                    no-caps
                    size="lg"
                    @click="onEnrollmentActionClick"
                  />

                  <div
                    class="save-action"
                    :class="{
                      'save-action--active': bookmarkFeedbackActive,
                      'save-action--saved': isBookmarked,
                    }"
                  >
                    <q-btn
                      flat
                      :color="saveButtonColor"
                      :label="saveButtonLabel"
                      class="full-width save-btn"
                      :class="{
                        'save-btn--pop': bookmarkFeedbackActive,
                        'save-btn--saved': isBookmarked,
                      }"
                      :icon="saveButtonIcon"
                      no-caps
                      size="md"
                      @click="onToggleBookmark"
                    />
                    <span
                      v-if="bookmarkFeedbackActive"
                      class="save-action__ring"
                      aria-hidden="true"
                    />
                    <span
                      v-for="dot in saveBurstDots"
                      v-show="bookmarkFeedbackActive && isBookmarked"
                      :key="dot"
                      class="save-action__dot"
                      :class="`save-action__dot--${dot}`"
                      aria-hidden="true"
                    />
                  </div>
                </q-card-section>
              </q-card>

              <!-- Instructor Card -->
              <q-card flat bordered class="detail-card q-mb-lg">
                <q-card-section>
                  <div class="detail-card__header">
                    <q-icon name="person" size="24px" color="primary" />
                    <h2 class="detail-card__title">{{ $t('instructorLabel') }}</h2>
                  </div>
                  <div class="instructor-card q-mt-md">
                    <q-avatar size="72px" class="instructor-card__avatar">
                      <q-img :src="course.instructor.avatarUrl" />
                    </q-avatar>
                    <div class="instructor-card__info q-mt-sm">
                      <div class="text-subtitle1 text-weight-bold text-dark">
                        {{ getTranslatedInstructorName(course) }}
                      </div>
                      <div class="text-caption text-grey-6">
                        {{ getTranslatedInstructorTitle(course) }}
                      </div>
                      <div class="text-caption text-grey-6 q-mt-xs">
                        {{ getTranslatedInstructorDept(course) }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Course Class Type Card -->
              <q-card flat bordered class="detail-card q-mb-lg">
                <q-card-section>
                  <div class="detail-card__header">
                    <q-icon name="school" size="24px" color="primary" />
                    <h2 class="detail-card__title">
                      {{ locale === 'th' ? 'การจัดการเรียนการสอน' : 'Teaching Management' }}
                    </h2>
                  </div>

                  <!-- Loading state -->
                  <div v-if="isLoading" class="q-mt-md">
                    <q-skeleton type="text" width="80%" />
                    <q-skeleton type="text" width="60%" class="q-mt-sm" />
                  </div>

                  <!-- Has typeClasses data -->
                  <q-list
                    v-else-if="course.typeClasses && course.typeClasses.length > 0"
                    class="q-mt-md"
                  >
                    <q-item v-for="tc in course.typeClasses" :key="tc.typeclassId">
                      <q-item-section avatar top>
                        <q-icon name="groups" color="primary" size="20px" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-body2 text-grey-9">
                          {{
                            locale === 'th' ? `แบบที่ ${tc.typeclassId}` : `Type ${tc.typeclassId}`
                          }}
                          <span class="text-grey-6"> — </span>
                          {{ tc.typeclassName ?? '-' }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>

                  <!-- No data fallback -->
                  <div v-else class="q-mt-md">
                    <q-item>
                      <q-item-section>
                        <q-item-label class="text-body2 text-grey-5">
                          {{
                            locale === 'th'
                              ? 'ไม่มีข้อมูลการจัดการเรียนการสอน'
                              : 'No teaching type information available'
                          }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Contact Card -->
              <q-card flat bordered class="detail-card">
                <q-card-section>
                  <div class="detail-card__header">
                    <q-icon name="support_agent" size="24px" color="primary" />
                    <h2 class="detail-card__title">
                      {{ locale === 'th' ? 'ข้อมูลในการติดต่อสอบถาม' : 'Contact Information' }}
                    </h2>
                  </div>
                  <q-list class="q-mt-md">
                    <!-- ชื่อ-สกุล -->
                    <q-item v-if="course.contractName">
                      <q-item-section avatar>
                        <q-icon name="person" color="primary" size="20px" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>{{
                          locale === 'th' ? 'ชื่อ-สกุล' : 'Name'
                        }}</q-item-label>
                        <q-item-label class="text-body2 text-grey-9">{{
                          course.contractName
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <!-- เบอร์โทรศัพท์ -->
                    <q-item
                      v-if="course.contractTel"
                      clickable
                      v-ripple
                      :href="`tel:${course.contractTel}`"
                      tag="a"
                    >
                      <q-item-section avatar>
                        <q-icon name="phone" color="primary" size="20px" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>{{
                          locale === 'th' ? 'เบอร์โทรศัพท์' : 'Phone'
                        }}</q-item-label>
                        <q-item-label class="text-body2 text-grey-9">{{
                          course.contractTel
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <!-- E-mail -->
                    <q-item
                      v-if="course.contractEmail"
                      clickable
                      v-ripple
                      :href="`mailto:${course.contractEmail}`"
                      tag="a"
                    >
                      <q-item-section avatar>
                        <q-icon name="email" color="primary" size="20px" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>{{
                          locale === 'th' ? 'อีเมล' : 'E-mail'
                        }}</q-item-label>
                        <q-item-label class="text-body2 text-grey-9">{{
                          course.contractEmail
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <!-- URL -->
                    <q-item
                      v-if="course.contractUrl"
                      clickable
                      v-ripple
                      :href="course.contractUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      tag="a"
                    >
                      <q-item-section avatar>
                        <q-icon name="link" color="primary" size="20px" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>{{
                          locale === 'th' ? 'เว็บไซต์' : 'Website'
                        }}</q-item-label>
                        <q-item-label class="text-body2 text-grey-9 ellipsis">{{
                          course.contractUrl
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <!-- Fallback: ถ้าไม่มีข้อมูลติดต่อเลย -->
                    <q-item
                      v-if="
                        !course.contractName &&
                        !course.contractTel &&
                        !course.contractEmail &&
                        !course.contractUrl
                      "
                    >
                      <q-item-section>
                        <q-item-label class="text-body2 text-grey-5">
                          {{
                            locale === 'th'
                              ? 'ไม่มีข้อมูลการติดต่อ'
                              : 'No contact information available'
                          }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </section>

      <!-- Course Reviews -->
      <CourseReviewSection
        v-if="numericCourseId"
        :course-id="numericCourseId"
        class="detail-reviews"
      />

      <CourseRecommendationSection
        v-if="recommendedCourses.length > 0"
        :courses="recommendedCourses"
        @course-click="onCourseClick"
      />

      <CourseEnrollmentDialog
        :course="enrollmentDialogCourse"
        :open-key="enrollmentDialogOpenKey"
        @go-to-learning="goToLearningPage"
      />

      <BaseConfirmDialog
        v-model="showLoginRequiredDialog"
        :title="$t('loginRequiredDialog.title')"
        :message="$t('loginRequiredDialog.message')"
        :confirm-label="$t('loginRequiredDialog.confirm')"
        :cancel-label="$t('loginRequiredDialog.cancel')"
        icon="login"
        confirm-icon="login"
        @confirm="goToLogin"
      />

      <BaseConfirmDialog
        v-model="showEnterClassDialog"
        :title="$t('enterClassDialog.title')"
        :message="$t('enterClassDialog.message')"
        :confirm-label="$t('enterClassDialog.confirm')"
        :cancel-label="$t('enterClassDialog.cancel')"
        icon="play_circle"
        confirm-color="positive"
        @confirm="goToLearningPage()"
      />
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { api } from 'src/boot/axios';
import { useRoute, useRouter } from 'vue-router';
import CourseCoverImage from 'components/course/CourseCoverImage.vue';
import CourseEnrollmentDialog from 'components/course/CourseEnrollmentDialog.vue';
import CourseRecommendationSection from 'components/course/CourseRecommendationSection.vue';
import CourseReviewSection from 'components/course/CourseReviewSection.vue';
import BaseConfirmDialog from 'components/base/BaseConfirmDialog.vue';
import BaseSpinner from 'components/base/BaseSpinner.vue';
import { useCourseDetail } from 'src/composables/use-course-detail';
import { useCourseChapers } from 'src/composables/use-course-chapters';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseStore } from 'src/stores/course-store';
import { useCourseRegistrationStore } from 'src/stores/course-registration-store';
import { useCourseBookmarkStore } from 'src/stores/course-bookmark-store';
import { useEffectiveCoursePrice } from 'src/composables/use-effective-course-price';
import type { Course, DeliveryMode } from 'src/types/course';
import type {
  CourseDetail,
  CourseSyllabus,
  EnrollmentAction,
  RegistrationWindowStatus,
} from 'src/types/course-detail';
import { useI18n } from 'vue-i18n';
import { useMoodleSso } from 'src/composables/use-moodle-sso';
import { pushMoodleLearningRoute } from 'src/utils/moodle-navigation';

const { locale, t } = useI18n();

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const courseStore = useCourseStore();
const courseRegistrationStore = useCourseRegistrationStore();
const courseBookmarkStore = useCourseBookmarkStore();
const { getMoodleCourseUrl } = useMoodleSso();

function getRouteCourseId(): string {
  const routeCourseId = route.params.id;

  if (Array.isArray(routeCourseId)) {
    return routeCourseId[0] ?? '';
  }

  return typeof routeCourseId === 'string' ? routeCourseId : '';
}

function getTranslatedTitle(course: Course): string {
  if (locale.value === 'th') return course.title;
  return course.titleEn || course.title;
}

function getTranslatedFaculty(course: Course): string {
  if (locale.value === 'th') return course.faculty;
  return course.facultyEn || course.faculty;
}

function getTranslatedDescription(course: CourseDetail): string {
  if (locale.value === 'th') return course.descriptionFull;
  return course.descriptionFullEn || course.descriptionFull;
}

const MOCK_OBJECTIVE_PLACEHOLDERS = [
  'รายละเอียดวัตถุประสงค์จะประกาศเพิ่มเติม',
  'Learning objectives will be announced.',
];

function getTranslatedObjectives(course: CourseDetail): string[] {
  const raw =
    locale.value === 'th' ? course.objectives : (course.objectivesEn ?? course.objectives);
  return raw.filter((obj) => !MOCK_OBJECTIVE_PLACEHOLDERS.includes(obj.trim()));
}

function getTranslatedInstructorName(course: CourseDetail): string {
  if (locale.value === 'th') return course.instructor.name;
  return course.instructor.nameEn || course.instructor.name;
}

function getTranslatedInstructorTitle(course: CourseDetail): string {
  if (locale.value === 'th') return course.instructor.title;
  return course.instructor.titleEn || course.instructor.title;
}

function getTranslatedInstructorDept(course: CourseDetail): string {
  if (locale.value === 'th') return course.instructor.department;
  return course.instructor.departmentEn || course.instructor.department;
}

function getTranslatedTopic(item: CourseSyllabus): string {
  if (locale.value === 'th') return item.topic;
  return item.topicEn || item.topic;
}

function getTranslatedSyllabusDesc(item: CourseSyllabus): string {
  if (locale.value === 'th') return item.description;
  return item.descriptionEn || item.description;
}

function getTranslatedRegStart(course: Course): string {
  if (locale.value === 'th') {
    return course.registrationStartDate
      ? formatRegistrationDateByLocale(course.registrationStartDate)
      : course.registrationStart;
  }
  return course.registrationStartEn || formatRegistrationDateByLocale(course.registrationStartDate);
}

function getTranslatedRegEnd(course: Course): string {
  if (locale.value === 'th') {
    return course.registrationEndDate
      ? formatRegistrationDateByLocale(course.registrationEndDate)
      : course.registrationEnd;
  }
  return course.registrationEndEn || formatRegistrationDateByLocale(course.registrationEndDate);
}

function getTranslatedCertType(course: CourseDetail): string {
  if (locale.value === 'th') return course.certificateType;
  return course.certificateTypeEn || course.certificateType;
}

function getTranslatedDeliveryMode(mode: DeliveryMode): string {
  const map: Record<DeliveryMode, string> = {
    Online: t('deliveryModeOnline'),
    Onsite: t('deliveryModeOnsite'),
    'Self-Paced Learning': t('deliveryModeSelfPaced'),
  };
  return map[mode] || mode;
}

function getYoutubeVideoId(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);

    if (url.hostname.includes('youtu.be')) {
      return url.pathname.split('/').filter(Boolean)[0] ?? null;
    }

    if (url.hostname.includes('youtube.com')) {
      if (url.pathname.startsWith('/embed/')) {
        return url.pathname.split('/').filter(Boolean)[1] ?? null;
      }

      return url.searchParams.get('v');
    }
  } catch {
    return null;
  }

  return null;
}

function isYoutubeVideoUrl(videoUrl: string): boolean {
  return Boolean(getYoutubeVideoId(videoUrl));
}

function getYoutubeEmbedUrl(videoUrl: string, showControls: boolean): string {
  const videoId = getYoutubeVideoId(videoUrl);

  if (!videoId) {
    return videoUrl;
  }

  const params = new URLSearchParams({
    autoplay: '1',
    controls: showControls ? '1' : '0',
    loop: '1',
    mute: '1',
    playlist: videoId,
    playsinline: '1',
    rel: '0',
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

const courseId = computed<string>(getRouteCourseId);
const numericCourseId = computed<number | null>(() => {
  const raw = courseId.value.replace('db-', '');
  const n = Number(raw);
  return !Number.isNaN(n) && n > 0 ? n : null;
});
const { course, recommendedCourses, isLoading, error, fetchCourseDetail } =
  useCourseDetail(courseId);
const { effectivePrice, effectiveIsFree } = useEffectiveCoursePrice(course);

// ดึงข้อมูลรูปจาก router state เพื่อแสดง hero ทันทีก่อน API โหลด
const { chapters: dbChapters, fetchChapters } = useCourseChapers();

const enrollmentDialogCourse = ref<CourseDetail | null>(null);
const enrollmentDialogOpenKey = ref(0);
const showLoginRequiredDialog = ref(false);
const showEnterClassDialog = ref(false);
const previewControlsVisible = ref(false);
const bookmarkFeedbackActive = ref(false);
const bookmarkFeedbackMode = ref<'saved' | 'removed'>('saved');
const saveBurstDots = [1, 2, 3, 4, 5, 6, 7, 8];
let bookmarkFeedbackTimer: ReturnType<typeof setTimeout> | null = null;

const isCourseRegistered = computed<boolean>(() => {
  if (!course.value) {
    return false;
  }

  return courseRegistrationStore.isRegistered(course.value.id);
});

const isCourseCompleted = computed<boolean>(() => {
  if (!course.value) return false;
  return courseRegistrationStore.isCourseCompleted(course.value.id);
});

const courseRegistration = computed(() => {
  if (!course.value) {
    return null;
  }
  return (
    courseRegistrationStore.myRegistrations.find((r) => r.courseId === course.value?.id) || null
  );
});

const isBookmarked = computed<boolean>(() => {
  if (!course.value) {
    return false;
  }

  return courseBookmarkStore.isBookmarked(course.value.id);
});

const saveButtonColor = computed(() => {
  if (bookmarkFeedbackActive.value && bookmarkFeedbackMode.value === 'saved') {
    return 'positive';
  }

  return isBookmarked.value ? 'negative' : 'primary';
});

const saveButtonIcon = computed(() => {
  if (bookmarkFeedbackActive.value && bookmarkFeedbackMode.value === 'saved') {
    return 'check_circle';
  }

  if (bookmarkFeedbackActive.value && bookmarkFeedbackMode.value === 'removed') {
    return 'bookmark_remove';
  }

  return isBookmarked.value ? 'bookmark_remove' : 'bookmark_add';
});

const saveButtonLabel = computed(() => {
  if (bookmarkFeedbackActive.value && bookmarkFeedbackMode.value === 'saved') {
    return locale.value === 'th' ? 'บันทึกแล้ว' : 'Saved';
  }

  return isBookmarked.value ? t('profile.courses.unsave') : t('profile.courses.save');
});

const isCourseFull = computed<boolean>(() => {
  if (!course.value) {
    return false;
  }

  return course.value.maxSeats != null && course.value.enrolledCount >= course.value.maxSeats;
});

const registrationWindowStatus = computed<RegistrationWindowStatus>(() => {
  if (!course.value) {
    return 'closed';
  }

  const today = new Date();
  const registrationStart = parseLocalDate(course.value.registrationStartDate);
  const registrationEnd = getEndOfLocalDate(course.value.registrationEndDate);
  const hasValidDates = !isNaN(registrationStart.getTime()) && !isNaN(registrationEnd.getTime());

  if (hasValidDates && today < registrationStart) {
    return 'upcoming';
  }

  if (hasValidDates && today > registrationEnd) {
    return 'closed';
  }

  return 'open';
});

const enrollmentAction = computed<EnrollmentAction>(() => {
  if (isCourseCompleted.value) {
    // Completed courses stay enterable so learners can go back and review.
    return {
      label: t('courseDetail.reviewLessons'),
      icon: 'menu_book',
      color: 'positive',
      disabled: false,
    };
  }

  if (isCourseRegistered.value) {
    if (courseRegistration.value?.paymentStatus === 'pending') {
      return {
        label: t('courseDetail.pendingPayment'),
        icon: 'hourglass_empty',
        color: 'orange-8',
        disabled: false,
      };
    }

    return {
      label: t('courseDetail.enterClass'),
      icon: 'play_circle',
      color: 'positive',
      disabled: false,
    };
  }

  if (registrationWindowStatus.value === 'upcoming') {
    return {
      label: t('courseDetail.regUpcoming'),
      icon: 'schedule',
      color: 'grey-7',
      disabled: true,
    };
  }

  if (registrationWindowStatus.value === 'closed') {
    return {
      label: t('courseDetail.regClosed'),
      icon: 'event_busy',
      color: 'grey-7',
      disabled: true,
    };
  }

  if (isCourseFull.value) {
    return {
      label: t('courseDetail.seatsFull'),
      icon: 'block',
      color: 'grey-7',
      disabled: true,
    };
  }

  return {
    label: t('courseDetail.enrollNow'),
    icon: 'how_to_reg',
    color: 'primary',
    disabled: false,
  };
});

const enrollmentRatio = computed<number>(() => {
  if (!course.value || !course.value.maxSeats) {
    return 0;
  }

  return Math.min(course.value.enrolledCount / course.value.maxSeats, 1);
});

const progressColor = computed<string>(() =>
  enrollmentAction.value.disabled ? 'grey-7' : 'primary',
);

function parseLocalDate(dateText: string | null | undefined): Date {
  if (!dateText) return new Date(NaN);
  const parts = dateText.split('-').map(Number);
  if (parts.length < 3 || parts.some(isNaN)) return new Date(NaN);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return new Date(parts[0] as number, (parts[1] as number) - 1, parts[2] as number);
}

function formatRegistrationDateByLocale(dateText: string | null | undefined): string {
  if (!dateText) return '—';
  const date = parseLocalDate(dateText);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(locale.value === 'th' ? 'th-TH' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getEndOfLocalDate(dateText: string | null | undefined): Date {
  const date = parseLocalDate(dateText);
  if (!isNaN(date.getTime())) date.setHours(23, 59, 59, 999);
  return date;
}

function getModeColor(mode: DeliveryMode): string {
  const colorMap: Record<DeliveryMode, string> = {
    Online: 'teal-7',
    Onsite: 'red-7',
    'Self-Paced Learning': 'blue-7',
  };
  return colorMap[mode] ?? 'grey';
}

function getFirstModeColor(modes: DeliveryMode[]): string {
  const first = modes[0];
  if (!first) return 'grey';
  return getModeColor(first);
}

function onCourseClick(courseItem: Course): void {
  void router.push(`/course/${courseItem.id}`);
}

async function goToLearningPage(targetCourseId = courseId.value): Promise<void> {
  const username = authStore.user?.username;
  if (username) {
    const courseCode = course.value?.code;
    const moodleCourseId = String(course.value?.moodleId ?? targetCourseId);
    const url = await getMoodleCourseUrl(moodleCourseId, username, courseCode);
    if (url) {
      pushMoodleLearningRoute(router, targetCourseId, url, {
        moodleCourseId,
        courseCode,
        courseTitle: course.value?.title,
      });
      return;
    }
  }
  void router.push(`/course/${targetCourseId}/learn`);
}

function goToLogin(): void {
  void router.push({
    path: '/login',
    query: { redirect: route.fullPath },
  });
}

function onEnrollmentActionClick(): void {
  if (!course.value || enrollmentAction.value.disabled) {
    return;
  }

  if (isCourseRegistered.value) {
    if (courseRegistration.value?.paymentStatus === 'pending') {
      enrollmentDialogCourse.value = course.value;
      enrollmentDialogOpenKey.value += 1;
      return;
    }
    showEnterClassDialog.value = true;
    return;
  }

  if (!authStore.isLoggedIn) {
    showLoginRequiredDialog.value = true;
    return;
  }

  enrollmentDialogCourse.value = course.value;
  enrollmentDialogOpenKey.value += 1;
}

function showPreviewControls(): void {
  previewControlsVisible.value = true;
}

function hidePreviewControls(): void {
  previewControlsVisible.value = false;
}

function onToggleBookmark(): void {
  if (!course.value) {
    return;
  }

  if (!authStore.isLoggedIn) {
    showLoginRequiredDialog.value = true;
    return;
  }

  const wasBookmarked = isBookmarked.value;
  courseBookmarkStore.toggleBookmark(course.value);
  playBookmarkFeedback(wasBookmarked ? 'removed' : 'saved');
}

function playBookmarkFeedback(mode: 'saved' | 'removed'): void {
  bookmarkFeedbackMode.value = mode;
  bookmarkFeedbackActive.value = false;

  if (bookmarkFeedbackTimer) {
    clearTimeout(bookmarkFeedbackTimer);
  }

  requestAnimationFrame(() => {
    bookmarkFeedbackActive.value = true;
    bookmarkFeedbackTimer = setTimeout(() => {
      bookmarkFeedbackActive.value = false;
      bookmarkFeedbackTimer = null;
    }, 820);
  });
}

onBeforeUnmount(() => {
  if (bookmarkFeedbackTimer) {
    clearTimeout(bookmarkFeedbackTimer);
  }
});

function recordCourseClick(id: string): void {
  const numericId = Number(id.replace('db-', ''));
  if (!numericId || Number.isNaN(numericId)) return;
  void api
    .post<{ clickCount: number }>(`/api/moodle/courses/${numericId}/click`, {})
    .then(({ data }) => {
      courseStore.updateCourse(id, { views: data.clickCount });
      if (course.value) course.value.views = data.clickCount;
    })
    .catch(() => undefined);
}

watch(
  courseId,
  (id) => {
    void fetchCourseDetail();
    const rawId = id ? id.replace('db-', '') : '';
    const moodleId = Number(rawId);
    if (moodleId && !Number.isNaN(moodleId)) {
      void fetchChapters(moodleId);
    }
    if (id) recordCourseClick(id);
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
// ── Hero Banner ──────────────────────────────────────────────
.detail-hero {
  position: relative;
  min-height: 340px;
  overflow: hidden;

  &__bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: linear-gradient(
      180deg,
      rgba(15, 23, 42, 0.5) 0%,
      rgba(24, 40, 53, 0.78) 62%,
      rgba(35, 78, 112, 0.9) 100%
    );
  }

  &__content {
    position: relative;
    z-index: 2;
    padding-top: 84px;
    padding-bottom: 48px;
    color: white;
  }

  &__info {
    flex: 1 1 560px;
    min-width: 0;
  }

  &__badges {
    flex-wrap: wrap;
  }

  &__code {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
    letter-spacing: 0;
    margin-bottom: 4px;
  }

  &__title {
    font-size: 1.85rem;
    font-weight: 800;
    line-height: 1.3;
    margin: 0;
    max-width: 720px;
    color: white;
  }

  &__meta {
    font-size: 0.88rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 400;
  }
}

.badge-pill-lg {
  border-radius: 999px !important;
  padding: 4px 14px !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  letter-spacing: 0;
}

// ── Quick Info Bar ────────────────────────────────────────────
.quick-info-bar {
  background: white;
  border-bottom: 1px solid rgba(17, 24, 39, 0.12);
  padding: 18px 0;
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.06);
}

.quick-info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;

  &__label {
    font-size: 0.72rem;
    color: #999;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0;
  }

  &__value {
    font-size: 0.92rem;
    font-weight: 700;
    color: #333;
  }
}

// ── Loading & Error ──────────────────────────────────────────
.loading-state {
  min-height: 60vh;
}

.error-state {
  min-height: 50vh;
}

// ── Detail Content ───────────────────────────────────────────
.detail-content {
  background: transparent;
}

// ── Detail Cards ─────────────────────────────────────────────
.detail-card {
  border-radius: 14px !important;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__title {
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0;
    color: #1a1a1a;
  }

  &__text {
    font-size: 0.95rem;
    line-height: 1.8;
    color: #555;
    margin: 0;
  }
}

// ── Objectives ───────────────────────────────────────────────
.objective-item {
  padding: 8px 0;
  min-height: auto;
}

.objective-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary 0%, #d48e1e 100%);
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(245, 166, 35, 0.35);
}

// ── Syllabus ─────────────────────────────────────────────────
.syllabus-header {
  font-weight: 600;
  color: #333;
  font-size: 0.92rem;
  padding: 14px 16px;
  border-radius: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: #fafafa;
  }
}

.syllabus-content {
  background: #fafbfc;
  border-radius: 0 0 8px 8px;
}

/* เพิ่มส่วนนี้เข้าไปครับ */
.subchapter-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subchapter-item {
  background: #ffffff;
  border: 1px solid rgba(17, 24, 39, 0.06);
  border-radius: 8px;
  padding: 10px 14px;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: rgba($primary, 0.2);
    box-shadow: 0 2px 10px rgba(17, 24, 39, 0.04);
    transform: translateX(4px);
  }

  // แถบสีด้านซ้ายเวลา Hover
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: $primary;
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  &__index {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    background: rgba($primary, 0.1);
    color: $primary;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    margin-right: 12px;
    margin-top: -1px;
  }

  &__text {
    line-height: 1.5;
    flex: 1;
  }
}

// ── Schedule Table ───────────────────────────────────────────
.schedule-table {
  border-radius: 8px !important;
  overflow: hidden;

  thead {
    background: #234e70;

    th {
      color: white !important;
      font-weight: 600;
      font-size: 0.85rem;
      padding: 12px 16px;
    }
  }

  tbody td {
    font-size: 0.9rem;
    padding: 12px 16px;
    color: #444;
  }

  tbody tr:hover {
    background: rgba($primary, 0.04);
  }
}

// ── Detail Sidebar ───────────────────────────────────────────
.detail-sidebar {
  align-self: flex-start;
}

// ── Course Preview ───────────────────────────────────────────
.course-preview-card {
  border-radius: 14px !important;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;
  overflow: hidden;
  background: #0f172a;
  box-shadow: none !important;

  &__frame {
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: #0f172a;
  }

  &__video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    object-fit: cover;
  }

  &__shade {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(180deg, rgba(15, 23, 42, 0.02), rgba(15, 23, 42, 0.2)),
      linear-gradient(135deg, rgba(245, 166, 35, 0.1), transparent 48%);
  }
}

// ── Enroll Card ──────────────────────────────────────────────
.enroll-card {
  border-radius: 14px !important;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;
  overflow: hidden;
  box-shadow: none !important;

  &__top {
    background:
      radial-gradient(circle at 20% 10%, rgba($primary, 0.22), transparent 34%),
      linear-gradient(135deg, #fff8ea 0%, #f5fbf9 100%);
    text-align: center;
    padding: 24px;
  }

  &__price {
    font-size: 2.2rem;
    font-weight: 800;
    color: $secondary;
    line-height: 1.1;
  }

  &__currency {
    font-size: 1rem;
    font-weight: 600;
    color: #666;
  }

  &__seats {
    font-size: 0.82rem;
    color: #777;
    font-weight: 500;
  }
}

.enroll-btn {
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  padding: 12px 24px;
  letter-spacing: 0;
  box-shadow: 0 4px 16px rgba($primary, 0.35);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba($primary, 0.45);
  }
}

.save-action {
  position: relative;
  isolation: isolate;
}

.save-btn {
  position: relative;
  z-index: 2;
  overflow: visible;
  border-radius: 8px;
  font-weight: 700;
  border-width: 2px;
  transition:
    background 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s cubic-bezier(0.2, 1.4, 0.35, 1);
}

.save-btn--saved {
  background: rgba(239, 68, 68, 0.06);
}

.save-btn--pop {
  animation: saveButtonSubscribePop 0.64s cubic-bezier(0.18, 1.35, 0.32, 1);
}

.save-action--active .save-btn {
  box-shadow: 0 12px 26px rgba(34, 197, 94, 0.22);
}

.save-action__ring {
  position: absolute;
  inset: -5px;
  z-index: 1;
  border: 2px solid rgba(34, 197, 94, 0.42);
  border-radius: 12px;
  pointer-events: none;
  animation: saveButtonSubscribeRing 0.72s ease-out both;
}

.save-action__dot {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 0;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #22c55e;
  pointer-events: none;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
  animation: saveButtonSubscribeDot 0.78s ease-out both;
}

.save-action__dot--1 {
  --save-dot-x: -134px;
  --save-dot-y: -28px;
  background: #22c55e;
}

.save-action__dot--2 {
  --save-dot-x: -92px;
  --save-dot-y: 30px;
  background: #f59e0b;
}

.save-action__dot--3 {
  --save-dot-x: -34px;
  --save-dot-y: -36px;
  background: #0ea5e9;
}

.save-action__dot--4 {
  --save-dot-x: 38px;
  --save-dot-y: 34px;
  background: #22c55e;
}

.save-action__dot--5 {
  --save-dot-x: 92px;
  --save-dot-y: -34px;
  background: #ef4444;
}

.save-action__dot--6 {
  --save-dot-x: 132px;
  --save-dot-y: 24px;
  background: #f59e0b;
}

.save-action__dot--7 {
  --save-dot-x: -156px;
  --save-dot-y: 10px;
  background: #ef4444;
}

.save-action__dot--8 {
  --save-dot-x: 156px;
  --save-dot-y: -10px;
  background: #0ea5e9;
}

@keyframes saveButtonSubscribePop {
  0% {
    transform: scale(1);
  }
  34% {
    transform: scale(0.92);
  }
  62% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes saveButtonSubscribeRing {
  0% {
    opacity: 0.72;
    transform: scale(0.92);
  }
  100% {
    opacity: 0;
    transform: scale(1.16);
  }
}

@keyframes saveButtonSubscribeDot {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3);
  }
  18% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--save-dot-x)), calc(-50% + var(--save-dot-y))) scale(0.95);
  }
}

// ── Registration Dialog ──────────────────────────────────────
.registration-dialog {
  position: relative;
  width: min(760px, calc(100vw - 32px));
  overflow: hidden;
  border-radius: 12px !important;
  background: white;
  box-shadow: 0 24px 72px rgba(15, 23, 42, 0.24) !important;

  &--paid {
    width: min(820px, calc(100vw - 32px));
  }

  &__close {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 5;
    color: #334155;
    background: rgba(255, 255, 255, 0.92) !important;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.16);
  }

  &__hero {
    position: relative;
    overflow: hidden;
    background: #1f2937;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 1;
      background:
        linear-gradient(180deg, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.84) 100%),
        linear-gradient(135deg, rgba(35, 78, 112, 0.42), rgba(245, 166, 35, 0.18));
    }
  }

  &__hero-cover {
    z-index: 0;
  }

  &__hero-content {
    position: relative;
    z-index: 2;
    min-height: 132px;
    padding: 20px 72px 18px 28px;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  &__price-badge {
    width: fit-content;
    margin-bottom: 10px;
    border-radius: 999px !important;
    padding: 5px 13px !important;
    font-size: 0.8rem !important;
    font-weight: 800 !important;
  }

  &__course-code {
    margin-bottom: 5px;
    color: rgba(255, 255, 255, 0.72);
    font-size: 0.78rem;
    font-weight: 700;
  }

  &__course-title {
    max-width: 680px;
    color: white;
    font-size: 1.14rem;
    font-weight: 800;
    line-height: 1.38;
    display: -webkit-box;
    overflow: hidden;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__course-meta {
    margin-top: 10px;
    color: rgba(255, 255, 255, 0.78);
    font-size: 0.82rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__content {
    padding: 18px 28px 22px;
  }

  &__billing {
    margin-top: 0;
  }

  &__billing-title {
    margin-bottom: 12px;
    color: #374151;
    font-size: 1rem;
    font-weight: 800;
  }

  &__form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 18px;
    row-gap: 4px;
  }

  &__field {
    min-width: 0;

    &--full {
      grid-column: 1 / -1;
    }
  }

  &__field-label {
    min-height: 34px;
    margin-bottom: 5px;
    color: #4b5563;
    font-size: 0.88rem;
    font-weight: 700;
    line-height: 1.3;
    display: flex;
    align-items: flex-end;
  }

  &__input {
    :deep(.q-field__control) {
      min-height: 46px;
      border-radius: 8px;
    }

    :deep(.q-field__native) {
      color: #444;
      font-weight: 500;
    }

    :deep(.q-field__bottom) {
      min-height: 20px;
      padding: 4px 8px 0;
      font-size: 0.74rem;
    }

    :deep(textarea.q-field__native) {
      min-height: 56px;
      resize: none;
    }
  }

  &__label {
    margin-top: 8px;
    color: #374151;
    font-size: 1rem;
    font-weight: 800;
  }

  &__options {
    margin-top: 8px;
    padding: 8px 12px;
    border: 1px solid rgba(17, 24, 39, 0.08);
    border-radius: 8px;
    background: #f9fafb;
    color: #4b5563;
    font-size: 0.94rem;
    font-weight: 600;
  }

  &__actions {
    margin-top: 14px;
    padding: 14px 0 0;
    border-top: 1px solid rgba(17, 24, 39, 0.08);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  &__confirm,
  &__cancel {
    min-width: 104px;
    min-height: 40px;
    border-radius: 8px;
    font-weight: 800;
    padding: 9px 20px;
  }
}

// ── Instructor Card ──────────────────────────────────────────
.instructor-card {
  text-align: center;

  &__avatar {
    border: 3px solid $primary;
    box-shadow: 0 4px 16px rgba($primary, 0.2);
  }
}

// ── Info List ────────────────────────────────────────────────
.info-list {
  :deep(.q-item) {
    padding: 10px 0;
    min-height: auto;
  }
}

// ── Responsive ───────────────────────────────────────────────
@media (max-width: 767px) {
  .registration-dialog {
    width: min(100%, calc(100vw - 24px));

    &--paid {
      width: min(100%, calc(100vw - 24px));
    }

    &__close {
      top: 8px;
      right: 8px;
    }

    &__hero-content {
      min-height: 138px;
      padding: 18px 56px 16px 16px;
    }

    &__price-badge {
      margin-bottom: 8px;
    }

    &__course-title {
      font-size: 0.95rem;
      line-clamp: 2;
    }

    &__course-meta {
      margin-top: 10px;
      font-size: 0.78rem;
    }

    &__content {
      padding: 14px 16px 16px;
    }

    &__billing {
      margin-top: 0;
    }

    &__form-grid {
      grid-template-columns: 1fr;
      row-gap: 6px;
    }

    &__field-label {
      min-height: 0;
      font-size: 0.84rem;
    }

    &__input {
      :deep(.q-field__control) {
        min-height: 44px;
      }

      :deep(textarea.q-field__native) {
        min-height: 58px;
      }
    }

    &__options {
      font-size: 0.88rem;
      padding: 8px 10px;
    }

    &__actions {
      margin-top: 14px;
      padding-top: 14px;
      justify-content: stretch;
      gap: 8px;
    }

    &__confirm,
    &__cancel {
      flex: 1 1 0;
      min-width: 0;
    }
  }

  .detail-hero {
    min-height: 260px;

    &__title {
      font-size: 1.35rem;
    }

    &__content {
      padding-top: 76px;
      padding-bottom: 32px;
    }
  }

  .quick-info-bar {
    .section-container .row {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .quick-info-item {
    padding: 6px 0;
  }
}

@media (min-width: 768px) and (max-height: 760px) {
  .registration-dialog {
    &__hero-content {
      min-height: 118px;
      padding-top: 18px;
      padding-bottom: 16px;
    }

    &__content {
      padding: 16px 24px 18px;
    }

    &__billing {
      margin-top: 0;
    }

    &__label {
      margin-top: 12px;
    }

    &__actions {
      margin-top: 12px;
      padding-top: 12px;
    }
  }
}

// ── Applicant Requirements ───────────────────────────────────
.applicant-req {
  &__subtitle {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }

  &__item {
    line-height: 1.6;
  }
}
</style>
