<template>
  <q-page class="bg-grey-1 course-page">
    <q-layout
      view="lHh Lpr lFf"
      container
      style="height: calc(100vh - 68px); overflow-y: scroll"
      class="learning-layout shadow-2"
    >
      <!-- Course Toolbar (Header) -->
      <q-header elevated class="nav-bar text-white">
        <div class="section-container">
          <div class="row items-center no-wrap">
            <!-- Left: Menu toggle + Tabs -->
            <div class="row items-center no-wrap col">
              <div
                class="menu-toggle-btn cursor-pointer row items-center justify-center"
                @click="leftDrawerOpen = !leftDrawerOpen"
              >
                <q-icon name="menu" size="20px" />
              </div>

              <q-tabs
                v-model="activeNav"
                align="left"
                active-color="white"
                indicator-color="white"
                dense
                no-caps
                class="nav-tabs"
              >
                <q-tab
                  name="home"
                  icon="home"
                  :label="$t('learning.home')"
                  class="nav-tab"
                  @click="$router.push('/course-home')"
                />

                <q-tab
                  name="my-courses"
                  icon="auto_stories"
                  :label="$t('learning.myCourses')"
                  class="nav-tab"
                  @mouseenter="openMenu"
                  @mouseleave="closeMenu"
                >
                  <q-menu
                    v-model="myCoursesMenu"
                    @mouseenter="openMenu"
                    @mouseleave="closeMenu"
                    transition-show="jump-down"
                    transition-hide="jump-up"
                    fit
                    class="my-courses-dropdown shadow-10"
                    :offset="[0, 8]"
                  >
                    <q-list style="min-width: 320px" class="q-py-sm">
                      <div class="text-overline q-px-md q-pb-sm text-grey-6 letter-spacing-1">
                        {{ $t('profile.courses.registeredTitle') }}
                      </div>
                      <q-item
                        v-for="course in registeredCourses"
                        :key="course.id"
                        clickable
                        v-ripple
                        @click="$router.push(`/course/${course.id}/learn`)"
                        class="course-menu-item q-mx-sm border-radius-10"
                        :active="course.id === courseId"
                        active-class="bg-blue-1 text-primary"
                      >
                        <q-item-section avatar>
                          <q-avatar
                            :icon="course.cover.icon"
                            :color="course.id === courseId ? 'primary' : 'grey-2'"
                            :text-color="course.id === courseId ? 'white' : 'grey-7'"
                            size="32px"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label lines="1" class="text-weight-bold">{{
                            course.title
                          }}</q-item-label>
                          <q-item-label caption>{{ course.code }}</q-item-label>
                        </q-item-section>
                        <q-item-section side v-if="course.id === courseId">
                          <q-icon name="check_circle" color="primary" size="20px" />
                        </q-item-section>
                      </q-item>
                      <q-item
                        v-if="registeredCourses.length === 0"
                        class="text-grey-6 text-center q-pa-md"
                      >
                        {{ $t('profile.courses.empty') }}
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-tab>

                <q-tab
                  name="this-course"
                  icon="school"
                  :label="$t('learning.thisCourse')"
                  class="nav-tab"
                  @mouseenter="openThisCourseMenu"
                  @mouseleave="closeThisCourseMenu"
                >
                  <q-menu
                    v-model="thisCourseMenu"
                    @mouseenter="openThisCourseMenu"
                    @mouseleave="closeThisCourseMenu"
                    transition-show="jump-down"
                    transition-hide="jump-up"
                    class="this-course-dropdown shadow-12"
                    :offset="[0, 0]"
                    square
                  >
                    <q-list style="min-width: 220px" class="q-py-sm">
                      <q-item clickable v-ripple class="this-course-menu-item">
                        <q-item-section avatar class="this-course-icon-section">
                          <q-icon name="format_list_numbered" size="20px" color="grey-7" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">{{
                            $t('thisCourse.sections')
                          }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-icon name="chevron_right" size="18px" color="grey-5" />
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-ripple class="this-course-menu-item">
                        <q-item-section avatar class="this-course-icon-section">
                          <q-icon name="groups" size="20px" color="deep-purple-5" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">{{
                            $t('thisCourse.participants')
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-ripple
                        class="this-course-menu-item"
                        @click="$router.push(`/course/${courseId}/grades`)"
                      >
                        <q-item-section avatar class="this-course-icon-section">
                          <q-icon name="grid_on" size="20px" color="teal-6" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">{{
                            $t('thisCourse.grades')
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-ripple class="this-course-menu-item">
                        <q-item-section avatar class="this-course-icon-section">
                          <q-icon name="forum" size="20px" color="blue-grey-5" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">{{
                            $t('thisCourse.forum')
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-ripple
                        class="this-course-menu-item"
                        @click="$router.push(`/course/${courseId}/learn`)"
                      >
                        <q-item-section avatar class="this-course-icon-section">
                          <q-icon name="description" size="20px" color="orange-7" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">{{
                            $t('thisCourse.content')
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-ripple class="this-course-menu-item">
                        <q-item-section avatar class="this-course-icon-section">
                          <q-icon name="manage_accounts" size="20px" color="deep-orange-5" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">{{
                            $t('thisCourse.quiz')
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-tab>

                <q-tab
                  name="lll-system"
                  icon="stars"
                  :label="$t('learning.systemTitle')"
                  class="nav-tab"
                  @click="$router.push('/profile')"
                />
              </q-tabs>
            </div>

            <!-- Right: View Mode Toggle -->
            <div class="view-toggle-group row items-center q-gutter-xs q-pr-sm">
              <q-btn
                :flat="isFullscreen"
                :unelevated="!isFullscreen"
                round
                dense
                icon="view_agenda"
                size="sm"
                :class="!isFullscreen ? 'view-btn-active' : 'view-btn-inactive'"
                @click="isFullscreen = false"
              >
                <q-tooltip
                  anchor="bottom middle"
                  self="top middle"
                  :offset="[0, 8]"
                  class="bg-dark text-white text-caption"
                  >มุมมองมาตรฐาน</q-tooltip
                >
              </q-btn>
              <q-btn
                :flat="!isFullscreen"
                :unelevated="isFullscreen"
                round
                dense
                icon="fullscreen"
                size="sm"
                :class="isFullscreen ? 'view-btn-active' : 'view-btn-inactive'"
                @click="isFullscreen = true"
              >
                <q-tooltip
                  anchor="bottom middle"
                  self="top middle"
                  :offset="[0, 8]"
                  class="bg-dark text-white text-caption"
                  >มุมมองเต็มหน้าจอ</q-tooltip
                >
              </q-btn>
            </div>
          </div>
        </div>
      </q-header>

      <!-- Sidebar Navigation (Drawer) -->
      <q-drawer v-model="leftDrawerOpen" bordered :width="300" :breakpoint="1024" class="bg-white">
        <SidebarNavigation />
      </q-drawer>
      <q-page-container>
        <div
          class="q-pb-xl content-area"
          :class="isFullscreen ? 'content-fullscreen' : 'section-container content-standard'"
          style="padding-top: 50px"
        >
          <!-- Start Screen with Attempts History -->
          <div
            v-if="!quizStarted && !quizSubmitted && !showSummary"
            class="quiz-intro-wrapper row justify-center"
          >
            <div :class="isFullscreen ? 'col-12' : 'col-12 col-lg-10 col-xl-9'">
              <q-breadcrumbs class="text-grey-8 q-mb-xl modern-breadcrumbs" active-color="primary">
                <template v-slot:separator>
                  <q-icon size="1.4em" name="chevron_right" color="grey-4" />
                </template>
                <q-breadcrumbs-el
                  label="หน้าแรก"
                  icon="home"
                  to="/course-home"
                  class="breadcrumb-link"
                />
                <!-- <q-breadcrumbs-el
                  label="This course"
                  icon="school"
                  class="breadcrumb-link cursor-pointer"
                  @click="$router.push(`/course/${String($route.params.id)}/learn`)"
                /> -->
                <q-breadcrumbs-el
                  :label="courseTitle"
                  class="breadcrumb-link cursor-pointer"
                  @click="$router.push(`/course/${String($route.params.id)}/learn`)"
                />
                <q-breadcrumbs-el :label="quizTitle" class="text-weight-bold text-dark q-px-sm" />
              </q-breadcrumbs>

              <div class="intro-card bg-white shadow-1 q-mb-xl border-radius-16 overflow-hidden">
                <div class="q-pa-xl">
                  <h1 class="text-h4 text-weight-bolder text-dark q-mt-none q-mb-lg">
                    {{ quizTitle }}
                  </h1>

                  <div class="row q-mb-xl">
                    <q-btn
                      unelevated
                      :color="isCompleted ? 'positive' : 'grey-8'"
                      :icon="isCompleted ? 'check_circle' : 'panorama_fish_eye'"
                      :label="isCompleted ? 'Completed' : 'Mark as done'"
                      no-caps
                      class="q-px-lg q-py-sm border-radius-8"
                      @click="toggleDone"
                    />
                  </div>

                  <q-separator class="q-mb-xl" />

                  <!-- Attempt History Table (Shown inside card if exists) -->
                  <div v-if="previousAttempts.length > 0" class="q-mb-xl">
                    <div class="text-h6 text-weight-bold q-mb-md">
                      Summary of your previous attempts
                    </div>
                    <q-markup-table
                      flat
                      bordered
                      class="attempts-table overflow-hidden border-radius-8"
                    >
                      <thead>
                        <tr class="bg-grey-1">
                          <th class="text-left">Attempt</th>
                          <th class="text-left">State</th>
                          <th class="text-right text-no-wrap">คะแนน / {{ totalQuestions }}.00</th>
                          <th class="text-right text-no-wrap">คะแนนที่ได้ / 10.00</th>
                          <th class="text-center">Review</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(attempt, idx) in previousAttempts" :key="idx">
                          <td class="text-weight-bold">{{ idx + 1 }}</td>
                          <td>
                            <div class="text-weight-medium">เสร็จสิ้น</div>
                            <div class="text-caption text-grey-6">Submitted {{ attempt.date }}</div>
                          </td>
                          <td class="text-right">{{ attempt.score.toFixed(2) }}</td>
                          <td class="text-right text-dark">
                            {{ ((attempt.score / attempt.total) * 10).toFixed(2) }}
                          </td>
                          <td class="text-center text-grey-5">Not permitted</td>
                        </tr>
                      </tbody>
                    </q-markup-table>
                    <div class="text-h6 text-center q-mt-xl text-weight-bolder">
                      คะแนนสูงสุด:
                      <span class="text-dark">{{ (bestGrade * 10).toFixed(2) }} / 10.00</span>
                    </div>
                  </div>

                  <div class="quiz-info-section text-body1 text-grey-9 q-gutter-y-sm">
                    <div class="row">
                      <div class="text-weight-bold q-mr-sm">Opened:</div>
                      <div>วันอังคาร, 29 กรกฎาคม 2025, 12:01AM</div>
                    </div>
                    <div class="row">
                      <div class="text-weight-bold q-mr-sm">Closes:</div>
                      <div>วันพุธ, 29 กรกฎาคม 2026, 11:59PM</div>
                    </div>
                  </div>

                  <div class="q-mt-xl">
                    <q-btn
                      v-if="previousAttempts.length < maxAttempts"
                      unelevated
                      color="dark"
                      :label="$t('quiz.attemptQuiz')"
                      no-caps
                      class="q-px-xl q-py-md text-weight-bold border-radius-8"
                      @click="startQuiz"
                    />
                    <div
                      v-else
                      class="text-negative text-weight-bold bg-red-1 q-pa-md border-radius-8"
                    >
                      คุณทำแบบทดสอบครบจำนวนครั้งที่กำหนดแล้ว
                    </div>
                  </div>

                  <div class="q-mt-xl text-body2 text-grey-8 q-gutter-y-xs">
                    <div>{{ $t('quiz.attemptsAllowed') }} {{ maxAttempts }}</div>
                    <div>{{ $t('quiz.gradingMethod') }}: {{ $t('quiz.highestGrade') }}</div>
                  </div>
                </div>
              </div>

              <!-- Activity Navigation -->
              <div
                class="activity-navigation row items-center justify-between q-mt-xl border-top q-pt-lg"
              >
                <div
                  v-if="nav.prev"
                  class="nav-item cursor-pointer text-left col-5"
                  @click="navigateToActivity(nav.prev!)"
                >
                  <div class="row items-center q-gutter-sm">
                    <q-icon name="chevron_left" size="sm" class="text-grey-6" />
                    <div>
                      <div
                        class="text-caption text-grey-6 uppercase text-weight-bold letter-spacing-1"
                      >
                        {{ $t('quiz.prevActivity') }}
                      </div>
                      <div class="text-subtitle2 text-dark">{{ nav.prev.title }}</div>
                    </div>
                  </div>
                </div>
                <div v-else class="col-5"></div>
                <div
                  v-if="nav.next"
                  class="nav-item cursor-pointer text-right col-5"
                  @click="navigateToActivity(nav.next!)"
                >
                  <div class="row items-center justify-end q-gutter-sm">
                    <div>
                      <div
                        class="text-caption text-grey-6 uppercase text-weight-bold letter-spacing-1"
                      >
                        {{ $t('quiz.nextActivity') }}
                      </div>
                      <div class="text-subtitle2 text-dark">{{ nav.next.title }}</div>
                    </div>
                    <q-icon name="chevron_right" size="sm" class="text-grey-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary of Attempt Screen (Full Width) -->
          <div v-else-if="showSummary" class="quiz-summary-wrapper row justify-center">
            <div :class="isFullscreen ? 'col-12' : 'col-12 col-lg-10 col-xl-9'">
              <q-breadcrumbs class="text-grey-8 q-mb-xl modern-breadcrumbs" active-color="primary">
                <template v-slot:separator
                  ><q-icon size="1.4em" name="chevron_right" color="grey-4"
                /></template>
                <q-breadcrumbs-el
                  :label="$t('learning.home')"
                  icon="home"
                  to="/course-home"
                  class="breadcrumb-link"
                />
                <q-breadcrumbs-el
                  :label="$t('learning.thisCourse')"
                  icon="school"
                  @click="$router.push(`/course/${String($route.params.id)}/learn`)"
                  class="breadcrumb-link cursor-pointer"
                />
                <q-breadcrumbs-el
                  :label="courseTitle"
                  @click="$router.push(`/course/${String($route.params.id)}/learn`)"
                  class="breadcrumb-link cursor-pointer"
                />
                <q-breadcrumbs-el :label="quizTitle" class="text-weight-bold text-dark q-px-sm" />
              </q-breadcrumbs>

              <div class="summary-card q-pa-xl bg-white shadow-1 border-radius-16">
                <h2 class="text-h4 text-weight-bolder q-mt-none q-mb-xl">
                  {{ $t('quiz.summary') }}
                </h2>
                <q-markup-table flat bordered class="q-mb-xl overflow-hidden border-radius-12">
                  <thead>
                    <tr class="bg-grey-1 text-grey-7">
                      <th class="text-left text-subtitle1 text-weight-bold" style="width: 150px">
                        {{ $t('quiz.question') }}
                      </th>
                      <th class="text-left text-subtitle1 text-weight-bold">
                        {{ $t('quiz.status') }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="n in totalQuestions" :key="n" class="hover-row">
                      <td class="text-weight-bold text-body1 text-grey-9">
                        {{ $t('quiz.questionNumber', { n }) }}
                      </td>
                      <td class="text-body1">
                        <div class="row items-center q-gutter-x-sm">
                          <q-icon
                            :name="answers[n - 1] !== undefined ? 'check_circle' : 'help_outline'"
                            :color="answers[n - 1] !== undefined ? 'positive' : 'grey-5'"
                            size="20px"
                          />
                          <span
                            :class="
                              answers[n - 1] !== undefined
                                ? 'text-positive text-weight-medium'
                                : 'text-grey-6'
                            "
                          >
                            {{
                              answers[n - 1] !== undefined
                                ? $t('quiz.statusSaved')
                                : $t('quiz.notAnswered')
                            }}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>

                <div class="column items-center q-gutter-y-md q-mt-xl">
                  <q-btn
                    outline
                    color="primary"
                    :label="$t('quiz.returnToAttempt')"
                    no-caps
                    class="q-py-md text-weight-bold border-radius-12"
                    style="min-width: 320px"
                    @click="showSummary = false"
                  />
                  <q-btn
                    unelevated
                    color="primary"
                    :label="$t('quiz.submitAttempt')"
                    no-caps
                    class="q-py-md text-weight-bold border-radius-12"
                    style="min-width: 320px"
                    @click="confirmSubmit"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Results Screen removed as per user request, going directly to start screen -->

          <!-- Active Quiz Screen (With Sidebar) -->
          <div v-else class="quiz-content-wrapper row justify-center">
            <div :class="isFullscreen ? 'col-12' : 'col-12 col-lg-10 col-xl-9'">
              <q-breadcrumbs class="text-grey-8 q-mb-xl modern-breadcrumbs" active-color="primary">
                <template v-slot:separator
                  ><q-icon size="1.4em" name="chevron_right" color="grey-4"
                /></template>
                <q-breadcrumbs-el
                  :label="$t('learning.home')"
                  icon="home"
                  to="/course-home"
                  class="breadcrumb-link"
                />
                <q-breadcrumbs-el
                  :label="$t('learning.thisCourse')"
                  icon="school"
                  @click="$router.push(`/course/${String($route.params.id)}/learn`)"
                  class="breadcrumb-link cursor-pointer"
                />
                <q-breadcrumbs-el
                  :label="courseTitle"
                  @click="$router.push(`/course/${String($route.params.id)}/learn`)"
                  class="breadcrumb-link cursor-pointer"
                />
                <q-breadcrumbs-el :label="quizTitle" class="text-weight-bold text-dark q-px-sm" />
              </q-breadcrumbs>

              <div class="row q-col-gutter-lg">
                <!-- Sidebar -->
                <div class="col-12 col-sm-3">
                  <div class="sticky-top">
                    <div
                      class="question-status-card q-pa-md bg-white border-faint q-mb-md border-radius-12"
                    >
                      <div class="text-weight-bold text-primary q-mb-xs">
                        คำถาม {{ currentQuestionIndex + 1 }}
                      </div>
                      <div class="text-caption text-grey-7">
                        {{
                          answers[currentQuestionIndex] !== undefined ? 'Saved' : 'Not yet answered'
                        }}
                      </div>
                    </div>

                    <div class="quiz-nav-card q-pa-md bg-white border-faint border-radius-12">
                      <div class="text-subtitle2 text-weight-bold q-mb-md">นำทางแบบทดสอบ</div>
                      <div class="question-grid-mini">
                        <q-btn
                          v-for="n in totalQuestions"
                          :key="n"
                          :label="n"
                          :color="
                            currentQuestionIndex + 1 === n
                              ? 'primary'
                              : answers[n - 1] !== undefined
                                ? 'grey-8'
                                : 'white'
                          "
                          :text-color="
                            currentQuestionIndex + 1 === n || answers[n - 1] !== undefined
                              ? 'white'
                              : 'dark'
                          "
                          unelevated
                          class="question-nav-btn-mini"
                          @click="jumpToQuestion(n - 1)"
                        />
                      </div>
                      <q-separator class="q-my-md" />
                      <q-btn
                        flat
                        no-caps
                        label="Finish attempt..."
                        color="primary"
                        class="full-width text-left q-px-none text-weight-bold"
                        @click="finishQuiz"
                      />
                    </div>
                  </div>
                </div>

                <!-- Main Area -->
                <div class="col-12 col-sm-9">
                  <div
                    v-if="currentQuestion"
                    class="question-card q-pa-xl bg-white shadow-1 border-radius-16"
                  >
                    <div class="text-h5 text-weight-bold text-dark q-mb-xl line-height-md">
                      {{ currentQuestion.text }}
                    </div>
                    <q-list class="options-list q-gutter-y-md">
                      <q-item
                        v-for="(option, idx) in currentQuestion.options"
                        :key="idx"
                        tag="label"
                        v-ripple
                        class="option-item border-radius-12"
                        :class="{ 'selected-option': answers[currentQuestionIndex] === idx }"
                        @click="selectOption(idx)"
                      >
                        <q-item-section avatar
                          ><q-radio
                            v-model="answers[currentQuestionIndex]"
                            :val="idx"
                            color="primary"
                        /></q-item-section>
                        <q-item-section
                          ><q-item-label
                            >{{ String.fromCharCode(97 + idx) }}. {{ option }}</q-item-label
                          ></q-item-section
                        >
                      </q-item>
                    </q-list>
                  </div>

                  <!-- Pagination -->
                  <div class="row justify-between items-center q-mt-xl">
                    <q-btn
                      outline
                      color="dark"
                      :label="$t('quiz.back')"
                      no-caps
                      v-if="currentQuestionIndex > 0"
                      @click="prevQuestion"
                      class="nav-btn border-radius-8"
                    />
                    <div v-else></div>
                    <q-btn
                      unelevated
                      color="dark"
                      :label="
                        currentQuestionIndex === totalQuestions - 1
                          ? $t('quiz.finish')
                          : $t('quiz.nextPage')
                      "
                      no-caps
                      @click="nextQuestion"
                      class="nav-btn border-radius-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Confirmation Dialog -->
          <q-dialog v-model="confirmSubmitDialog" persistent>
            <q-card class="border-radius-16 q-pa-md" style="min-width: 400px">
              <q-card-section class="row items-center">
                <div class="text-h6 text-weight-bold">{{ $t('quiz.confirmTitle') }}</div>
              </q-card-section>

              <q-card-section class="q-pt-none text-body1 text-grey-8">
                คุณกำลังจะออกจากกาทำแบบทดสอบ
                หากออกจากกาทำแบบทดสอบแล้วคุณจะไม่สามารถเปลี่ยนแปลงคำตอบได้
              </q-card-section>

              <q-card-actions align="right" class="q-mt-md">
                <q-btn
                  flat
                  :label="$t('quiz.cancel')"
                  color="dark"
                  v-close-popup
                  no-caps
                  class="border-radius-8"
                />
                <q-btn
                  unelevated
                  :label="$t('quiz.submitAttempt')"
                  color="primary"
                  @click="handleFinalSubmit"
                  no-caps
                  class="text-weight-bold border-radius-8"
                />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useCourseProgressStore } from 'src/stores/course-progress-store';
import { useMyRegisteredCourses } from 'src/composables/use-my-registered-courses';

import SidebarNavigation from 'components/navigation/SidebarNavigation.vue';
import { getNavigation, type Lesson } from 'src/data/course-structure';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();
const progressStore = useCourseProgressStore();
const { myRegisteredCourseEntries } = useMyRegisteredCourses();
const activeNav = ref('this-course');
const leftDrawerOpen = ref(false);
const myCoursesMenu = ref(false);
const thisCourseMenu = ref(false);
import { useUiStore } from 'src/stores/ui-store';
const uiStore = useUiStore();
const isFullscreen = computed({
  get: () => uiStore.isCourseFullscreen,
  set: (val) => uiStore.setCourseFullscreen(val),
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let menuTimer: any = null;

const openMenu = () => {
  if (menuTimer) clearTimeout(menuTimer);
  myCoursesMenu.value = true;
};

const closeMenu = () => {
  menuTimer = setTimeout(() => {
    myCoursesMenu.value = false;
  }, 150);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let thisCourseMenuTimer: any = null;

const openThisCourseMenu = () => {
  if (thisCourseMenuTimer) clearTimeout(thisCourseMenuTimer);
  thisCourseMenu.value = true;
};

const closeThisCourseMenu = () => {
  thisCourseMenuTimer = setTimeout(() => {
    thisCourseMenu.value = false;
  }, 150);
};
const quizStarted = ref(false);
const quizSubmitted = ref(false);
const showSummary = ref(false);
const confirmSubmitDialog = ref(false);
const score = ref(0);
const maxAttempts = ref(2);
const currentQuestionIndex = ref(0);
const answers = ref<Record<number, number>>({});

const courseId = computed(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  return id || '';
});

const registeredCourses = computed(() => {
  return myRegisteredCourseEntries.value.map((entry) => entry.course);
});
const quizId = computed(() =>
  Array.isArray(route.params.quizId) ? route.params.quizId[0] : route.params.quizId,
);

const quizTitle = computed(() => decodeURIComponent(quizId.value || ''));

import { getCourseDetailById } from 'src/data/mock-courses';
const currentCourse = computed(() => {
  if (!courseId.value) return null;
  return getCourseDetailById(courseId.value);
});
const courseTitle = computed(() => currentCourse.value?.title || 'Course');

const isCompleted = computed(() => {
  if (!courseId.value || !quizTitle.value) return false;
  return progressStore.isLessonCompleted(courseId.value, quizTitle.value);
});

const toggleDone = () => {
  if (!courseId.value || !quizTitle.value) return;
  progressStore.toggleLessonCompletion(courseId.value, quizTitle.value);
};

const finishQuiz = () => {
  showSummary.value = true;
};

const confirmSubmit = () => {
  confirmSubmitDialog.value = true;
};

const handleFinalSubmit = () => {
  confirmSubmitDialog.value = false;

  let correctCount = 0;
  const qs = questions.value;
  if (qs && qs.length > 0) {
    qs.forEach((q, idx) => {
      if (answers.value[idx] === q.correct) {
        correctCount++;
      }
    });
  }

  score.value = correctCount;
  quizSubmitted.value = false; // Go back to start screen instead of results view
  quizStarted.value = false;
  showSummary.value = false;

  if (courseId.value && quizTitle.value) {
    progressStore.addQuizAttempt(courseId.value, quizTitle.value, {
      score: correctCount,
      total: totalQuestions.value,
      date: new Date().toLocaleString('th-TH'),
    });

    // Also mark as completed
    if (!progressStore.isLessonCompleted(courseId.value, quizTitle.value)) {
      progressStore.toggleLessonCompletion(courseId.value, quizTitle.value);
    }
  }

  $q.notify({
    type: 'positive',
    message: t('quiz.success'),
    icon: 'check',
  });
};

const restartQuiz = () => {
  quizStarted.value = false;
  quizSubmitted.value = false;
  showSummary.value = false;
  score.value = 0;
  currentQuestionIndex.value = 0;
  answers.value = {};
};

const startQuiz = () => {
  restartQuiz();
  quizStarted.value = true;
};

const previousAttempts = computed(() => {
  if (!courseId.value || !quizTitle.value) return [];
  return progressStore.getAttempts(courseId.value, quizTitle.value);
});

const bestGrade = computed(() => {
  if (!courseId.value || !quizTitle.value) return 0;
  const best = progressStore.getBestScore(courseId.value, quizTitle.value);
  if (best === null) return 0;
  return best / totalQuestions.value;
});

interface QuizQuestion {
  text: string;
  options: string[];
  correct: number;
}

// Mock Questions Database
const quizData: Record<string, QuizQuestion[]> = {
  'Pre-test วัดความรู้พื้นฐาน': [
    {
      text: 'Pathfinder Panel ในโปรแกรม Adobe Illustrator สัมพันธ์กับการสร้างชิ้นงานได้มากที่สุด',
      options: [
        'ภาพวาดเลียนแบบผลงานศิลปิน',
        'หนังสือการ์ตูนมังงะพิมพ์สี่สี',
        'แอปพลิเคชันรายงานสภาพอากาศ',
        'โปสเตอร์โฆษณารถยนต์บนโซเชียลมีเดีย',
      ],
      correct: 0,
    },
    {
      text: 'ข้อใดคือความหมายที่ถูกต้องที่สุดของ Generative AI?',
      options: [
        'AI ที่เน้นการวิเคราะห์ข้อมูลขนาดใหญ่',
        'AI ที่สามารถสร้างเนื้อหาใหม่ๆ เช่น ภาพ ข้อความ หรือเสียงได้',
        'AI ที่ใช้ในการนำทางหุ่นยนต์',
        'AI ที่ทำงานแทนมนุษย์ในโรงงานอุตสาหกรรม',
      ],
      correct: 1,
    },
  ],
  'แบบฝึกหัดการเขียน Prompt': [
    {
      text: 'องค์ประกอบ "Role" ในการเขียน Prompt มีวัตถุประสงค์เพื่ออะไร?',
      options: [
        'เพื่อกำหนดบทบาทหรือความเชี่ยวชาญให้ AI สวมบทบาทนั้น',
        'เพื่อระบุชื่อผู้ใช้งาน',
        'เพื่อกำหนดความยาวของข้อความ',
        'เพื่อใส่รหัสลับในการสั่งงาน',
      ],
      correct: 0,
    },
  ],
  'Post-test วัดผลสัมฤทธิ์ทางการเรียน': [
    {
      text: 'หลังจากเรียนจบคอร์สนี้ ข้อใดคือข้อดีที่สุดของการใช้ AI ในงานออกแบบ?',
      options: [
        'ไม่ต้องใช้ความคิดสร้างสรรค์เลย',
        'ช่วยเพิ่มประสิทธิภาพและลดเวลาในการทำงานที่ซ้ำซ้อน',
        'ทำให้ไม่ต้องจ้างนักออกแบบอีกต่อไป',
        'ช่วยให้คอมพิวเตอร์ทำงานเร็วขึ้น',
      ],
      correct: 1,
    },
  ],
  แบบทดสอบเรื่องอัญมณีและราศี: [
    {
      text: 'อัญมณีชนิดใดที่นิยมนำมาใช้เสริมดวงสำหรับผู้ที่เกิดวันอาทิตย์?',
      options: ['ทับทิม', 'มรกต', 'ไพลิน', 'บุษราคัม'],
      correct: 0,
    },
    {
      text: 'ดาวนพเคราะห์ดวงใดที่มีความสัมพันธ์กับอัญมณี "เพชร"?',
      options: ['ดาวอังคาร', 'ดาวศุกร์', 'ดาวเสาร์', 'ดาวพฤหัสบดี'],
      correct: 1,
    },
  ],
  แบบทดสอบวัดผลสัมฤทธิ์: [
    {
      text: 'การเลือกอัญมณีตามหลักโหราศาสตร์ไทยมักพิจารณาจากสิ่งใดเป็นหลัก?',
      options: [
        'ความสวยงามอย่างเดียว',
        'ราคาของอัญมณี',
        'วันเกิดและตำแหน่งของดวงดาว',
        'ความนิยมในตลาด',
      ],
      correct: 2,
    },
  ],
  'Quiz: Workflow Proficiency': [
    {
      text: 'Which file format is best for exporting from Recraft.ai to Adobe Illustrator to maintain editability?',
      options: ['PNG', 'JPG', 'SVG/Vector', 'WebP'],
      correct: 2,
    },
    {
      text: 'In Adobe Illustrator, which tool is commonly used to refine paths generated by AI?',
      options: ['Pen Tool', 'Direct Selection Tool', 'Smooth Tool', 'All of the above'],
      correct: 3,
    },
  ],
};

const questions = computed(() => {
  return quizData[quizTitle.value] || quizData['Pre-test วัดความรู้พื้นฐาน'];
});

const totalQuestions = computed(() => questions.value!.length);
const currentQuestion = computed(() => questions.value![currentQuestionIndex.value]);

const jumpToQuestion = (index: number) => {
  currentQuestionIndex.value = index;
};

const selectOption = (idx: number) => {
  answers.value[currentQuestionIndex.value] = idx;
};

const nextQuestion = () => {
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    currentQuestionIndex.value++;
  } else {
    finishQuiz();
  }
};

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
};

const nav = computed(() => getNavigation(quizTitle.value, courseId.value));

const navigateToActivity = (lesson: Lesson) => {
  const lessonId = encodeURIComponent(lesson.title);
  if (lesson.type === 'video') {
    void router.push(`/course/${courseId.value}/video/${lessonId}`);
  } else if (lesson.type === 'quiz') {
    void router.push(`/course/${courseId.value}/quiz/${lessonId}`);
  } else {
    void router.push(`/course/${courseId.value}/learn`);
  }
};
</script>

<style lang="scss" scoped>
.course-page {
  height: calc(100vh - 68px);
  overflow: hidden;
  background-color: #f8f9fa;
}

.section-container {
  max-width: 1400px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

// View Mode
.content-area {
  transition: padding 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.content-fullscreen {
  padding-left: 32px;
  padding-right: 32px;
  max-width: 100% !important;
  margin: 0 !important;
}
.view-toggle-group {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
  backdrop-filter: blur(4px);
}
.view-btn-active {
  background: rgba(255, 255, 255, 0.25) !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 8px !important;
}
.view-btn-inactive {
  color: rgba(255, 255, 255, 0.65) !important;
  border-radius: 8px !important;
  transition: all 0.2s ease;
  &:hover {
    color: white !important;
    background: rgba(255, 255, 255, 0.12) !important;
  }
}

.modern-breadcrumbs {
  font-size: 0.95rem;
  font-weight: 500;
  .breadcrumb-link {
    transition: all 0.3s ease;
    padding: 6px 12px;
    border-radius: 10px;
    text-decoration: none;
    color: inherit;
    &:hover {
      background: rgba(var(--q-primary), 0.08);
      color: var(--q-primary) !important;
    }
  }
}

.menu-toggle-btn {
  color: rgba(255, 255, 255, 0.8);
  min-height: 48px;
  padding: 0 16px; /* ระยะซ้ายขวาให้สมดุลกับแท็บอื่น */
  margin-right: 8px;
  transition: color 0.2s ease;

  &:hover {
    color: white; /* สว่างขึ้นตอนเมาส์ชี้ เหมือนปุ่มหน้าแรก */
  }
}

.nav-bar {
  background-color: var(--q-primary);
  min-height: 48px;
}

.nav-tabs {
  :deep(.q-tab) {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    padding: 0 20px;
    min-width: 118px;
    min-height: 48px;
    font-size: 0.9rem;
    transition: color 0.2s ease;

    &.q-tab--active {
      color: white;
      font-weight: 700;
    }

    &:hover {
      color: white;
    }

    .q-icon {
      font-size: 1rem;
    }
  }
}

// ── This Course Dropdown ────────────────────────────────────
.this-course-dropdown {
  border-top: 3px solid var(--q-primary);
  border-radius: 0 0 12px 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18) !important;
  overflow: hidden;
}

.this-course-menu-item {
  min-height: 48px;
  padding: 6px 16px;
  transition: background 0.18s ease;

  &:hover {
    background: rgba(var(--q-primary-rgb, 26, 115, 232), 0.07);
    .q-item__label {
      color: var(--q-primary);
    }
  }
}

.this-course-icon-section {
  min-width: 36px !important;
  padding-right: 4px;
}

.course-menu-item {
  transition: all 0.3s ease;
  &:hover {
    background-color: #e3f2fd;
    color: var(--q-primary);
  }
}

.hover-row {
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #fcfcfc;
  }
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.question-nav-btn {
  width: 40px;
  height: 40px;
  min-width: 0;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-weight: bold;
  font-size: 0.9rem;
}

.intro-card,
.question-card,
.summary-card,
.results-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  background: white;
  min-height: 480px; /* Prevent layout jump */
  display: flex;
  flex-direction: column;
}

.question-card {
  justify-content: flex-start;
}

.attempts-table,
.summary-table {
  background: white;

  :deep(thead tr th) {
    font-weight: 700;
    color: #555;
    text-transform: none;
    font-size: 0.9rem;
  }
}

.option-item {
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  padding: 16px;

  &:hover {
  }
}

.nav-btn {
  padding: 10px 32px;
  border-radius: 8px;
  font-weight: 600;
}

.lh-sm {
  line-height: 1.3;
}

.course-menu-item {
  transition: all 0.3s ease;
  &:hover {
    background-color: #fff8ed;
    color: #f5a623;
  }
}

.border-radius-10 {
  border-radius: 10px;
}

.line-height-md {
  line-height: 1.6;
}

.border-faint {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.uppercase {
  text-transform: uppercase;
}

.letter-spacing-1 {
  letter-spacing: 1px;
}
.intro-card {
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.border-radius-8 {
  border-radius: 8px;
}

.activity-navigation {
  .nav-item {
    transition: all 0.3s ease;
    padding: 12px;
    border-radius: 12px;

    &:hover {
      background: rgba(0, 0, 0, 0.02);
      .text-subtitle2 {
        color: var(--q-primary);
      }
    }
  }
}

.jump-select {
  width: 250px;
}

.border-top {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.question-grid-mini {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.question-nav-btn-mini {
  width: 100%;
  aspect-ratio: 1;
  min-width: 0;
  border-radius: 6px;
  border: 1px solid #eee;
  font-weight: bold;
  font-size: 0.85rem;
}

.quiz-nav-card {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.sticky-top {
  position: sticky;
  top: 20px;
}
</style>
