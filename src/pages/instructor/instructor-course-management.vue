<template>
  <q-page class="instructor-dashboard">
    <div class="section-container instructor-dashboard__inner">
      <section class="instructor-hero">
        <div>
          <div class="instructor-hero__eyebrow">Instructor Workspace</div>
          <h1>จัดการรายวิชา</h1>
          <p>
            สวัสดี {{ instructorName }} ดูภาพรวมรายวิชา ปรับเนื้อหา ติดตามผู้เรียน ตรวจงาน ออกประกาศ
            และจัดการการเผยแพร่ได้จากหน้านี้
          </p>
        </div>

        <div class="instructor-hero__actions">
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="สร้างรายวิชา"
            no-caps
            @click="openCreateCourseDialog"
          />
          <q-btn
            outline
            color="primary"
            icon="analytics"
            label="รายงานรวม"
            no-caps
            @click="activeWorkspaceTab = 'reports'"
          />
        </div>
      </section>

      <section class="metrics-grid">
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
      </section>

      <section class="workspace-layout">
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
                  <q-icon name="groups" /> {{ selectedCourse.enrolledCount.toLocaleString() }} /
                  {{ selectedCourse.maxSeats.toLocaleString() }} ผู้เรียน
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
                    <q-input
                      v-model="courseSettings.registrationStartDate"
                      dense
                      outlined
                      type="date"
                      label="วันเปิดรับสมัคร"
                      class="course-settings-field"
                    />
                    <q-input
                      v-model="courseSettings.registrationEndDate"
                      dense
                      outlined
                      type="date"
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
                      @click="addFacultyStaff"
                    />
                  </div>
                  <div class="staff-list q-mt-md">
                    <div v-for="staff in facultyStaff" :key="staff.email" class="staff-row">
                      <q-avatar color="primary" text-color="white" icon="badge" />
                      <div>
                        <strong>{{ staff.name }}</strong>
                        <span>{{ staff.email }} · {{ staff.permission }}</span>
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
                  <h3>โครงสร้างบทเรียน</h3>
                  <p>จัดลำดับบทเรียน เพิ่มสื่อ วิดีโอ เอกสาร แบบทดสอบ และกำหนดการเผยแพร่</p>
                </div>
                <q-btn
                  unelevated
                  color="primary"
                  icon="add"
                  label="เพิ่มบทเรียน"
                  no-caps
                  @click="openQuickDialog('เพิ่มบทเรียน')"
                />
              </div>

              <div class="module-list">
                <div
                  v-for="(module, index) in selectedStructure"
                  :key="`${module.title}-${index}`"
                  class="module-row"
                >
                  <div class="module-row__header">
                    <q-avatar
                      rounded
                      :color="module.color || 'primary'"
                      text-color="white"
                      :icon="module.icon || 'folder'"
                    />
                    <div>
                      <h4>{{ module.title }}</h4>
                      <span>{{ module.lessons.length }} รายการ</span>
                    </div>
                    <q-space />
                    <q-btn flat round dense icon="drag_indicator" color="grey-6">
                      <q-tooltip>ลากเพื่อจัดลำดับ</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      icon="edit"
                      color="primary"
                      @click="openQuickDialog(`แก้ไข ${module.title}`)"
                    />
                  </div>
                  <div class="lesson-list">
                    <div v-for="lesson in module.lessons" :key="lesson.title" class="lesson-row">
                      <q-icon
                        :name="lessonIcon(lesson.type)"
                        :color="lessonColor(lesson.type)"
                        size="20px"
                      />
                      <span>{{ lesson.title }}</span>
                      <q-space />
                      <q-badge outline color="grey-7" :label="lesson.duration" />
                      <q-btn
                        flat
                        round
                        dense
                        icon="more_vert"
                        color="grey-6"
                        @click="openQuickDialog(`จัดการ ${lesson.title}`)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Moodle Activities -->
              <div class="q-mt-lg">
                <div class="panel-heading q-mb-md">
                  <div>
                    <h4>กิจกรรม Moodle</h4>
                    <p>กิจกรรมที่เชื่อมต่อกับระบบ Moodle</p>
                  </div>
                </div>

                <div v-if="isMoodleLoading" class="flex flex-center q-py-lg">
                  <q-spinner color="primary" size="40px" />
                </div>

                <template v-else-if="moodleContents.length > 0">
                  <div class="lesson-list">
                    <div v-for="mod in moodleContents" :key="mod.name" class="lesson-row">
                      <q-icon
                        :name="mod.modname === 'quiz' ? 'quiz' : 'assignment'"
                        :color="mod.modname === 'quiz' ? 'orange-7' : 'teal-7'"
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
                        :color="mod.modname === 'quiz' ? 'orange-7' : 'teal-7'"
                        :label="mod.modname === 'quiz' ? 'แบบทดสอบ' : 'งาน'"
                      />
                    </div>
                  </div>
                </template>

                <div v-else class="text-grey-6 text-center q-py-md">ไม่มีกิจกรรม</div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="learners">
              <div class="panel-heading q-mb-md">
                <div>
                  <h3>ผู้เรียนและความก้าวหน้า</h3>
                  <p>
                    ลงทะเบียนแล้ว {{ selectedCourse?.enrolledCount.toLocaleString() ?? 0 }} คน จาก
                    {{ selectedCourse?.maxSeats.toLocaleString() ?? 0 }} ที่นั่ง
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
                <div
                  v-for="assignment in assignments"
                  :key="assignment.title"
                  class="assignment-card"
                >
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
          <p>สร้างรายวิชาใหม่เพื่อเริ่มจัดการข้อมูลรายวิชา</p>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="สร้างรายวิชา"
            no-caps
            @click="openCreateCourseDialog"
          />
        </main>
      </section>
    </div>

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
              {{ selectedLearner.studentId }} · {{ selectedLearner.email }}
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
            <span>บทเรียนที่จบ</span>
            <strong
              >{{ selectedLearner.completedLessons }}/{{ selectedLearner.totalLessons }}</strong
            >
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
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseStore } from 'src/stores/course-store';
import { getCourseStructure, type Lesson } from 'src/data/course-structure';
import type { Course, DeliveryMode } from 'src/types/course';
import BaseSystemDialog from 'components/base/BaseSystemDialog.vue';

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

interface CourseSettingsForm {
  published: boolean;
  registrationOpen: boolean;
  maxSeats: number;
  coverImageUrl: string;
  termName: string;
  deliveryMode: DeliveryMode;
  registrationStartDate: string;
  registrationEndDate: string;
}

interface MoodleModule {
  modname: string;
  name: string;
  url?: string;
}

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const courseStore = useCourseStore();

// Initialize store
courseStore.init();

const courseSearch = ref('');
const activeWorkspaceTab = ref<WorkspaceTab>('overview');
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
const facultyStaff = ref<FacultyStaffMember[]>([
  {
    name: 'เจ้าหน้าที่คณะตัวอย่าง',
    email: 'faculty.staff@buu.ac.th',
    permission: 'แก้ไขข้อมูลและตรวจสอบรายชื่อ',
  },
]);
const instructorName = computed(() => authStore.user?.firstNameTh || 'อาจารย์');
const selectedCourse = computed<Course | undefined>(() =>
  instructorCourses.value.find((course) => course.id === selectedCourseId.value),
);
const selectedStructure = computed(() => getCourseStructure(selectedCourseId.value));

const moodleContents = ref<MoodleModule[]>([]);
const isMoodleLoading = ref(false);

async function fetchMoodleContents(shortname: string): Promise<void> {
  isMoodleLoading.value = true;
  moodleContents.value = [];
  try {
    const url = `http://localhost:3000/api/moodle/activities?shortname=${encodeURIComponent(shortname)}`;
    const res = await fetch(url);
    if (res.ok) {
      moodleContents.value = (await res.json()) as MoodleModule[];
    }
  } catch {
    // silent fail — Moodle unavailable
  } finally {
    isMoodleLoading.value = false;
  }
}

const filteredCourses = computed(() => {
  const keyword = courseSearch.value.trim().toLowerCase();
  if (!keyword) return instructorCourses.value;
  return instructorCourses.value.filter((course) =>
    [course.code, course.title, course.titleEn, course.faculty, course.category]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword)),
  );
});

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

const KNOWN_COURSE_IDS = new Set(['1', '2', '3', '4', '8', '10', '12']);

const learnerNamePool = [
  'ณัฐพงศ์ ไม้อยู่',
  'สมชาย รักดี',
  'มานี มีใจ',
  'วิชัย ใจตรง',
  'ฟ้า สดใส',
  'กิตติคุณ มั่งมี',
  'นลินี มีสุข',
  'วรวุฒิ ใจดี',
  'อลิสา สดใส',
  'ธนกร ร่ำรวย',
  'ปาณิสรา แสงดาว',
  'ชยพล ตั้งใจ',
  'สุภาวดี เรียนดี',
  'ภานุวัฒน์ กล้าคิด',
  'ณิชา พัฒนา',
  'พีรพล ศึกษา',
];

const facultyPool = [
  { faculty: 'คณะวิทยาการสารสนเทศ', department: 'สาขาวิทยาการคอมพิวเตอร์' },
  { faculty: 'คณะวิทยาศาสตร์', department: 'ภาควิชาเคมี' },
  { faculty: 'คณะวิศวกรรมศาสตร์', department: 'สาขาวิศวกรรมคอมพิวเตอร์' },
  { faculty: 'คณะมนุษยศาสตร์และสังคมศาสตร์', department: 'สาขานิเทศศาสตร์' },
];
const defaultLearnerUnit = facultyPool[0] ?? {
  faculty: 'มหาวิทยาลัยบูรพา',
  department: 'Lifelong Learning',
};

function getLearnerStatus(progress: number): Pick<LearnerRow, 'status' | 'statusColor'> {
  if (progress >= 85) return { status: 'เรียนต่อเนื่อง', statusColor: 'positive' };
  if (progress >= 60) return { status: 'ปกติ', statusColor: 'primary' };
  if (progress >= 35) return { status: 'ควรติดตาม', statusColor: 'warning' };
  return { status: 'เสี่ยงหลุด', statusColor: 'negative' };
}

function buildLearnersForCourse(course: Course | undefined): LearnerRow[] {
  if (!course || course.enrolledCount <= 0) {
    return [];
  }

  const totalLessons =
    getCourseStructure(course.id).reduce((sum, module) => sum + module.lessons.length, 0) || 8;

  return Array.from({ length: course.enrolledCount }, (_, index) => {
    const name = learnerNamePool[index % learnerNamePool.length] ?? `ผู้เรียน ${index + 1}`;
    const unit = facultyPool[index % facultyPool.length] ?? defaultLearnerUnit;
    const progress = (course.id.charCodeAt(0) * 9 + index * 17) % 101;
    const completedLessons = Math.min(totalLessons, Math.round((progress / 100) * totalLessons));
    const status = getLearnerStatus(progress);
    const studentNumber = `C69${String(index + 1355).padStart(5, '0')}`;
    const emailPrefix =
      index === 0 && course.id === '4'
        ? 'student'
        : `student${course.id}${String(index + 1).padStart(3, '0')}`;

    return {
      id: `${course.id}-${studentNumber}`,
      studentId: index === 0 && course.id === '4' ? 'C6901355' : studentNumber,
      name,
      email: `${emailPrefix}@go.buu.ac.th`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(`${course.id}-${name}-${index}`)}`,
      faculty: unit.faculty,
      department: unit.department,
      phone: `08${String((course.id.charCodeAt(0) + index * 37) % 100000000).padStart(8, '0')}`,
      progress,
      lastActive:
        index % 5 === 0 ? 'วันนี้ 10:24' : index % 5 === 1 ? 'เมื่อวาน' : `${index + 1} วันที่แล้ว`,
      score: progress < 30 ? 'ยังไม่ประเมิน' : `${Math.min(100, Math.max(55, progress + 6))}/100`,
      ...status,
      enrolledAt: `2569-04-${String((index % 20) + 1).padStart(2, '0')}`,
      paymentStatus: course.isFree ? 'ไม่มีค่าใช้จ่าย' : index % 4 === 0 ? 'รอตรวจสอบ' : 'ชำระแล้ว',
      completedLessons,
      totalLessons,
    };
  });
}

const MOCK_ASSIGNMENTS = [
  {
    title: 'Pre-test',
    detail: 'แบบทดสอบก่อนเรียน 15 คะแนน',
    submitted: 42,
    pending: 0,
    status: 'เปิดอยู่',
    statusColor: 'positive',
    icon: 'quiz',
    color: 'primary',
  },
  {
    title: 'ใบงานวิเคราะห์กรณีศึกษา',
    detail: 'ส่งไฟล์ PDF พร้อมคำอธิบาย',
    submitted: 31,
    pending: 9,
    status: 'รอตรวจ',
    statusColor: 'warning',
    icon: 'assignment',
    color: 'orange',
  },
  {
    title: 'Final Project',
    detail: 'ชิ้นงานปลายรายวิชา 40 คะแนน',
    submitted: 18,
    pending: 18,
    status: 'กำลังรับงาน',
    statusColor: 'primary',
    icon: 'workspace_premium',
    color: 'purple',
  },
];

const MOCK_ANNOUNCEMENTS = [
  {
    title: 'กำหนดส่งงานครั้งที่ 1',
    body: 'ขอให้ผู้เรียนส่งใบงานก่อนวันศุกร์ เวลา 23:59 น.',
    date: 'ประกาศเมื่อ 30 เม.ย. 2569',
    pinned: true,
  },
  {
    title: 'เปิดห้องถามตอบประจำสัปดาห์',
    body: 'ผู้เรียนสามารถฝากคำถามไว้ในกระดานสนทนาได้ตลอดสัปดาห์',
    date: 'ประกาศเมื่อ 28 เม.ย. 2569',
    pinned: false,
  },
  {
    title: 'อัปเดตเอกสารประกอบบทเรียน',
    body: 'เพิ่มไฟล์สรุปบทเรียนและ checklist สำหรับทบทวนก่อนสอบ',
    date: 'ประกาศเมื่อ 26 เม.ย. 2569',
    pinned: false,
  },
];

const MOCK_REPORTS = [
  { label: 'อัตราเรียนจบ', value: '74%', progress: 0.74, color: 'positive' },
  { label: 'คะแนนเฉลี่ย', value: '82/100', progress: 0.82, color: 'primary' },
  { label: 'การมีส่วนร่วม', value: '68%', progress: 0.68, color: 'warning' },
  { label: 'ความพึงพอใจ', value: '4.7/5', progress: 0.94, color: 'purple' },
];

const isKnownCourse = computed(() => KNOWN_COURSE_IDS.has(selectedCourseId.value));

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

const assignments = computed(() => (isKnownCourse.value ? MOCK_ASSIGNMENTS : []));

const announcements = computed(() => (isKnownCourse.value ? MOCK_ANNOUNCEMENTS : []));

const reports = computed(() =>
  isKnownCourse.value
    ? MOCK_REPORTS
    : [
        { label: 'อัตราเรียนจบ', value: '0%', progress: 0, color: 'positive' },
        { label: 'คะแนนเฉลี่ย', value: '0/100', progress: 0, color: 'primary' },
        { label: 'การมีส่วนร่วม', value: '0%', progress: 0, color: 'warning' },
        { label: 'ความพึงพอใจ', value: '-/5', progress: 0, color: 'purple' },
      ],
);

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
  { label: 'กำหนดจำนวนที่นั่งแล้ว', done: courseSettings.maxSeats > 0 },
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
    courseSettings.registrationStartDate = course.registrationStartDate;
    courseSettings.registrationEndDate = course.registrationEndDate;
    if (learnerPricing[0])
      learnerPricing[0].amount = course.isFree ? 0 : Math.max(0, Math.round(course.price * 0.5));
    if (learnerPricing[1])
      learnerPricing[1].amount = course.isFree ? 0 : Math.max(0, Math.round(course.price * 0.75));
    if (learnerPricing[2]) learnerPricing[2].amount = course.price;
    activeWorkspaceTab.value = 'overview';
    void fetchMoodleContents(course.code);
  },
  { immediate: true },
);

function openCreateCourseDialog(): void {
  void router.push('/instructor/create-course');
}

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

function addFacultyStaff(): void {
  const nextIndex = facultyStaff.value.length + 1;
  facultyStaff.value = [
    ...facultyStaff.value,
    {
      name: `เจ้าหน้าที่คณะ ${nextIndex}`,
      email: `faculty.staff${nextIndex}@buu.ac.th`,
      permission: 'แก้ไขข้อมูลรายวิชา',
    },
  ];
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

function lessonIcon(type: Lesson['type']): string {
  if (type === 'video') return 'play_circle';
  if (type === 'quiz') return 'quiz';
  return 'article';
}

function lessonColor(type: Lesson['type']): string {
  if (type === 'video') return 'primary';
  if (type === 'quiz') return 'warning';
  return 'blue-grey-6';
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(value);
}

function previewCourse(): void {
  if (!selectedCourse.value) return;
  void router.push(`/course/${selectedCourse.value.id}`);
}

function formatCourseDateLabel(dateText: string, fallback: string): string {
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
  padding-block: 32px 48px;
}

.instructor-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
  padding: 28px 30px;
  border-radius: 18px;
  background:
    radial-gradient(circle at 92% 10%, rgba(245, 166, 35, 0.18), transparent 30%),
    linear-gradient(135deg, #1e3a5f 0%, #23384a 58%, #315f4a 100%);
  color: #fff;
  box-shadow: 0 18px 42px rgba(30, 58, 95, 0.16);

  h1 {
    margin: 6px 0 8px;
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.2;
  }

  p {
    max-width: 720px;
    margin: 0;
    color: rgba(255, 255, 255, 0.76);
    font-size: 1rem;
    line-height: 1.6;
  }
}

.instructor-hero__eyebrow {
  color: #f8c94a;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.instructor-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.metric-tile,
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
  gap: 14px;
  min-height: 94px;
  padding: 18px;
  border-radius: 14px;
}

.metric-tile__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
}

.metric-tile__value {
  color: #10223c;
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.1;
}

.metric-tile__label {
  margin-top: 4px;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 700;
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
  .metrics-grid,
  .assignment-grid,
  .learner-course-grid,
  .report-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .workspace-layout,
  .course-summary {
    grid-template-columns: 1fr;
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
    align-items: stretch;
    flex-direction: column;
    padding: 22px;

    h1 {
      font-size: 1.65rem;
    }
  }

  .instructor-hero__actions,
  .course-summary__actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .metrics-grid,
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
