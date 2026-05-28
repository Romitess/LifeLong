<template>
  <q-page class="instructor-dashboard">
    <div v-if="isTeachingRole" class="section-container instructor-dashboard__inner">
      <section class="instructor-hero">
        <div class="instructor-hero__particles" />
        <div class="instructor-hero__overlay" />

        <div class="instructor-hero__content">
          <div class="instructor-hero__identity">
            <q-avatar size="100px" class="instructor-hero__avatar">
              <img
                v-if="authStore.user?.avatar"
                :src="authStore.user.avatar"
                alt="Instructor avatar"
                class="instructor-hero__avatar-image"
              />
              <q-icon v-else name="person" size="56px" color="white" />
            </q-avatar>

            <div class="instructor-hero__copy">
              <div class="instructor-hero__eyebrow">Instructor Workspace</div>
              <h1>{{ authStore.user?.firstNameTh }} {{ authStore.user?.lastNameTh }}</h1>
              <div class="instructor-hero__meta">
                <q-badge rounded color="positive" label="Teacher" class="text-weight-bold" />
                <span>{{ authStore.user?.studentId }}</span>
              </div>
            </div>
          </div>

          <div class="instructor-hero__stats">
            <div v-for="metric in dashboardMetrics" :key="metric.label" class="metric-tile">
              <div
                class="metric-tile__icon"
                :style="{ background: metric.background, color: metric.color }"
              >
                <q-icon :name="metric.icon" size="24px" />
              </div>
              <div>
                <div class="metric-tile__value">{{ metric.value }}</div>
                <div class="metric-tile__label">{{ metric.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-if="isCourseTableView" class="course-table-layout">
        <div class="course-table-view">
          <div class="course-table-view__toolbar">
            <div>
              <h2>{{ courseTableTitle }}</h2>
              <span>{{ filteredCourses.length }} รายวิชา</span>
            </div>

            <div class="course-table-view__actions">
              <q-input
                v-model="courseSearch"
                dense
                outlined
                rounded
                placeholder="ค้นหารายวิชา..."
                class="course-table-search"
              >
                <template #prepend>
                  <q-icon name="search" color="grey-5" />
                </template>
              </q-input>

              <q-btn
                outline
                color="primary"
                icon="filter_alt"
                label="ตัวกรอง"
                no-caps
                class="course-table-filter-btn"
                @click="goToActiveInstructorCoursesTable"
              />
            </div>
          </div>

          <div v-if="false && paginatedCourses.length > 0" class="instructor-profile-course-list">
            <article
              v-for="course in paginatedCourses"
              :key="course.id"
              class="instructor-profile-course-card"
            >
              <div class="instructor-profile-course-card__stripe"></div>

              <div class="instructor-profile-course-card__thumb">
                <img :src="course.imageUrl" :alt="course.titleEn || course.title" />
              </div>

              <div class="instructor-profile-course-card__content">
                <div class="instructor-profile-course-card__top">
                  <div>
                    <button
                      type="button"
                      class="instructor-profile-course-card__title"
                      @click="openCourseWorkspace(course.id)"
                    >
                      {{ course.code }} : {{ course.title }}
                    </button>
                    <div v-if="course.titleEn" class="instructor-profile-course-card__subtitle">
                      {{ course.titleEn }}
                    </div>

                    <div class="instructor-profile-course-card__badges">
                      <q-badge
                        :color="course.isActive ? 'positive' : 'blue-grey-7'"
                        class="badge-pill"
                      >
                        {{ course.isActive ? 'เปิดสอน' : 'ฉบับร่าง' }}
                      </q-badge>
                      <q-badge
                        v-for="mode in course.deliveryModes"
                        :key="mode"
                        color="blue-7"
                        class="badge-pill"
                      >
                        {{ mode }}
                      </q-badge>
                      <q-badge color="green-6" class="badge-pill">
                        ว่าง {{ getRemainingSeats(course) }} ที่
                      </q-badge>
                    </div>
                  </div>

                  <div class="instructor-profile-course-card__publish">
                    <span>สถานะการเผยแพร่</span>
                    <q-toggle
                      :model-value="course.isActive"
                      color="positive"
                      dense
                      @update:model-value="setCoursePublished(course.id, $event)"
                    />
                  </div>
                </div>

                <div class="instructor-profile-course-card__meta">
                  <q-icon name="event" size="15px" color="grey-5" />
                  <span
                    >ลงทะเบียน {{ course.registrationStart }} ถึง {{ course.registrationEnd }}</span
                  >
                </div>

                <div class="instructor-profile-course-card__progress">
                  <div class="instructor-profile-course-card__progress-head">
                    <span>จำนวนผู้เรียน</span>
                    <q-badge color="primary" class="badge-pill">
                      {{ course.enrolledCount }}{{ course.maxSeats ? ` / ${course.maxSeats}` : '' }}
                    </q-badge>
                  </div>
                  <q-linear-progress
                    rounded
                    size="8px"
                    :value="
                      (course.maxSeats ?? 0) > 0 ? course.enrolledCount / (course.maxSeats ?? 1) : 0
                    "
                    color="primary"
                    track-color="grey-2"
                  />
                  <div class="instructor-profile-course-card__payment">
                    <span class="text-positive"
                      >ไม่มีหนี้ค้างชำระ {{ getPaidLearnerCount(course) }}</span
                    >
                    <span class="text-negative">ค้างชำระ {{ getUnpaidLearnerCount(course) }}</span>
                    <span>เหลือ {{ getRemainingSeats(course) }}</span>
                  </div>
                </div>

                <div class="instructor-profile-course-card__footer">
                  <div class="instructor-profile-course-card__moodle">
                    <q-badge
                      rounded
                      :color="course.isActive ? 'positive' : 'grey-5'"
                      text-color="white"
                      :label="course.isActive ? 'ส่งข้อมูลแล้ว' : 'ยังไม่ส่ง'"
                    />
                    <span v-if="course.isActive">sukanya ยท {{ course.registrationEnd }}</span>
                  </div>

                  <div class="instructor-profile-course-card__actions">
                    <q-btn
                      outline
                      color="primary"
                      icon="list_alt"
                      label="รายละเอียด"
                      no-caps
                      class="course-action-btn"
                      @click="openCourseWorkspace(course.id)"
                    />
                    <q-btn
                      outline
                      color="primary"
                      icon="edit"
                      label="แก้ไข"
                      no-caps
                      class="course-action-btn"
                      @click="openCourseWorkspace(course.id)"
                    />
                    <q-btn
                      unelevated
                      color="positive"
                      icon="login"
                      label="เข้าระบบ Moodle"
                      no-caps
                      class="course-action-btn course-action-btn--moodle"
                      :disable="!course.moodleId"
                      :loading="moodleOpenLoading === course.id"
                      @click="openInMoodle(course)"
                    />
                    <q-btn
                      outline
                      color="negative"
                      icon="close"
                      label="ลบ"
                      no-caps
                      class="course-action-btn"
                      @click="queueDeleteCourse(course)"
                    />
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div
            v-if="false && paginatedCourses.length === 0"
            class="instructor-profile-course-empty"
          >
            ไม่พบรายวิชา
          </div>

          <div class="course-table-scroll">
            <table class="course-admin-table">
              <colgroup>
                <col class="course-col-title" />
                <col class="course-col-fee" />
                <col class="course-col-schedule" />
                <col class="course-col-seat" />
                <col class="course-col-paid" />
                <col class="course-col-unpaid" />
                <col class="course-col-remain" />
                <col class="course-col-publish" />
                <col class="course-col-moodle" />
                <col class="course-col-actions" />
              </colgroup>
              <thead>
                <tr>
                  <th>รายวิชา</th>
                  <th>ค่าเรียน</th>
                  <th>วันที่</th>
                  <th>รับ</th>
                  <th>
                    <span class="table-head-label">ชำระแล้ว</span>
                  </th>
                  <th>ค้าง</th>
                  <th>เหลือ</th>
                  <th>
                    <span class="table-head-label">เผยแพร่</span>
                  </th>
                  <th>
                    <span class="table-head-label">Moodle</span>
                  </th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="course in paginatedCourses" :key="course.id">
                  <td class="course-title-cell">
                    <div class="course-title-cell__layout">
                      <img
                        :src="course.imageUrl"
                        :alt="course.titleEn || course.title"
                        class="course-title-cell__image"
                      />
                      <div class="course-title-cell__copy">
                        <q-badge outline color="primary" class="course-title-cell__code">
                          {{ course.code }}
                        </q-badge>
                        <button type="button" @click="openCourseWorkspace(course.id)">
                          {{ course.title }}
                        </button>
                        <span v-if="course.titleEn">{{ course.titleEn }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="text-center">
                    {{ course.isFree ? 'ไม่มีค่าใช้จ่าย' : formatCurrency(course.price) }}
                  </td>
                  <td class="schedule-cell">
                    <div class="schedule-cell__content">
                      <span>ลงทะเบียน</span>
                      <strong>
                        {{
                          formatCompactDateRange(course.registrationStart, course.registrationEnd)
                        }}
                      </strong>
                    </div>
                  </td>
                  <td class="text-center">{{ course.maxSeats }}</td>
                  <td class="text-center text-positive">
                    {{ getPaidLearnerCount(course) }}
                  </td>
                  <td class="text-center text-negative">
                    {{ getUnpaidLearnerCount(course) }}
                  </td>
                  <td class="text-center">
                    {{ getRemainingSeats(course) }}
                  </td>
                  <td class="text-center">
                    <q-toggle
                      :model-value="course.isActive"
                      color="positive"
                      dense
                      @update:model-value="setCoursePublished(course.id, $event)"
                    />
                  </td>
                  <td class="moodle-cell">
                    <div class="moodle-status">
                      <q-badge
                        rounded
                        :color="course.isActive ? 'positive' : 'grey-5'"
                        text-color="white"
                        :label="course.isActive ? 'ส่งข้อมูลแล้ว' : 'ยังไม่ส่ง'"
                      />
                      <div v-if="course.isActive" class="moodle-status__meta">
                        <span>sukanya</span>
                        <span>{{ course.registrationEnd }}</span>
                      </div>
                    </div>
                    <q-btn
                      unelevated
                      color="positive"
                      label="เข้าระบบ Moodle"
                      no-caps
                      size="sm"
                      class="moodle-link-btn"
                      :disable="!course.moodleId"
                      :loading="moodleOpenLoading === course.id"
                      @click="openInMoodle(course)"
                    />
                  </td>
                  <td class="actions-cell">
                    <div class="actions-cell__group">
                      <q-btn
                        dense
                        round
                        color="primary"
                        icon="list_alt"
                        class="table-action-btn table-action-btn--list"
                        aria-label="รายละเอียด"
                        @click="openCourseWorkspace(course.id)"
                      >
                        <q-tooltip>รายละเอียด</q-tooltip>
                      </q-btn>
                      <q-btn
                        dense
                        round
                        color="primary"
                        icon="edit"
                        class="table-action-btn table-action-btn--edit"
                        aria-label="แก้ไข"
                        @click="openCourseWorkspace(course.id)"
                      >
                        <q-tooltip>แก้ไข</q-tooltip>
                      </q-btn>
                      <q-btn
                        dense
                        round
                        color="negative"
                        icon="close"
                        class="table-action-btn table-action-btn--delete"
                        aria-label="ลบ"
                        @click="queueDeleteCourse(course)"
                      >
                        <q-tooltip>ลบ</q-tooltip>
                      </q-btn>
                    </div>
                  </td>
                </tr>
                <tr v-if="paginatedCourses.length === 0">
                  <td colspan="10" class="empty-table-cell">ไม่พบรายวิชา</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="filteredCourses.length > courseRowsPerPage" class="course-table-pagination">
            <q-btn
              flat
              dense
              round
              icon="chevron_left"
              :disable="courseTablePage === 1"
              @click="courseTablePage -= 1"
            />
            <span> หน้า {{ courseTablePage }} / {{ courseTablePageCount }} </span>
            <q-btn
              flat
              dense
              round
              icon="chevron_right"
              :disable="courseTablePage === courseTablePageCount"
              @click="courseTablePage += 1"
            />
          </div>
        </div>
      </section>

      <section v-else class="workspace-layout">
        <aside class="course-sidebar">
          <div class="toolbar-row">
            <div>
              <h2>รายวิชาของฉัน</h2>
              <span>{{ instructorCourses.length }} รายวิชา</span>
            </div>
          </div>

          <q-input
            v-model="courseSearch"
            dense
            outlined
            placeholder="ค้นหารหัสหรือชื่อรายวิชา"
            class="course-search"
          >
            <template #prepend>
              <q-icon name="search" color="grey-5" />
            </template>
          </q-input>

          <div class="course-list">
            <button
              v-for="course in filteredCourses"
              :key="course.id"
              type="button"
              class="course-list-item"
              :class="{ 'course-list-item--active': course.id === selectedCourseId }"
              @click="selectedCourseId = course.id"
            >
              <img :src="course.imageUrl" :alt="course.titleEn || course.title" />
              <div class="course-list-item__content">
                <div class="course-list-item__code">{{ course.code }}</div>
                <div class="course-list-item__title">{{ course.titleEn || course.title }}</div>
                <div class="course-list-item__meta">
                  <q-icon name="group" size="15px" />
                  <span class="learner-count-link" @click.stop="openLearnerRoster(course.id)">
                    {{ course.enrolledCount }}/{{ course.maxSeats }} ผู้เรียน
                  </span>
                  <span>{{ getCourseHealth(course.id).completion }}% complete</span>
                </div>
              </div>
            </button>
          </div>
        </aside>

        <main v-if="selectedCourse" class="course-workspace">
          <section class="course-summary">
            <div class="course-summary__media">
              <img
                :src="courseSettings.coverImageUrl || selectedCourse.imageUrl"
                :alt="selectedCourse.titleEn || selectedCourse.title"
              />
            </div>
            <div class="course-summary__content">
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-badge rounded color="primary" :label="selectedCourse.code" />
                <q-badge
                  rounded
                  :color="selectedCourse.isActive ? 'positive' : 'grey-7'"
                  :label="selectedCourse.isActive ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'"
                />
                <q-badge
                  rounded
                  color="blue-grey-1"
                  text-color="blue-grey-8"
                  :label="selectedCourse.deliveryModes.join(', ')"
                />
              </div>
              <h2>{{ selectedCourse.titleEn || selectedCourse.title }}</h2>
              <div class="course-summary__meta">
                <span><q-icon name="event" /> เปิดรับถึง {{ selectedCourse.registrationEnd }}</span>
                <span
                  ><q-icon name="payments" />
                  {{
                    selectedCourse.isFree ? 'ไม่มีค่าใช้จ่าย' : formatCurrency(selectedCourse.price)
                  }}</span
                >
                <span
                  ><q-icon name="visibility" />
                  {{ selectedCourse.views.toLocaleString() }} views</span
                >
                <button
                  type="button"
                  class="course-summary__learner-link"
                  @click="openLearnerRoster(selectedCourse.id)"
                >
                  <q-icon name="groups" /> {{ selectedCourse.enrolledCount.toLocaleString()
                  }}{{
                    selectedCourse.maxSeats ? ` / ${selectedCourse.maxSeats.toLocaleString()}` : ''
                  }}
                  ผู้เรียน
                </button>
              </div>
            </div>
            <div class="course-summary__actions">
              <q-btn
                outline
                color="primary"
                icon="preview"
                label="ดูหน้าผู้เรียน"
                no-caps
                @click="previewCourse"
              />
              <q-btn
                unelevated
                color="positive"
                icon="school"
                label="จัดการใน Moodle"
                no-caps
                :disable="!selectedCourse?.moodleId"
                :loading="moodleOpenLoading === selectedCourse?.id"
                @click="selectedCourse && openInMoodle(selectedCourse)"
              >
                <q-tooltip v-if="!selectedCourse?.moodleId"
                  >รายวิชานี้ยังไม่ได้ sync กับ Moodle</q-tooltip
                >
              </q-btn>
              <q-btn
                unelevated
                color="primary"
                icon="save"
                label="บันทึกการเปลี่ยนแปลง"
                no-caps
                @click="confirmSaveCourseChanges"
              />
              <q-btn
                outline
                color="negative"
                icon="delete"
                label="ลบรายวิชา"
                no-caps
                @click="confirmDeleteSelectedCourse"
              />
            </div>
          </section>

          <q-tabs
            v-model="activeWorkspaceTab"
            dense
            align="left"
            active-color="primary"
            indicator-color="primary"
            class="workspace-tabs"
          >
            <q-tab
              v-for="tab in workspaceTabs"
              :key="tab.name"
              :name="tab.name"
              :icon="tab.icon"
              :label="tab.label"
              no-caps
            />
          </q-tabs>

          <q-tab-panels v-model="activeWorkspaceTab" animated class="workspace-panels">
            <q-tab-panel name="overview">
              <div class="overview-grid">
                <div class="panel-block">
                  <div class="panel-heading">
                    <div>
                      <h3>สถานะรายวิชา</h3>
                      <p>สิ่งที่ต้องตรวจเพื่อให้รายวิชาพร้อมเรียน</p>
                    </div>
                    <q-circular-progress
                      show-value
                      :value="selectedHealth.readiness"
                      size="74px"
                      :thickness="0.18"
                      color="primary"
                      track-color="orange-1"
                    >
                      {{ selectedHealth.readiness }}%
                    </q-circular-progress>
                  </div>
                  <q-list class="checklist-list">
                    <q-item
                      v-for="item in readinessChecklist"
                      :key="item.label"
                      class="checklist-item"
                    >
                      <q-item-section avatar>
                        <q-icon
                          :name="item.done ? 'check_circle' : 'radio_button_unchecked'"
                          :color="item.done ? 'positive' : 'grey-5'"
                          size="22px"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ item.label }}</q-item-label>
                        <q-item-label caption>{{ item.detail }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <div class="panel-block">
                  <div class="panel-heading">
                    <div>
                      <h3>จัดการรูปรายวิชา</h3>
                      <p>ปรับรูปปกและภาพตัวอย่างที่ผู้เรียนเห็น</p>
                    </div>
                  </div>
                  <div class="cover-editor q-mt-md">
                    <img
                      :src="courseSettings.coverImageUrl || selectedCourse.imageUrl"
                      :alt="selectedCourse.titleEn || selectedCourse.title"
                    />
                    <q-input
                      v-model="courseSettings.coverImageUrl"
                      dense
                      outlined
                      label="URL รูปปก"
                    />
                    <div class="row q-gutter-sm">
                      <q-btn
                        outline
                        color="primary"
                        icon="image"
                        label="ใช้รูปตัวอย่าง"
                        no-caps
                        @click="useSampleCover"
                      />
                      <q-btn
                        flat
                        color="grey-7"
                        icon="restart_alt"
                        label="คืนค่ารูปเดิม"
                        no-caps
                        @click="resetCoverImage"
                      />
                    </div>
                  </div>
                </div>

                <div class="panel-block">
                  <div class="panel-heading">
                    <div>
                      <h3>ตั้งค่ารายวิชาที่เปิดสอน</h3>
                      <p>กำหนดรอบเรียน วันรับสมัคร และรูปแบบการเรียน</p>
                    </div>
                  </div>
                  <div class="form-grid course-settings-form q-mt-md">
                    <q-input
                      v-model="courseSettings.termName"
                      dense
                      outlined
                      label="รอบ/รุ่นที่เปิดสอน"
                      class="course-settings-field"
                    />
                    <q-select
                      v-model="courseSettings.deliveryMode"
                      :options="deliveryModeOptions"
                      dense
                      outlined
                      label="รูปแบบการเรียน"
                      dropdown-icon="keyboard_arrow_down"
                      popup-content-class="course-settings-select-menu"
                      class="course-settings-field"
                    />
                    <BaseDateInput
                      v-model="courseSettings.registrationStartDate"
                      value-format="YYYY-MM-DD"
                      label="วันเปิดรับสมัคร"
                      class="course-settings-field"
                    />
                    <BaseDateInput
                      v-model="courseSettings.registrationEndDate"
                      value-format="YYYY-MM-DD"
                      label="วันปิดรับสมัคร"
                      class="course-settings-field"
                    />
                  </div>
                </div>

                <div class="panel-block">
                  <div class="panel-heading">
                    <div>
                      <h3>การคิดเงินผู้เรียนแต่ละประเภท</h3>
                      <p>กำหนดค่าลงทะเบียนแยกตามกลุ่มผู้เรียน</p>
                    </div>
                  </div>
                  <div class="pricing-list q-mt-md">
                    <div v-for="price in learnerPricing" :key="price.type" class="pricing-row">
                      <div>
                        <strong>{{ price.label }}</strong>
                        <span>{{ price.description }}</span>
                      </div>
                      <q-toggle v-model="price.enabled" color="primary" />
                      <q-input
                        v-model.number="price.amount"
                        dense
                        outlined
                        type="number"
                        suffix="บาท"
                        :disable="!price.enabled"
                        class="price-input"
                      />
                    </div>
                  </div>
                </div>

                <div class="panel-block">
                  <div class="panel-heading">
                    <div>
                      <h3>เจ้าหน้าที่คณะ</h3>
                      <p>เพิ่มผู้ช่วยจัดการข้อมูลรายวิชาแทนผู้สอน</p>
                    </div>
                    <q-btn
                      outline
                      color="primary"
                      icon="person_add"
                      label="เพิ่มเจ้าหน้าที่"
                      no-caps
                      @click="openFacultyStaffDialog"
                    />
                  </div>
                  <div class="staff-list q-mt-md">
                    <div v-for="staff in facultyStaff" :key="staff.email" class="staff-row">
                      <q-avatar color="primary" text-color="white" icon="badge" />
                      <div>
                        <strong>{{ staff.name }}</strong>
                        <span>{{ staff.email }} - {{ staff.permission }}</span>
                      </div>
                      <q-btn
                        flat
                        round
                        dense
                        icon="delete"
                        color="negative"
                        @click="removeFacultyStaff(staff.email)"
                      />
                    </div>
                  </div>
                </div>

                <div class="panel-block">
                  <div class="panel-heading">
                    <div>
                      <h3>งานเร่งด่วน</h3>
                      <p>คิวงานที่อาจารย์ควรจัดการก่อน</p>
                    </div>
                    <q-btn flat round dense icon="more_horiz" color="grey-7" />
                  </div>
                  <div class="task-list">
                    <div v-for="task in priorityTasks" :key="task.title" class="task-row">
                      <q-icon :name="task.icon" :color="task.color" size="22px" />
                      <div>
                        <strong>{{ task.title }}</strong>
                        <span>{{ task.detail }}</span>
                      </div>
                      <q-btn
                        flat
                        dense
                        color="primary"
                        label="จัดการ"
                        no-caps
                        @click="openQuickDialog(task.title)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="content">
              <div class="panel-heading q-mb-md">
                <div>
                  <h3>กิจกรรมใน Moodle</h3>
                  <p>กิจกรรมและสื่อการเรียนรู้จากระบบ Moodle LMS</p>
                </div>
                <q-btn
                  unelevated
                  color="positive"
                  icon="school"
                  label="จัดการใน Moodle"
                  no-caps
                  :disable="!selectedCourse?.moodleId"
                  :loading="moodleOpenLoading === selectedCourse?.id"
                  @click="selectedCourse && openInMoodle(selectedCourse)"
                />
              </div>

              <div v-if="isMoodleLoading" class="flex flex-center q-py-xl">
                <q-spinner color="primary" size="48px" />
              </div>

              <template v-else-if="selectedCourse?.moodleId">
                <template v-if="moodleSections.length > 0">
                  <div
                    v-for="section in moodleSections"
                    :key="section.id"
                    class="module-row q-mb-md"
                  >
                    <div class="module-row__header">
                      <q-avatar rounded color="primary" text-color="white" icon="folder" />
                      <div>
                        <h4>{{ section.name }}</h4>
                        <span>{{ section.modules.length }} รายการ</span>
                      </div>
                    </div>
                    <div class="lesson-list">
                      <div v-for="mod in section.modules" :key="mod.id" class="lesson-row">
                        <q-icon
                          :name="moodleModIcon(mod.modname)"
                          :color="moodleModColor(mod.modname)"
                          size="20px"
                        />
                        <a
                          v-if="mod.url"
                          :href="mod.url"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="moodle-activity-link"
                          >{{ mod.name }}</a
                        >
                        <span v-else>{{ mod.name }}</span>
                        <q-space />
                        <q-badge
                          outline
                          :color="moodleModColor(mod.modname)"
                          :label="moodleModLabel(mod.modname)"
                        />
                      </div>
                    </div>
                  </div>
                </template>
                <div v-else class="empty-tab-state text-center q-pa-xl">
                  <q-icon name="school" size="56px" color="grey-4" />
                  <div class="text-h6 text-grey-6 q-mt-md">ยังไม่มีกิจกรรมใน Moodle</div>
                  <div class="text-body2 text-grey-5 q-mt-sm">
                    เพิ่มกิจกรรมในระบบ Moodle เพื่อให้ปรากฏที่นี่
                  </div>
                </div>
              </template>

              <div v-else class="empty-tab-state text-center q-pa-xl">
                <q-icon name="link_off" size="56px" color="grey-4" />
                <div class="text-h6 text-grey-6 q-mt-md">
                  รายวิชานี้ยังไม่ได้เชื่อมต่อกับ Moodle
                </div>
                <div class="text-body2 text-grey-5 q-mt-sm">
                  ติดต่อผู้ดูแลระบบเพื่อเชื่อมรายวิชากับ Moodle
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="learners">
              <div class="panel-heading q-mb-md">
                <div>
                  <h3>ผู้เรียนและความก้าวหน้า</h3>
                  <p>
                    ลงทะเบียนแล้ว {{ selectedCourse?.enrolledCount.toLocaleString() ?? 0 }} คน{{
                      selectedCourse?.maxSeats
                        ? ` จาก ${selectedCourse.maxSeats.toLocaleString()} ที่นั่ง`
                        : ''
                    }}
                  </p>
                </div>
                <q-btn
                  outline
                  color="primary"
                  icon="download"
                  label="ส่งออก CSV"
                  no-caps
                  @click="openQuickDialog('ส่งออกข้อมูลผู้เรียน')"
                />
              </div>

              <q-table
                v-if="learners.length > 0"
                flat
                :rows="learners"
                :columns="learnerColumns"
                row-key="id"
                :pagination="{ rowsPerPage: 8 }"
                class="management-table"
                @row-click="openLearnerDetail"
              >
                <template #body-cell-name="props">
                  <q-td :props="props">
                    <div class="learner-name-cell">
                      <q-avatar size="34px">
                        <img :src="props.row.avatarUrl" :alt="props.row.name" />
                      </q-avatar>
                      <div>
                        <strong>{{ props.row.name }}</strong>
                        <span>{{ props.row.studentId }}</span>
                      </div>
                    </div>
                  </q-td>
                </template>
                <template #body-cell-progress="props">
                  <q-td :props="props">
                    <div class="progress-cell">
                      <q-linear-progress
                        rounded
                        size="8px"
                        :value="props.row.progress / 100"
                        color="primary"
                      />
                      <span>{{ props.row.progress }}%</span>
                    </div>
                  </q-td>
                </template>
                <template #body-cell-status="props">
                  <q-td :props="props">
                    <q-badge rounded :color="props.row.statusColor" :label="props.row.status" />
                  </q-td>
                </template>
                <template #body-cell-actions="props">
                  <q-td :props="props" class="text-right">
                    <q-btn
                      flat
                      round
                      dense
                      icon="mail"
                      color="primary"
                      @click.stop="openQuickDialog(`ส่งข้อความถึง ${props.row.name}`)"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      icon="visibility"
                      color="grey-7"
                      @click.stop="openLearnerDetail(null, props.row)"
                    />
                  </q-td>
                </template>
              </q-table>
              <div v-else class="empty-tab-state text-center q-pa-xl">
                <q-icon name="groups" size="56px" color="grey-4" />
                <div class="text-h6 text-grey-6 q-mt-md">ยังไม่มีผู้เรียนลงทะเบียน</div>
                <div class="text-body2 text-grey-5 q-mt-sm">
                  เมื่อมีผู้เรียนลงทะเบียนแล้ว รายชื่อจะแสดงที่นี่
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="grading">
              <div class="panel-heading q-mb-md">
                <div>
                  <h3>งาน แบบทดสอบ และคะแนน</h3>
                  <p>ดูรายการที่ต้องตรวจ กำหนดคะแนนผ่าน และประกาศผลให้ผู้เรียน</p>
                </div>
                <q-btn
                  unelevated
                  color="primary"
                  icon="assignment_add"
                  label="สร้างงาน"
                  no-caps
                  @click="openQuickDialog('สร้างงานใหม่')"
                />
              </div>

              <div v-if="assignments.length > 0" class="assignment-grid">
                <div v-for="(assignment, idx) in assignments" :key="idx" class="assignment-card">
                  <div class="assignment-card__top">
                    <q-icon :name="assignment.icon" :color="assignment.color" size="28px" />
                    <q-badge rounded :color="assignment.statusColor" :label="assignment.status" />
                  </div>
                  <h4>{{ assignment.title }}</h4>
                  <p>{{ assignment.detail }}</p>
                  <div class="assignment-card__stats">
                    <span>{{ assignment.submitted }} ส่งแล้ว</span>
                    <span>{{ assignment.pending }} รอตรวจ</span>
                  </div>
                  <q-btn
                    outline
                    color="primary"
                    label="ตรวจงาน"
                    no-caps
                    class="full-width"
                    @click="router.push('/instructor/grading')"
                  />
                </div>
              </div>
              <div v-else class="empty-tab-state text-center q-pa-xl">
                <q-icon name="assignment" size="56px" color="grey-4" />
                <div class="text-h6 text-grey-6 q-mt-md">ยังไม่มีงานหรือแบบทดสอบ</div>
                <div class="text-body2 text-grey-5 q-mt-sm">
                  กดปุ่ม "สร้างงาน" เพื่อเพิ่มงานใหม่
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="announcements">
              <div class="panel-heading q-mb-md">
                <div>
                  <h3>ประกาศและการสื่อสาร</h3>
                  <p>แจ้งข่าว ส่งข้อความ และปักหมุดประกาศสำคัญของรายวิชา</p>
                </div>
                <q-btn
                  unelevated
                  color="primary"
                  icon="campaign"
                  label="เขียนประกาศ"
                  no-caps
                  @click="openQuickDialog('เขียนประกาศ')"
                />
              </div>

              <div v-if="announcements.length > 0" class="announcement-list">
                <div
                  v-for="announcement in announcements"
                  :key="announcement.title"
                  class="announcement-row"
                >
                  <q-icon
                    :name="announcement.pinned ? 'push_pin' : 'campaign'"
                    :color="announcement.pinned ? 'primary' : 'blue-grey-5'"
                    size="22px"
                  />
                  <div>
                    <strong>{{ announcement.title }}</strong>
                    <p>{{ announcement.body }}</p>
                    <span>{{ announcement.date }}</span>
                  </div>
                  <q-btn
                    flat
                    dense
                    round
                    icon="edit"
                    color="primary"
                    @click="openQuickDialog(`แก้ไขประกาศ ${announcement.title}`)"
                  />
                </div>
              </div>
              <div v-else class="empty-tab-state text-center q-pa-xl">
                <q-icon name="campaign" size="56px" color="grey-4" />
                <div class="text-h6 text-grey-6 q-mt-md">ยังไม่มีประกาศ</div>
                <div class="text-body2 text-grey-5 q-mt-sm">
                  กดปุ่ม "เขียนประกาศ" เพื่อแจ้งข่าวสารให้ผู้เรียน
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="settings">
              <div class="settings-grid">
                <div class="panel-block">
                  <div class="panel-heading">
                    <div>
                      <h3>การเผยแพร่</h3>
                      <p>ควบคุมสถานะรายวิชาและการเปิดรับสมัคร</p>
                    </div>
                  </div>
                  <q-list class="settings-list">
                    <q-item tag="label">
                      <q-item-section>
                        <q-item-label>เผยแพร่รายวิชา</q-item-label>
                        <q-item-label caption>ผู้เรียนสามารถเห็นรายวิชาบนหน้าเว็บไซต์</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-toggle v-model="courseSettings.published" color="primary" />
                      </q-item-section>
                    </q-item>
                    <q-item tag="label">
                      <q-item-section>
                        <q-item-label>เปิดรับสมัคร</q-item-label>
                        <q-item-label caption>อนุญาตให้ผู้เรียนลงทะเบียนรายวิชานี้</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-toggle v-model="courseSettings.registrationOpen" color="primary" />
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label>จำนวนที่นั่งสูงสุด</q-item-label>
                        <q-item-label caption>กำหนดจำนวนผู้เรียนที่รับได้</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-input
                          v-model.number="courseSettings.maxSeats"
                          dense
                          outlined
                          type="number"
                          class="seat-input"
                        />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <div class="panel-block">
                  <div class="panel-heading">
                    <div>
                      <h3>คุณภาพก่อนเผยแพร่</h3>
                      <p>รายการตรวจสอบเชิงระบบ</p>
                    </div>
                  </div>
                  <div class="quality-grid">
                    <div v-for="quality in qualityChecks" :key="quality.label" class="quality-item">
                      <q-icon
                        :name="quality.done ? 'verified' : 'error_outline'"
                        :color="quality.done ? 'positive' : 'warning'"
                        size="24px"
                      />
                      <span>{{ quality.label }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="reports">
              <div class="panel-heading q-mb-md">
                <div>
                  <h3>รายงานรวมรายวิชา</h3>
                  <p>ข้อมูลสำหรับติดตามผลและตัดสินใจปรับปรุงรายวิชา</p>
                </div>
                <q-btn
                  outline
                  color="primary"
                  icon="picture_as_pdf"
                  label="ส่งออกรายงาน"
                  no-caps
                  @click="openQuickDialog('ส่งออกรายงาน')"
                />
              </div>
              <div class="report-grid">
                <div v-for="report in reports" :key="report.label" class="report-card">
                  <span>{{ report.label }}</span>
                  <strong>{{ report.value }}</strong>
                  <q-linear-progress
                    rounded
                    size="8px"
                    :value="report.progress"
                    :color="report.color"
                  />
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </main>
        <main v-else class="course-workspace empty-course-state">
          <q-icon name="library_books" size="52px" color="grey-5" />
          <h2>ยังไม่มีรายวิชา</h2>
          <p>ติดต่อผู้ดูแลระบบเพื่อเพิ่มรายวิชา</p>
        </main>
      </section>
    </div>

    <q-dialog v-model="facultyStaffDialogOpen" persistent>
      <q-card class="staff-dialog">
        <q-card-section class="row items-center q-pb-sm">
          <div>
            <div class="text-h6 text-weight-bold">เพิ่มเจ้าหน้าที่คณะ</div>
            <div class="text-body2 text-grey-7 q-mt-xs">
              เพิ่มผู้ช่วยจัดการข้อมูลรายวิชาในคอร์สนี้
            </div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="staff-dialog__form">
          <q-input
            v-model="facultyStaffForm.name"
            outlined
            label="ชื่อเจ้าหน้าที่"
            placeholder="เช่น นางสาวสมใจ ใจดี"
          />
          <q-input
            v-model="facultyStaffForm.email"
            outlined
            type="email"
            label="อีเมล"
            placeholder="name@buu.ac.th"
          />
          <q-select
            v-model="facultyStaffForm.permission"
            outlined
            emit-value
            map-options
            label="สิทธิ์การใช้งาน"
            :options="facultyStaffPermissionOptions"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn flat color="grey-7" label="ยกเลิก" no-caps v-close-popup />
          <q-btn
            unelevated
            color="primary"
            icon="person_add"
            label="เพิ่มเจ้าหน้าที่"
            no-caps
            @click="addFacultyStaff"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteCourseDialogOpen" persistent>
      <q-card class="delete-course-dialog">
        <q-card-section class="row items-start no-wrap q-gutter-md">
          <q-avatar color="negative" text-color="white" icon="delete" />
          <div>
            <div class="text-h6 text-weight-bold">ลบรายวิชา</div>
            <div class="text-body2 text-grey-8 q-mt-xs">
              ต้องการลบรายวิชา "{{ pendingDeleteCourse?.titleEn || pendingDeleteCourse?.title }}"
              ใช่หรือไม่?
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat color="grey-7" label="ยกเลิก" no-caps v-close-popup />
          <q-btn
            unelevated
            color="negative"
            icon="delete"
            label="ลบรายวิชา"
            no-caps
            @click="deletePendingCourse"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="learnerDetailDialogOpen">
      <q-card class="learner-detail-dialog" v-if="selectedLearner">
        <q-card-section class="learner-detail-header">
          <q-avatar size="64px">
            <img :src="selectedLearner.avatarUrl" :alt="selectedLearner.name" />
          </q-avatar>
          <div>
            <div class="text-h6 text-weight-bold">{{ selectedLearner.name }}</div>
            <div class="text-body2 text-grey-7">
              {{ selectedLearner.studentId }} ยท {{ selectedLearner.email }}
            </div>
            <q-badge
              rounded
              class="q-mt-sm"
              :color="selectedLearner.statusColor"
              :label="selectedLearner.status"
            />
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="learner-detail-grid">
          <div class="learner-detail-stat">
            <span>ความก้าวหน้า</span>
            <strong>{{ selectedLearner.progress }}%</strong>
            <q-linear-progress
              rounded
              size="8px"
              :value="selectedLearner.progress / 100"
              color="primary"
            />
          </div>
          <div class="learner-detail-stat">
            <span>คะแนนรวม</span>
            <strong>{{ selectedLearner.score }}</strong>
          </div>
          <div class="learner-detail-stat">
            <span>งานที่เสร็จ</span>
            <strong>{{
              selectedLearner.totalLessons > 0
                ? `${selectedLearner.completedLessons}/${selectedLearner.totalLessons}`
                : '-'
            }}</strong>
          </div>
          <div class="learner-detail-stat">
            <span>เข้าเรียนล่าสุด</span>
            <strong>{{ selectedLearner.lastActive }}</strong>
          </div>
        </q-card-section>

        <q-card-section class="learner-detail-info">
          <div>
            <span>คณะ/หน่วยงาน</span><strong>{{ selectedLearner.faculty }}</strong>
          </div>
          <div>
            <span>สาขา</span><strong>{{ selectedLearner.department }}</strong>
          </div>
          <div>
            <span>เบอร์โทร</span><strong>{{ selectedLearner.phone }}</strong>
          </div>
          <div>
            <span>วันที่ลงทะเบียน</span><strong>{{ selectedLearner.enrolledAt }}</strong>
          </div>
          <div>
            <span>สถานะชำระเงิน</span><strong>{{ selectedLearner.paymentStatus }}</strong>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            color="primary"
            icon="mail"
            label="ส่งข้อความ"
            no-caps
            @click="openQuickDialog(`ส่งข้อความถึง ${selectedLearner.name}`)"
          />
          <q-btn
            unelevated
            color="primary"
            icon="assignment"
            label="ดูงาน/คะแนน"
            no-caps
            @click="
              activeWorkspaceTab = 'grading';
              learnerDetailDialogOpen = false;
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <BaseSystemDialog
      v-model="saveCourseDialogOpen"
      variant="confirm"
      title="ยืนยันการแก้ไขรายวิชา"
      :message="saveCourseDialogMessage"
      :details="pendingCourseChangeLabels"
      confirm-label="ยืนยันการบันทึก"
      confirm-icon="save"
      cancel-label="ยกเลิก"
      @confirm="confirmPendingCourseSave"
      @cancel="clearPendingCourseSave"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseStore } from 'src/stores/course-store';
import { getCourseStructure } from 'src/data/course-structure';
import { useInstructorBackend } from 'src/composables/use-instructor-backend';
import type { Course, DeliveryMode } from 'src/types/course';
import BaseDateInput from 'components/base/BaseDateInput.vue';
import BaseSystemDialog from 'components/base/BaseSystemDialog.vue';
import { api } from 'src/boot/axios';

type WorkspaceTab =
  | 'overview'
  | 'content'
  | 'learners'
  | 'grading'
  | 'announcements'
  | 'settings'
  | 'reports';

interface LearnerRow {
  id: string;
  studentId: string;
  name: string;
  email: string;
  avatarUrl: string;
  faculty: string;
  department: string;
  phone: string;
  progress: number;
  lastActive: string;
  score: string;
  status: string;
  statusColor: string;
  enrolledAt: string;
  paymentStatus: string;
  completedLessons: number;
  totalLessons: number;
}

interface LearnerPriceRule {
  type: 'student' | 'staff' | 'external';
  label: string;
  description: string;
  enabled: boolean;
  amount: number;
}

interface FacultyStaffMember {
  name: string;
  email: string;
  permission: string;
}

interface FacultyStaffForm {
  name: string;
  email: string;
  permission: string;
}

interface CourseSettingsForm {
  published: boolean;
  registrationOpen: boolean;
  maxSeats: number | null;
  coverImageUrl: string;
  termName: string;
  deliveryMode: DeliveryMode;
  registrationStartDate: string;
  registrationEndDate: string;
}

interface MoodleModule {
  id: number;
  modname: string;
  name: string;
  url?: string;
}

interface MoodleSection {
  id: number;
  name: string;
  modules: MoodleModule[];
}

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const courseStore = useCourseStore();
const instructorBackend = useInstructorBackend();

// Initialize store
courseStore.init();

onMounted(() => {
  const email = authStore.user?.email;
  if (email) {
    void courseStore.fetchInstructorCourses(email);
  }
});

const courseSearch = ref('');
const activeWorkspaceTab = ref<WorkspaceTab>('overview');
const courseRowsPerPage = 10;
const courseTablePage = ref(1);
const deleteCourseDialogOpen = ref(false);
const pendingDeleteCourse = ref<Course | null>(null);
const saveCourseDialogOpen = ref(false);
const pendingCourseSaveId = ref('');
const pendingCourseChanges = ref<Partial<Course>>({});
const pendingCourseChangeLabels = ref<string[]>([]);
const saveCourseDialogMessage = ref('');
const learnerDetailDialogOpen = ref(false);
const selectedLearner = ref<LearnerRow | null>(null);
const defaultDeliveryMode: DeliveryMode = 'Online';
const requestedCourseId = typeof route.query.courseId === 'string' ? route.query.courseId : '';

const deliveryModeOptions: DeliveryMode[] = ['Online', 'Onsite', 'Self-Paced Learning'];
const defaultCoverImage =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';
const sampleCoverImages = [
  defaultCoverImage,
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
];

const learnerPricing = reactive<LearnerPriceRule[]>([
  {
    type: 'student',
    label: 'นิสิต/นักศึกษา',
    description: 'ผู้เรียนภายในมหาวิทยาลัย',
    enabled: true,
    amount: 0,
  },
  {
    type: 'staff',
    label: 'บุคลากร',
    description: 'บุคลากรหรือศิษย์เก่าที่ได้รับสิทธิ์',
    enabled: true,
    amount: 500,
  },
  {
    type: 'external',
    label: 'บุคคลทั่วไป',
    description: 'ผู้เรียนภายนอกมหาวิทยาลัย',
    enabled: true,
    amount: 1000,
  },
]);

const instructorCourses = computed<Course[]>(() =>
  courseStore.getInstructorCourses(authStore.user),
);
const selectedCourseId = ref(
  instructorCourses.value.some((course) => course.id === requestedCourseId)
    ? requestedCourseId
    : (instructorCourses.value[0]?.id ?? ''),
);
const courseSettings = reactive<CourseSettingsForm>({
  published: true,
  registrationOpen: true,
  maxSeats: 0,
  coverImageUrl: '',
  termName: 'รุ่นที่ 1/2569',
  deliveryMode: defaultDeliveryMode,
  registrationStartDate: '',
  registrationEndDate: '',
});
const defaultFacultyStaff: FacultyStaffMember[] = [
  {
    name: 'เจ้าหน้าที่คณะตัวอย่าง',
    email: 'faculty.staff@buu.ac.th',
    permission: 'แก้ไขข้อมูลและตรวจสอบรายชื่อ',
  },
];
const facultyStaffByCourseId = ref<Record<string, FacultyStaffMember[]>>({});
const facultyStaffDialogOpen = ref(false);
const facultyStaffPermissionOptions = [
  { label: 'แก้ไขข้อมูลรายวิชา', value: 'แก้ไขข้อมูลรายวิชา' },
  { label: 'แก้ไขข้อมูลและตรวจสอบรายชื่อ', value: 'แก้ไขข้อมูลและตรวจสอบรายชื่อ' },
  { label: 'ตรวจสอบรายชื่ออย่างเดียว', value: 'ตรวจสอบรายชื่ออย่างเดียว' },
];
const facultyStaffForm = reactive<FacultyStaffForm>({
  name: '',
  email: '',
  permission: facultyStaffPermissionOptions[0]?.value ?? 'แก้ไขข้อมูลรายวิชา',
});
const courseStatusFilter = computed<'all' | 'active'>(() =>
  route.query.status === 'active' ? 'active' : 'all',
);
const isTeachingRole = computed(
  () => authStore.user?.role === 'teach' || authStore.user?.role === 'instructor',
);
const isCourseTableView = computed(() => route.query.view === 'table');
const courseTableTitle = computed(() =>
  courseStatusFilter.value === 'active' ? 'รายวิชาที่เปิดสอน' : 'รายวิชาของฉัน',
);
const selectedCourse = computed<Course | undefined>(() =>
  instructorCourses.value.find((course) => course.id === selectedCourseId.value),
);
const facultyStaff = computed<FacultyStaffMember[]>({
  get() {
    const courseId = selectedCourseId.value;
    if (!courseId) return [];
    return facultyStaffByCourseId.value[courseId] ?? [];
  },
  set(value) {
    const courseId = selectedCourseId.value;
    if (!courseId) return;
    facultyStaffByCourseId.value = {
      ...facultyStaffByCourseId.value,
      [courseId]: value,
    };
  },
});

watch(
  selectedCourse,
  (course) => {
    const email = authStore.user?.email;
    if (!course) return;
    if (!facultyStaffByCourseId.value[course.id]) {
      facultyStaffByCourseId.value = {
        ...facultyStaffByCourseId.value,
        [course.id]: defaultFacultyStaff.map((staff) => ({ ...staff })),
      };
    }
    if (!email) return;
    void instructorBackend.fetchLearners(email, course.id);
    void instructorBackend.fetchGrades(email, course.id);
  },
  { immediate: true },
);
const selectedStructure = computed(() => getCourseStructure(selectedCourseId.value));

const moodleSections = ref<MoodleSection[]>([]);
const isMoodleLoading = ref(false);

async function fetchMoodleContents(moodleId: number | null | undefined): Promise<void> {
  if (!moodleId) {
    moodleSections.value = [];
    return;
  }
  isMoodleLoading.value = true;
  moodleSections.value = [];
  try {
    const { data } = await api.get<MoodleSection[]>(`/api/moodle/moodle-contents/${moodleId}`);
    moodleSections.value = data.filter((s) => s.modules && s.modules.length > 0);
  } catch {
    // silent fail — Moodle unavailable
  } finally {
    isMoodleLoading.value = false;
  }
}

const moodleOpenLoading = ref<string>('');

async function openInMoodle(course: Course): Promise<void> {
  const moodleId = course.moodleId;
  const username = authStore.user?.username || authStore.user?.email;
  if (!moodleId || !username) {
    $q.notify({ type: 'warning', message: 'ยังไม่มีข้อมูล Moodle สำหรับรายวิชานี้' });
    return;
  }
  moodleOpenLoading.value = course.id;
  try {
    const { data } = await api.get<{ url: string }>(
      `/api/moodle/instructor-course-url/${moodleId}?username=${encodeURIComponent(username)}`,
    );
    window.open(data.url, '_blank', 'noopener,noreferrer');
  } catch {
    $q.notify({ type: 'negative', message: 'ไม่สามารถเชื่อมต่อ Moodle ได้ในขณะนี้' });
  } finally {
    moodleOpenLoading.value = '';
  }
}

const filteredCourses = computed(() => {
  const courses =
    courseStatusFilter.value === 'active'
      ? instructorCourses.value.filter((course) => course.isActive)
      : instructorCourses.value;
  const keyword = courseSearch.value.trim().toLowerCase();
  if (!keyword) return courses;
  return courses.filter((course) =>
    [course.code, course.title, course.titleEn, course.faculty, course.category]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword)),
  );
});

const courseTablePageCount = computed(() =>
  Math.max(1, Math.ceil(filteredCourses.value.length / courseRowsPerPage)),
);
const firstCourseRowIndex = computed(() => (courseTablePage.value - 1) * courseRowsPerPage);
const paginatedCourses = computed(() =>
  filteredCourses.value.slice(
    firstCourseRowIndex.value,
    firstCourseRowIndex.value + courseRowsPerPage,
  ),
);

watch([filteredCourses, courseStatusFilter], () => {
  courseTablePage.value = 1;
});

watch(courseTablePageCount, (pageCount) => {
  if (courseTablePage.value > pageCount) {
    courseTablePage.value = pageCount;
  }
});

watch(
  filteredCourses,
  (courses) => {
    if (courses.some((course) => course.id === selectedCourseId.value)) {
      return;
    }

    selectedCourseId.value = courses[0]?.id ?? '';
  },
  { immediate: true },
);

watch(
  isTeachingRole,
  (canAccessInstructorArea) => {
    if (canAccessInstructorArea) {
      return;
    }

    void router.replace('/profile');
  },
  { immediate: true },
);

const dashboardMetrics = computed(() => {
  const totalLearners = instructorCourses.value.reduce(
    (sum, course) => sum + course.enrolledCount,
    0,
  );
  const activeCourses = instructorCourses.value.filter((course) => course.isActive).length;
  const pendingReviews = assignments.value.reduce((sum, item) => sum + item.pending, 0);
  const totalViews = instructorCourses.value.reduce((sum, course) => sum + course.views, 0);

  return [
    {
      label: 'ผู้เรียนทั้งหมด',
      value: totalLearners.toLocaleString(),
      icon: 'groups',
      color: '#1976d2',
      background: '#e3f2fd',
    },
    {
      label: 'รายวิชาที่เผยแพร่',
      value: String(activeCourses),
      icon: 'menu_book',
      color: '#2e7d32',
      background: '#e8f5e9',
    },
    {
      label: 'งานรอตรวจ',
      value: String(pendingReviews),
      icon: 'assignment_late',
      color: '#c77700',
      background: '#fff7df',
    },
    {
      label: 'ยอดเข้าชม',
      value: totalViews.toLocaleString(),
      icon: 'visibility',
      color: '#6a1b9a',
      background: '#f3e5f5',
    },
  ];
});

const workspaceTabs: Array<{ name: WorkspaceTab; label: string; icon: string }> = [
  { name: 'overview', label: 'ภาพรวม', icon: 'dashboard' },
  { name: 'content', label: 'เนื้อหา', icon: 'view_list' },
  { name: 'learners', label: 'ผู้เรียน', icon: 'groups' },
  { name: 'grading', label: 'งาน/คะแนน', icon: 'grading' },
  { name: 'announcements', label: 'ประกาศ', icon: 'campaign' },
  { name: 'settings', label: 'ตั้งค่า', icon: 'settings' },
  { name: 'reports', label: 'รายงาน', icon: 'analytics' },
];

function getLearnerStatus(progress: number): Pick<LearnerRow, 'status' | 'statusColor'> {
  if (progress >= 85) return { status: 'เรียนต่อเนื่อง', statusColor: 'positive' };
  if (progress >= 60) return { status: 'ปกติ', statusColor: 'primary' };
  if (progress >= 35) return { status: 'ควรติดตาม', statusColor: 'warning' };
  return { status: 'รอข้อมูลความคืบหน้า', statusColor: 'grey-7' };
}

function formatBackendDate(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatPaymentStatus(value: string | null | undefined, isFree: boolean): string {
  if (isFree) return 'ไม่มีค่าใช้จ่าย';
  if (value === 'Y') return 'ชำระแล้ว';
  if (value === 'N') return 'ยังไม่ชำระ';
  return value || '-';
}

function buildLearnersForCourse(course: Course | undefined): LearnerRow[] {
  if (!course) return [];

  const backendLearners = instructorBackend.learnersByCourseId.value[course.id] ?? [];
  const backendGrades = instructorBackend.gradesByCourseId.value[course.id] ?? [];

  return backendLearners.map((learner) => {
    const grade = backendGrades.find(
      (candidate) =>
        candidate.learnerUserId === learner.userId || candidate.studentId === learner.studentId,
    );

    const GRADEABLE = ['assign', 'quiz'];
    const gradeItems = (grade?.gradeItems ?? []).filter(
      (item) => item.itemmodule !== null && GRADEABLE.includes(item.itemmodule),
    );
    const completedLessons = gradeItems.filter((item) => item.score !== null).length;
    const courseTotalActivities = moodleSections.value.reduce(
      (sum, s) => sum + s.modules.filter((m) => GRADEABLE.includes(m.modname)).length,
      0,
    );
    const totalLessons = gradeItems.length > 0 ? gradeItems.length : courseTotalActivities;
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const status = getLearnerStatus(progress);

    return {
      id: `${course.id}-${learner.userId}`,
      studentId: learner.studentId,
      name: learner.fullName,
      email: learner.email ?? '-',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(`${course.id}-${learner.userId}`)}`,
      faculty: '-',
      department: '-',
      phone: learner.phone ?? '-',
      progress,
      lastActive: grade?.updatedAt ? formatBackendDate(grade.updatedAt) : '-',
      score:
        completedLessons === 0 || grade?.score === null || grade?.score === undefined
          ? 'ยังไม่มีคะแนน'
          : `${grade.score}/${grade.maxScore ?? 100}`,
      ...status,
      enrolledAt: formatBackendDate(learner.enrolledAt),
      paymentStatus: formatPaymentStatus(learner.paymentStatus, course.isFree),
      completedLessons,
      totalLessons,
    };
  });
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function formatUnixDate(ts: number): string {
  const d = new Date(ts * 1000);
  return `ประกาศเมื่อ ${d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}`;
}

const isKnownCourse = computed(() => Boolean(selectedCourse.value));

const learners = computed<LearnerRow[]>(() =>
  isKnownCourse.value ? buildLearnersForCourse(selectedCourse.value) : [],
);

const learnerColumns: QTableColumn<LearnerRow>[] = [
  { name: 'name', label: 'ผู้เรียน', field: 'name', align: 'left', sortable: true },
  { name: 'email', label: 'อีเมล', field: 'email', align: 'left' },
  { name: 'progress', label: 'ความก้าวหน้า', field: 'progress', align: 'left', sortable: true },
  { name: 'score', label: 'คะแนน', field: 'score', align: 'left' },
  {
    name: 'lastActive',
    label: 'เข้าเรียนล่าสุด',
    field: 'lastActive',
    align: 'left',
    sortable: true,
  },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'left' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
];

const assignments = computed(() => {
  if (!isKnownCourse.value) return [];
  const GRADEABLE = ['assign', 'quiz'];
  const grades = instructorBackend.gradesByCourseId.value[selectedCourse.value!.id] ?? [];
  const result: {
    title: string;
    detail: string;
    submitted: number;
    pending: number;
    status: string;
    statusColor: string;
    icon: string;
    color: string;
  }[] = [];
  for (const section of moodleSections.value) {
    for (const mod of section.modules) {
      if (!GRADEABLE.includes(mod.modname)) continue;
      const submitted = grades.filter((g) =>
        g.gradeItems.some((gi) => gi.cmid !== null && gi.cmid === mod.id && gi.score !== null),
      ).length;
      result.push({
        title: mod.name,
        detail: section.name,
        submitted,
        pending: 0,
        status: mod.modname === 'quiz' ? 'แบบทดสอบ' : 'งานส่ง',
        statusColor: mod.modname === 'quiz' ? 'primary' : 'orange',
        icon: mod.modname === 'quiz' ? 'quiz' : 'assignment',
        color: mod.modname === 'quiz' ? 'primary' : 'orange',
      });
    }
  }
  return result;
});

const announcements = computed(() => {
  if (!isKnownCourse.value) return [];
  return instructorBackend.courseAnnouncements.value.map((a) => ({
    title: a.subject,
    body: stripHtml(a.body),
    date: formatUnixDate(a.createdAt),
    pinned: a.pinned,
  }));
});

const reports = computed(() => {
  if (!isKnownCourse.value) {
    return [
      { label: 'อัตราเรียนจบ', value: '0%', progress: 0, color: 'positive' },
      { label: 'คะแนนเฉลี่ย', value: '0/100', progress: 0, color: 'primary' },
      { label: 'การมีส่วนร่วม', value: '0%', progress: 0, color: 'warning' },
    ];
  }
  const grades = instructorBackend.gradesByCourseId.value[selectedCourse.value!.id] ?? [];
  const total = learners.value.length;
  const passed = grades.filter((g) => g.status === 'passed').length;
  const completionRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const scoredGrades = grades.filter((g) => g.score !== null && g.maxScore);
  const avgScore =
    scoredGrades.length > 0
      ? Math.round(scoredGrades.reduce((s, g) => s + g.score!, 0) / scoredGrades.length)
      : 0;
  const maxScore = scoredGrades[0]?.maxScore ?? 100;
  const hasActivity = learners.value.filter((l) => l.completedLessons > 0).length;
  const participation = total > 0 ? Math.round((hasActivity / total) * 100) : 0;

  return [
    {
      label: 'อัตราเรียนจบ',
      value: `${completionRate}%`,
      progress: completionRate / 100,
      color: 'positive',
    },
    {
      label: 'คะแนนเฉลี่ย',
      value: scoredGrades.length > 0 ? `${avgScore}/${maxScore}` : '-',
      progress: avgScore / maxScore,
      color: 'primary',
    },
    {
      label: 'การมีส่วนร่วม',
      value: `${participation}%`,
      progress: participation / 100,
      color: 'warning',
    },
  ];
});

const selectedHealth = computed(() => getCourseHealth(selectedCourseId.value));

const readinessChecklist = computed(() => {
  const hasStructure = selectedStructure.value.length > 0;
  const hasQuiz = selectedStructure.value.some((module) =>
    module.lessons.some((lesson) => lesson.type === 'quiz'),
  );
  const hasAnnouncements = announcements.value.length > 0;
  return [
    {
      label: 'ข้อมูลรายวิชาครบถ้วน',
      detail: 'ชื่อ คำอธิบาย ราคา รูปปก และช่องทางติดต่อพร้อมใช้งาน',
      done: Boolean(selectedCourse.value?.title),
    },
    {
      label: 'มีโครงสร้างบทเรียน',
      detail: `${selectedStructure.value.length} โมดูลพร้อมเผยแพร่`,
      done: hasStructure,
    },
    {
      label: 'มีแบบประเมินผล',
      detail: 'ตั้งค่า quiz หรืองานที่ใช้ตัดสินผลการเรียน',
      done: hasQuiz,
    },
    {
      label: 'ประกาศเริ่มเรียน',
      detail: 'มีประกาศต้อนรับและแนวทางการเรียน',
      done: hasAnnouncements,
    },
  ];
});

const priorityTasks = computed(() => [
  {
    title: 'ตรวจงานที่ค้าง',
    detail: `${assignments.value.reduce((sum, item) => sum + item.pending, 0)} รายการรอการตรวจ`,
    icon: 'assignment_late',
    color: 'warning',
  },
  {
    title: 'ติดตามผู้เรียนเสี่ยงหลุด',
    detail: 'มีผู้เรียน 1 คนไม่เข้าเรียนเกิน 7 วัน',
    icon: 'person_alert',
    color: 'negative',
  },
  {
    title: 'อัปเดตประกาศรายวิชา',
    detail: 'ประกาศล่าสุดเกิน 2 วันแล้ว',
    icon: 'campaign',
    color: 'primary',
  },
]);

const qualityChecks = computed(() => [
  { label: 'รูปปกแสดงผลถูกต้อง', done: Boolean(selectedCourse.value?.imageUrl) },
  {
    label: 'มีบทเรียนอย่างน้อย 3 รายการ',
    done: selectedStructure.value.reduce((sum, module) => sum + module.lessons.length, 0) >= 3,
  },
  { label: 'มีเกณฑ์ประเมินผล', done: true },
  { label: 'กำหนดจำนวนที่นั่งแล้ว', done: (courseSettings.maxSeats ?? 0) > 0 },
]);

watch(
  selectedCourse,
  (course) => {
    if (!course) return;
    courseSettings.published = course.isActive;
    courseSettings.registrationOpen = course.isActive;
    courseSettings.maxSeats = course.maxSeats;
    courseSettings.coverImageUrl = course.imageUrl;
    courseSettings.deliveryMode = course.deliveryModes[0] ?? 'Online';
    courseSettings.registrationStartDate = course.registrationStartDate ?? '';
    courseSettings.registrationEndDate = course.registrationEndDate ?? '';
    if (learnerPricing[0])
      learnerPricing[0].amount = course.isFree ? 0 : Math.max(0, Math.round(course.price * 0.5));
    if (learnerPricing[1])
      learnerPricing[1].amount = course.isFree ? 0 : Math.max(0, Math.round(course.price * 0.75));
    if (learnerPricing[2]) learnerPricing[2].amount = course.price;
    activeWorkspaceTab.value = 'overview';
    void fetchMoodleContents(course.moodleId);
    void instructorBackend.fetchCourseAnnouncements(course.moodleId);
  },
  { immediate: true },
);

function openLearnerRoster(courseId: string): void {
  selectedCourseId.value = courseId;
  void nextTick(() => {
    activeWorkspaceTab.value = 'learners';
  });
}

function openLearnerDetail(_event: Event | null, learner: LearnerRow): void {
  selectedLearner.value = learner;
  learnerDetailDialogOpen.value = true;
}

function useSampleCover(): void {
  const currentIndex = sampleCoverImages.indexOf(courseSettings.coverImageUrl);
  courseSettings.coverImageUrl =
    sampleCoverImages[(currentIndex + 1) % sampleCoverImages.length] ?? defaultCoverImage;
}

function resetCoverImage(): void {
  courseSettings.coverImageUrl = selectedCourse.value?.imageUrl ?? '';
}

function resetFacultyStaffForm(): void {
  facultyStaffForm.name = '';
  facultyStaffForm.email = '';
  facultyStaffForm.permission = facultyStaffPermissionOptions[0]?.value ?? 'แก้ไขข้อมูลรายวิชา';
}

function openFacultyStaffDialog(): void {
  resetFacultyStaffForm();
  facultyStaffDialogOpen.value = true;
}

function addFacultyStaff(): void {
  const name = facultyStaffForm.name.trim();
  const email = facultyStaffForm.email.trim().toLowerCase();
  const permission = facultyStaffForm.permission.trim();

  if (!selectedCourseId.value) {
    $q.notify({ type: 'warning', message: 'ยังไม่พบรายวิชาที่เลือกอยู่ในขณะนี้' });
    return;
  }

  if (!name) {
    $q.notify({ type: 'warning', message: 'กรุณากรอกชื่อเจ้าหน้าที่' });
    return;
  }

  if (!/.+@.+\..+/.test(email)) {
    $q.notify({ type: 'warning', message: 'กรุณากรอกอีเมลให้ถูกต้อง' });
    return;
  }

  if (facultyStaff.value.some((staff) => staff.email.toLowerCase() === email)) {
    $q.notify({ type: 'warning', message: 'อีเมลนี้ถูกเพิ่มเป็นเจ้าหน้าที่แล้ว' });
    return;
  }

  facultyStaff.value = [
    ...facultyStaff.value,
    {
      name,
      email,
      permission,
    },
  ];
  facultyStaffDialogOpen.value = false;
  resetFacultyStaffForm();
  $q.notify({ type: 'positive', message: 'เพิ่มเจ้าหน้าที่เรียบร้อยแล้ว' });
}

function removeFacultyStaff(email: string): void {
  facultyStaff.value = facultyStaff.value.filter((staff) => staff.email !== email);
}

function getCourseHealth(courseId: string) {
  const numericId = Number(courseId) || 1;
  return {
    readiness: Math.min(96, 72 + numericId * 3),
    completion: Math.min(91, 48 + numericId * 7),
  };
}

function moodleModIcon(modname: string): string {
  if (modname === 'quiz') return 'quiz';
  if (modname === 'assign') return 'assignment';
  if (modname === 'resource') return 'description';
  if (modname === 'url') return 'link';
  if (modname === 'page') return 'article';
  if (modname === 'folder') return 'folder';
  if (modname === 'lesson') return 'menu_book';
  if (modname === 'forum') return 'forum';
  if (modname === 'scorm') return 'play_lesson';
  return 'extension';
}

function moodleModColor(modname: string): string {
  if (modname === 'quiz') return 'orange-7';
  if (modname === 'assign') return 'teal-7';
  if (modname === 'lesson') return 'purple-7';
  if (modname === 'scorm') return 'blue-7';
  if (modname === 'forum') return 'blue-grey-6';
  return 'grey-7';
}

function moodleModLabel(modname: string): string {
  if (modname === 'quiz') return 'แบบทดสอบ';
  if (modname === 'assign') return 'งาน';
  if (modname === 'resource') return 'ไฟล์';
  if (modname === 'url') return 'ลิงก์';
  if (modname === 'page') return 'หน้าเนื้อหา';
  if (modname === 'folder') return 'โฟลเดอร์';
  if (modname === 'lesson') return 'บทเรียน';
  if (modname === 'forum') return 'กระดานสนทนา';
  if (modname === 'scorm') return 'SCORM';
  return modname;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(value);
}

function getPaidLearnerCount(course: Course): number {
  return Math.max(0, course.enrolledCount - getUnpaidLearnerCount(course));
}

function getUnpaidLearnerCount(course: Course): number {
  if (course.isFree) return 0;
  return Math.min(course.enrolledCount, Math.max(0, Math.round(course.enrolledCount * 0.12)));
}

function getRemainingSeats(course: Course): number {
  return Math.max(0, (course.maxSeats ?? 0) - course.enrolledCount);
}

function setCoursePublished(courseId: string, isPublished: boolean): void {
  courseStore.updateCourse(courseId, { isActive: isPublished });
}

function openCourseWorkspace(courseId: string): void {
  selectedCourseId.value = courseId;
  activeWorkspaceTab.value = 'overview';
  void router.push({
    path: '/instructor/courses',
    query: { courseId },
  });
}

function goToActiveInstructorCoursesTable(): void {
  void router.push({
    path: '/instructor/courses',
    query: { view: 'table', status: 'active' },
  });
}

function previewCourse(): void {
  if (!selectedCourse.value) return;
  void router.push(`/course/${selectedCourse.value.id}`);
}

function formatCourseDateLabel(dateText: string | null | undefined, fallback: string): string {
  if (!dateText) return fallback;
  const [year, month, day] = dateText.split('-').map(Number);
  if (!year || !month || !day) {
    return fallback;
  }

  return new Date(year, month - 1, day).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCompactDateRange(startDate: string, endDate: string): string {
  const thaiShortDatePattern = /^(\d{1,2})\s+(.+?)\s+(\d{4})$/;
  const startMatch = startDate.match(thaiShortDatePattern);
  const endMatch = endDate.match(thaiShortDatePattern);

  if (startMatch && endMatch && startMatch[3] === endMatch[3]) {
    return `${startMatch[1]} ${startMatch[2]} - ${endMatch[1]} ${endMatch[2]} ${endMatch[3]}`;
  }

  return `${startDate} - ${endDate}`;
}

function buildCourseUpdatePayload(course: Course): Partial<Course> {
  const externalPrice = learnerPricing.find((price) => price.type === 'external');
  const nextPrice = externalPrice?.enabled ? externalPrice.amount : course.price;

  return {
    imageUrl: courseSettings.coverImageUrl || course.imageUrl,
    isActive: courseSettings.published,
    deliveryModes: [courseSettings.deliveryMode],
    registrationStart: formatCourseDateLabel(
      courseSettings.registrationStartDate,
      course.registrationStart,
    ),
    registrationEnd: formatCourseDateLabel(
      courseSettings.registrationEndDate,
      course.registrationEnd,
    ),
    registrationStartDate: courseSettings.registrationStartDate,
    registrationEndDate: courseSettings.registrationEndDate,
    maxSeats: courseSettings.maxSeats,
    price: nextPrice,
    isFree: nextPrice <= 0,
  };
}

function getCourseChangeLabels(course: Course, changes: Partial<Course>): string[] {
  const labels: string[] = [];

  if (changes.imageUrl !== course.imageUrl) labels.push('รูปปกรายวิชา');
  if (changes.isActive !== course.isActive) labels.push('สถานะการเผยแพร่');
  if (changes.deliveryModes?.[0] !== course.deliveryModes[0]) labels.push('รูปแบบการเรียน');
  if (changes.registrationStartDate !== course.registrationStartDate)
    labels.push('วันเปิดรับสมัคร');
  if (changes.registrationEndDate !== course.registrationEndDate) labels.push('วันปิดรับสมัคร');
  if (changes.maxSeats !== course.maxSeats) labels.push('จำนวนที่นั่ง');
  if (changes.price !== course.price || changes.isFree !== course.isFree)
    labels.push('ราคา/ค่าใช้จ่าย');

  return labels;
}

function confirmSaveCourseChanges(): void {
  const course = selectedCourse.value;
  if (!course) return;

  const changes = buildCourseUpdatePayload(course);
  const changeLabels = getCourseChangeLabels(course, changes);

  if (changeLabels.length === 0) {
    $q.notify({
      type: 'info',
      icon: 'info',
      message: 'ยังไม่มีข้อมูลที่เปลี่ยนแปลง',
      position: 'top',
    });
    return;
  }

  pendingCourseSaveId.value = course.id;
  pendingCourseChanges.value = changes;
  pendingCourseChangeLabels.value = changeLabels;
  saveCourseDialogMessage.value = `คุณต้องการบันทึกการแก้ไข "${course.titleEn || course.title}" ใช่หรือไม่?`;
  saveCourseDialogOpen.value = true;
}

function saveCourseChanges(courseId: string, changes: Partial<Course>): void {
  courseStore.updateCourse(courseId, changes);
  notifySaved();
}

function confirmPendingCourseSave(): void {
  if (!pendingCourseSaveId.value) return;

  saveCourseChanges(pendingCourseSaveId.value, pendingCourseChanges.value);
  saveCourseDialogOpen.value = false;
  clearPendingCourseSave();
}

function clearPendingCourseSave(): void {
  pendingCourseSaveId.value = '';
  pendingCourseChanges.value = {};
  pendingCourseChangeLabels.value = [];
  saveCourseDialogMessage.value = '';
}

function notifySaved(): void {
  $q.notify({
    type: 'positive',
    icon: 'check_circle',
    message: 'บันทึกการตั้งค่ารายวิชาแล้ว',
    position: 'top',
  });
}

function confirmDeleteSelectedCourse(): void {
  confirmDeleteSelectedCourseWithDialog();
}

function queueDeleteCourse(course: Course): void {
  pendingDeleteCourse.value = course;
  deleteCourseDialogOpen.value = true;
}

function confirmDeleteSelectedCourseWithDialog(): void {
  const course = selectedCourse.value;
  if (!course) return;

  $q.dialog({
    title: 'ลบรายวิชา',
    message: `ต้องการลบรายวิชา "${course.titleEn || course.title}" ใช่หรือไม่?`,
    cancel: {
      label: 'ยกเลิก',
      flat: true,
      color: 'grey-7',
    },
    ok: {
      label: 'ลบรายวิชา',
      color: 'negative',
      unelevated: true,
    },
    persistent: true,
  }).onOk(() => {
    deleteSelectedCourse(course.id);
  });
}

function deletePendingCourse(): void {
  if (!pendingDeleteCourse.value) return;

  deleteSelectedCourse(pendingDeleteCourse.value.id);
  pendingDeleteCourse.value = null;
  deleteCourseDialogOpen.value = false;
}

function deleteSelectedCourse(courseId: string): void {
  const currentIndex = instructorCourses.value.findIndex((course) => course.id === courseId);
  const nextCourse =
    instructorCourses.value[currentIndex + 1] ?? instructorCourses.value[currentIndex - 1] ?? null;

  courseStore.deleteCourse(courseId);
  selectedCourseId.value = nextCourse?.id ?? '';
  activeWorkspaceTab.value = 'overview';

  $q.notify({
    type: 'positive',
    icon: 'delete',
    message: 'ลบรายวิชาแล้ว',
    position: 'top',
  });
}

function openQuickDialog(title: string): void {
  $q.dialog({
    title,
    message:
      'ตัวอย่าง workflow สำหรับอาจารย์: สามารถต่อ API จริงเพื่อบันทึกข้อมูล สร้างงาน ส่งประกาศ หรือจัดการผู้เรียนได้จากจุดนี้',
    ok: {
      label: 'รับทราบ',
      color: 'primary',
      unelevated: true,
    },
  });
}
</script>

<style lang="scss" scoped>
.instructor-dashboard {
  min-height: 100vh;
  background: #f8f6f1;
}

.instructor-dashboard__inner {
  padding-block: 0 48px;
}

.instructor-hero {
  position: relative;
  overflow: hidden;
  width: 100vw;
  margin-left: 50%;
  margin-bottom: 28px;
  transform: translateX(-50%);
  border-radius: 0;
  background:
    radial-gradient(circle at 15% 25%, rgba(245, 166, 35, 0.3), transparent 40%),
    radial-gradient(circle at 85% 75%, rgba(35, 78, 112, 0.4), transparent 40%),
    linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #234e70 100%);
  color: #fff;
  box-shadow: none;

  h1 {
    margin: 6px 0 4px;
    font-size: clamp(2rem, 3vw, 2.6rem);
    font-weight: 800;
    line-height: 1.12;
  }
}

.instructor-hero__particles,
.instructor-hero__overlay {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.instructor-hero__overlay {
  background:
    repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.015) 0,
      rgba(255, 255, 255, 0.015) 1px,
      transparent 1px,
      transparent 48px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.015) 0,
      rgba(255, 255, 255, 0.015) 1px,
      transparent 1px,
      transparent 48px
    );
}

.instructor-hero__content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 34px;
  max-width: 1280px;
  margin: 0 auto;
  min-height: 200px;
  padding: 32px 24px;
}

.instructor-hero__identity {
  display: flex;
  align-items: center;
  gap: 26px;
  min-width: 0;
}

.instructor-hero__avatar {
  flex: 0 0 auto;
  border: 3px solid rgba(245, 166, 35, 0.48);
  background: rgba(255, 255, 255, 0.12);
  box-shadow:
    0 0 0 3px rgba(255, 255, 255, 0.08),
    0 14px 30px rgba(0, 0, 0, 0.24);
}

.instructor-hero__avatar-image {
  object-fit: cover;
}

.instructor-hero__eyebrow {
  color: rgba(255, 255, 255, 0.66);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.instructor-hero__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.86rem;
  font-weight: 700;
}

.instructor-hero__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(132px, 1fr));
  gap: 14px;
  width: min(720px, 100%);
  flex: 0 0 auto;
}

.metric-tile,
.course-table-view,
.course-sidebar,
.course-workspace,
.panel-block,
.assignment-card,
.report-card {
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #fff;
  box-shadow: 0 10px 28px rgba(17, 24, 39, 0.05);
}

.metric-tile {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 78px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(4px);
}

.metric-tile__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  flex-shrink: 0;
}

.metric-tile__value {
  color: #ffffff;
  font-size: 1.48rem;
  font-weight: 800;
  line-height: 1.1;
}

.metric-tile__label {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.82rem;
  font-weight: 700;
}

.course-table-layout {
  width: calc(100vw - 48px);
  margin-left: calc(50% - 50vw + 24px);
  display: block;
}

.instructor-table-nav__card {
  position: sticky;
  top: 88px;
  min-height: 520px;
  overflow: hidden;
  border-radius: 14px !important;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(17, 24, 39, 0.06) !important;
}

.instructor-table-nav__item {
  min-height: 52px;
  margin: 6px 8px;
  padding: 0 10px;
  border-radius: 10px;
  transition:
    background-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;

  &:hover {
    background: rgba($primary, 0.06);
    transform: translateX(2px);
  }

  &--active {
    background: rgba($primary, 0.1) !important;
    box-shadow: inset 3px 0 0 $primary;
  }

  :deep(.q-item__section--avatar) {
    min-width: 34px;
    padding-right: 10px;
  }
}

.course-table-view {
  overflow: hidden;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(17, 24, 39, 0.06);
}

.course-table-view__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 26px 26px 20px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  background: #ffffff;

  h2 {
    margin: 0;
    color: #10223c;
    font-size: 1.25rem;
    font-weight: 800;
  }

  span {
    color: #64748b;
    font-size: 0.84rem;
    font-weight: 700;
  }
}

.course-table-view__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
  min-width: 0;
}

.course-table-search {
  width: min(300px, 34vw);
}

.course-table-filter-btn,
.course-table-create-btn {
  min-height: 40px;
  padding: 0 16px !important;
  border-radius: 8px !important;
  font-size: 0.78rem;
  font-weight: 900 !important;
}

.course-table-filter-btn {
  background: #ffffff !important;
}

.course-table-create-btn {
  box-shadow: 0 8px 18px rgba($primary, 0.22) !important;
}

.course-table-scroll {
  display: block;
  overflow-x: auto;
  overflow-y: hidden;
  padding-top: 4px;
}

.instructor-profile-course-list {
  display: grid;
  gap: 18px;
  padding: 0 18px 18px;
}

.instructor-profile-course-card {
  position: relative;
  display: grid;
  grid-template-columns: 154px minmax(0, 1fr);
  gap: 18px;
  overflow: hidden;
  padding: 18px 18px 16px 26px;
  border: 1px solid rgba(245, 166, 35, 0.28);
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.05);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(245, 166, 35, 0.5);
    box-shadow: 0 16px 32px rgba(17, 24, 39, 0.08);
  }
}

.instructor-profile-course-card__stripe {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 5px;
  background: linear-gradient(180deg, $primary, #c4850e);
}

.instructor-profile-course-card__thumb {
  width: 154px;
  height: 94px;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.instructor-profile-course-card__content {
  min-width: 0;
}

.instructor-profile-course-card__top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: start;
}

.instructor-profile-course-card__title {
  display: block;
  padding: 0;
  border: 0;
  color: #2f3137;
  background: transparent;
  font: inherit;
  font-size: 1.04rem;
  font-weight: 900;
  line-height: 1.4;
  text-align: left;
  cursor: pointer;

  &:hover {
    color: #d97706;
  }
}

.instructor-profile-course-card__subtitle {
  margin-top: 4px;
  color: #d97706;
  font-size: 0.82rem;
  font-weight: 800;
}

.instructor-profile-course-card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.instructor-profile-course-card__publish {
  display: grid;
  justify-items: end;
  gap: 5px;
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 800;
}

.instructor-profile-course-card__meta {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 18px;
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 700;
}

.instructor-profile-course-card__progress {
  max-width: 520px;
  margin-top: 18px;
}

.instructor-profile-course-card__progress-head,
.instructor-profile-course-card__payment {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 7px;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 800;
}

.instructor-profile-course-card__payment {
  justify-content: flex-start;
  margin: 8px 0 0;
  font-size: 0.78rem;
}

.instructor-profile-course-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(17, 24, 39, 0.1);
}

.instructor-profile-course-card__moodle {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 800;
}

.instructor-profile-course-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.course-action-btn--moodle {
  border: 0 !important;
  box-shadow: 0 7px 18px rgba(22, 163, 74, 0.18) !important;
}

.instructor-profile-course-empty {
  margin: 0 18px 18px;
  padding: 42px 18px;
  border: 2px dashed rgba(245, 166, 35, 0.16);
  border-radius: 12px;
  color: #94a3b8;
  font-weight: 800;
  text-align: center;
}

.course-admin-table {
  width: 100%;
  min-width: 1320px;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
  color: #172033;
  font-size: 0.82rem;

  th,
  td {
    padding: 14px 10px;
    border-right: 1px solid #dce4ee;
    border-bottom: 1px solid #dce4ee;
    vertical-align: top;
    overflow-wrap: break-word;
  }

  th {
    color: #0f172a;
    background: #e7e7e7;
    font-size: 0.78rem;
    font-weight: 900;
    text-align: center;
    height: 58px;
    line-height: 1.42;
    vertical-align: middle;
    white-space: nowrap;
    word-break: keep-all;
  }

  tbody tr {
    background: #ffffff;
    transition: background-color 0.16s ease;
  }

  tbody tr:nth-child(even) {
    background: #fffaf1;
  }

  tbody tr:hover {
    background: #fff4dd;
  }

  td.text-center {
    vertical-align: middle;
  }
}

.table-head-label {
  display: inline-block;
  line-height: 1.38;
}

.course-col-index {
  width: 56px;
}

.course-col-title {
  width: 32%;
}

.course-col-fee {
  width: 8%;
}

.course-col-schedule {
  width: 11%;
}

.course-col-seat {
  width: 5%;
}

.course-col-paid,
.course-col-unpaid {
  width: 6%;
}

.course-col-publish {
  width: 6%;
}

.course-col-remain {
  width: 5%;
}

.course-col-moodle {
  width: 12%;
}

.course-col-actions {
  width: 9%;
}

.col-index {
  text-align: center;
  vertical-align: middle !important;
  word-break: keep-all;
}

.course-title-cell {
  padding: 14px 16px !important;

  .course-title-cell__layout {
    display: grid;
    grid-template-columns: 108px minmax(0, 1fr);
    gap: 16px;
    align-items: center;
  }

  .course-title-cell__image {
    display: block;
    width: 108px;
    height: 76px;
    border-radius: 8px;
    object-fit: cover;
    box-shadow: 0 7px 18px rgba(15, 23, 42, 0.09);
  }

  .course-title-cell__copy {
    min-width: 0;
  }

  .course-title-cell__code {
    width: fit-content;
    margin-bottom: 5px;
    padding: 2px 7px;
    border-radius: 999px;
    font-size: 0.64rem;
    font-weight: 900;
  }

  button {
    display: block;
    padding: 0;
    border: 0;
    color: #172033;
    background: transparent;
    font: inherit;
    font-size: 0.88rem;
    font-weight: 900;
    line-height: 1.45;
    text-align: left;
    cursor: pointer;
    transition: color 0.18s ease;

    &:hover {
      color: #d97706;
    }
  }

  span {
    display: block;
    margin-top: 5px;
    color: #64748b;
    font-size: 0.74rem;
    font-weight: 700;
    line-height: 1.45;
  }
}

.schedule-cell {
  color: #26364d;
  font-size: 0.76rem;
  font-weight: 600;
  line-height: 1.42;
  vertical-align: middle !important;
}

.schedule-cell__content {
  display: grid;
  gap: 4px;
  justify-items: center;

  span {
    color: #64748b;
    font-size: 0.72rem;
    font-weight: 800;
  }

  strong {
    color: #172033;
    font-size: 0.78rem;
    font-weight: 900;
  }
}

.moodle-cell {
  text-align: center;
  vertical-align: middle !important;

  .moodle-link-btn {
    min-height: 30px;
    min-width: 0;
    width: 100%;
    max-width: 128px;
    margin-top: 10px;
    padding: 0 8px !important;
    border: 0 !important;
    border-radius: 999px !important;
    font-size: 0.68rem;
    font-weight: 900 !important;
    box-shadow: 0 7px 16px rgba(22, 163, 74, 0.16) !important;
  }
}

.moodle-status {
  display: grid;
  justify-items: center;
  gap: 7px;
}

.moodle-status :deep(.q-badge) {
  min-height: 24px;
  padding: 4px 9px;
  font-size: 0.7rem;
  font-weight: 900;
}

.moodle-status__meta {
  display: grid;
  gap: 2px;
  color: #334155;
  font-size: 0.74rem;
  font-weight: 700;
  line-height: 1.35;
}

.actions-cell {
  text-align: center;
  white-space: nowrap;
  vertical-align: middle !important;
}

.actions-cell__group {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
}

.table-action-btn {
  width: 32px;
  height: 32px;
  min-height: 32px;
  margin: 0;
  background: #ffffff !important;
  border: 1px solid #dce4ee !important;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06) !important;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12) !important;
  }
}

.table-action-btn--list,
.table-action-btn--edit {
  color: #f59e0b !important;
}

.table-action-btn--delete {
  color: #dc2626 !important;
}

.empty-table-cell {
  padding: 34px 16px !important;
  color: #94a3b8;
  font-weight: 700;
  text-align: center;
}

.course-table-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 18px;
  border-top: 1px solid #dce4ee;
  background: #ffffff;
  color: #475569;
  font-size: 0.86rem;
  font-weight: 800;
}

.workspace-layout {
  display: grid;
  grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
  gap: 22px;
  align-items: start;
}

.course-sidebar,
.course-workspace {
  border-radius: 16px;
}

.course-sidebar {
  position: sticky;
  top: 88px;
  padding: 18px;
}

.toolbar-row,
.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  h2,
  h3 {
    margin: 0;
    color: #10223c;
    font-weight: 800;
  }

  h2 {
    font-size: 1.12rem;
  }

  h3 {
    font-size: 1.15rem;
  }

  p,
  span {
    margin: 4px 0 0;
    color: #64748b;
    font-size: 0.86rem;
    line-height: 1.45;
  }
}

.course-search {
  margin-top: 16px;
}

.course-list {
  display: grid;
  gap: 10px;
  max-height: 690px;
  margin-top: 14px;
  padding-right: 2px;
  overflow-y: auto;
}

.course-list-item {
  display: grid;
  grid-template-columns: 74px minmax(0, 1fr);
  gap: 12px;
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 12px;
  background: #fff;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;

  img {
    width: 74px;
    height: 74px;
    border-radius: 10px;
    object-fit: cover;
  }

  &:hover,
  &--active {
    border-color: rgba($primary, 0.62);
    background: #fffaf0;
    transform: translateY(-1px);
  }
}

.course-list-item__content {
  min-width: 0;
}

.course-list-item__code {
  color: $primary;
  font-size: 0.74rem;
  font-weight: 800;
}

.course-list-item__title {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 3px;
  color: #1f2937;
  font-size: 0.88rem;
  font-weight: 800;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  line-clamp: 2;
}

.course-list-item__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;

  span {
    color: #475569;
  }
}

.learner-count-link {
  border: 0;
  padding: 0;
  background: transparent;
  color: $primary !important;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
}

.learner-count-link:hover {
  text-decoration: underline;
}

.course-workspace {
  min-width: 0;
  overflow: hidden;
}

.empty-course-state {
  display: grid;
  place-items: center;
  gap: 10px;
  min-height: 420px;
  padding: 32px;
  text-align: center;

  h2 {
    margin: 0;
    color: #10223c;
    font-size: 1.35rem;
    font-weight: 800;
  }

  p {
    margin: 0 0 8px;
    color: #64748b;
  }
}

.course-summary {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) auto;
  gap: 20px;
  align-items: center;
  padding: 20px;
}

.course-summary__media {
  height: 138px;
  border-radius: 14px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.course-summary__content {
  min-width: 0;

  h2 {
    display: -webkit-box;
    overflow: hidden;
    margin: 0;
    color: #10223c;
    font-size: 1.35rem;
    font-weight: 800;
    line-height: 1.32;
    -webkit-box-orient: vertical;
    line-clamp: 2;
  }
}

.course-summary__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-top: 12px;
  color: #64748b;
  font-size: 0.86rem;
  font-weight: 700;

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

.course-summary__learner-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  padding: 0;
  background: transparent;
  color: $primary;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
}

.course-summary__learner-link:hover {
  text-decoration: underline;
}

.course-summary__actions {
  display: grid;
  gap: 10px;
  min-width: 184px;
}

.workspace-tabs {
  padding: 0 18px;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  background: #fbfcfd;
}

.workspace-panels {
  background: transparent;
}

.workspace-panels :deep(.q-tab-panel) {
  padding: 20px;
}

.overview-grid,
.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.panel-block {
  min-width: 0;
  padding: 18px;
  border-radius: 14px;
}

.checklist-list,
.settings-list {
  margin-top: 12px;
}

.checklist-item {
  padding-inline: 0;
}

.task-list,
.module-list,
.announcement-list {
  display: grid;
  gap: 12px;
}

.task-row,
.lesson-row,
.announcement-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 12px;
  border-radius: 12px;
  background: #f8f6f1;
  border: 1px solid rgba(17, 24, 39, 0.06);
}

.task-row {
  div {
    display: grid;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  strong {
    color: #1f2937;
    font-size: 0.92rem;
  }

  span {
    color: #64748b;
    font-size: 0.82rem;
  }
}

.module-row {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
}

.module-row__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fbfcfd;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);

  h4 {
    margin: 0;
    color: #10223c;
    font-size: 1rem;
    font-weight: 800;
  }

  span {
    color: #64748b;
    font-size: 0.82rem;
    font-weight: 700;
  }
}

.lesson-list {
  display: grid;
  padding: 10px;
}

.lesson-row {
  background: #fff;

  span {
    min-width: 0;
    color: #334155;
    font-size: 0.9rem;
    font-weight: 700;
  }
}

.moodle-activity-link {
  min-width: 0;
  color: #334155;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    color: var(--q-primary);
  }
}

.management-table {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 14px;
  overflow: hidden;

  :deep(tbody tr) {
    cursor: pointer;
  }
}

.learner-course-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.learner-course-card {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 116px;
  padding: 12px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: rgba(25, 118, 210, 0.38);
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
    transform: translateY(-1px);
  }

  img {
    width: 120px;
    height: 84px;
    border-radius: 10px;
    object-fit: cover;
  }
}

.learner-course-card__content {
  min-width: 0;
}

.learner-course-card__code {
  color: $primary;
  font-size: 0.76rem;
  font-weight: 900;
}

.learner-course-card h4 {
  display: -webkit-box;
  overflow: hidden;
  margin: 4px 0 10px;
  color: #10223c;
  font-size: 0.98rem;
  font-weight: 900;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  line-clamp: 2;
}

.learner-course-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 800;

  span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
}

.learner-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 220px;

  div {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  strong {
    color: #10223c;
    font-size: 0.9rem;
    font-weight: 800;
  }

  span {
    color: #64748b;
    font-size: 0.78rem;
    font-weight: 700;
  }
}

.progress-cell {
  display: grid;
  grid-template-columns: minmax(96px, 1fr) 44px;
  gap: 10px;
  align-items: center;
  min-width: 170px;

  span {
    color: #475569;
    font-size: 0.82rem;
    font-weight: 800;
  }
}

.learner-detail-dialog {
  width: min(720px, calc(100vw - 32px));
  border-radius: 14px;
}

.learner-detail-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.learner-detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.learner-detail-stat {
  display: grid;
  gap: 8px;
  min-height: 104px;
  padding: 14px;
  border-radius: 12px;
  background: #f8f6f1;

  span {
    color: #64748b;
    font-size: 0.78rem;
    font-weight: 800;
  }

  strong {
    color: #10223c;
    font-size: 1.18rem;
    font-weight: 900;
  }
}

.learner-detail-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 18px;

  div {
    display: grid;
    gap: 4px;
  }

  span {
    color: #64748b;
    font-size: 0.78rem;
    font-weight: 800;
  }

  strong {
    color: #1f2937;
    font-size: 0.9rem;
    font-weight: 800;
  }
}

.assignment-grid,
.report-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.assignment-card,
.report-card {
  border-radius: 14px;
  padding: 18px;
}

.assignment-card__top,
.assignment-card__stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.assignment-card {
  h4 {
    margin: 16px 0 6px;
    color: #10223c;
    font-size: 1rem;
    font-weight: 800;
  }

  p {
    min-height: 44px;
    margin: 0;
    color: #64748b;
    font-size: 0.86rem;
    line-height: 1.45;
  }
}

.assignment-card__stats {
  margin: 16px 0;
  color: #475569;
  font-size: 0.84rem;
  font-weight: 800;
}

.announcement-row {
  align-items: flex-start;
  background: #fff;

  div {
    min-width: 0;
    flex: 1;
  }

  strong {
    color: #10223c;
    font-size: 0.98rem;
    font-weight: 800;
  }

  p {
    margin: 5px 0 6px;
    color: #475569;
    font-size: 0.9rem;
    line-height: 1.45;
  }

  span {
    color: #94a3b8;
    font-size: 0.78rem;
    font-weight: 700;
  }
}

.seat-input {
  width: 112px;
}

.cover-editor,
.pricing-list,
.staff-list {
  display: grid;
  gap: 12px;
}

.cover-editor {
  img {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 12px;
    object-fit: cover;
    border: 1px solid rgba(17, 24, 39, 0.08);
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.course-settings-form {
  gap: 16px;
}

.course-settings-field {
  min-width: 0;
  padding-bottom: 0;

  :deep(.q-field__control) {
    min-height: 58px;
    border-radius: 10px;
    background: #f8fafc;
    color: #10223c;
    box-shadow: inset 0 0 0 1px rgba(16, 34, 60, 0.12);
    transition:
      box-shadow 0.2s ease,
      background 0.2s ease,
      transform 0.2s ease;
  }

  :deep(.q-field__control::before) {
    border: 0;
  }

  :deep(.q-field__control::after) {
    border: 0;
  }

  :deep(.q-field__bottom) {
    display: none;
  }

  :deep(.q-field__native),
  :deep(.q-field__input),
  :deep(.q-field__label) {
    color: #10223c;
    font-weight: 800;
  }

  :deep(.q-field__label) {
    color: #64748b;
    font-size: 0.76rem;
    font-weight: 800;
  }

  :deep(.q-field__marginal) {
    color: #475569;
  }

  :deep(.q-field__append .q-icon) {
    font-size: 21px;
    transition:
      color 0.2s ease,
      transform 0.2s ease;
  }

  &:hover :deep(.q-field__control) {
    background: #fff;
    box-shadow:
      inset 0 0 0 1px rgba(245, 166, 35, 0.6),
      0 10px 24px rgba(15, 23, 42, 0.06);
    transform: translateY(-1px);
  }

  &.q-field--focused :deep(.q-field__control) {
    background: #fff;
    box-shadow:
      inset 0 0 0 2px $primary,
      0 0 0 4px rgba(245, 166, 35, 0.12),
      0 12px 26px rgba(15, 23, 42, 0.08);
  }

  &.q-field--focused :deep(.q-field__append .q-icon) {
    color: $primary;
    transform: rotate(180deg);
  }

  :deep(input[type='date']) {
    color-scheme: light;
  }

  :deep(input[type='date']::-webkit-calendar-picker-indicator) {
    width: 18px;
    height: 18px;
    cursor: pointer;
    opacity: 0.72;
    filter: invert(18%) sepia(22%) saturate(1212%) hue-rotate(181deg) brightness(90%) contrast(93%);
    transition:
      opacity 0.2s ease,
      transform 0.2s ease,
      filter 0.2s ease;
  }

  &:hover :deep(input[type='date']::-webkit-calendar-picker-indicator) {
    opacity: 1;
    filter: invert(66%) sepia(95%) saturate(586%) hue-rotate(348deg) brightness(99%) contrast(94%);
    transform: scale(1.05);
  }
}

:global(.course-settings-select-menu) {
  overflow: hidden;
  margin-top: 8px;
  border: 1px solid rgba(16, 34, 60, 0.1);
  border-radius: 10px;
  background: #fff;
  box-shadow:
    0 18px 42px rgba(15, 23, 42, 0.14),
    0 2px 8px rgba(15, 23, 42, 0.06);
}

:global(.course-settings-select-menu .q-item) {
  min-height: 44px;
  padding: 10px 14px;
  color: #10223c;
  font-size: 0.9rem;
  font-weight: 800;
  transition:
    background 0.18s ease,
    color 0.18s ease;
}

:global(.course-settings-select-menu .q-item:hover),
:global(.course-settings-select-menu .q-item.q-manual-focusable--focused) {
  background: rgba(245, 166, 35, 0.1);
  color: #10223c;
}

:global(.course-settings-select-menu .q-item.q-item--active) {
  background: linear-gradient(90deg, rgba(245, 166, 35, 0.18), rgba(245, 166, 35, 0.06));
  color: #1a237e;
}

:global(.course-settings-select-menu .q-item.q-item--active .q-item__label) {
  font-weight: 900;
}

.form-grid__wide {
  grid-column: 1 / -1;
}

.pricing-row,
.staff-row {
  display: grid;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 12px;
  background: #f8f6f1;
}

.pricing-row {
  grid-template-columns: minmax(0, 1fr) auto 140px;
}

.staff-row {
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.pricing-row strong,
.staff-row strong {
  display: block;
  color: #10223c;
  font-size: 0.9rem;
}

.pricing-row span,
.staff-row span {
  display: block;
  margin-top: 2px;
  color: #64748b;
  font-size: 0.8rem;
}

.price-input {
  width: 140px;
}

.staff-dialog {
  width: min(560px, calc(100vw - 32px));
  border-radius: 18px;
}

.staff-dialog__form {
  display: grid;
  gap: 14px;
}

.create-course-dialog {
  width: min(720px, calc(100vw - 32px));
  border-radius: 12px;
}

.quality-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.quality-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 58px;
  padding: 12px;
  border-radius: 12px;
  background: #f8f6f1;
  color: #334155;
  font-size: 0.88rem;
  font-weight: 800;
}

.report-card {
  display: grid;
  gap: 12px;

  span {
    color: #64748b;
    font-size: 0.84rem;
    font-weight: 800;
  }

  strong {
    color: #10223c;
    font-size: 1.7rem;
    font-weight: 800;
  }
}

@media (max-width: 1180px) {
  .assignment-grid,
  .learner-course-grid,
  .report-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .instructor-hero__content {
    align-items: flex-start;
    flex-direction: column;
  }

  .instructor-hero__stats {
    width: 100%;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .workspace-layout,
  .course-table-layout,
  .course-summary {
    grid-template-columns: 1fr;
  }

  .course-table-layout {
    width: 100%;
    margin-left: 0;
  }

  .course-sidebar {
    position: static;
  }

  .course-summary__actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .learner-detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .instructor-dashboard__inner {
    padding-block: 20px 32px;
  }

  .instructor-hero {
    h1 {
      font-size: 1.65rem;
    }
  }

  .instructor-hero__content {
    min-height: auto;
    padding: 30px 16px;
  }

  .instructor-hero__identity {
    align-items: flex-start;
    flex-direction: column;
  }

  .instructor-hero__avatar {
    width: 82px !important;
    height: 82px !important;
    font-size: 82px !important;
  }

  .instructor-hero__stats {
    grid-template-columns: 1fr;
  }

  .course-summary__actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .overview-grid,
  .settings-grid,
  .form-grid,
  .assignment-grid,
  .learner-course-grid,
  .report-grid,
  .learner-detail-grid,
  .learner-detail-info,
  .quality-grid {
    grid-template-columns: 1fr;
  }

  .course-summary__media {
    height: 190px;
  }

  .pricing-row {
    grid-template-columns: 1fr;
  }

  .learner-course-card {
    grid-template-columns: 92px minmax(0, 1fr) auto;

    img {
      width: 92px;
      height: 72px;
    }
  }
}

.empty-tab-state {
  padding: 48px 24px;
  background: #fafbfc;
  border-radius: 14px;
  border: 2px dashed #e0e4e8;
}
</style>
