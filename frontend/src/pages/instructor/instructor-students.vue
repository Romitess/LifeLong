<template>
  <q-page class="instructor-students-page">
    <div class="section-container instructor-students">
      <InstructorPageHero
        eyebrow="Instructor Workspace"
        :title="studentHeroTitle"
        :description="studentHeroDescription"
      >
        <template #actions>
          <div
            :class="[
              activeStudentTab === 'results' ? 'certificate-hero-actions' : 'student-hero-actions',
            ]"
          >
            <div
              :class="[
                activeStudentTab === 'results'
                  ? 'certificate-hero-summary'
                  : 'student-roster-hero-summary',
              ]"
            >
              <div
                v-for="card in studentHeroSummaryCards"
                :key="card.label"
                :class="[
                  activeStudentTab === 'results'
                    ? 'certificate-summary-card'
                    : 'student-roster-summary-card',
                  activeStudentTab === 'results' ? '' : 'student-roster-summary-card--hero',
                ]"
                :style="{ '--summary-accent': card.color, '--summary-soft': card.softColor }"
              >
                <div
                  :class="
                    activeStudentTab === 'results'
                      ? 'certificate-summary-card__icon'
                      : 'student-roster-summary-card__icon'
                  "
                >
                  <q-icon :name="card.icon" />
                </div>
                <div>
                  <strong>{{ card.value }}</strong>
                  <span>{{ card.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </InstructorPageHero>

      <nav v-if="selectedCourse" class="student-breadcrumb-nav" aria-label="breadcrumb">
        <a
          :href="
            resolveFullUrl(`/instructor/${activeStudentTab === 'results' ? 'results' : 'students'}`)
          "
          class="student-breadcrumb-nav__item"
          @click="onClearSelectedCourseClick"
        >
          <q-icon name="menu_book" size="20px" />
          <span>{{ t('instructor.students.myCourses') }}</span>
        </a>

        <q-icon name="chevron_right" size="18px" class="student-breadcrumb-nav__separator" />

        <span class="student-breadcrumb-nav__item student-breadcrumb-nav__item--current">
          {{ selectedCourse.titleEn || selectedCourse.title }}
        </span>
      </nav>

      <section v-if="!selectedCourse" class="student-course-list-panel">
        <div class="student-course-list-panel__header">
          <div>
            <h2>
              {{
                activeStudentTab === 'results'
                  ? t('instructor.students.selectForGrades')
                  : t('instructor.students.selectForRoster')
              }}
            </h2>
            <span
              >{{ filteredInstructorCourses.length.toLocaleString() }}
              {{ t('instructor.students.coursesUnit') }}</span
            >
          </div>
          <BaseSearchInput
            v-model="courseSearch"
            :placeholder="t('instructor.students.searchPlaceholder')"
            class="student-course-list-search"
          />
        </div>

        <BaseTable
          :rows="paginatedInstructorCourses"
          :columns="studentCourseColumns"
          row-key="id"
          show-index
          :rows-per-page="courseListRowsPerPage"
          :index-offset="(courseListPage - 1) * courseListRowsPerPage"
          :page="courseListPage"
          :total-pages="courseListPageCount"
          min-width="1120px"
          :row-height="104"
          height-mode="stable"
          :empty-text="t('instructor.table.noCourseFound')"
          class="student-course-table"
          :on-page-change="setCourseListPage"
        >
          <template #cell-course="{ row: course }">
            <div class="student-course-table__title-layout">
              <img
                :src="course.imageUrl"
                :alt="course.titleEn || course.title"
                class="student-course-table__image"
              />
              <div class="student-course-table__copy">
                <button
                  type="button"
                  class="student-course-table__link"
                  @click="selectCourse(course.id)"
                >
                  {{ course.code }} : {{ course.title }}
                </button>
                <div v-if="course.titleEn" class="student-course-table__subtitle">
                  {{ course.titleEn }}
                </div>
              </div>
            </div>
          </template>
          <template #cell-fee="{ row: course }">
            {{ course.isFree ? t('instructor.students.noFee') : formatCurrency(course.price) }}
          </template>
          <template #cell-schedule="{ row: course }">
            <div class="student-course-table__schedule">
              <div>{{ t('instructor.students.enrollmentLabel') }}</div>
              <strong>{{ formatCourseDateRange(course) }}</strong>
            </div>
          </template>
          <template #cell-seats="{ row: course }">
            {{
              course.maxSeats?.toLocaleString() ??
              (activeStudentTab === 'results' ? '-' : t('instructor.students.unlimited'))
            }}
          </template>
          <template #cell-enrolled="{ row: course }">
            {{ course.enrolledCount.toLocaleString() }}
          </template>
          <template v-if="activeStudentTab === 'results'" #cell-passed="{ row: course }">
            <span class="text-positive">{{ getCoursePassedCount(course).toLocaleString() }}</span>
          </template>
          <template v-if="activeStudentTab === 'results'" #cell-failed="{ row: course }">
            <span class="text-negative">{{ getCourseFailedCount(course).toLocaleString() }}</span>
          </template>
          <template #cell-action="{ row: course }">
            <div class="student-course-table__actions">
              <AppActionButton
                v-if="activeStudentTab === 'roster'"
                variant="primary"
                color="primary"
                icon="fact_check"
                :label="t('instructor.students.checkRosterBtn')"
                no-caps
                class="student-course-table__action-btn"
                tag="a"
                :href="resolveFullUrl(`/instructor/students?courseId=${course.id}`)"
                @click="onSelectCourseClick(course.id, $event)"
              />
              <AppIconButton
                v-else
                icon="edit"
                tone="edit"
                tag="a"
                :href="resolveFullUrl(`/instructor/results?courseId=${course.id}`)"
                @click="onSelectCourseClick(course.id, $event)"
              />
            </div>
          </template>
          <template v-if="activeStudentTab === 'results'" #cell-download="{ row: course }">
            <div class="student-course-table__actions">
              <button
                type="button"
                class="student-course-table__download-link"
                @click.stop="printCbs003(course)"
              >
                {{ getLearningResultDownloadCode() }}
              </button>
            </div>
          </template>
        </BaseTable>
      </section>

      <section v-else class="student-roster-panel">
        <div v-if="activeStudentTab === 'results'" class="student-roster-panel__summary">
          <div>
            <span>{{ t('instructor.students.enrolledLabel') }}</span>
            <strong>{{ displayedEnrolledCount.toLocaleString() }}</strong>
          </div>
          <div>
            <span>{{ t('instructor.students.col.capacity') }}</span>
            <strong>{{
              selectedCourse.maxSeats?.toLocaleString() ?? t('instructor.students.unlimited')
            }}</strong>
          </div>
          <div>
            <span>{{ t('instructor.students.avgProgress') }}</span>
            <strong>{{ averageProgress }}%</strong>
          </div>
        </div>

        <template v-if="activeStudentTab === 'results'">
          <div class="learning-result-import-page">
            <div class="learning-result-course-info">
              <div>
                <span>{{ t('instructor.certificates.courseLabel') }}</span>
                <strong>{{ selectedCourse.code }} : {{ selectedCourse.title }}</strong>
              </div>
              <div>
                <span>{{ t('instructor.students.feeSummaryLabel') }}</span>
                <strong>{{
                  selectedCourse.isFree
                    ? t('instructor.students.noFee')
                    : formatCurrency(selectedCourse.price)
                }}</strong>
              </div>
              <div>
                <span>{{ t('instructor.certificates.capacityLabel') }}</span>
                <strong
                  >{{
                    selectedCourse.maxSeats?.toLocaleString() ?? t('instructor.students.unlimited')
                  }}
                  {{ t('instructor.certificates.persons') }}</strong
                >
              </div>
              <div>
                <span>{{ t('instructor.certificates.enrolledLabel') }}</span>
                <strong
                  >{{ selectedCourse.enrolledCount.toLocaleString() }}
                  {{ t('instructor.certificates.persons') }}</strong
                >
              </div>
              <p>
                <span class="text-positive">{{
                  t('instructor.students.passedCount', {
                    count: getCoursePassedCount(selectedCourse),
                  })
                }}</span>
                <span class="text-negative">{{
                  t('instructor.students.failedCount', {
                    count: getCourseFailedCount(selectedCourse),
                  })
                }}</span>
              </p>
            </div>

            <div v-if="!approvalStatus" class="learning-result-import-grid">
              <label class="learning-result-import-label" for="learning-result-import"
                >import</label
              >
              <div class="learning-result-import-workspace">
                <div class="learning-result-import-toolbar">
                  <div class="learning-result-import-toolbar__row">
                    <BaseButton
                      outline
                      color="primary"
                      icon="download"
                      :label="t('instructor.students.downloadTemplate')"
                      no-caps
                      class="learning-result-import-tool-btn"
                      @click="downloadGradeImportTemplate"
                    />
                    <BaseButton
                      outline
                      color="primary"
                      icon="upload_file"
                      :label="t('instructor.students.uploadCsv')"
                      no-caps
                      class="learning-result-import-tool-btn"
                      @click="triggerGradeImportFile"
                    />
                    <input
                      ref="gradeImportFileInput"
                      type="file"
                      accept=".csv,.txt,text/csv,text/plain"
                      class="hidden"
                      @change="onGradeImportFileSelected"
                    />
                  </div>
                  <div class="learning-result-import-toolbar__row">
                    <BaseButton
                      outline
                      color="primary"
                      icon="groups"
                      :label="t('instructor.students.fetchAll')"
                      no-caps
                      :disable="learners.length === 0"
                      class="learning-result-import-tool-btn"
                      @click="fillAllStudents"
                    />
                    <BaseButton
                      outline
                      color="primary"
                      icon="pending_actions"
                      :label="t('instructor.students.fetchPending')"
                      no-caps
                      :disable="learners.length === 0"
                      class="learning-result-import-tool-btn"
                      @click="fillStudentsWithoutGrade"
                    />
                    <BaseButton
                      flat
                      color="grey-7"
                      icon="close"
                      :label="t('instructor.students.clearBtn')"
                      no-caps
                      :disable="!resultImportText"
                      class="learning-result-import-tool-btn"
                      @click="resultImportText = ''"
                    />
                  </div>
                </div>

                <q-input
                  id="learning-result-import"
                  v-model="resultImportText"
                  type="textarea"
                  outlined
                  :placeholder="t('instructor.students.importPlaceholder')"
                  class="learning-result-import-input"
                />

                <BaseButton
                  outline
                  color="primary"
                  icon="preview"
                  :label="t('instructor.students.previewBtn')"
                  no-caps
                  :disable="!resultImportText.trim()"
                  class="learning-result-import-action-btn"
                  @click="buildDetailPreview"
                />
              </div>
              <div class="learning-result-import-help">
                <strong>{{ t('instructor.students.importExample') }}</strong>
                <p>{{ t('instructor.students.importHint') }}</p>
                <p>C6600001 A</p>
                <p>C6600002 B</p>
                <p>C6600003 B+</p>
                <ol>
                  <li>{{ t('instructor.students.importStep1') }}</li>
                  <li>{{ t('instructor.students.importStep2') }}</li>
                  <li>{{ t('instructor.students.importStep3') }}</li>
                  <li>{{ t('instructor.students.importStep4') }}</li>
                </ol>
              </div>
            </div>

            <div
              v-if="!approvalStatus && detailPreviewRows.length > 0"
              class="learning-result-detail-preview"
            >
              <div class="learning-result-detail-preview__header">
                <span class="text-positive">
                  พร้อม Import
                  {{ detailPreviewRows.filter((r) => r.matched && r.gradeItemId).length }} รายการ
                </span>
                <span
                  v-if="detailPreviewRows.filter((r) => !r.matched).length > 0"
                  class="text-negative"
                >
                  ไม่พบในระบบ {{ detailPreviewRows.filter((r) => !r.matched).length }} รายการ
                </span>
                <BaseButton
                  flat
                  no-caps
                  icon="close"
                  :label="t('instructor.students.cancelImport')"
                  color="grey-7"
                  style="margin-left: auto"
                  @click="detailPreviewRows = []"
                />
              </div>
              <div class="preview-bulk-bar">
                <div class="preview-bulk-bar__section">
                  <span class="preview-bulk-bar__label">{{
                    t('instructor.students.bulkGradeAll')
                  }}</span>
                  <q-select
                    v-model="bulkGradeId"
                    :options="gradeItemOptions"
                    option-value="id"
                    option-label="name"
                    emit-value
                    map-options
                    dense
                    outlined
                    :placeholder="t('instructor.students.gradePlaceholder')"
                    class="preview-bulk-bar__select"
                  />
                  <BaseButton
                    unelevated
                    color="primary"
                    :label="t('instructor.students.applyAllBtn')"
                    no-caps
                    :disable="!bulkGradeId"
                    class="preview-bulk-bar__btn"
                    @click="applyBulkGrade"
                  />
                </div>

                <div class="preview-bulk-bar__divider">
                  {{ t('instructor.students.scoreCriteriaLabel') }}
                </div>

                <div class="preview-bulk-bar__section preview-bulk-bar__section--rules">
                  <span class="preview-bulk-bar__hint">{{
                    t('instructor.students.criteriaHint')
                  }}</span>
                  <div v-for="(rule, i) in scoreRules" :key="i" class="preview-bulk-bar__rule">
                    <span class="preview-bulk-bar__label">{{
                      t('instructor.students.col.score')
                    }}</span>
                    <q-select
                      v-model="rule.operator"
                      :options="operatorOptions"
                      option-value="value"
                      option-label="label"
                      emit-value
                      map-options
                      dense
                      outlined
                      class="preview-bulk-bar__operator"
                    />
                    <q-input
                      v-model.number="rule.minScore"
                      type="number"
                      dense
                      outlined
                      min="0"
                      max="100"
                      class="preview-bulk-bar__score-input"
                    />
                    <span class="preview-bulk-bar__label">→</span>
                    <q-select
                      v-model="rule.gradeItemId"
                      :options="gradeItemOptions"
                      option-value="id"
                      option-label="name"
                      emit-value
                      map-options
                      dense
                      outlined
                      :placeholder="t('instructor.students.gradePlaceholder')"
                      class="preview-bulk-bar__select"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      icon="close"
                      color="grey-5"
                      @click="scoreRules.splice(i, 1)"
                    />
                  </div>
                  <div class="preview-bulk-bar__rule-actions">
                    <BaseButton
                      flat
                      color="primary"
                      icon="add"
                      :label="t('instructor.students.addCriteriaBtn')"
                      no-caps
                      class="preview-bulk-bar__btn"
                      @click="
                        scoreRules.push({ minScore: null, operator: '>=', gradeItemId: null })
                      "
                    />
                    <BaseButton
                      unelevated
                      color="primary"
                      icon="calculate"
                      :label="t('instructor.students.autoCalcBtn')"
                      no-caps
                      :disable="!scoreRules.some((r) => r.minScore !== null && r.gradeItemId)"
                      class="preview-bulk-bar__btn"
                      @click="applyScoreRules"
                    />
                    <BaseButton
                      flat
                      color="grey-7"
                      icon="clear_all"
                      :label="t('instructor.students.clearAllBtn')"
                      no-caps
                      class="preview-bulk-bar__btn"
                      style="margin-left: auto"
                      @click="clearAllGrades"
                    />
                  </div>
                </div>
              </div>

              <div class="learning-result-table-scroll">
                <table class="learning-result-entry-table">
                  <thead>
                    <tr>
                      <th style="width: 52px">{{ t('instructor.students.col.no') }}</th>
                      <th style="width: 120px">{{ t('instructor.students.col.studentId') }}</th>
                      <th>{{ t('instructor.students.col.nameSurname') }}</th>
                      <th style="width: 110px">{{ t('instructor.students.col.lmsScore') }}</th>
                      <th style="width: 100px">{{ t('instructor.students.col.oldValue') }}</th>
                      <th style="width: 200px">{{ t('instructor.students.col.result') }}</th>
                      <th style="width: 80px">{{ t('instructor.students.col.statusCol') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, index) in detailPreviewRows"
                      :key="row.studentId + index"
                      :class="{ 'detail-row--unmatched': !row.matched }"
                    >
                      <td class="text-center">{{ index + 1 }}</td>
                      <td class="text-center">{{ row.studentId }}</td>
                      <td>{{ row.learnerName ?? '-' }}</td>
                      <td class="text-center">
                        {{ row.lmsFinalscore !== null ? row.lmsFinalscore.toFixed(2) : '—' }}
                      </td>
                      <td class="text-center">
                        <span v-if="row.currentGradeName" class="detail-grade-badge">
                          {{ row.currentGradeName }}
                        </span>
                        <span v-else class="detail-grade-dash">—</span>
                      </td>
                      <td>
                        <q-select
                          v-if="row.matched"
                          v-model="row.gradeItemId"
                          :options="gradeItemOptions"
                          option-value="id"
                          option-label="name"
                          emit-value
                          map-options
                          dense
                          outlined
                          :placeholder="t('instructor.students.gradePlaceholder')"
                          class="detail-grade-select"
                        />
                        <span v-else class="detail-unmatched-label">{{
                          t('instructor.students.notFoundInSystem')
                        }}</span>
                      </td>
                      <td class="text-center">
                        <span
                          v-if="row.matched && row.gradeItemId"
                          class="detail-status detail-status--ready"
                          >{{ t('instructor.students.statusReady') }}</span
                        >
                        <span
                          v-else-if="row.matched"
                          class="detail-status detail-status--pending"
                          >{{ t('instructor.students.statusPendingGrade') }}</span
                        >
                        <span v-else class="detail-status detail-status--error">{{
                          t('instructor.students.statusNotFound')
                        }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <BaseButton
                unelevated
                color="primary"
                icon="upload"
                label="import"
                no-caps
                class="learning-result-import-action-btn"
                :disable="!detailPreviewRows.some((r) => r.matched && r.gradeItemId)"
                @click="importLearningResults"
              />
            </div>

            <!-- Approval status banner -->
            <div v-if="approvalStatus" class="learning-result-approved-banner">
              <q-icon name="lock" color="positive" size="20px" />
              <div>
                <div class="text-weight-bold">
                  รายวิชานี้ได้บันทึกการอนุมัติเกรดแล้ว ไม่สามารถแก้ไขผลการเรียนได้
                </div>
                <div class="learning-result-approved-meta">
                  ผู้อนุมัติเกรด: {{ approvalStatus.approvedBy }} &nbsp;&nbsp; วันที่อนุมัติเกรด:
                  {{ formatBackendDateTime(approvalStatus.approvedAt) }}
                </div>
              </div>
            </div>

            <div class="learning-result-table-actions">
              <div class="learning-result-links">
                <button type="button" @click="exportLearnerListCsv(selectedCourse)">
                  ดาวน์โหลดรายชื่อผู้เรียน
                </button>
                <button type="button" @click="printGradeForm(selectedCourse)">
                  ดาวน์โหลดแบบฟอร์มใบส่งเกรด สำหรับเจ้าประชุมกรรมการประจำ
                </button>
                <button type="button" @click="printCbs003(selectedCourse)">
                  ดาวน์โหลด BUU-CBS 003 รายงานสรุปผลการจัดรายวิชา
                </button>
              </div>
              <div class="learning-result-sync-actions">
                <BaseButton
                  outline
                  color="primary"
                  icon="cloud_download"
                  :label="t('instructor.students.fetchLmsScore')"
                  no-caps
                  :loading="syncingScores"
                  @click="pullScoresFromLms"
                />
                <BaseButton
                  outline
                  color="primary"
                  icon="refresh"
                  :label="t('instructor.students.fetchResults')"
                  no-caps
                  :loading="syncingResults"
                  @click="saveLearningResults"
                />
                <BaseButton
                  v-if="!approvalStatus"
                  unelevated
                  color="positive"
                  icon="how_to_reg"
                  :label="t('instructor.students.saveApproveBtn')"
                  no-caps
                  :loading="approvingGrades"
                  @click="openApproveDialog"
                />
              </div>
            </div>

            <BaseTable
              :rows="paginatedLearningResultLearners"
              :columns="learningResultEntryColumns"
              row-key="id"
              show-index
              :index-offset="(learningResultTablePage - 1) * instructorTableRowsPerPage"
              :rows-per-page="instructorTableRowsPerPage"
              :page="learningResultTablePage"
              :total-pages="learningResultPageCount"
              min-width="1040px"
              :empty-text="emptyLearnerStateMessage"
              height-mode="stable"
              class="learning-result-entry-base-table"
              :on-page-change="setLearningResultTablePage"
            >
              <template #cell-lmsScore="{ row }">
                {{ getLearnerLmsScore(row) }}
              </template>
              <template #cell-gradeUpdatedAt="{ row }">
                {{ row.resultUpdatedAt ?? '' }}
              </template>
              <template #cell-lmsSyncedAt="{ row }">
                {{ row.lmsSyncedAt ?? '' }}
              </template>
              <template #cell-detail="{ row }">
                <button type="button" class="learning-result-breakdown-btn" @click="openGradePanel(row)">
                  <q-icon name="assignment" size="13px" />
                  ดูรายละเอียด
                </button>
              </template>
            </BaseTable>
          </div>
        </template>

        <template v-else>
          <q-tabs
            :model-value="activeStudentTab"
            dense
            align="left"
            active-color="primary"
            indicator-color="primary"
            class="student-roster-tabs"
            @update:model-value="switchTab"
          >
            <q-tab
              name="roster"
              icon="groups"
              :label="t('instructor.students.heroRosterTitle')"
              no-caps
            />
            <q-tab
              name="results"
              icon="fact_check"
              :label="t('instructor.students.heroGradesTitle')"
              no-caps
            />
          </q-tabs>

          <div class="student-roster-filters row items-center q-gutter-md q-mb-md">
            <BaseSearchInput
              v-model="searchQuery"
              :placeholder="t('instructor.students.searchPlaceholder')"
              class="student-roster-search"
            />

            <q-select
              v-model="statusFilter"
              :options="statusOptions"
              :label="t('instructor.students.statusFilter')"
              outlined
              dense
              bg-color="white"
              style="min-width: 160px"
              class="custom-filter-input"
              emit-value
              map-options
            />

            <q-space />

            <template v-if="activeStudentTab === 'roster'">
              <BaseButton
                outline
                color="primary"
                icon="table_view"
                label="CSV"
                no-caps
                class="student-export-btn"
                :disable="filteredLearners.length === 0"
                @click="exportLearnersCsv"
              />
              <BaseButton
                unelevated
                color="primary"
                icon="picture_as_pdf"
                label="PDF"
                no-caps
                class="student-export-btn student-export-btn--primary"
                :disable="filteredLearners.length === 0"
                @click="exportLearnersPdf"
              />
            </template>
            <BaseButton
              v-else
              unelevated
              color="primary"
              icon="save"
              :label="t('instructor.students.recordGradeBtn')"
              no-caps
              class="student-export-btn student-export-btn--primary"
              :disable="filteredLearners.length === 0"
              @click="saveLearningResults"
            />
          </div>

          <template v-if="activeStudentTab === 'roster'">
            <BaseTable
              v-if="filteredLearners.length > 0"
              :rows="paginatedRosterLearners"
              :columns="learnerColumns"
              row-key="id"
              show-index
              :index-offset="(rosterTablePage - 1) * instructorTableRowsPerPage"
              :rows-per-page="instructorTableRowsPerPage"
              :page="rosterTablePage"
              :total-pages="rosterPageCount"
              min-width="1040px"
              empty-text="ไม่พบรายชื่อผู้เรียน"
              height-mode="stable"
              class="student-roster-table"
              :on-page-change="setRosterTablePage"
            >
              <template #cell-name="{ row }">
                <div class="student-name-cell">
                  <q-avatar size="36px" color="primary" text-color="white">
                    {{ getInitials(row.name) }}
                  </q-avatar>
                  <div>
                    <strong>{{ row.name }}</strong>
                    <span>{{ row.studentId }}</span>
                  </div>
                </div>
              </template>
              <template #cell-progress="{ row }">
                <div class="student-progress-cell">
                  <q-linear-progress
                    rounded
                    size="8px"
                    :value="row.progress / 100"
                    color="primary"
                  />
                  <span>{{ row.progress }}%</span>
                </div>
              </template>
              <template #cell-status="{ row }">
                <q-badge rounded :color="row.statusColor" :label="row.status" />
              </template>
              <template #cell-actions="{ row }">
                <q-btn
                  flat
                  round
                  dense
                  icon="visibility"
                  color="primary"
                  class="student-roster-action-btn"
                  @click.stop="openLearnerDetail(null, row)"
                >
                  <q-tooltip>ดูรายละเอียด</q-tooltip>
                </q-btn>
              </template>
            </BaseTable>
          </template>

          <BaseTable
            v-else-if="filteredLearners.length > 0"
            :rows="paginatedLearningResultLearners"
            :columns="learningResultColumns"
            row-key="id"
            :rows-per-page="instructorTableRowsPerPage"
            :page="learningResultTablePage"
            :total-pages="learningResultPageCount"
            min-width="980px"
            empty-text="ไม่พบรายชื่อผู้เรียน"
            height-mode="stable"
            class="student-roster-table"
            :on-page-change="setLearningResultTablePage"
          >
            <template #cell-name="{ row }">
              <div class="student-name-cell">
                <q-avatar size="36px" color="primary" text-color="white">
                  {{ getInitials(row.name) }}
                </q-avatar>
                <div>
                  <strong>{{ row.name }}</strong>
                  <span>{{ row.studentId }}</span>
                </div>
              </div>
            </template>
            <template #cell-progress="{ row }"> {{ row.progress }}% </template>
            <template #cell-finalScore="{ row }">
              <q-input
                v-model.number="row.finalScore"
                type="number"
                dense
                outlined
                min="0"
                max="100"
                suffix="/100"
                class="student-result-score"
              />
            </template>
            <template #cell-note="{ row }">
              <q-input v-model="row.resultNote" dense outlined placeholder="หมายเหตุ" />
            </template>
          </BaseTable>

          <div
            v-if="filteredLearners.length === 0"
            class="column items-center q-py-xl text-grey-5 border-dashed"
            style="border: 2px dashed rgba(0, 0, 0, 0.05); border-radius: 12px"
          >
            <q-icon name="search_off" size="3rem" class="q-mb-md" />
            <div class="text-body1">{{ emptyLearnerStateMessage }}</div>
            <BaseButton
              v-if="searchQuery || statusFilter !== ''"
              flat
              no-caps
              :label="t('instructor.students.clearSearchBtn')"
              color="primary"
              class="q-mt-md"
              @click="clearFilters"
            />
          </div>
        </template>
      </section>
    </div>

    <q-dialog v-model="learnerDetailDialogOpen">
      <q-card class="student-detail-dialog" v-if="selectedLearner">
        <q-card-section class="student-detail-header">
          <q-avatar size="64px" color="primary" text-color="white">
            {{ getInitials(selectedLearner.name) }}
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

        <q-card-section class="student-detail-stats">
          <div>
            <span>{{ t('instructor.learnerDetail.progress') }}</span>
            <strong>{{ selectedLearner.progress }}%</strong>
          </div>
          <div>
            <span>{{ t('instructor.learnerDetail.completedWork') }}</span>
            <strong
              >{{ selectedLearner.completedLessons }}/{{ selectedLearner.totalLessons }}</strong
            >
          </div>
          <div>
            <span>{{ t('instructor.learnerDetail.lastActive') }}</span>
            <strong>{{ selectedLearner.lastActive }}</strong>
          </div>
        </q-card-section>

        <q-card-section class="student-detail-info">
          <div>
            <span>{{ t('instructor.learnerDetail.faculty') }}</span
            ><strong>{{ selectedLearner.faculty }}</strong>
          </div>
          <div>
            <span>{{ t('instructor.learnerDetail.branch') }}</span
            ><strong>{{ selectedLearner.department }}</strong>
          </div>
          <div>
            <span>{{ t('instructor.learnerDetail.phone') }}</span
            ><strong>{{ selectedLearner.phone }}</strong>
          </div>
          <div>
            <span>{{ t('instructor.learnerDetail.enrollDate') }}</span
            ><strong>{{ selectedLearner.enrolledAt }}</strong>
          </div>
          <div>
            <span>{{ t('instructor.learnerDetail.paymentStatus') }}</span
            ><strong>{{ selectedLearner.paymentStatus }}</strong>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- ─── GRADE BREAKDOWN PANEL ─── -->
    <Teleport to="body">
      <div v-if="panelOpen" class="student-grade-panel-overlay" @click="closeGradePanel" />
      <transition name="student-panel-slide">
        <div v-if="panelOpen" class="student-grade-panel">
          <div class="student-grade-panel__header">
            <div>
              <p class="student-grade-panel__eyebrow">Grade Breakdown</p>
              <h3 class="student-grade-panel__title">{{ panelRow?.name }}</h3>
              <span class="student-grade-panel__sub">{{ panelRow?.studentId }}</span>
            </div>
            <button
              class="student-grade-panel__close"
              :aria-label="t('instructor.students.close')"
              @click="closeGradePanel"
            >
              <q-icon name="close" size="20px" />
            </button>
          </div>

          <div class="student-grade-panel__total">
            <span class="student-grade-panel__total-label">{{
              t('instructor.learnerDetail.totalScore')
            }}</span>
            <span class="student-grade-panel__total-value">
              {{ formatScoreValue(panelRow?.lmsFinalscore) }}
              <span v-if="panelRow?.lmsFinalscore != null && panelRow?.maxScore != null">
                / {{ formatMaxScoreValue(panelRow?.maxScore) }}</span
              >
            </span>
            <span v-if="panelRow?.importedGradeName" class="student-grade-panel__grade-badge">
              {{ panelRow.importedGradeName }}
            </span>
          </div>

          <div class="student-grade-panel__body">
            <div v-if="!panelRow?.gradeItems.length" class="student-grade-panel__empty">
              {{ t('instructor.status.noScore') }}
            </div>
            <div
              v-for="item in panelRow?.gradeItems"
              :key="`${item.itemmodule}:${item.itemname}`"
              class="student-grade-panel__item"
            >
              <div class="student-grade-panel__item-left">
                <span
                  class="student-grade-panel__module-badge"
                  :class="`student-grade-panel__module-badge--${item.itemmodule ?? 'mod'}`"
                >
                  {{
                    item.itemmodule === 'assign'
                      ? t('instructor.assignmentType.assignment')
                      : item.itemmodule === 'quiz'
                        ? t('instructor.assignmentType.quiz')
                        : t('instructor.assignmentType.assignment')
                  }}
                </span>
                <span class="student-grade-panel__item-name">{{ item.itemname ?? '—' }}</span>
              </div>
              <div class="student-grade-panel__item-right">
                <span v-if="item.score !== null" class="student-grade-panel__score">
                  {{ item.score }}
                  <span class="student-grade-panel__score-max"
                    >/ {{ formatMaxScoreValue(item.maxScore) }}</span
                  >
                </span>
                <span v-else class="student-grade-panel__no-score">
                  — <span class="student-grade-panel__score-max">/ {{ item.maxScore ?? 100 }}</span>
                </span>
                <button
                  v-if="
                    item.itemmodule === 'assign' &&
                    canOpenMoodleGrader(item, panelRow)
                  "
                  type="button"
                  class="student-grade-panel__grade-link"
                  :disabled="openingMoodleGraderKey === moodleGraderKey(item, panelRow)"
                  @click="openMoodleGrader(item, panelRow)"
                >
                  <q-icon
                    :name="
                      openingMoodleGraderKey === moodleGraderKey(item, panelRow)
                        ? 'hourglass_empty'
                        : 'rate_review'
                    "
                    size="13px"
                  />
                  {{ t('instructor.grading.gradeBtn') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Approve Grades Dialog -->
    <q-dialog v-model="approveDialogOpen" transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 420px; border-radius: 12px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-subtitle1 text-weight-bold">
            {{ t('instructor.students.approveTitle') }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-gutter-y-sm">
          <q-input
            v-model="approveForm.detail"
            type="textarea"
            outlined
            dense
            rows="3"
            :label="t('instructor.students.approveDetailLabel')"
          />
          <BaseDateInput
            v-model="approveForm.date"
            value-format="YYYY-MM-DD"
            :label="t('instructor.students.approveDateLabel')"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <BaseButton
            flat
            :label="t('instructor.common.cancel')"
            no-caps
            color="grey-7"
            v-close-popup
          />
          <BaseButton
            unelevated
            color="positive"
            :label="approveLearningResultLabel"
            no-caps
            :loading="approvingGrades"
            @click="confirmApproveGrades"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseStore } from 'src/stores/course-store';
import { getCourseStructure } from 'src/data/course-structure';
import { useInstructorBackend } from 'src/composables/use-instructor-backend';
import type { GradeItemBreakdown, InstructorGrade } from 'src/composables/use-instructor-backend';
import { useMoodleSso } from 'src/composables/use-moodle-sso';
import { isNewTabClick, resolveFullUrl } from 'src/composables/use-nav-link';
import { api } from 'src/boot/axios';
import type { Course } from 'src/types/course';
import buuLogoUrl from 'src/assets/buu-logo-receipt.png';
import BaseDateInput from 'src/components/base/BaseDateInput.vue';
import BaseButton from 'src/components/base/BaseButton.vue';
import AppActionButton from 'src/components/common/AppActionButton.vue';
import AppIconButton from 'src/components/common/AppIconButton.vue';
import BaseTable, { type BaseTableColumn } from 'src/components/base/BaseTable.vue';
import BaseSearchInput from 'src/components/base/BaseSearchInput.vue';
import InstructorPageHero from 'src/components/instructor/InstructorPageHero.vue';

interface LearnerRow {
  id: string;
  studentId: string;
  name: string;
  email: string;
  faculty: string;
  department: string;
  phone: string;
  progress: number;
  lastActive: string;
  score: string;
  maxScore: number | null;
  status: string;
  statusColor: string;
  enrolledAt: string;
  paymentStatus: string;
  completedLessons: number;
  totalLessons: number;
  finalScore: number;
  resultStatus: string;
  resultNote: string;
  importedGradeName: string | null;
  lmsFinalscore: number | null;
  lmsSyncedAt: string | null;
  resultUpdatedAt: string | null;
  moodleUserId: number | null;
  gradeItems: GradeItemBreakdown[];
}

interface ImportedLearningResult {
  grade: string;
  score: number;
  status: string;
}

interface RosterSummaryCard {
  label: string;
  value: string;
  caption: string;
  icon: string;
  color: string;
  softColor: string;
}

const { locale, t } = useI18n();
const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const courseStore = useCourseStore();
const instructorBackend = useInstructorBackend();
const { getMoodleActivityUrl } = useMoodleSso();
courseStore.init();

const selectedCourseId = ref(typeof route.query.courseId === 'string' ? route.query.courseId : '');
const activeStudentTab = computed<'roster' | 'results'>(() =>
  route.path.includes('/instructor/results') ? 'results' : 'roster',
);
const studentHeroTitle = computed(() =>
  activeStudentTab.value === 'results'
    ? formatHeroTitle(t('instructor.students.heroGradesTitle'))
    : t('instructor.students.heroRosterTitle'),
);
const approveLearningResultLabel = computed(() =>
  locale.value === 'th' ? 'อนุมัติผลการเรียน' : 'Approve Learning Results',
);

function formatHeroTitle(title: string): string {
  return title.includes(' ') ? title.replace(/\s+(?=\S+$)/, '\n') : title;
}

const studentHeroDescription = computed(() => {
  if (activeStudentTab.value === 'roster') {
    return '';
  }

  if (activeStudentTab.value === 'results') {
    return '';
  }

  if (selectedCourse.value) {
    return `${selectedCourse.value.code} ${selectedCourse.value.titleEn || selectedCourse.value.title}`;
  }

  return activeStudentTab.value === 'results'
    ? t('instructor.students.selectForGrades')
    : t('instructor.students.selectForRoster');
});
const learnerDetailDialogOpen = ref(false);
const selectedLearner = ref<LearnerRow | null>(null);
const searchQuery = ref('');
const courseSearch = ref('');
const statusFilter = ref('');
const resultImportText = ref('');
const gradeImportFileInput = ref<HTMLInputElement | null>(null);
const importedLearningResults = ref<Record<string, ImportedLearningResult>>({});
const pendingLearningResults = ref<Record<string, ImportedLearningResult>>({});
const gradeItemOptions = ref<Array<{ id: number; name: string }>>([]);
const savingGrades = ref(false);
const syncingScores = ref(false);
const syncingResults = ref(false);
const approvingGrades = ref(false);
const approveDialogOpen = ref(false);
const approveForm = ref({
  detail: '',
  date: new Date().toISOString().slice(0, 10),
});
const approvalStatus = ref<{ approvedBy: string; approvedAt: string } | null>(null);
const panelOpen = ref(false);
const panelRow = ref<LearnerRow | null>(null);
const openingMoodleGraderKey = ref<string | null>(null);

const instructorTableRowsPerPage = 10;
const courseListRowsPerPage = 10;
const courseListPage = ref(1);
const rosterTablePage = ref(1);
const learningResultTablePage = ref(1);

interface DetailPreviewRow {
  studentId: string;
  gradeText: string;
  gradeItemId: number | null;
  currentGradeName: string | null;
  learnerName: string | null;
  lmsFinalscore: number | null;
  matched: boolean;
}

type ScoreOperator = '>=' | '>' | '<=' | '<' | '=';

interface ScoreRule {
  minScore: number | null;
  operator: ScoreOperator;
  gradeItemId: number | null;
}

const operatorOptions: { label: string; value: ScoreOperator }[] = [
  { label: '≥', value: '>=' },
  { label: '>', value: '>' },
  { label: '≤', value: '<=' },
  { label: '<', value: '<' },
  { label: '=', value: '=' },
];

const detailPreviewRows = ref<DetailPreviewRow[]>([]);
const bulkGradeId = ref<number | null>(null);
const scoreRules = ref<ScoreRule[]>([{ minScore: null, operator: '>=', gradeItemId: null }]);

const statusOptions = computed(() => [
  { label: t('tabAll'), value: '' },
  { label: t('instructor.status.activeStudent'), value: t('instructor.status.activeStudent') },
  { label: t('instructor.status.normal'), value: t('instructor.status.normal') },
  { label: t('instructor.status.watchlist'), value: t('instructor.status.watchlist') },
  { label: t('instructor.status.waitingProgress'), value: t('instructor.status.waitingProgress') },
]);

watch(
  () => route.query.courseId,
  (courseId) => {
    selectedCourseId.value = typeof courseId === 'string' ? courseId : '';
  },
);

const instructorCourses = computed<Course[]>(() =>
  [...courseStore.getInstructorCourses(authStore.user)].sort((left, right) => {
    if (right.enrolledCount !== left.enrolledCount) {
      return right.enrolledCount - left.enrolledCount;
    }
    return left.code.localeCompare(right.code);
  }),
);
const filteredInstructorCourses = computed<Course[]>(() => {
  const query = courseSearch.value.trim().toLowerCase();
  if (!query) return instructorCourses.value;

  return instructorCourses.value.filter((course) =>
    [course.code, course.title, course.titleEn]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)),
  );
});
const courseListPageCount = computed(() =>
  Math.max(1, Math.ceil(filteredInstructorCourses.value.length / courseListRowsPerPage)),
);
const paginatedInstructorCourses = computed<Course[]>(() =>
  filteredInstructorCourses.value.slice(
    (courseListPage.value - 1) * courseListRowsPerPage,
    courseListPage.value * courseListRowsPerPage,
  ),
);
const selectedCourse = computed<Course | undefined>(() =>
  instructorCourses.value.find((course) => course.id === selectedCourseId.value),
);

function clearAllGrades(): void {
  for (const row of detailPreviewRows.value) {
    row.gradeItemId = null;
  }
}

function applyBulkGrade(): void {
  if (!bulkGradeId.value) return;
  for (const row of detailPreviewRows.value) {
    if (row.matched) row.gradeItemId = bulkGradeId.value;
  }
}

function applyScoreRules(): void {
  const valid = scoreRules.value.filter((r) => r.minScore !== null && r.gradeItemId !== null);
  if (valid.length === 0) return;
  for (const row of detailPreviewRows.value) {
    if (!row.matched || row.lmsFinalscore === null) continue;
    const score = row.lmsFinalscore;
    const matched = valid.find((r) => {
      const t = r.minScore!;
      switch (r.operator) {
        case '>=':
          return score >= t;
        case '>':
          return score > t;
        case '<=':
          return score <= t;
        case '<':
          return score < t;
        case '=':
          return score === t;
      }
    });
    if (matched) row.gradeItemId = matched.gradeItemId;
  }
}

function buildDetailPreview(): void {
  if (!resultImportText.value.trim() || !selectedCourse.value) {
    detailPreviewRows.value = [];
    return;
  }
  const course = selectedCourse.value;
  const courseKey = String(course.id).startsWith('db-') ? course.id : `db-${course.id}`;
  const grades = instructorBackend.gradesByCourseId.value[courseKey] ?? [];
  const lines = resultImportText.value
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Use Maps for O(1) lookups to avoid O(N*M) nested loops
  const learnerMap = new Map(learners.value.map((l) => [l.studentId, l]));
  const gradeMap = new Map(grades.map((g) => [g.studentId, g]));
  const gradeItemMap = new Map(gradeItemOptions.value.map((opt) => [opt.name.toLowerCase(), opt]));

  detailPreviewRows.value = lines.map((line) => {
    const parts = line.split(/[,\t ]+/).filter(Boolean);
    const studentId = parts[0] ?? '';
    const gradeText = parts.slice(1).join(' ').trim();

    const learner = learnerMap.get(studentId);
    const gradeData = gradeMap.get(studentId);
    const matchedItem = gradeItemMap.get(gradeText.toLowerCase());

    return {
      studentId,
      gradeText,
      gradeItemId: matchedItem?.id ?? null,
      currentGradeName: gradeData?.importedGradeName ?? null,
      learnerName: learner?.name ?? null,
      lmsFinalscore: gradeData?.lmsFinalscore != null ? Number(gradeData.lmsFinalscore) : null,
      matched: !!learner,
    };
  });
}

onMounted(async () => {
  const email = authStore.user?.email;
  if (email) {
    void courseStore.fetchInstructorCourses(email);
  }
  try {
    const { data } = await api.get<Array<{ id: number; name: string }>>(
      '/api/instructor/grade-items',
    );
    gradeItemOptions.value = data;
  } catch {
    // grade items not critical
  }
});

watch(
  selectedCourse,
  async (course) => {
    const email = authStore.user?.email;
    approvalStatus.value = null;
    if (!course || !email) return;
    void instructorBackend.fetchLearners(email, course.id, course.moodleId ?? null);
    void instructorBackend.fetchGrades(email, course.id);
    const numericId = String(course.id).replace(/^db-/, '');
    try {
      const { data } = await api.get<{
        approved: boolean;
        approvedBy: string | null;
        approvedAt: string | null;
        detail: string | null;
      }>(`/api/instructor/courses/${numericId}/approval-status?email=${encodeURIComponent(email)}`);
      if (data.approved) {
        approvalStatus.value = {
          approvedBy: data.approvedBy ?? '',
          approvedAt: data.approvedAt ?? '',
        };
      }
    } catch {
      // non-critical
    }
  },
  { immediate: true },
);

function getLearnerStatus(progress: number): Pick<LearnerRow, 'status' | 'statusColor'> {
  if (progress >= 85)
    return { status: t('instructor.status.activeStudent'), statusColor: 'positive' };
  if (progress >= 60) return { status: t('instructor.status.normal'), statusColor: 'primary' };
  if (progress >= 35) return { status: t('instructor.status.watchlist'), statusColor: 'warning' };
  return { status: t('instructor.status.waitingProgress'), statusColor: 'grey-7' };
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

function formatBackendDateTime(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function formatPaymentStatus(value: string | null | undefined, isFree: boolean): string {
  if (isFree) return t('instructor.students.noFee');
  if (value === 'Y') return t('instructor.status.paid');
  if (value === 'N') return t('instructor.status.unpaid');
  return value || '-';
}

function formatScoreValue(value: number | string | null | undefined): string {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : '-';
}

function formatMaxScoreValue(value: number | string | null | undefined): string {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '-';
  return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(2);
}

function resolveGradeMaxScore(grade: InstructorGrade | null | undefined): number | null {
  const directMaxScore = Number(grade?.maxScore);
  if (Number.isFinite(directMaxScore) && directMaxScore > 0) return directMaxScore;

  const itemMaxScore = (grade?.gradeItems ?? []).reduce((total, item) => {
    const maxScore = Number(item.maxScore);
    return Number.isFinite(maxScore) && maxScore > 0 ? total + maxScore : total;
  }, 0);

  return itemMaxScore > 0 ? itemMaxScore : null;
}

function formatScoreSummary(
  score: number | string | null | undefined,
  maxScore: number | null,
): string {
  if (score === null || score === undefined) return t('instructor.status.noScore');
  return `${formatScoreValue(score)}/${formatMaxScoreValue(maxScore)}`;
}

function getInitials(name: string | null | undefined): string {
  const parts = (name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function getResultStatusFromGrade(importedGradeName: string | null | undefined): string {
  if (!importedGradeName) return 'ไม่ผ่าน';
  const name = importedGradeName.trim().toLowerCase();
  if (name === 'f' || name === 'ไม่ผ่าน') return 'ไม่ผ่าน';
  return 'ผ่าน';
}

function buildLearnersForCourse(course: Course | undefined): LearnerRow[] {
  if (!course) return [];

  const courseKey = String(course.id).startsWith('db-') ? course.id : `db-${course.id}`;
  const backendLearners = instructorBackend.learnersByCourseId.value[courseKey] ?? [];
  const backendGrades = instructorBackend.gradesByCourseId.value[courseKey] ?? [];
  const totalLessons =
    getCourseStructure(course.id).reduce((sum, module) => sum + module.lessons.length, 0) || 0;

  const gradesByUserId = new Map(backendGrades.map((g) => [g.learnerUserId, g]));
  const gradesByStudentId = new Map(backendGrades.map((g) => [g.studentId, g]));

  return backendLearners.map((learner) => {
    const grade = gradesByUserId.get(learner.userId) || gradesByStudentId.get(learner.studentId);
    const importedResult = importedLearningResults.value[learner.studentId];
    const score = importedResult?.score ?? grade?.score ?? 0;
    const maxScore = resolveGradeMaxScore(grade);
    const importedGradeName = grade?.importedGradeName ?? null;
    const resultStatus = getResultStatusFromGrade(importedGradeName);
    const progress = grade?.status === 'passed' ? 100 : 0;
    const status = getLearnerStatus(progress);

    return {
      id: `${course.id}-${learner.userId}`,
      studentId: learner.studentId,
      name: learner.fullName,
      email: learner.email ?? '-',
      faculty: '-',
      department: '-',
      phone: learner.phone ?? '-',
      progress,
      lastActive: grade?.updatedAt ? formatBackendDate(grade.updatedAt) : '-',
      score:
        grade?.score === null || grade?.score === undefined
          ? t('instructor.status.noScore')
          : formatScoreSummary(grade.score, maxScore),
      maxScore,
      ...status,
      enrolledAt: formatBackendDate(learner.enrolledAt),
      paymentStatus: formatPaymentStatus(learner.paymentStatus, course.isFree),
      completedLessons: progress === 100 ? totalLessons : 0,
      totalLessons,
      finalScore: score,
      resultStatus,
      resultNote: importedResult ? `นำเข้าเกรด ${importedResult.grade}` : (grade?.grade ?? ''),
      importedGradeName,
      lmsFinalscore: grade?.lmsFinalscore != null ? Number(grade.lmsFinalscore) : null,
      lmsSyncedAt: grade?.lmsSyncedAt ? formatBackendDate(grade.lmsSyncedAt) : null,
      resultUpdatedAt: grade?.gradeUpdatedAt ? formatBackendDate(grade.gradeUpdatedAt) : null,
      moodleUserId: grade?.moodleUserId ?? null,
      gradeItems: grade?.gradeItems ?? [],
    };
  });
}
const learners = computed<LearnerRow[]>(() => buildLearnersForCourse(selectedCourse.value));
const displayedEnrolledCount = computed(() =>
  Math.max(selectedCourse.value?.enrolledCount ?? 0, learners.value.length),
);
const averageProgress = computed(() => {
  if (learners.value.length === 0) return 0;
  const total = learners.value.reduce((sum, learner) => sum + learner.progress, 0);
  return Math.round(total / learners.value.length);
});

function hasRosterIssue(learner: LearnerRow): boolean {
  return (
    !learner.studentId.trim() ||
    !learner.name.trim() ||
    learner.email === '-' ||
    learner.email.trim().length === 0
  );
}

function isPendingRosterVerification(learner: LearnerRow): boolean {
  const paymentStatus = learner.paymentStatus.toLowerCase();
  return (
    hasRosterIssue(learner) ||
    paymentStatus === '-' ||
    paymentStatus.includes('ยัง') ||
    paymentStatus.includes('pending') ||
    paymentStatus.includes('unpaid')
  );
}

const rosterSummaryCounts = computed(() => {
  if (!selectedCourse.value) {
    const total = instructorCourses.value.reduce((sum, course) => sum + course.enrolledCount, 0);
    return {
      total,
      verified: total,
      pending: 0,
      issue: 0,
      scope: `${instructorCourses.value.length.toLocaleString('th-TH')} ${t('instructor.students.coursesUnit')}`,
    };
  }

  const total = displayedEnrolledCount.value;
  const issue = learners.value.filter(hasRosterIssue).length;
  const pendingFromMissingRows = Math.max(total - learners.value.length, 0);
  const pending =
    pendingFromMissingRows + learners.value.filter(isPendingRosterVerification).length;
  const verified = Math.max(total - pending, 0);

  return {
    total,
    verified,
    pending,
    issue,
    scope: selectedCourse.value.code,
  };
});

const rosterSummaryCards = computed<RosterSummaryCard[]>(() => {
  const counts = rosterSummaryCounts.value;
  return [
    {
      label: t('instructor.students.summaryCards.totalStudents'),
      value: counts.total.toLocaleString('th-TH'),
      caption: counts.scope,
      icon: 'groups',
      color: '#f5a623',
      softColor: 'rgba(245, 166, 35, 0.14)',
    },
    {
      label: t('instructor.students.summaryCards.verified'),
      value: counts.verified.toLocaleString('th-TH'),
      caption: t('instructor.students.summaryCards.verifiedCaption'),
      icon: 'verified_user',
      color: '#16a34a',
      softColor: 'rgba(22, 163, 74, 0.12)',
    },
    {
      label: t('instructor.students.summaryCards.pending'),
      value: counts.pending.toLocaleString('th-TH'),
      caption: t('instructor.students.summaryCards.pendingCaption'),
      icon: 'pending_actions',
      color: '#f59e0b',
      softColor: 'rgba(245, 158, 11, 0.14)',
    },
    {
      label: t('instructor.students.summaryCards.issues'),
      value: counts.issue.toLocaleString('th-TH'),
      caption: t('instructor.students.summaryCards.issuesCaption'),
      icon: 'report_problem',
      color: '#dc2626',
      softColor: 'rgba(220, 38, 38, 0.12)',
    },
  ];
});

function hasSavedLearningResult(learner: LearnerRow): boolean {
  return Boolean(
    learner.importedGradeName ||
    learner.lmsFinalscore !== null ||
    learner.finalScore > 0 ||
    learner.resultNote.trim(),
  );
}

function needsLearningResultReview(learner: LearnerRow): boolean {
  if (learner.finalScore < 0 || learner.finalScore > 100) {
    return true;
  }

  if (!hasSavedLearningResult(learner)) {
    return false;
  }

  return learner.importedGradeName === null || learner.lmsFinalscore === null;
}

function getLearningResultSummaryForCourses(courses: Course[]) {
  return courses.reduce(
    (summary, course) => {
      const courseLearners = buildLearnersForCourse(course);
      const total = Math.max(course.enrolledCount, courseLearners.length);
      const saved = courseLearners.filter(hasSavedLearningResult).length;
      const review = courseLearners.filter(needsLearningResultReview).length;

      summary.total += total;
      summary.saved += saved;
      summary.review += review;
      return summary;
    },
    { total: 0, saved: 0, review: 0 },
  );
}

const learningResultSummaryCounts = computed(() => {
  const summary = selectedCourse.value
    ? {
        total: displayedEnrolledCount.value,
        saved: learners.value.filter(hasSavedLearningResult).length,
        review: learners.value.filter(needsLearningResultReview).length,
      }
    : getLearningResultSummaryForCourses(instructorCourses.value);

  return {
    ...summary,
    pending: Math.max(summary.total - summary.saved, 0),
  };
});

const learningResultSummaryCards = computed<RosterSummaryCard[]>(() => {
  const counts = learningResultSummaryCounts.value;
  return [
    {
      label: t('instructor.students.summaryCards.totalStudents'),
      value: counts.total.toLocaleString('th-TH'),
      caption: '',
      icon: 'groups',
      color: '#f5a623',
      softColor: 'rgba(245, 166, 35, 0.14)',
    },
    {
      label: t('instructor.students.summaryCards.recorded'),
      value: counts.saved.toLocaleString('th-TH'),
      caption: '',
      icon: 'task_alt',
      color: '#16a34a',
      softColor: 'rgba(22, 163, 74, 0.12)',
    },
    {
      label: t('instructor.students.summaryCards.pendingRecord'),
      value: counts.pending.toLocaleString('th-TH'),
      caption: '',
      icon: 'pending_actions',
      color: '#f59e0b',
      softColor: 'rgba(245, 158, 11, 0.14)',
    },
    {
      label: t('instructor.students.summaryCards.needsReview'),
      value: counts.review.toLocaleString('th-TH'),
      caption: '',
      icon: 'rule',
      color: '#dc2626',
      softColor: 'rgba(220, 38, 38, 0.12)',
    },
  ];
});

const studentHeroSummaryCards = computed<RosterSummaryCard[]>(() =>
  activeStudentTab.value === 'results'
    ? learningResultSummaryCards.value
    : rosterSummaryCards.value,
);

const filteredLearners = computed(() => {
  let result = learners.value;

  if (statusFilter.value && statusFilter.value !== '') {
    result = result.filter((l) => l.status === statusFilter.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (l) => l.name.toLowerCase().includes(query) || l.studentId.toLowerCase().includes(query),
    );
  }

  return result;
});

const rosterPageCount = computed(() =>
  Math.max(1, Math.ceil(filteredLearners.value.length / instructorTableRowsPerPage)),
);
const paginatedRosterLearners = computed(() =>
  filteredLearners.value.slice(
    (rosterTablePage.value - 1) * instructorTableRowsPerPage,
    rosterTablePage.value * instructorTableRowsPerPage,
  ),
);
const learningResultPageCount = computed(() =>
  Math.max(1, Math.ceil(filteredLearners.value.length / instructorTableRowsPerPage)),
);
const paginatedLearningResultLearners = computed(() =>
  filteredLearners.value.slice(
    (learningResultTablePage.value - 1) * instructorTableRowsPerPage,
    learningResultTablePage.value * instructorTableRowsPerPage,
  ),
);
const emptyLearnerStateMessage = computed(() => {
  if (searchQuery.value || statusFilter.value !== '') {
    return t('instructor.students.notFoundMsg');
  }

  return t('instructor.students.noEnrolledMsg');
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCourseDateRange(course: Course): string {
  return `${course.registrationStart} - ${course.registrationEnd}`;
}

function getCourseResultLearners(course: Course): LearnerRow[] {
  return buildLearnersForCourse(course);
}

function getCoursePassedCount(course: Course): number {
  return getCourseResultLearners(course).filter((learner) => learner.resultStatus === 'ผ่าน')
    .length;
}

function getCourseFailedCount(course: Course): number {
  return getCourseResultLearners(course).filter((learner) => learner.resultStatus === 'ไม่ผ่าน')
    .length;
}

function getLearningResultDownloadCode(): string {
  return 'CBS 003';
}

const studentCourseColumns = computed<BaseTableColumn[]>(() =>
  activeStudentTab.value === 'results'
    ? [
        {
          key: 'course',
          label: t('instructor.students.col.courseName'),
          width: '30%',
          sortable: true,
          sortKey: 'title',
        },
        {
          key: 'fee',
          label: t('instructor.students.col.fee'),
          width: '96px',
          align: 'center',
          sortable: true,
          sortKey: 'price',
        },
        {
          key: 'schedule',
          label: t('instructor.students.col.schedule'),
          width: '170px',
          align: 'center',
          sortable: true,
          sortKey: 'registrationStartDate',
        },
        {
          key: 'seats',
          label: t('instructor.students.col.capacity'),
          width: '86px',
          align: 'center',
          sortable: true,
          sortKey: 'maxSeats',
        },
        {
          key: 'enrolled',
          label: t('instructor.students.col.enrolled'),
          width: '92px',
          align: 'center',
          sortable: true,
          sortKey: 'enrolledCount',
        },
        {
          key: 'passed',
          label: t('instructor.students.col.passed'),
          width: '92px',
          align: 'center',
          sortable: true,
          sortValue: (course) => getCoursePassedCount(course as Course),
        },
        {
          key: 'failed',
          label: t('instructor.students.col.failed'),
          width: '92px',
          align: 'center',
          sortable: true,
          sortValue: (course) => getCourseFailedCount(course as Course),
        },
        {
          key: 'action',
          label: t('instructor.students.col.actions'),
          width: '88px',
          align: 'center',
        },
        {
          key: 'download',
          label: t('instructor.students.col.download'),
          width: '96px',
          align: 'center',
        },
      ]
    : [
        {
          key: 'course',
          label: t('instructor.students.col.courseName'),
          width: '30%',
          sortable: true,
          sortKey: 'title',
        },
        {
          key: 'fee',
          label: t('instructor.students.col.fee'),
          width: '96px',
          align: 'center',
          sortable: true,
          sortKey: 'price',
        },
        {
          key: 'schedule',
          label: t('instructor.students.col.schedule'),
          width: '170px',
          align: 'center',
          sortable: true,
          sortKey: 'registrationStartDate',
        },
        {
          key: 'seats',
          label: t('instructor.students.col.capacity'),
          width: '86px',
          align: 'center',
          sortable: true,
          sortKey: 'maxSeats',
        },
        {
          key: 'enrolled',
          label: t('instructor.students.col.enrolled'),
          width: '92px',
          align: 'center',
          sortable: true,
          sortKey: 'enrolledCount',
        },
        {
          key: 'action',
          label: t('instructor.students.col.actions'),
          width: '148px',
          align: 'center',
        },
      ],
);

const learnerColumns: BaseTableColumn[] = [
  { key: 'name', label: 'นิสิต', width: '280px', sortable: true },
  { key: 'email', label: 'อีเมล', width: '240px', sortable: true },
  { key: 'progress', label: 'ความก้าวหน้า', width: '190px', sortable: true },
  { key: 'lastActive', label: 'เข้าเรียนล่าสุด', align: 'center', width: '150px', sortable: true },
  { key: 'status', label: 'สถานะ', align: 'center', width: '150px', sortable: true },
  { key: 'actions', label: 'จัดการ', align: 'center', width: '92px' },
];

const learningResultColumns: BaseTableColumn[] = [
  { key: 'name', label: 'ผู้เรียน', sortable: true },
  { key: 'progress', label: 'ความก้าวหน้า', width: '180px', sortable: true },
  { key: 'score', label: 'คะแนนปัจจุบัน', width: '140px', sortable: true },
  { key: 'finalScore', label: 'คะแนนผลการเรียน', width: '170px', sortable: true },
  { key: 'resultStatus', label: 'ผลการเรียน', width: '150px', sortable: true },
  { key: 'note', label: 'หมายเหตุ', width: '220px', sortable: true },
];

const learningResultEntryColumns: BaseTableColumn[] = [
  { key: 'studentId', label: 'รหัสผู้เรียน', width: '150px', align: 'center', sortable: true },
  { key: 'name', label: 'ชื่อ-สกุล', width: '220px', sortable: true },
  {
    key: 'lmsScore',
    label: 'คะแนน LMS',
    width: '130px',
    align: 'center',
    sortable: true,
    sortValue: (row) => Number((row as LearnerRow).lmsFinalscore ?? (row as LearnerRow).score ?? -1),
  },
  {
    key: 'importedGradeName',
    label: 'ผลการเรียน',
    width: '120px',
    align: 'center',
    sortable: true,
  },
  {
    key: 'lmsSyncedAt',
    label: 'วันที่ sync คะแนน',
    width: '170px',
    align: 'center',
    sortable: true,
  },
  {
    key: 'gradeUpdatedAt',
    label: 'วันที่อัปเดตเกรด',
    width: '170px',
    align: 'center',
    sortable: true,
    sortValue: (row) => (row as LearnerRow).resultUpdatedAt,
  },
  { key: 'detail', label: 'รายละเอียด', width: '140px', align: 'center' },
];

function setRosterTablePage(page: number): void {
  rosterTablePage.value = page;
}

function setLearningResultTablePage(page: number): void {
  learningResultTablePage.value = page;
}

function setCourseListPage(page: number): void {
  courseListPage.value = page;
}

watch(filteredLearners, () => {
  rosterTablePage.value = 1;
  learningResultTablePage.value = 1;
});

watch([courseSearch, activeStudentTab], () => {
  courseListPage.value = 1;
});

watch(courseListPageCount, (pageCount) => {
  courseListPage.value = Math.min(courseListPage.value, pageCount);
});

watch(rosterPageCount, (pageCount) => {
  rosterTablePage.value = Math.min(rosterTablePage.value, pageCount);
});

watch(learningResultPageCount, (pageCount) => {
  learningResultTablePage.value = Math.min(learningResultTablePage.value, pageCount);
});

function switchTab(tab: string): void {
  const base = tab === 'results' ? '/instructor/results' : '/instructor/students';
  void router.push({
    path: base,
    query: selectedCourseId.value ? { courseId: selectedCourseId.value } : {},
  });
}

function selectCourse(courseId: string): void {
  selectedCourseId.value = courseId;
  selectedLearner.value = null;
  void router.push({
    query: { courseId },
  });
}

function onSelectCourseClick(courseId: string, event: Event) {
  if (isNewTabClick(event)) return;
  event.preventDefault();
  event.stopPropagation();
  selectCourse(courseId);
}

function clearSelectedCourse(): void {
  selectedCourseId.value = '';
  selectedLearner.value = null;
  clearFilters();
  const nextQuery = { ...route.query };
  delete nextQuery.courseId;
  void router.replace({ query: nextQuery });
}

function onClearSelectedCourseClick(event: Event) {
  if (isNewTabClick(event)) return;
  event.preventDefault();
  clearSelectedCourse();
}

function clearFilters(): void {
  searchQuery.value = '';
  statusFilter.value = '';
}

function openLearnerDetail(_event: Event | null, learner: LearnerRow): void {
  selectedLearner.value = learner;
  learnerDetailDialogOpen.value = true;
}

function openGradePanel(learner: LearnerRow): void {
  panelRow.value = learner;
  panelOpen.value = true;
}

function closeGradePanel(): void {
  panelOpen.value = false;
}

function moodleGraderPath(cmid: number | null, moodleUserId: number | null): string | null {
  if (!cmid || !moodleUserId) return null;
  return `/mod/assign/view.php?id=${cmid}&action=grader&userid=${moodleUserId}`;
}

function moodleGraderKey(item: GradeItemBreakdown, learner: LearnerRow | null | undefined): string {
  return `${item.cmid ?? 'none'}:${learner?.moodleUserId ?? 'none'}`;
}

function canOpenMoodleGrader(
  item: GradeItemBreakdown,
  learner: LearnerRow | null | undefined,
): boolean {
  return Boolean(selectedCourse.value?.moodleId && item.cmid && learner?.moodleUserId);
}

async function openMoodleGrader(
  item: GradeItemBreakdown,
  learner: LearnerRow | null | undefined,
): Promise<void> {
  const course = selectedCourse.value;
  const username = authStore.user?.username ?? authStore.user?.email ?? '';
  const wantsurl = moodleGraderPath(item.cmid, learner?.moodleUserId ?? null);
  if (!course?.moodleId || !username || !wantsurl) return;

  const key = moodleGraderKey(item, learner);
  openingMoodleGraderKey.value = key;
  try {
    const url = await getMoodleActivityUrl(course.moodleId, username, wantsurl);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    $q.notify({
      type: 'negative',
      icon: 'error',
      message: 'ไม่สามารถเปิดหน้า Moodle สำหรับตรวจงานได้',
    });
  } finally {
    if (openingMoodleGraderKey.value === key) openingMoodleGraderKey.value = null;
  }
}

async function saveLearningResults(): Promise<void> {
  const course = selectedCourse.value;
  const email = authStore.user?.email;
  if (!course || !email) return;
  syncingResults.value = true;
  try {
    await instructorBackend.fetchGrades(email, course.id);
    $q.notify({
      type: 'positive',
      icon: 'refresh',
      message: t('instructor.students.updatedMsg'),
    });
  } finally {
    syncingResults.value = false;
  }
}

async function importLearningResults(): Promise<void> {
  const readyRows = detailPreviewRows.value.filter(
    (row) => row.matched && row.gradeItemId !== null,
  );

  if (readyRows.length === 0) {
    $q.notify({
      type: 'warning',
      icon: 'error',
      message: t('instructor.students.noImportDataMsg'),
    });
    return;
  }

  const course = selectedCourse.value;
  const email = authStore.user?.email;
  if (!course || !email) return;

  const gradeNameById = new Map(gradeItemOptions.value.map((option) => [option.id, option.name]));
  const items = readyRows.map((row) => ({
    userCode: row.studentId,
    gradeText: gradeNameById.get(row.gradeItemId as number) ?? row.gradeText,
    gradeItemId: row.gradeItemId as number,
  }));

  savingGrades.value = true;
  try {
    const result = await instructorBackend.importGrades(email, course.id, items);
    if (!result) {
      $q.notify({
        type: 'negative',
        icon: 'error',
        message: t('instructor.students.importErrorMsg'),
      });
      return;
    }
    resultImportText.value = '';
    detailPreviewRows.value = [];
    if (result.saved > 0) {
      $q.notify({
        type: 'positive',
        icon: 'upload_file',
        message: t('instructor.students.importSavedMsg', {
          count: result.saved.toLocaleString('th-TH'),
        }),
      });
    }
    if (result.failed > 0) {
      $q.notify({
        type: 'warning',
        message: t('instructor.students.importFailedMsg', {
          count: result.failed,
          codes: result.errors.map((e) => e.userCode).join(', '),
        }),
        timeout: 6000,
      });
    }
    await instructorBackend.fetchGrades(email, course.id);
  } finally {
    savingGrades.value = false;
  }
}

function triggerGradeImportFile(): void {
  gradeImportFileInput.value?.click();
}

function onGradeImportFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    resultImportText.value = typeof reader.result === 'string' ? reader.result : '';
    input.value = '';
  };
  reader.readAsText(file, 'utf-8');
}

function downloadGradeImportTemplate(): void {
  const rows = learners.value.map((learner) => [learner.studentId, 'A']);
  const csvRows = [['รหัสผู้เรียน', 'เกรด'], ...rows]
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\r\n');
  const blob = new Blob([`\uFEFF${csvRows}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFileName(`${selectedCourse.value?.code ?? 'course'}-grade-template`)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function fillAllStudents(): void {
  resultImportText.value = learners.value.map((l) => l.studentId).join('\n');
}

function fillStudentsWithoutGrade(): void {
  resultImportText.value = learners.value
    .filter((l) => !l.importedGradeName)
    .map((l) => l.studentId)
    .join('\n');
}

async function pullScoresFromLms(): Promise<void> {
  const course = selectedCourse.value;
  const email = authStore.user?.email;
  if (!course || !email) return;

  syncingScores.value = true;
  try {
    const result = await instructorBackend.syncScores(email, course.id);
    if (result) {
      $q.notify({
        type: 'info',
        icon: 'cloud_download',
        message: `ดึงคะแนนจาก LMS แล้ว ${result.synced} รายการ`,
      });
      await instructorBackend.fetchGrades(email, course.id);
    }
  } finally {
    syncingScores.value = false;
  }
}

function openApproveDialog(): void {
  approveForm.value = {
    detail: '',
    date: new Date().toISOString().slice(0, 10),
  };
  approveDialogOpen.value = true;
}

async function confirmApproveGrades(): Promise<void> {
  const course = selectedCourse.value;
  const email = authStore.user?.email;
  if (!course || !email) return;

  const detail = approveForm.value.detail.trim();

  approvingGrades.value = true;
  try {
    const numericId = String(course.id).replace(/^db-/, '');
    const { data } = await api.patch<{
      approved: number;
      skipped: number;
      approvedBy: string;
      approvedAt: string;
    }>(`/api/instructor/courses/${numericId}/approve-grades?email=${encodeURIComponent(email)}`, {
      approveDetail: detail,
      approveDate: approveForm.value.date,
    });
    approvalStatus.value = { approvedBy: data.approvedBy, approvedAt: data.approvedAt };
    approveDialogOpen.value = false;
    $q.notify({
      type: 'positive',
      icon: 'how_to_reg',
      message: t('instructor.students.approvedMsg', { count: data.approved }),
    });
    await instructorBackend.fetchGrades(email, course.id);
  } catch (err) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      t('instructor.students.approveErrorMsg');
    console.error('approveGrades error:', err);
    $q.notify({ type: 'negative', icon: 'error', message: msg });
  } finally {
    approvingGrades.value = false;
  }
}

function getLearnerLmsScore(learner: LearnerRow): string {
  if (learner.lmsFinalscore !== null) return Number(learner.lmsFinalscore).toFixed(2);
  const pendingResult = pendingLearningResults.value[learner.studentId];
  const savedResult = importedLearningResults.value[learner.studentId];
  const score = pendingResult?.score ?? savedResult?.score;
  return score === undefined ? '' : score.toFixed(2);
}

function exportLearnerListCsv(course: Course | undefined): void {
  if (!course) return;
  const learnerList = getCourseResultLearners(course);
  const headers = [
    'ลำดับ',
    'รหัสผู้เรียน',
    'ชื่อ-นามสกุล',
    'อีเมล',
    'สถานะการชำระเงิน',
    'วันที่ลงทะเบียน',
  ];
  const rows = learnerList.map((learner, index) => [
    index + 1,
    learner.studentId,
    learner.name,
    learner.email,
    learner.paymentStatus,
    learner.enrolledAt,
  ]);
  const csvRows = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csvRows}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFileName(`รายชื่อผู้เรียน-${course.code}`)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function getAuthUserDisplayName(): string {
  const nameTh = [authStore.user?.firstNameTh, authStore.user?.lastNameTh]
    .filter(Boolean)
    .join(' ')
    .trim();
  const nameEn = [authStore.user?.firstNameEn, authStore.user?.lastNameEn]
    .filter(Boolean)
    .join(' ')
    .trim();
  return nameTh || nameEn || authStore.user?.username || authStore.user?.email || '';
}

async function getInstructorDocumentIdentity(): Promise<{ prefix: string; name: string }> {
  await authStore.fetchProfile().catch(() => undefined);
  let prefix = '';
  try {
    const { data } = await api.get<{
      prefix: string | null;
    }>('/api/instructor/profile');
    prefix = data.prefix ?? '';
  } catch {
    prefix = '';
  }
  return { prefix, name: getAuthUserDisplayName() };
}

async function printGradeForm(course: Course | undefined): Promise<void> {
  if (!course) return;
  const { prefix: instructorPrefix, name: instructorName } =
    await getInstructorDocumentIdentity();
  const learnerList = getCourseResultLearners(course);
  const printDate = new Date().toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const tableRows = learnerList
    .map(
      (learner, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${learner.studentId}</td>
      <td>${learner.name}</td>
      <td>${learner.lmsFinalscore !== null ? Number(learner.lmsFinalscore).toFixed(2) : ''}</td>
      <td>${learner.importedGradeName ?? ''}</td>
    </tr>`,
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8"/>
<title>ใบส่งเกรด ${course.code}</title>
<style>
  body { font-family: 'Sarabun', sans-serif; font-size: 14px; margin: 40px; color: #000; }
  .header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
  .header img { width: 64px; height: 64px; object-fit: contain; }
  .header-title h1 { font-size: 18px; font-weight: bold; margin: 0; }
  .header-title p { margin: 0; font-size: 13px; }
  .meta { margin-bottom: 16px; line-height: 2; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { border: 1px solid #000; padding: 6px 10px; text-align: left; }
  th { background: #f0f0f0; text-align: center; }
  td:first-child, td:nth-child(4), td:nth-child(5) { text-align: center; }
  .footer { margin-top: 60px; display: flex; justify-content: space-between; }
  .sig { text-align: center; }
  .sig-line { border-top: 1px solid #000; width: 200px; margin: 0 auto 4px; }
  .print-date { margin-top: 8px; font-size: 12px; text-align: right; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
<div class="header">
  <img src="${window.location.origin}${buuLogoUrl}" alt="BUU Logo"/>
  <div class="header-title">
    <h1>มหาวิทยาลัยบูรพา</h1>
    <p>ใบส่งเกรด ระบบคลังหน่วยกิต</p>
  </div>
</div>
<div class="meta">
  <div><strong>รายวิชา</strong> ${course.code} : ${course.title}</div>
  <div><strong>ผู้สอน</strong> ${[instructorPrefix, instructorName].filter(Boolean).join(' ') || '-'}</div>
  <div><strong>การเรียนการสอน</strong> ${course.registrationStart ?? ''} - ${course.registrationEnd ?? ''}</div>
</div>
<table>
  <thead>
    <tr>
      <th>ลำดับ</th>
      <th>รหัสผู้เรียน</th>
      <th>ชื่อ-สกุล</th>
      <th>คะแนน</th>
      <th>ผลการเรียน</th>
    </tr>
  </thead>
  <tbody>${tableRows}</tbody>
</table>
<div class="footer">
  <div class="sig">
    <div class="sig-line"></div>
    <div>(${[instructorPrefix, instructorName].filter(Boolean).join(' ') || '................................'})</div>
    <div>__/__/__</div>
  </div>
  <div class="sig">
    <div class="sig-line"></div>
    <div>คณบดี</div>
    <div>__/__/__</div>
  </div>
</div>
<div class="print-date">วันที่พิมพ์ : ${printDate} Page 1/1</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

async function printCbs003(course: Course | undefined): Promise<void> {
  if (!course) return;
  const email = authStore.user?.email ?? '';
  const { prefix: instructorPrefix, name: instructorName } =
    await getInstructorDocumentIdentity();

  // Ensure data is loaded before printing
  const courseKey = String(course.id).startsWith('db-') ? course.id : `db-${course.id}`;
  if (!instructorBackend.learnersByCourseId.value[courseKey]) {
    await instructorBackend.fetchLearners(email, course.id, course.moodleId ?? null);
    await instructorBackend.fetchGrades(email, course.id);
  }

  const learnerList = getCourseResultLearners(course);
  const passed = learnerList.filter((l) => l.resultStatus === 'ผ่าน').length;
  const failed = learnerList.filter((l) => l.resultStatus === 'ไม่ผ่าน').length;
  const noGrade = learnerList.filter((l) => !l.importedGradeName).length;
  const printDate = new Date().toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const learnerRows = learnerList
    .map(
      (learner, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${learner.studentId}</td>
      <td>${learner.name}</td>
      <td>${learner.lmsFinalscore !== null ? Number(learner.lmsFinalscore).toFixed(2) : ''}</td>
      <td>${learner.importedGradeName ?? ''}</td>
    </tr>`,
    )
    .join('');

  const instructorFullName = [instructorPrefix, instructorName].filter(Boolean).join(' ');
  const totalEnrolled = learnerList.length;
  const maxSeats = course.enrolledCount ?? totalEnrolled;

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8"/>
<title>BUU-CBS 003 ${course.code}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Sarabun', sans-serif; font-size: 14px; margin: 0; padding: 0; color: #000; line-height: 1.8; }
  .wrap { width: 160mm; margin: 0 auto; padding: 15mm 0; }
  .header-box { border: 1px solid #000; padding: 4px 12px; float: right; font-size: 13px; font-weight: bold; }
  .title-block { text-align: center; margin: 16px 0 24px; clear: both; }
  .title-block p { margin: 2px 0; font-size: 15px; font-weight: bold; }
  .sub { margin-left: 24px; margin-bottom: 2px; }
  .sub2 { margin-left: 48px; margin-bottom: 2px; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0 12px; font-size: 13px; }
  tr { page-break-inside: avoid; }
  th, td { border: 1px solid #000; padding: 5px 8px; text-align: left; }
  th { background: #f5f5f5; text-align: center; font-weight: bold; }
  td.center { text-align: center; }
  .no-data td { text-align: center; color: #666; }
  .print-date { margin-top: 24px; font-size: 11px; text-align: right; color: #666; }
  @media print {
    @page { margin: 15mm 25mm; size: A4; }
    .wrap { width: 100%; padding: 0; }
  }
</style>
</head>
<body>
<div class="wrap">
<div class="header-box">BUU-CBS 003</div>
<div style="clear:both"></div>
<div class="title-block">
  <p>แบบฟอร์ม</p>
  <p>รายงานสรุปผลการจัดรายวิชา/ ชุดวิชา เพื่อสะสมในระบบคลังหน่วยกิต</p>
  <p>มหาวิทยาลัยบูรพา</p>
</div>

<p><strong>1. ข้อมูลทั่วไป</strong></p>
<div class="sub">1.1 ชื่อรายวิชา/ ชุดวิชา:&nbsp;&nbsp; ภาษาไทย ${course.title ?? ''}</div>
<div class="sub2">ภาษาอังกฤษ ${course.titleEn ?? '-'}</div>
<div class="sub">1.2 จำนวน ${course.totalHours ?? '-'} หน่วยกิต</div>
<div class="sub">1.3 ชื่อหลักสูตรที่ส่งสะสมหน่วยกิต
  <table>
    <thead><tr><th>ลำดับ</th><th>ชื่อรายวิชา</th><th>หลักสูตร</th><th>หน่วยกิต</th><th>จำนวนหน่วยกิตที่สะสม</th></tr></thead>
    <tbody><tr class="no-data"><td colspan="5">ไม่พบข้อมูล</td></tr></tbody>
  </table>
</div>
<div class="sub">1.4 ชื่อส่วนงานที่รับผิดชอบ ${course.faculty ?? '-'}</div>
<div class="sub">1.5 ชื่อส่วนงานหรือสถานประกอบการที่ร่วมจัดการเรียนการสอน (ถ้ามี และสามารถจัดร่วม มากกว่า 1 ส่วนงานได้)
  <div class="sub">1.5.1 ชื่อส่วนงานที่ร่วมจัดการเรียนการสอน -</div>
  <div class="sub">1.5.2 ชื่อสถานประกอบการที่ร่วมจัดการเรียนการสอน -</div>
</div>
<div class="sub">1.6 อาจารย์ผู้รับผิดชอบรายวิชา/ ชุดวิชา (ชื่อ-สกุล)
  <table>
    <thead><tr><th>ลำดับ</th><th>ชื่อ -สกุล</th><th>อีเมล</th><th>เบอร์โทรศัพท์</th></tr></thead>
    <tbody><tr><td class="center">1</td><td>${instructorFullName || '-'}</td><td>${email}</td><td></td></tr></tbody>
  </table>
</div>
<div class="sub">1.7 อาจารย์ผู้สอนรายวิชา/ ชุดวิชา (ชื่อ-สกุล)
  <table>
    <thead><tr><th>ลำดับ</th><th>ชื่อ -สกุล</th><th>อีเมล</th><th>เบอร์โทรศัพท์</th></tr></thead>
    <tbody><tr><td class="center">1</td><td>${instructorFullName || '-'}</td><td>${email}</td><td></td></tr></tbody>
  </table>
</div>
<div class="sub">1.8 ระยะเวลาในการดำเนินการ ตั้งแต่วันที่ ${course.registrationStart ?? '-'} ถึงวันที่ ${course.registrationEnd ?? '-'}</div>

<br/>
<table>
  <thead>
    <tr>
      <th>ลำดับ</th><th>รหัสผู้เรียน</th><th>ชื่อ-สกุล</th><th>คะแนน</th><th>ผลการเรียน</th>
    </tr>
  </thead>
  <tbody>${learnerRows || `<tr class="no-data"><td colspan="5">ไม่มีข้อมูล</td></tr>`}</tbody>
</table>

<table style="margin-top:8px">
  <thead>
    <tr><th>รับ</th><th>ลง</th><th>ผ่าน</th><th>ไม่ผ่าน</th><th>ดำเนินการ</th></tr>
  </thead>
  <tbody>
    <tr>
      <td class="center">${maxSeats}</td>
      <td class="center">${totalEnrolled}</td>
      <td class="center">${passed}</td>
      <td class="center">${failed}</td>
      <td class="center">${noGrade}</td>
    </tr>
  </tbody>
</table>

<div class="print-date">วันที่พิมพ์ : ${printDate}</div>
</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

function sanitizeFileName(value: string): string {
  return value
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function escapeCsvCell(value: string | number): string {
  const text = String(value);
  if (!/[",\r\n]/.test(text)) {
    return text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

function buildLearnerExportRows(): Array<Array<string | number>> {
  return filteredLearners.value.map((learner, index) => [
    index + 1,
    learner.studentId,
    learner.name,
    learner.email,
    learner.faculty,
    learner.department,
    learner.phone,
    learner.progress,
    learner.score,
    learner.status,
    learner.paymentStatus,
    learner.enrolledAt,
    learner.lastActive,
  ]);
}

function getLearnerExportFileBase(): string {
  const course = selectedCourse.value;
  const code = course?.code ?? 'course';
  return sanitizeFileName(`learner-roster-${code}`);
}

function exportLearnersCsv(): void {
  if (!selectedCourse.value || filteredLearners.value.length === 0) return;

  const headers = [
    'ลำดับ',
    'รหัสผู้เรียน',
    'ชื่อ-นามสกุล',
    'อีเมล',
    'คณะ/หน่วยงาน',
    'สาขา',
    'เบอร์โทร',
    'ความก้าวหน้า (%)',
    'คะแนน',
    'สถานะ',
    'สถานะชำระเงิน',
    'วันที่ลงทะเบียน',
    'เข้าเรียนล่าสุด',
  ];
  const csvRows = [headers, ...buildLearnerExportRows()]
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\r\n');
  const blob = new Blob([`\uFEFF${csvRows}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${getLearnerExportFileBase()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function exportLearnersPdf(): void {
  const course = selectedCourse.value;
  if (!course || filteredLearners.value.length === 0) return;

  const printedAt = new Date().toLocaleString('th-TH');
  const rows = buildLearnerExportRows()
    .map(
      (row) => `
        <tr>
          ${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}
        </tr>
      `,
    )
    .join('');

  const printWindow = window.open('', '_blank', 'width=1120,height=800');
  if (!printWindow) return;

  printWindow.document.write(`<!doctype html>
    <html lang="th">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(getLearnerExportFileBase())}</title>
        <style>
          @page { size: A4 landscape; margin: 12mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: #172033;
            font-family: "Noto Sans Thai", "TH Sarabun New", Arial, sans-serif;
            font-size: 11px;
          }
          h1 {
            margin: 0 0 4px;
            color: #09213f;
            font-size: 20px;
          }
          .meta {
            display: grid;
            gap: 2px;
            margin-bottom: 14px;
            color: #475569;
            font-size: 11px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th,
          td {
            padding: 6px 7px;
            border: 1px solid #dce4ee;
            text-align: left;
            vertical-align: top;
          }
          th {
            color: #0f172a;
            background: #e7e7e7;
            font-weight: 800;
          }
        </style>
      </head>
      <body>
        <h1>รายชื่อผู้เรียน</h1>
        <div class="meta">
          <span>${escapeHtml(course.code)} : ${escapeHtml(course.titleEn || course.title)}</span>
          <span>จำนวน ${filteredLearners.value.length.toLocaleString('th-TH')} รายการ | พิมพ์เมื่อ ${escapeHtml(printedAt)}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>รหัสผู้เรียน</th>
              <th>ชื่อ-นามสกุล</th>
              <th>อีเมล</th>
              <th>คณะ/หน่วยงาน</th>
              <th>สาขา</th>
              <th>เบอร์โทร</th>
              <th>ก้าวหน้า</th>
              <th>คะแนน</th>
              <th>สถานะ</th>
              <th>ชำระเงิน</th>
              <th>ลงทะเบียน</th>
              <th>ล่าสุด</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <script>
          window.onload = () => {
            window.focus();
            window.print();
          };
        <${'/'}script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
</script>

<style lang="scss" scoped>
.instructor-students-page {
  min-height: 100vh;
  background: #f6f8fb;
}

.instructor-students {
  width: 100%;
  max-width: none;
  padding: 0 24px 56px;
}

.students-hero,
.student-roster-panel,
.student-course-card {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.students-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px;
  margin-bottom: 22px;

  h1 {
    margin: 0;
    color: #09213f;
    font-size: 1.8rem;
    font-weight: 900;
  }

  p {
    margin: 6px 0 0;
    color: #64748b;
    font-size: 0.95rem;
    font-weight: 700;
  }
}

.students-hero__eyebrow,
.student-course-card__code,
.student-course-row__code {
  color: $primary;
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
}

.student-course-list-panel {
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.student-roster-search {
  flex: 1 1 320px;
  min-width: min(320px, 100%);
}

.student-course-list-search {
  width: min(320px, 100%);
}

.student-course-list__empty {
  padding: 28px 16px;
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 800;
  text-align: center;
}

.student-course-list-pagination {
  justify-content: flex-end;
  padding: 18px 22px 22px;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
  overflow-x: auto;
}

.student-breadcrumb-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: -8px 0 22px;
  color: #6b7280;
  font-size: 0.95rem;
  font-weight: 800;
}

.student-breadcrumb-nav__item {
  border: 0;
  background: transparent;
  font: inherit;
}

.student-breadcrumb-nav__item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 36px;
  padding: 4px 2px;
  color: #6b7280;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: $primary;
  }
}

.student-breadcrumb-nav__item--current {
  min-width: 0;
  max-width: min(560px, 100%);
  overflow: hidden;
  color: #111827;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: default;

  &:hover {
    color: #111827;
  }
}

.student-breadcrumb-nav__separator {
  flex: 0 0 auto;
  color: #d1d5db;
}

.student-course-list-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 20px 22px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);

  h2 {
    margin: 0;
    color: #09213f;
    font-size: 1.18rem;
    font-weight: 900;
  }

  span {
    display: block;
    margin-top: 3px;
    color: #64748b;
    font-size: 0.84rem;
    font-weight: 800;
  }
}

.student-course-list {
  display: grid;
}

.student-roster-hero-summary,
.student-roster-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(132px, 1fr));
  gap: 14px;
}

.student-hero-actions {
  display: grid;
  gap: 14px;
  width: min(720px, 100%);
}

.student-roster-hero-summary {
  width: min(720px, 100%);
}

.student-roster-summary-grid {
  padding: 16px 18px;
}

.student-roster-panel > .student-roster-summary-grid {
  padding: 0;
  margin-bottom: 16px;
}

.student-roster-summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 78px;
  padding: 14px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 14px;
  background: linear-gradient(135deg, var(--summary-soft), rgba(255, 255, 255, 0.96) 48%), #ffffff;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
}

.student-roster-summary-card__icon {
  display: grid;
  place-items: center;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--summary-soft);
  color: var(--summary-accent);
  font-size: 23px;
}

.student-roster-summary-card div:last-child {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.student-roster-summary-card span {
  color: #64748b;
  margin-top: 4px;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.25;
}

.student-roster-summary-card strong {
  color: #09213f;
  font-size: 1.48rem;
  font-weight: 800;
  line-height: 1.1;
}

.student-roster-summary-card small {
  color: #94a3b8;
  font-size: 0.68rem;
  font-weight: 800;
  line-height: 1.22;
}

.student-roster-summary-card--hero {
  min-height: 78px;
  padding: 14px;
  border-color: rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(4px);
}

.student-roster-summary-card--hero .student-roster-summary-card__icon {
  background: rgba(255, 255, 255, 0.9);
}

.student-roster-summary-card--hero span,
.student-roster-summary-card--hero small {
  color: rgba(255, 255, 255, 0.76);
}

.student-roster-summary-card--hero strong {
  color: #ffffff;
}

.certificate-hero-actions {
  display: grid;
  gap: 14px;
  width: min(720px, 100%);
}

.certificate-hero-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(132px, 1fr));
  gap: 14px;
  width: min(720px, 100%);
}

.certificate-summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 78px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(4px);
}

.certificate-summary-card__icon {
  display: grid;
  place-items: center;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--summary-accent);
  font-size: 23px;
}

.certificate-summary-card div:last-child {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.certificate-summary-card strong {
  color: #ffffff;
  font-size: 1.48rem;
  font-weight: 800;
  line-height: 1.1;
}

.certificate-summary-card span {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.25;
}

.student-course-table__title-layout {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  min-width: 320px;
}

.student-course-table__image {
  display: block;
  width: 108px;
  max-width: 108px;
  height: 76px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 7px 18px rgba(15, 23, 42, 0.09);
}

.student-course-table__copy {
  min-width: 0;
}

.student-course-table__link {
  display: block;
  padding: 0;
  border: 0;
  background: transparent;
  color: #172033;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 900;
  line-height: 1.45;
  text-align: left;
  cursor: pointer;
  transition: color 0.18s ease;

  &:hover {
    color: $primary;
  }
}

.student-course-table__subtitle {
  display: block;
  margin-top: 5px;
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 700;
  line-height: 1.45;
}

.student-course-table__schedule {
  display: grid;
  gap: 4px;
  justify-items: center;
  color: #26364d;
  font-size: 0.76rem;
  font-weight: 600;
  line-height: 1.42;

  > div {
    color: #64748b;
    font-size: 0.72rem;
    font-weight: 800;
  }

  > strong {
    color: #172033;
    font-size: 0.78rem;
    font-weight: 900;
  }
}

.student-course-table__actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.student-course-table__action-btn {
  min-width: 132px;
}

.student-course-table__download-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 900;
  line-height: 1.2;
  cursor: pointer;
  transition: color 0.18s ease;

  &:hover {
    color: $primary;
  }
}

.learning-result-table-scroll {
  display: block;
  overflow-x: auto;
}

.learning-result-course-table {
  width: 100%;
  min-width: 1080px;
  table-layout: fixed;
  border-collapse: collapse;
  border-spacing: 0;
  color: #172033;
  font-size: 0.82rem;

  th,
  td {
    padding: 14px 10px;
    border: 1px solid #dce4ee;
    vertical-align: middle;
    overflow-wrap: break-word;
  }

  th {
    height: 54px;
    color: #0f172a;
    background: #e7e7e7;
    font-size: 0.76rem;
    font-weight: 900;
    line-height: 1.35;
    text-align: center;
    white-space: nowrap;
  }

  tbody tr {
    background: #ffffff;
    transition: background-color 0.16s ease;
  }

  tbody tr:hover {
    background: rgba(37, 99, 235, 0.03);
  }
}

.learning-result-col-index {
  width: 58px;
}

.learning-result-col-title {
  width: 34%;
}

.learning-result-col-fee {
  width: 10%;
}

.learning-result-col-schedule {
  width: 14%;
}

.learning-result-col-seat,
.learning-result-col-enrolled,
.learning-result-col-pass,
.learning-result-col-fail {
  width: 6%;
}

.learning-result-col-actions,
.learning-result-col-download {
  width: 9%;
}

.learning-result-title-cell {
  button {
    display: block;
    padding: 0;
    border: 0;
      color: #172033;
    background: transparent;
    font: inherit;
    font-size: 0.86rem;
    font-weight: 900;
    line-height: 1.45;
    text-align: left;
    cursor: pointer;

    &:hover {
      color: $primary;
    }
  }

  span {
    display: block;
    margin-top: 4px;
    color: #64748b;
    font-size: 0.74rem;
    font-weight: 700;
    line-height: 1.4;
  }
}

.learning-result-schedule-cell {
  color: #172033;
  font-size: 0.76rem;
  font-weight: 800;
  line-height: 1.42;
  vertical-align: middle !important;

  span {
    display: block;
    color: #64748b;
    font-size: 0.7rem;
    font-weight: 800;
  }

  strong {
    display: block;
    margin-top: 4px;
  }
}

.learning-result-icon-btn {
  --action-color: var(--admin-gold, #f5a623);
  --action-border: rgba(245, 166, 35, 0.28);
  --action-ring: rgba(245, 166, 35, 0.1);
  width: 34px;
  height: 34px;
  min-height: 34px;
  background: #ffffff !important;
  color: var(--action-color) !important;
  border: 1px solid var(--action-border) !important;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06) !important;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;

  :deep(.q-icon) {
    font-size: 17px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 8px 18px rgba(15, 23, 42, 0.12),
      0 0 0 1px var(--action-ring) !important;
  }
}

.learning-result-download-link {
  padding: 0;
  border: 0;
  color: #475569;
  background: transparent;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 900;
  cursor: pointer;

  &:hover {
    color: $primary;
    text-decoration: underline;
  }
}

.learning-result-empty-cell {
  padding: 34px 16px !important;
  color: #94a3b8;
  font-weight: 700;
  text-align: center;
}

.student-course-row {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr) 96px 96px 164px;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 16px 18px;
  border: 0;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  background: #ffffff;
  cursor: pointer;
  text-align: left;
  transition:
    background-color 0.18s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background: rgba(37, 99, 235, 0.03);
    box-shadow: inset 4px 0 0 $primary;
  }

  &:last-child {
    border-bottom: 0;
  }

  img {
    width: 112px;
    height: 72px;
    border-radius: 10px;
    object-fit: cover;
    box-shadow: 0 7px 18px rgba(15, 23, 42, 0.08);
  }

  h3 {
    display: -webkit-box;
    overflow: hidden;
    margin: 4px 0 3px;
    color: #09213f;
    font-size: 1rem;
    font-weight: 900;
    line-height: 1.35;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  p {
    display: -webkit-box;
    overflow: hidden;
    margin: 0;
    color: #64748b;
    font-size: 0.78rem;
    font-weight: 700;
    line-height: 1.4;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    line-clamp: 1;
  }
}

.student-course-row__body {
  min-width: 0;
}

.student-course-row__metric {
  display: grid;
  justify-items: center;
  gap: 2px;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 800;

  strong {
    color: #09213f;
    font-size: 1.12rem;
    font-weight: 900;
  }
}

.student-course-row__action {
  min-height: 44px;
}

.student-roster-panel {
  padding: 18px;
}

.learning-result-import-page {
  display: grid;
  gap: 18px;
}

.learning-result-course-info {
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr);
  gap: 9px 18px;
  max-width: 720px;
  margin: 0 auto;
  color: #172033;
  font-size: 0.9rem;
  font-weight: 800;

  div,
  p {
    display: contents;
  }

  span:first-child {
    color: #475569;
    text-align: right;
  }

  strong {
    color: $primary;
    font-weight: 900;
  }

  p {
    margin: 0;
  }

  p span {
    text-align: left;
  }
}

.learning-result-import-grid {
  display: grid;
  grid-template-columns: 70px minmax(320px, 1fr) minmax(320px, 0.95fr);
  gap: 10px 16px;
  align-items: start;
}

.learning-result-import-label {
  padding-top: 8px;
  color: #475569;
  font-size: 0.88rem;
  font-weight: 800;
  text-align: right;
}

.learning-result-import-workspace {
  display: grid;
  gap: 10px;
}

.learning-result-import-toolbar {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.learning-result-import-tool-btn {
  font-size: 0.82rem;
}

.learning-result-import-action-btn {
  width: 100%;
  font-size: 0.82rem;
}

.learning-result-import-input :deep(textarea) {
  min-height: 200px;
  max-height: 480px;
  resize: vertical;
}

.learning-result-import-preview {
  display: grid;
  gap: 8px;
  padding: 10px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 10px;
  background: #f8fafc;
}

.learning-result-import-preview__summary {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 0.86rem;
  font-weight: 900;
}

.learning-result-import-preview__rows {
  display: grid;
  gap: 6px;
}

.learning-result-import-preview__row {
  display: grid;
  grid-template-columns: 78px minmax(92px, 1fr) 48px minmax(120px, 1.2fr);
  gap: 8px;
  align-items: center;
  color: #166534;
  font-size: 0.82rem;
  font-weight: 800;

  span,
  small {
    color: #64748b;
  }

  em {
    font-style: normal;
    color: #09213f;
    font-weight: 900;
  }
}

.learning-result-import-preview__row--invalid {
  color: #dc2626;
}

.learning-result-import-help {
  min-height: 180px;
  padding: 14px 16px;
  background: #c7f5d9;
  color: #14532d;
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.45;

  strong {
    display: block;
    margin-bottom: 3px;
    text-decoration: underline;
  }

  p,
  ol {
    margin: 0;
  }

  ol {
    padding-left: 18px;
  }
}

.learning-result-links {
  display: grid;
  justify-items: start;
  gap: 4px;
  margin-top: 6px;

  button {
    padding: 0;
    border: 0;
    color: #475569;
    background: transparent;
    font: inherit;
    font-size: 0.84rem;
    font-weight: 800;
    cursor: pointer;

    &:hover {
      color: $primary;
      text-decoration: underline;
    }
  }
}

.learning-result-breakdown-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid #dce4ee;
  border-radius: 6px;
  color: #475569;
  background: #fff;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: rgba(245, 166, 35, 0.08);
    color: $primary;
    border-color: rgba(245, 166, 35, 0.32);
  }
}

// ── Grade Breakdown Panel ──────────────────────────────────────
.student-grade-panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 2999;
  background: rgba(15, 23, 42, 0.3);
}

.student-grade-panel {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  width: min(440px, 100vw);
  height: 100dvh;
  overflow-y: auto;
  background: #fff;
  box-shadow: -8px 0 32px rgba(15, 23, 42, 0.12);
}

.student-panel-slide-enter-active,
.student-panel-slide-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.student-panel-slide-enter-from,
.student-panel-slide-leave-to {
  transform: translateX(100%);
}

.student-grade-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
}

.student-grade-panel__eyebrow {
  margin: 0 0 4px;
  color: $primary;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.student-grade-panel__title {
  margin: 0 0 2px;
  color: #09213f;
  font-size: 1.1rem;
  font-weight: 900;
}

.student-grade-panel__sub {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 800;
}

.student-grade-panel__close {
  flex-shrink: 0;
  padding: 4px;
  border: 0;
  color: #64748b;
  background: transparent;
  cursor: pointer;

  &:hover {
    color: #09213f;
  }
}

.student-grade-panel__total {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
  background: #f8fafc;
}

.student-grade-panel__total-label {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 800;
}

.student-grade-panel__total-value {
  color: #09213f;
  font-size: 1.3rem;
  font-weight: 900;

  span {
    color: #94a3b8;
    font-size: 0.85rem;
  }
}

.student-grade-panel__grade-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 999px;
  background: $primary;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 900;
}

.student-grade-panel__body {
  display: grid;
  align-content: start;
  gap: 0;
  padding: 8px 0;
  flex: 1;
}

.student-grade-panel__empty {
  padding: 32px 20px;
  color: #94a3b8;
  font-size: 0.84rem;
  font-weight: 700;
  text-align: center;
}

.student-grade-panel__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.05);

  &:last-child {
    border-bottom: 0;
  }
}

.student-grade-panel__item-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.student-grade-panel__module-badge {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 5px;
  background: #e2e8f0;
  color: #475569;
  font-size: 0.7rem;
  font-weight: 900;

  &--assign {
    background: rgba(245, 166, 35, 0.14);
    color: #9a5f00;
  }

  &--quiz {
    background: #eef2f7;
    color: #475569;
  }
}

.student-grade-panel__item-name {
  overflow: hidden;
  color: #1e293b;
  font-size: 0.82rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-grade-panel__item-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 10px;
}

.student-grade-panel__score {
  color: #09213f;
  font-size: 0.9rem;
  font-weight: 900;
}

.student-grade-panel__score-max {
  color: #94a3b8;
  font-size: 0.76rem;
  font-weight: 700;
}

.student-grade-panel__no-score {
  color: #cbd5e1;
  font-size: 0.84rem;
}

.student-grade-panel__grade-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 0;
  border-radius: 6px;
  background: $primary;
  color: #fff;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 800;
  text-decoration: none;
  transition: background-color 0.15s ease;

  &:hover {
    background: #e18f13;
  }

  &:disabled {
    cursor: wait;
    opacity: 0.72;
  }
}

.preview-bulk-bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid rgba(17, 24, 39, 0.07);
  margin-bottom: 12px;

  &__section {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;

    &--rules {
      flex-direction: column;
      align-items: stretch;
    }
  }

  &__rule {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__rule-actions {
    display: flex;
    gap: 8px;
    margin-top: 4px;
  }

  &__label {
    flex-shrink: 0;
    color: #64748b;
    font-size: 0.78rem;
    font-weight: 700;
  }

  &__select {
    min-width: 130px;
  }

  &__operator {
    width: 72px;
  }

  &__score-input {
    width: 80px;
  }

  &__hint {
    color: #94a3b8;
    font-size: 0.7rem;
    font-weight: 600;
  }

  &__btn {
    font-size: 0.74rem;
  }

  &__divider {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #94a3b8;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(17, 24, 39, 0.08);
    }
  }
}

.learning-result-detail-preview {
  display: grid;
  gap: 10px;
}

.learning-result-detail-preview__header {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.88rem;
  font-weight: 900;
}

.detail-grade-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  background: $primary;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 900;
}

.detail-grade-dash {
  color: #94a3b8;
}

.detail-grade-select {
  min-width: 140px;
}

.detail-unmatched-label {
  color: #dc2626;
  font-size: 0.8rem;
  font-weight: 800;
}

.detail-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 900;
}

.detail-status--ready {
  background: #dcfce7;
  color: #166534;
}

.detail-status--pending {
  background: #fef9c3;
  color: #854d0e;
}

.detail-status--error {
  background: #fee2e2;
  color: #991b1b;
}

.detail-row--unmatched {
  opacity: 0.65;
}

.learning-result-approved-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #166534;
}

.learning-result-approved-meta {
  margin-left: 8px;
  font-size: 13px;
  color: #4b7a62;
}

.learning-result-table-actions {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.learning-result-sync-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.learning-result-lms-actions {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 18px;
  color: #ef4444;
  font-size: 1.55rem;
  font-weight: 400;

  > div {
    display: grid;
    justify-items: end;
    gap: 4px;
    min-width: 260px;
  }

  button {
    padding: 0;
    border: 0;
    color: #475569;
    background: transparent;
    font: inherit;
    font-size: 0.78rem;
    font-weight: 800;
    cursor: pointer;

    &:hover {
      color: $primary;
      text-decoration: underline;
    }
  }
}

.learning-result-entry-table {
  width: 100%;
  min-width: 900px;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
  color: #172033;
  font-size: 0.88rem;

  th,
  td {
    padding: 12px 10px;
    border-right: 1px solid #dce4ee;
    border-bottom: 1px solid #dce4ee;
    vertical-align: middle;
    overflow-wrap: break-word;
  }

  th {
    color: #0f172a;
    background: #e7e7e7;
    font-size: 0.82rem;
    font-weight: 900;
    text-align: center;
  }

  tbody tr:hover {
    background: rgba(37, 99, 235, 0.03);
  }
}

.learning-result-lms-icon {
  width: 30px;
  height: 30px;
  min-height: 30px;
  margin-bottom: 4px;
  background: #ffffff !important;
  border: 1px solid #dce4ee !important;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06) !important;
}

.student-roster-tabs {
  margin: 2px 0 16px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  color: #64748b;
  font-weight: 900;
}

.student-roster-panel__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;

  div {
    display: grid;
    gap: 4px;
    min-height: 82px;
    padding: 14px;
    border-radius: 12px;
    background: #f8fafc;
  }

  span {
    color: #64748b;
    font-size: 0.86rem;
    font-weight: 800;
  }

  strong {
    color: #09213f;
    font-size: 1.55rem;
    font-weight: 900;
  }
}

.student-roster-table {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 12px;
  overflow: hidden;

  :deep(tbody tr) {
    cursor: default;
  }

  :deep(td) {
    vertical-align: middle;
  }
}

.student-name-cell {
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
    color: #09213f;
    font-size: 0.9rem;
    font-weight: 900;
  }

  span {
    color: #64748b;
    font-size: 0.78rem;
    font-weight: 700;
  }
}

.student-roster-action-btn {
  width: 32px;
  height: 32px;
  min-height: 32px;
  background: #ffffff !important;
  border: 1px solid #dce4ee !important;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06) !important;
}

.student-progress-cell {
  display: grid;
  grid-template-columns: minmax(96px, 1fr) 44px;
  gap: 10px;
  align-items: center;
  min-width: 170px;

  span {
    color: #475569;
    font-size: 0.82rem;
    font-weight: 900;
  }
}

.student-detail-dialog {
  width: min(720px, calc(100vw - 32px));
  border-radius: 14px;
}

.student-detail-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.student-detail-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  div {
    display: grid;
    gap: 8px;
    min-height: 104px;
    padding: 14px;
    border-radius: 12px;
    background: #f8fafc;
  }

  span {
    color: #64748b;
    font-size: 0.78rem;
    font-weight: 800;
  }

  strong {
    color: #09213f;
    font-size: 1.18rem;
    font-weight: 900;
  }
}

.student-detail-info {
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

.student-roster-filters {
  .custom-filter-input :deep(.q-field__control) {
    border-radius: 12px !important;
  }
}

.student-result-score {
  width: 136px;
}

.student-result-status {
  width: 132px;
}

.student-export-btn {
  min-height: 38px;
  padding: 0 14px !important;
  border-radius: 10px !important;
  font-size: 0.78rem;
  font-weight: 900 !important;
}

.student-export-btn--primary {
  box-shadow: 0 7px 18px rgba($primary, 0.2) !important;
}

@media (max-width: 1180px) {
  .student-hero-actions,
  .certificate-hero-actions {
    width: 100%;
  }
}

@media (max-width: 900px) {
  .student-roster-hero-summary,
  .certificate-hero-summary {
    width: 100%;
  }

  .student-roster-hero-summary,
  .certificate-hero-summary,
  .student-roster-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .student-roster-panel__summary,
  .student-detail-stats {
    grid-template-columns: 1fr;
  }

  .student-course-row {
    grid-template-columns: 96px minmax(0, 1fr);
  }

  .student-course-row__metric,
  .student-course-row__action {
    grid-column: 2;
    justify-self: start;
  }
}

@media (max-width: 680px) {
  .students-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .student-roster-hero-summary,
  .student-roster-summary-grid {
    grid-template-columns: 1fr;
    padding: 14px;
  }

  .student-roster-hero-summary {
    padding: 0;
  }

  .student-course-row {
    grid-template-columns: 84px minmax(0, 1fr);
    padding: 14px;

    img {
      width: 84px;
      height: 64px;
    }
  }

  .student-detail-info {
    grid-template-columns: 1fr;
  }
}
</style>
