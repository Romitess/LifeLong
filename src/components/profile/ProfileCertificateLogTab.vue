<template>
  <div class="cert-log-panel">
    <div class="cert-log-panel__header">
      <div>
        <div class="text-h5 text-weight-bolder text-primary">ประวัติการดาวน์โหลดเกียรติบัตร</div>
        <div class="text-caption text-grey-6 q-mt-xs">
          รายการทั้งหมด {{ logs.length.toLocaleString('th-TH') }} รายการ
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="row justify-center q-py-xl">
      <q-spinner color="primary" size="40px" />
    </div>

    <div v-else-if="loadError" class="cert-log-error q-py-xl text-center">
      <q-icon name="error_outline" size="40px" color="negative" />
      <p class="text-grey-6 q-mt-sm">{{ loadError }}</p>
      <q-btn unelevated color="primary" label="ลองใหม่" no-caps @click="fetchLogs" />
    </div>

    <template v-else>
      <q-card v-if="logs.length === 0" flat class="cert-log-empty q-pa-xl text-center">
        <q-icon name="history" size="48px" color="grey-4" />
        <div class="text-h6 text-weight-bolder text-dark q-mt-md">ยังไม่มีประวัติการดาวน์โหลด</div>
        <div class="text-body2 text-grey-6 q-mt-xs">
          ประวัติจะแสดงที่นี่เมื่อคุณดาวน์โหลดเกียรติบัตรครั้งแรก
        </div>
      </q-card>

      <template v-else>
        <div class="cert-log-table-scroll">
          <table class="cert-log-table">
            <thead>
              <tr>
                <th class="col-index text-center">ลำดับ</th>
                <th class="col-device">อุปกรณ์</th>
                <th class="col-ip">IP Address</th>
                <th class="col-date">วัน-เวลาที่ดาวน์โหลด</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(log, index) in paginatedLogs" :key="log.id">
                <td class="text-center">{{ (currentPage - 1) * rowsPerPage + index + 1 }}</td>
                <td>
                  <div class="device-text" :title="log.device">
                    {{ truncate(log.device, 80) }}
                  </div>
                </td>
                <td>
                  <span class="ip-text">{{ log.clip }}</span>
                </td>
                <td class="date-cell">{{ formatDate(log.createDate) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="cert-log-pagination">
          <q-pagination
            v-model="currentPage"
            :max="totalPages"
            :max-pages="7"
            boundary-numbers
            direction-links
            color="primary"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth-store';

interface CertLog {
  id: number;
  userId: number;
  clip: string;
  device: string;
  createUser: string | null;
  createDate: string | null;
}

const authStore = useAuthStore();

const logs = ref<CertLog[]>([]);
const isLoading = ref(false);
const loadError = ref<string | null>(null);
const currentPage = ref(1);
const rowsPerPage = 10;

async function fetchLogs(): Promise<void> {
  isLoading.value = true;
  loadError.value = null;
  try {
    const userId = authStore.user?.id;
    const url = userId ? `/api/lltcertificatelog?userId=${userId}` : '/api/lltcertificatelog';
    const { data } = await api.get<CertLog[]>(url);
    logs.value = data;
  } catch {
    loadError.value = 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่';
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchLogs);

const totalPages = computed(() => Math.ceil(logs.value.length / rowsPerPage));

const paginatedLogs = computed<CertLog[]>(() => {
  const start = (currentPage.value - 1) * rowsPerPage;
  return logs.value.slice(start, start + rowsPerPage);
});

function formatDate(raw: string | null): string {
  if (!raw) return '-';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}
</script>

<style lang="scss" scoped>
.cert-log-panel {
  max-width: 1004px;
}

.cert-log-panel__header {
  margin-bottom: 20px;
}

.cert-log-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.cert-log-empty {
  border-radius: 20px !important;
  background:
    radial-gradient(circle at 50% 0%, rgba($primary, 0.04), transparent 60%), white !important;
  border: 2px dashed rgba($primary, 0.15) !important;
}

.cert-log-table-scroll {
  overflow-x: auto;
}

.cert-log-table {
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
  color: #1f2937;

  th,
  td {
    padding: 12px 14px;
    border: 1px solid #dfe7ef;
    vertical-align: middle;
  }

  th {
    background: #f3f4f6;
    color: #344054;
    font-weight: 800;
    white-space: nowrap;
  }

  tbody tr {
    background: #ffffff;
    transition: background-color 0.14s ease;
  }

  tbody tr:nth-child(even) {
    background: #fafbfc;
  }

  tbody tr:hover {
    background: #f0f4ff;
  }
}

.col-index {
  width: 64px;
}

.col-device {
  min-width: 260px;
}

.col-ip {
  width: 150px;
}

.col-date {
  width: 180px;
  white-space: nowrap;
}

.device-text {
  font-size: 0.82rem;
  color: #4b5563;
  line-height: 1.4;
  word-break: break-all;
}

.ip-text {
  font-family: monospace;
  font-size: 0.88rem;
  color: #374151;
}

.date-cell {
  color: #6b7280;
  font-size: 0.88rem;
}

.cert-log-pagination {
  display: flex;
  justify-content: center;
  padding-top: 16px;
}
</style>
