<template>
  <q-page class="admin-page finance-receipt-summary-page">
    <AdminPageHero
      eyebrow="Financial Operations"
      eyebrow-icon="receipt_long"
      :title="$t('finance.receiptSummary.title')"
      :description="$t('finance.receiptSummary.description')"
    />

    <section class="admin-shell admin-content">
      <AdminSurfaceCard>
        <div class="row q-col-gutter-md q-mb-md">
          <!-- Filter section -->
          <div class="col-12 col-md-8 offset-md-2">
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
                {{ $t('finance.receiptSummary.departmentLabel') }}
              </div>
              <div class="col-12 col-sm-8">
                <q-input v-model="filters.department" borderless dense readonly />
              </div>
            </div>

            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
                {{ $t('finance.receiptSummary.filters.receiptDate') }}
              </div>
              <div class="col-12 col-sm-8 row q-col-gutter-sm">
                <div class="col-6">
                  <q-input
                    v-model="filters.receiptDateStart"
                    outlined
                    dense
                    :label="$t('finance.receiptSummary.filters.start')"
                    placeholder="วว/ดด/ปปปป"
                    mask="##/##/####"
                    class="bg-white"
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" color="grey-7">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date
                            v-model="filters.receiptDateStart"
                            mask="DD/MM/YYYY"
                            color="warning"
                            text-color="black"
                          />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="col-6">
                  <q-input
                    v-model="filters.receiptDateEnd"
                    outlined
                    dense
                    :label="$t('finance.receiptSummary.filters.end')"
                    placeholder="วว/ดด/ปปปป"
                    mask="##/##/####"
                    class="bg-white"
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" color="grey-7">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date
                            v-model="filters.receiptDateEnd"
                            mask="DD/MM/YYYY"
                            color="warning"
                            text-color="black"
                          />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
                {{ $t('finance.receiptSummary.filters.effectiveDate') }}
              </div>
              <div class="col-12 col-sm-8 row q-col-gutter-sm">
                <div class="col-6">
                  <q-input
                    v-model="filters.effectiveDateStart"
                    outlined
                    dense
                    :label="$t('finance.receiptSummary.filters.start')"
                    placeholder="วว/ดด/ปปปป"
                    mask="##/##/####"
                    class="bg-white"
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" color="grey-7">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date
                            v-model="filters.effectiveDateStart"
                            mask="DD/MM/YYYY"
                            color="warning"
                            text-color="black"
                          />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="col-6">
                  <q-input
                    v-model="filters.effectiveDateEnd"
                    outlined
                    dense
                    :label="$t('finance.receiptSummary.filters.end')"
                    placeholder="วว/ดด/ปปปป"
                    mask="##/##/####"
                    class="bg-white"
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" color="grey-7">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date
                            v-model="filters.effectiveDateEnd"
                            mask="DD/MM/YYYY"
                            color="warning"
                            text-color="black"
                          />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <div class="row items-center">
              <div class="col-12 col-sm-4 text-right q-pr-md"></div>
              <div class="col-12 col-sm-8 q-gutter-sm">
                <q-btn
                  color="warning"
                  text-color="black"
                  :label="$t('finance.receiptSummary.filters.searchBtn')"
                  unelevated
                  class="q-px-xl"
                />
                <q-btn
                  outline
                  color="grey-7"
                  :label="$t('finance.receiptSummary.filters.clearBtn')"
                  class="q-px-lg bg-white"
                  @click="clearDates"
                />
              </div>
            </div>
          </div>
        </div>
      </AdminSurfaceCard>

      <AdminSurfaceCard class="q-mt-md" card-class="q-pa-none">
        <template #header-actions>
          <q-btn
            outline
            color="negative"
            icon="picture_as_pdf"
            :label="$t('finance.receiptSummary.exportPdf')"
            class="q-mr-sm"
          />
          <q-btn
            outline
            color="positive"
            icon="table_chart"
            :label="$t('finance.receiptSummary.exportExcel')"
          />
        </template>

        <div class="text-center q-pt-lg q-pb-sm text-weight-bold text-subtitle1">
          {{ $t('finance.receiptSummary.title') }}
        </div>

        <div class="row justify-between items-center q-px-md q-pb-md">
          <div class="row items-center q-gutter-sm">
            <span class="text-subtitle2 text-grey-8">{{
              $t('finance.receiptSummary.showEntries')
            }}</span>
            <q-select
              v-model="pagination.rowsPerPage"
              :options="[10, 25, 50, 100]"
              outlined
              dense
              options-dense
              style="width: 80px"
              class="bg-white"
            />
            <span class="text-subtitle2 text-grey-8">{{
              $t('finance.receiptSummary.entries')
            }}</span>
          </div>
          <q-input
            v-model="search"
            dense
            outlined
            :placeholder="$t('finance.receiptSummary.searchLabel')"
            class="receipt-search"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <q-table
          :rows="mockData"
          :columns="columns"
          row-key="id"
          flat
          :filter="search"
          class="receipt-table"
          v-model:pagination="pagination"
        >
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <div v-if="props.value === 'ยกเลิก'" class="text-negative text-center">
                {{ $t('finance.receiptSummary.statusCancelled') }}<br />
                <span class="text-caption text-grey-6"
                  >{{ props.row.cancelBy }}<br />{{ props.row.cancelDate }}</span
                >
              </div>
              <div v-else class="text-center">
                {{ $t('finance.receiptSummary.statusActive') }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-printReceipt="props">
            <q-td :props="props" class="text-center">
              <span v-if="props.row.status === 'ยกเลิก'" class="text-grey-6">
                {{ $t('finance.receiptSummary.statusCancelled') }}
              </span>
              <q-btn v-else flat round dense icon="download" color="warning">
                <q-tooltip>{{ $t('finance.receipts.printReceipt') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:body-cell-courseName="props">
            <q-td :props="props">
              <div style="white-space: pre-wrap; word-break: break-word">{{ props.value }}</div>
            </q-td>
          </template>

          <template v-slot:bottom="scope">
            <div class="row full-width justify-between items-center q-py-md">
              <div class="text-caption text-grey-8 text-weight-medium">
                {{
                  $t('finance.receiptSummary.showing', {
                    start: (scope.pagination.page - 1) * scope.pagination.rowsPerPage + 1,
                    end: Math.min(
                      scope.pagination.page * scope.pagination.rowsPerPage,
                      mockData.length,
                    ),
                    total: mockData.length,
                  })
                }}
              </div>
              <q-pagination
                v-model="pagination.page"
                :max="scope.pagesNumber"
                direction-links
                flat
                color="grey-8"
                active-color="warning"
                active-text-color="black"
                :max-pages="6"
                boundary-numbers
              />
            </div>
          </template>
        </q-table>
      </AdminSurfaceCard>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import { ref, computed } from 'vue';
import type { QTableProps } from 'quasar';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const search = ref('');

const pagination = ref({
  sortBy: 'no',
  descending: false,
  page: 1,
  rowsPerPage: 25,
});

const filters = ref({
  department: 'สำนักคอมพิวเตอร์ (82994)',
  receiptDateStart: '',
  receiptDateEnd: '',
  effectiveDateStart: '',
  effectiveDateEnd: '',
});

function clearDates() {
  filters.value.receiptDateStart = '';
  filters.value.receiptDateEnd = '';
  filters.value.effectiveDateStart = '';
  filters.value.effectiveDateEnd = '';
}

const columns = computed<QTableProps['columns']>(() => [
  {
    name: 'no',
    label: t('finance.receiptSummary.columns.no'),
    field: 'no',
    align: 'center',
    sortable: true,
  },
  {
    name: 'receiptNo',
    label: t('finance.receiptSummary.columns.receiptNo'),
    field: 'receiptNo',
    align: 'center',
    sortable: true,
  },
  {
    name: 'customerName',
    label: t('finance.receiptSummary.columns.fullName'),
    field: 'customerName',
    align: 'left',
    sortable: true,
  },
  {
    name: 'amount',
    label: t('finance.receiptSummary.columns.amount'),
    field: 'amount',
    align: 'center',
    sortable: true,
  },
  {
    name: 'effectiveDate',
    label: t('finance.receiptSummary.columns.effectiveDate'),
    field: 'effectiveDate',
    align: 'center',
    sortable: true,
  },
  {
    name: 'learnerName',
    label: t('finance.receiptSummary.columns.learnerName'),
    field: 'learnerName',
    align: 'left',
    sortable: true,
  },
  {
    name: 'courseName',
    label: t('finance.receiptSummary.columns.courseName'),
    field: 'courseName',
    align: 'left',
    sortable: true,
    style: 'width: 250px',
  },
  {
    name: 'collector',
    label: t('finance.receiptSummary.columns.collector'),
    field: 'collector',
    align: 'center',
    sortable: true,
  },
  {
    name: 'status',
    label: t('finance.receiptSummary.columns.status'),
    field: 'status',
    align: 'center',
    sortable: true,
  },
  {
    name: 'printReceipt',
    label: t('finance.receiptSummary.columns.actions'),
    field: 'printReceipt',
    align: 'center',
  },
]);

const generateMockData = () => {
  const data = [];
  data.push({
    id: 1,
    no: 1,
    receiptNo: '256706000001',
    customerName: 'นัธพร ยะโสวงษ์',
    amount: 1,
    effectiveDate: '30 พ.ย. 2566\n13:26:28',
    learnerName: 'นัธพร ยะโสวงษ์',
    courseName: 'C66061004:การถ่ายภาพโฆษณา\nคณะศิลปกรรมศาสตร์\n99999 สำหรับทดสอบ Direct link',
    collector: 'นางสาวนัธพร ยะโสวงษ์\n20 มี.ค. 2567',
    status: 'ยกเลิก',
    cancelBy: 'นัธพร ยะโสวงษ์',
    cancelDate: '15/05/2567\nทดสอบใบเสร็จ',
  });
  data.push({
    id: 2,
    no: 2,
    receiptNo: '256706000002',
    customerName: 'นัธพร ยะโสวงษ์',
    amount: 1,
    effectiveDate: '30 พ.ย. 2566\n13:26:28',
    learnerName: 'นัธพร ยะโสวงษ์',
    courseName: 'C66061004:การถ่ายภาพโฆษณา\nคณะศิลปกรรมศาสตร์\n99999 สำหรับทดสอบ Direct link',
    collector: 'นางสาวนัธพร ยะโสวงษ์\n20 มี.ค. 2567',
    status: 'ใช้งาน',
  });
  data.push({
    id: 3,
    no: 3,
    receiptNo: '256706000003',
    customerName: 'นัธพร ยะโสวงษ์',
    amount: 1,
    effectiveDate: '30 พ.ย. 2566\n13:26:28',
    learnerName: 'นัธพร ยะโสวงษ์',
    courseName: 'C66061004:การถ่ายภาพโฆษณา',
    collector: 'นางสาวนัธพร ยะโสวงษ์\n22 มี.ค. 2567',
    status: 'ใช้งาน',
  });

  const names = [
    'นัธพร ยะโสวงษ์',
    'วิมลรัตน์ ดีเลิศ',
    'สมชาย รักเรียน',
    'อนันต์ ยอดเยี่ยม',
    'เกศรา พูนผล',
  ];
  const courses = [
    'C66061004:การถ่ายภาพโฆษณา\nคณะศิลปกรรมศาสตร์\n99999 สำหรับทดสอบ Direct link',
    'C67052002:การพัฒนาเว็บแอปพลิเคชัน\nสำนักคอมพิวเตอร์',
    'C65091001:ภาษาอังกฤษเพื่อการสื่อสาร\nคณะมนุษยศาสตร์',
  ];
  const collectors = ['นางสาวนัธพร ยะโสวงษ์\n20 มี.ค. 2567', 'นายสมชาย ดีงาม\n21 มี.ค. 2567'];

  for (let i = 4; i <= 85; i++) {
    const isCancelled = i % 15 === 0;
    data.push({
      id: i,
      no: i,
      receiptNo: '256706' + String(i).padStart(6, '0'),
      customerName: names[i % names.length],
      amount: 1,
      effectiveDate: `30 พ.ย. 2566\n13:${20 + (i % 39)}:28`,
      learnerName: names[i % names.length],
      courseName: courses[i % courses.length],
      collector: collectors[i % collectors.length],
      status: isCancelled ? 'ยกเลิก' : 'ใช้งาน',
      cancelBy: isCancelled ? 'นัธพร ยะโสวงษ์' : undefined,
      cancelDate: isCancelled ? '15/05/2567\nทดสอบยกเลิก' : undefined,
    });
  }
  return data;
};

const mockData = generateMockData();
</script>

<style lang="scss" scoped>
.receipt-search {
  width: 250px;
}

.receipt-table {
  :deep(.q-table__card) {
    box-shadow: none;
  }
  :deep(thead tr) {
    background: #e2e8f0; // slightly darker for header as in screenshot
  }
  :deep(th) {
    font-weight: 700;
    color: #334155;
    font-size: 0.85rem;
    white-space: pre-wrap; // To allow \n in labels
    text-align: center;
  }
  :deep(tbody td) {
    vertical-align: top;
    padding-top: 12px;
    padding-bottom: 12px;
    white-space: pre-wrap; // To allow \n in content like dates
  }
}

:deep(.q-field__label) {
  font-weight: 400 !important;
}
</style>
