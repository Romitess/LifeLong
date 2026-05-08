<template>
  <div class="hero-template-editor">
    <div class="hero-template-editor__layout">
      <aside class="hero-template-sidebar">
        <div class="hero-template-sidebar__header">
          <div>
            <p>Hero Images</p>
            <h4>รูป Hero หน้า Main</h4>
          </div>
          <q-badge rounded color="primary" :label="`${draftHeroConfig.slides.length} ภาพ`" />
        </div>

        <div
          class="hero-drop-zone"
          :class="{ 'hero-drop-zone--active': isDraggingFile }"
          role="button"
          tabindex="0"
          @click="fileInput?.click()"
          @keyup.enter="fileInput?.click()"
          @dragenter.prevent="isDraggingFile = true"
          @dragover.prevent="isDraggingFile = true"
          @dragleave.prevent="isDraggingFile = false"
          @drop.prevent="onImageDrop"
        >
          <q-icon name="cloud_upload" size="34px" />
          <strong>ลากรูปมาวางที่นี่</strong>
          <span>หรือคลิกเพื่อเพิ่ม Hero image ใหม่</span>
          <input ref="fileInput" type="file" accept="image/*" hidden @change="onImageSelected" />
        </div>

        <div class="hero-global-settings">
          <HeroEditorInput
            v-model="draftHeroConfig.slideDurationMs"
            type="number"
            label="เวลาเปลี่ยนสไลด์ (ms)"
            :min="3000"
            :max="60000"
          />
          <HeroEditorInput
            v-model="draftHeroConfig.initialDelayMs"
            type="number"
            label="หน่วงก่อนเริ่มพิมพ์ (ms)"
            :min="0"
            :max="5000"
          />
        </div>

        <div class="hero-slide-list">
          <button
            v-for="slide in draftHeroConfig.slides"
            :key="slide.id"
            type="button"
            class="hero-slide-picker"
            :class="{ 'hero-slide-picker--active': selectedSlideId === slide.id }"
            @click="selectedSlideId = slide.id"
          >
            <img :src="slide.imageUrl" alt="" />
            <span>
              <strong>{{ slide.name }}</strong>
              <small>{{ slide.enabled ? 'แสดงบน main' : 'ซ่อนอยู่' }}</small>
            </span>
          </button>
        </div>

        <q-btn
          outline
          no-caps
          color="negative"
          icon="restart_alt"
          label="Reset เป็นค่าเริ่มต้น"
          class="full-width"
          @click="requestResetTemplate"
        />
      </aside>

      <section v-if="selectedSlide" class="hero-template-workspace">
        <div class="hero-template-toolbar">
          <div>
            <p>Template Preview</p>
            <h4>{{ selectedSlide.name }}</h4>
          </div>
          <div class="hero-template-toolbar__actions">
            <q-btn
              flat
              round
              dense
              :color="isPreviewPinned ? 'primary' : 'grey-7'"
              icon="push_pin"
              class="hero-toolbar-icon-button"
              @click="isPreviewPinned = !isPreviewPinned"
            >
              <q-tooltip>{{
                isPreviewPinned ? 'ถอนหมุด Preview' : 'ปักหมุด Preview ไว้ด้านบน'
              }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="play_arrow"
              class="hero-toolbar-icon-button"
              @click="restartPreviewAnimation"
            >
              <q-tooltip>เล่น Animation ใหม่</q-tooltip>
            </q-btn>
            <q-chip
              :class="{ invisible: !hasUnsavedChanges }"
              dense
              color="warning"
              text-color="dark"
              icon="edit"
              label="ยังไม่บันทึก"
            />
            <q-toggle v-model="selectedSlide.enabled" color="positive" label="แสดงผล" />
            <q-btn
              outline
              no-caps
              color="grey-8"
              icon="undo"
              label="ยกเลิก draft"
              :disable="!hasUnsavedChanges"
              @click="requestDiscardDraft"
            />
            <q-btn
              unelevated
              no-caps
              color="primary"
              icon="check_circle"
              label="ยืนยันการบันทึก"
              :disable="!hasUnsavedChanges"
              @click="requestSaveTemplate"
            />
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              :disable="draftHeroConfig.slides.length <= 1"
              @click="requestDeleteSelectedSlide"
            />
          </div>
        </div>

        <div class="hero-draft-banner">
          <q-icon name="verified_user" size="20px" />
          <span>
            ทุกการแก้ไขอยู่ใน draft preview ก่อน หน้า main และ localStorage จะเปลี่ยนเฉพาะหลัง
            “ยืนยันการบันทึก” ผ่าน dialog เท่านั้น
          </span>
        </div>

        <div
          ref="previewRef"
          class="hero-preview-stage"
          :class="{ 'hero-preview-stage--pinned': isPreviewPinned }"
        >
          <div class="hero-preview-stage__container" :key="animationKey">
            <q-carousel v-model="selectedSlideId" animated class="hero-carousel-preview">
              <q-carousel-slide
                :name="selectedSlide.id"
                :img-src="selectedSlide.imageUrl"
                class="hero-slide"
                :class="{ 'hero-slide--dragging': isDraggingBg }"
                :style="{ backgroundPosition: selectedSlide.backgroundPosition }"
                @pointerdown.prevent="startBgDrag"
              >
                <div
                  class="hero-preview-stage__overlay"
                  :style="{
                    backgroundColor: selectedSlide.overlayColor,
                    opacity: selectedSlide.overlayOpacity,
                  }"
                />
              </q-carousel-slide>
            </q-carousel>
            <div
              v-if="selectedSlide.textBlock.enabled"
              class="hero-preview-text-block"
              :class="{
                'hero-preview-text-block--dragging': isDraggingText,
                'hero-preview-text-block--editing': editingSegmentId !== null,
              }"
              :style="previewTextBlockStyle"
              @pointerdown.stop.prevent="startTextDrag"
            >
              <div
                v-for="(line, lineIndex) in enabledPreviewLines"
                :key="line.id"
                class="hero-preview-text-line"
                :class="[
                  `hero-type-line--effect-${line.effect}`,
                  { 'hero-type-line--visible': isHeroLineVisible(lineIndex) },
                ]"
                :style="getPreviewLineStyle(line)"
              >
                <span
                  v-for="segment in getVisibleHeroSegments(line, lineIndex)"
                  :key="segment.id"
                  class="hero-preview-segment"
                  :class="{ 'hero-preview-segment--editing': editingSegmentId === segment.id }"
                  :style="{
                    color: segment.color,
                    fontWeight: segment.fontWeight ?? line.fontWeight,
                  }"
                  :contenteditable="editingSegmentId === segment.id"
                  @dblclick.stop.prevent="startInlineEdit(segment, $event)"
                  @blur="finishInlineEdit(segment, $event)"
                  @keydown.enter.prevent="($event.target as HTMLElement)?.blur()"
                  @keydown.esc="($event.target as HTMLElement)?.blur()"
                  @pointerdown.stop="
                    editingSegmentId === segment.id ? undefined : startTextDrag($event)
                  "
                  >{{ segment.text }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="hero-editor-note">
          <q-icon name="drag_indicator" />
          ลากกล่องข้อความบน preview เพื่อกำหนดตำแหน่ง
        </div>
        <div class="hero-editor-note">
          <q-icon name="edit" />
          ดับเบิลคลิกที่ข้อความบน preview เพื่อแก้ไขตรงจุดได้เลย
        </div>

        <div class="hero-control-grid">
          <q-expansion-item
            v-model="isHeroSettingsOpen"
            class="hero-control-card hero-control-card--collapsible"
          >
            <template #header>
              <q-item-section>
                <div class="row items-center q-gutter-sm">
                  <q-icon name="image" color="primary" size="24px" />
                  <span class="text-h6">ตั้งค่าภาพ Hero</span>
                </div>
              </q-item-section>
              <q-item-section side />
            </template>

            <div class="q-pa-md">
              <div class="hero-form-grid">
                <HeroEditorInput
                  v-model="selectedSlide.name"
                  label="ชื่อภาพ"
                  class="hero-form-span-full"
                />
                <div class="hero-form-row">
                  <HeroEditorInput
                    v-model="bgPosX"
                    type="number"
                    label="ตำแหน่งภาพ X (%)"
                    :min="0"
                    :max="100"
                    :error="!canDragBgX && (isXInputFocused || isDraggingBg)"
                    @focus="isXInputFocused = true"
                    @blur="isXInputFocused = false"
                  >
                    <template #error> พอดีกรอบแล้ว เลื่อนซ้ายขวาไม่มีผล </template>
                  </HeroEditorInput>
                  <HeroEditorInput
                    v-model="bgPosY"
                    type="number"
                    label="ตำแหน่งภาพ Y (%)"
                    :min="0"
                    :max="100"
                    :error="!canDragBgY && (isYInputFocused || isDraggingBg)"
                    @focus="isYInputFocused = true"
                    @blur="isYInputFocused = false"
                  >
                    <template #error> พอดีกรอบแล้ว เลื่อนขึ้นลงไม่มีผล </template>
                  </HeroEditorInput>
                </div>
                <div class="hero-bg-hint hero-form-span-full">
                  <q-icon name="swipe" size="sm" class="q-mr-sm" color="primary" />
                  <span class="text-caption"
                    >สามารถใช้เมาส์คลิกค้างแล้วลาก (Drag)
                    ที่รูปภาพด้านบนเพื่อปรับตำแหน่งได้เลย</span
                  >
                </div>
                <ColorPickerInput v-model="selectedSlide.overlayColor" label="สี Overlay" />
                <HeroEditorSlider
                  v-model="selectedSlide.overlayOpacity"
                  label="ความทึบ Overlay"
                  unit="%"
                  is-percentage
                  :min="0"
                  :max="1"
                  :step="0.01"
                  class="hero-form-span-full"
                />
              </div>
              <div class="hero-image-actions q-mt-md">
                <BaseButton
                  flat
                  no-caps
                  color="primary"
                  icon="image"
                  label="เปลี่ยนรูปของสไลด์นี้"
                  class="hero-main-outline-button"
                  @click="replacementFileInput?.click()"
                />
                <span>ระบบจะถามยืนยันก่อนเปลี่ยนรูปใน draft</span>
                <input
                  ref="replacementFileInput"
                  type="file"
                  accept="image/*"
                  hidden
                  @change="onReplacementImageSelected"
                />
              </div>
            </div>
          </q-expansion-item>

          <q-expansion-item
            v-model="isTextBlockSettingsOpen"
            class="hero-control-card hero-control-card--collapsible"
          >
            <template #header>
              <q-item-section>
                <div class="row items-center q-gutter-sm">
                  <q-icon name="text_fields" color="primary" size="24px" />
                  <span class="text-h6">กล่องข้อความ</span>
                </div>
              </q-item-section>
              <q-item-section side />
            </template>

            <div class="q-pa-md">
              <div class="hero-form-grid">
                <div class="hero-form-toggle-row hero-form-span-full">
                  <q-toggle
                    v-model="selectedSlide.textBlock.enabled"
                    color="primary"
                    label="เปิดข้อความ"
                    @click.stop
                  />
                  <q-toggle
                    v-model="selectedSlide.textBlock.backgroundEnabled"
                    color="primary"
                    label="พื้นหลังกล่องข้อความ"
                    :disable="!selectedSlide.textBlock.enabled"
                    @click.stop
                  />
                </div>
                <div class="hero-form-row">
                  <HeroEditorInput
                    v-model="selectedSlide.textBlock.xPercent"
                    type="number"
                    label="ตำแหน่งกล่อง X (%)"
                  />
                  <HeroEditorInput
                    v-model="selectedSlide.textBlock.yPercent"
                    type="number"
                    label="ตำแหน่งกล่อง Y (%)"
                  />
                </div>
                <HeroEditorSlider
                  v-model="selectedSlide.textBlock.widthPercent"
                  label="ความกว้างกล่องข้อความ"
                  unit="%"
                  :min="10"
                  :max="100"
                  :step="1"
                  class="hero-form-span-full"
                />
                <HeroEditorSelect
                  v-model="selectedSlide.textBlock.textAlign"
                  :options="textAlignOptions"
                  label="จัดแนวข้อความ"
                />

                <HeroEditorInput
                  v-model="selectedSlide.textBlock.gapPx"
                  type="number"
                  label="ระยะห่างระหว่างบรรทัด (px)"
                />

                <q-expansion-item
                  dense
                  expand-separator
                  icon="straighten"
                  label="ตั้งค่า Padding (บน ขวา ล่าง ซ้าย)"
                  header-class="text-grey-8"
                  class="hero-padding-expansion hero-form-span-full"
                >
                  <div class="hero-padding-grid q-py-sm">
                    <div>
                      <HeroEditorInput
                        v-model="selectedSlide.textBlock.paddingTopPx"
                        type="number"
                        label="บน"
                        :min="0"
                      />
                    </div>
                    <div>
                      <HeroEditorInput
                        v-model="selectedSlide.textBlock.paddingRightPx"
                        type="number"
                        label="ขวา"
                        :min="0"
                      />
                    </div>
                    <div>
                      <HeroEditorInput
                        v-model="selectedSlide.textBlock.paddingBottomPx"
                        type="number"
                        label="ล่าง"
                        :min="0"
                      />
                    </div>
                    <div>
                      <HeroEditorInput
                        v-model="selectedSlide.textBlock.paddingLeftPx"
                        type="number"
                        label="ซ้าย"
                        :min="0"
                      />
                    </div>
                  </div>
                </q-expansion-item>
                <ColorPickerInput
                  v-model="selectedSlide.textBlock.backgroundColor"
                  label="สีพื้นหลัง"
                  :disable="
                    !selectedSlide.textBlock.enabled || !selectedSlide.textBlock.backgroundEnabled
                  "
                />
                <HeroEditorSlider
                  v-model="selectedSlide.textBlock.borderRadiusPx"
                  label="ความมนของกล่อง (Radius)"
                  unit="px"
                  :min="0"
                  :max="100"
                  :step="1"
                  :disable="
                    !selectedSlide.textBlock.enabled || !selectedSlide.textBlock.backgroundEnabled
                  "
                  class="hero-form-span-full"
                />
              </div>
            </div>
          </q-expansion-item>
        </div>

        <q-card flat bordered class="hero-control-card hero-text-lines-card">
          <div class="hero-control-card__header">
            <div>
              <h5>ข้อความและ Animation</h5>
              <p>เลือก effect ต่อบรรทัดได้ ไม่จำเป็นต้องเป็น typewriter ทุกบรรทัด</p>
            </div>
            <q-btn
              unelevated
              no-caps
              color="primary"
              icon="add"
              label="เพิ่มบรรทัด"
              @click="addTextLineToSelectedSlide"
            />
          </div>

          <q-expansion-item
            v-for="(line, lineIndex) in selectedSlide.textBlock.lines"
            :key="line.id"
            expand-separator
            default-opened
            class="hero-line-editor"
          >
            <template #header>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" size="30px">{{
                  lineIndex + 1
                }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="hero-line-header-label">
                  {{ line.label || `Line ${lineIndex + 1}` }}
                  <q-badge
                    rounded
                    color="teal"
                    class="hero-line-effect-badge"
                    :label="getEffectLabel(line.effect)"
                  />
                </q-item-label>
                <q-item-label caption>
                  {{ getLinePlainText(line) || 'ยังไม่มีข้อความ' }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="line.enabled" color="positive" dense label="แสดง" />
              </q-item-section>
            </template>

            <div class="hero-line-editor__body">
              <div class="hero-line-editor__actions">
                <span>ตั้งค่าบรรทัดนี้</span>
                <q-btn
                  outline
                  no-caps
                  color="negative"
                  icon="delete"
                  label="ลบบรรทัด"
                  @click="requestDeleteHeroTextLine(line.id)"
                />
              </div>

              <div class="hero-form-grid">
                <div class="hero-form-row">
                  <HeroEditorInput v-model="line.label" label="ชื่อบรรทัด" />
                  <HeroEditorSelect
                    v-model="line.effect"
                    :options="effectOptions"
                    label="Animation"
                  />
                </div>
                <div class="hero-form-row">
                  <HeroEditorInput
                    v-model="line.durationMs"
                    type="number"
                    label="ระยะเวลา Animation (ms)"
                    :min="80"
                    :max="10000"
                  />
                  <HeroEditorInput
                    v-model="line.gapMs"
                    type="number"
                    label="หน่วงก่อนบรรทัดถัดไป (ms)"
                    :min="0"
                    :max="5000"
                  />
                </div>
                <div class="hero-form-row">
                  <HeroEditorSelect
                    v-model="line.fontFamily"
                    :options="fontFamilyOptions"
                    label="ฟ้อนต์"
                  />
                  <HeroEditorInput
                    v-model="line.fontSizePx"
                    type="number"
                    label="ขนาดฟ้อนต์ (px)"
                    :min="10"
                    :max="160"
                    :step="1"
                  />
                </div>
                <div class="hero-form-row">
                  <HeroEditorInput v-model="line.letterSpacing" label="Letter spacing เช่น 0px" />
                  <HeroEditorInput
                    v-model="line.fontWeight"
                    type="number"
                    label="ความหนาฟ้อนต์ (ทั้งบรรทัด)"
                    :min="100"
                    :max="1000"
                    :step="50"
                  />
                </div>
                <HeroEditorInput
                  v-model="line.lineHeight"
                  type="number"
                  label="Line height"
                  :min="0.7"
                  :max="2.5"
                  :step="0.05"
                  style="grid-column: 1 / -1"
                />
              </div>

              <div class="hero-segment-list">
                <div v-for="segment in line.segments" :key="segment.id" class="hero-segment-row">
                  <HeroEditorInput
                    v-model="segment.text"
                    label="ข้อความในช่วงนี้"
                    style="flex: 2"
                  />
                  <ColorPickerInput v-model="segment.color" label="สี" style="flex: 1" />
                  <HeroEditorInput
                    v-model="segment.fontWeight"
                    type="number"
                    label="ความหนา"
                    :min="100"
                    :max="1000"
                    :step="50"
                    style="flex: 1"
                  />
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="close"
                    :disable="line.segments.length <= 1"
                    @click="requestDeleteHeroTextSegment(line, segment.id)"
                  />
                </div>
                <div class="q-mt-sm">
                  <BaseButton
                    flat
                    no-caps
                    color="primary"
                    icon="add"
                    label="เพิ่มส่วนของข้อความ (Segment)"
                    class="hero-main-outline-button hero-main-outline-button--compact"
                    @click="addTextSegmentToLine(line)"
                  />
                </div>
              </div>
            </div>
          </q-expansion-item>
        </q-card>
      </section>
    </div>

    <AdminConfirmDialog
      v-model="confirmDialog.open"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-label="confirmDialog.confirmLabel"
      :cancel-label="confirmDialog.cancelLabel"
      :icon="confirmDialog.icon"
      :icon-color="confirmDialog.iconColor"
      :confirm-color="confirmDialog.confirmColor"
      :confirm-icon="confirmDialog.confirmIcon"
      persistent
      @confirm="handleConfirmDialog"
      @cancel="clearPendingConfirmAction"
    />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
  type CSSProperties,
} from 'vue';
import { useQuasar } from 'quasar';
import AdminConfirmDialog from 'components/admin/AdminConfirmDialog.vue';
import BaseButton from 'components/base/BaseButton.vue';
import {
  cloneHeroTemplateConfig,
  createDefaultHeroTemplateConfig,
  createHeroSlideTemplate,
  createHeroTextLine,
  createHeroTextSegment,
  useSystemImageStore,
  type HeroTemplateConfig,
  type HeroTextEffect,
  type HeroTextLine,
  type HeroTextSegment,
} from 'src/stores/system-image-store';
import ColorPickerInput from 'src/components/common/ColorPickerInput.vue';
import HeroEditorInput from 'src/components/common/HeroEditorInput.vue';
import HeroEditorSelect from 'src/components/common/HeroEditorSelect.vue';
import HeroEditorSlider from 'src/components/common/HeroEditorSlider.vue';

interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  icon: string;
  iconColor: string;
  confirmColor: string;
  confirmIcon: string;
}

type ConfirmAction = () => void;

interface IntlSegmenterConstructor {
  new (
    locale?: string,
    options?: { granularity?: 'grapheme' },
  ): {
    segment(input: string): Iterable<{ segment: string }>;
  };
}

const $q = useQuasar();
const heroStore = useSystemImageStore();
heroStore.init();

const fileInput = ref<HTMLInputElement | null>(null);
const replacementFileInput = ref<HTMLInputElement | null>(null);
const previewRef = ref<HTMLElement | null>(null);
const previewScale = ref(1);

const heroPreviewBaseWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1920);
const isPreviewPinned = ref(false);
const animationKey = ref(0);

const heroTypedCharCounts = ref<number[]>([]);
const heroTypingLineIndex = ref(-1);
const isHeroTypingComplete = ref(false);
let heroTypingTimer: ReturnType<typeof setTimeout> | null = null;

function clearHeroTypingTimer(): void {
  if (heroTypingTimer) {
    clearTimeout(heroTypingTimer);
    heroTypingTimer = null;
  }
}

function stopHeroTyping(): void {
  clearHeroTypingTimer();
  heroTypingLineIndex.value = -1;
  heroTypedCharCounts.value = [];
  isHeroTypingComplete.value = false;
}

function startHeroTyping(): void {
  clearHeroTypingTimer();
  const lineCount = enabledPreviewLines.value.length;
  heroTypedCharCounts.value = Array.from({ length: lineCount }, () => 0);
  heroTypingLineIndex.value = -1;
  isHeroTypingComplete.value = lineCount === 0;

  if (lineCount === 0) return;

  heroTypingTimer = setTimeout(() => {
    playHeroLine(0);
  }, draftHeroConfig.value.initialDelayMs);
}

function playHeroLine(lineIndex: number): void {
  const lines = enabledPreviewLines.value;
  const currentLine = lines[lineIndex];

  if (lineIndex >= lines.length || !currentLine) {
    heroTypingLineIndex.value = lines.length - 1;
    isHeroTypingComplete.value = true;
    heroTypingTimer = null;
    return;
  }

  heroTypingLineIndex.value = lineIndex;

  if (currentLine.effect === 'typewriter') {
    typeHeroLine(lineIndex, 0);
    return;
  }

  heroTypedCharCounts.value[lineIndex] = getHeroLineCharacterLength(currentLine);
  const effectDuration = currentLine.effect === 'none' ? 0 : currentLine.durationMs;
  heroTypingTimer = setTimeout(() => {
    playHeroLine(lineIndex + 1);
  }, effectDuration + currentLine.gapMs);
}

function typeHeroLine(lineIndex: number, characterIndex: number): void {
  const lines = enabledPreviewLines.value;
  const currentLine = lines[lineIndex];

  if (lineIndex >= lines.length || !currentLine) {
    playHeroLine(lineIndex);
    return;
  }

  const totalCharacters = getHeroLineCharacterLength(currentLine);
  const duration = currentLine.durationMs;
  const interval = Math.max(Math.round(duration / Math.max(totalCharacters, 1)), 24);

  if (characterIndex < totalCharacters) {
    heroTypedCharCounts.value[lineIndex] = characterIndex + 1;
    heroTypingTimer = setTimeout(() => {
      typeHeroLine(lineIndex, characterIndex + 1);
    }, interval);
    return;
  }

  heroTypingTimer = setTimeout(() => {
    playHeroLine(lineIndex + 1);
  }, currentLine.gapMs);
}

function restartPreviewAnimation() {
  animationKey.value++;
  startHeroTyping();
}

const draftHeroConfig = ref<HeroTemplateConfig>(cloneHeroTemplateConfig(heroStore.heroConfig));
const savedSnapshot = ref(serializeHeroConfig(draftHeroConfig.value));
const selectedSlideId = ref(draftHeroConfig.value.slides[0]?.id ?? '');
const isHeroSettingsOpen = ref(true);
const isTextBlockSettingsOpen = ref(true);
const isDraggingFile = ref(false);
const isDraggingText = ref(false);
const dragInitialMouse = ref({ x: 0, y: 0 });
const dragInitialPercent = ref({ x: 0, y: 0 });
const dragBlockSizePercent = ref({ width: 0, height: 0 });

const isDraggingBg = ref(false);
const bgDragInitialMouse = ref({ x: 0, y: 0 });
const bgDragInitialPercent = ref({ x: 50, y: 50 });
const currentSlideImageSize = ref({ w: 0, h: 0 });

const isXInputFocused = ref(false);
const isYInputFocused = ref(false);

const pendingConfirmAction = ref<ConfirmAction | null>(null);
const editingSegmentId = ref<string | null>(null);
let previewResizeObserver: ResizeObserver | null = null;

const confirmDialog = reactive<ConfirmDialogState>({
  open: false,
  title: '',
  message: '',
  confirmLabel: 'ยืนยัน',
  cancelLabel: 'ยกเลิก',
  icon: 'help_outline',
  iconColor: 'primary',
  confirmColor: 'primary',
  confirmIcon: 'check',
});

const textAlignOptions = [
  { label: 'ซ้าย', value: 'left' },
  { label: 'กลาง', value: 'center' },
  { label: 'ขวา', value: 'right' },
];

const effectOptions: { label: string; value: HeroTextEffect }[] = [
  { label: 'Fade in', value: 'fade' },
  { label: 'Slide up', value: 'slide-up' },
  { label: 'Typewriter', value: 'typewriter' },
  { label: 'แสดงทันที', value: 'none' },
];

const fontFamilyOptions = [
  { label: 'Noto Sans Thai', value: "'Noto Sans Thai', sans-serif" },
  {
    label: 'IBM Plex Sans Thai',
    value: "'IBM Plex Sans Thai', 'Noto Sans Thai', sans-serif",
  },
  { label: 'Display Bold', value: "'Arial Black', 'Noto Sans Thai', sans-serif" },
  { label: 'Serif', value: "Georgia, 'Noto Sans Thai', serif" },
  { label: 'Mono', value: "'Courier New', monospace" },
];

const selectedSlide = computed(() =>
  draftHeroConfig.value.slides.find((slide) => slide.id === selectedSlideId.value),
);

const enabledPreviewLines = computed(
  () => selectedSlide.value?.textBlock.lines.filter((line) => line.enabled) ?? [],
);

// Auto-restart animation when settings change
watch(
  () => {
    if (!selectedSlide.value) return null;
    const block = selectedSlide.value.textBlock;
    return JSON.stringify({
      gap: block.gapPx,
      lines: block.lines.map((l) => ({
        eff: l.effect,
        dur: l.durationMs,
        gap: l.gapMs,
        segs: l.segments.map((s) => s.text),
      })),
    });
  },
  () => {
    restartPreviewAnimation();
  },
);

const hasUnsavedChanges = computed(
  () => serializeHeroConfig(draftHeroConfig.value) !== savedSnapshot.value,
);

watch(
  () => selectedSlide.value?.imageUrl,
  (url) => {
    if (url) {
      const img = new Image();
      img.onload = () => {
        currentSlideImageSize.value = { w: img.naturalWidth, h: img.naturalHeight };
      };
      img.src = url;
    }
  },
  { immediate: true },
);

// Auto-add line when enabling text block if it's empty
watch(
  () => selectedSlide.value?.textBlock.enabled,
  (enabled) => {
    if (enabled && selectedSlide.value && selectedSlide.value.textBlock.lines.length === 0) {
      addTextLineToSelectedSlide();
    }
  },
);

watch(
  () => selectedSlide.value?.textBlock.enabled,
  (enabled) => {
    if (!enabled && selectedSlide.value) {
      selectedSlide.value.textBlock.backgroundEnabled = false;
    }
  },
  { immediate: true },
);

const previewTextBlockStyle = computed<CSSProperties>(() => {
  const block = selectedSlide.value?.textBlock;

  if (!block) {
    return {};
  }

  return {
    left: `${block.xPercent}%`,
    top: `${block.yPercent}%`,
    width: `${block.widthPercent}%`,
    gap: `${scalePreviewNumber(block.gapPx)}px`,
    textAlign: block.textAlign,
    background: block.backgroundEnabled ? block.backgroundColor : 'rgba(255, 255, 255, 0.08)',
    paddingTop: `${scalePreviewNumber(block.paddingTopPx)}px`,
    paddingRight: `${scalePreviewNumber(block.paddingRightPx)}px`,
    paddingBottom: `${scalePreviewNumber(block.paddingBottomPx)}px`,
    paddingLeft: `${scalePreviewNumber(block.paddingLeftPx)}px`,
    borderRadius: `${scalePreviewNumber(block.borderRadiusPx)}px`,
  };
});

watch(
  () => draftHeroConfig.value.slides.map((slide) => slide.id),
  (slideIds) => {
    if (!slideIds.includes(selectedSlideId.value)) {
      selectedSlideId.value = slideIds[0] ?? '';
    }
  },
);

watch(
  () => heroStore.heroConfig,
  (config) => {
    if (hasUnsavedChanges.value) {
      return;
    }

    draftHeroConfig.value = cloneHeroTemplateConfig(config);
    savedSnapshot.value = serializeHeroConfig(draftHeroConfig.value);
    selectedSlideId.value = draftHeroConfig.value.slides[0]?.id ?? '';
  },
  { deep: true },
);

function getPreviewLineStyle(line: HeroTextLine): CSSProperties {
  return {
    fontFamily: line.fontFamily,
    fontSize: `${scalePreviewNumber(line.fontSizePx)}px`,
    fontWeight: line.fontWeight,
    lineHeight: line.lineHeight,
    letterSpacing: scalePreviewCssLength(line.letterSpacing),
  };
}

function getEffectLabel(effect: HeroTextEffect): string {
  return effectOptions.find((option) => option.value === effect)?.label ?? 'Fade in';
}

function getHeroLineCharacterLength(line: HeroTextLine): number {
  return line.segments.reduce(
    (total, segment) => total + getHeroTextSegments(segment.text).length,
    0,
  );
}

function getHeroTextSegments(text: string): string[] {
  const Segmenter = (Intl as unknown as { Segmenter?: IntlSegmenterConstructor }).Segmenter;
  if (!Segmenter) return Array.from(text);
  return Array.from(
    new Segmenter(undefined, { granularity: 'grapheme' }).segment(text),
    (part) => part.segment,
  );
}

function getVisibleHeroSegments(line: HeroTextLine, lineIndex: number): HeroTextSegment[] {
  if (!isHeroLineVisible(lineIndex)) return [];
  if (line.effect !== 'typewriter') return line.segments;

  let remainingCharacters = heroTypedCharCounts.value[lineIndex] ?? 0;
  if (isHeroTypingComplete.value || heroTypingLineIndex.value > lineIndex) {
    remainingCharacters = getHeroLineCharacterLength(line);
  }

  return line.segments
    .map((segment) => {
      if (remainingCharacters <= 0) return { ...segment, text: '' };
      const segmentCharacters = getHeroTextSegments(segment.text);
      const visibleCharacters = segmentCharacters.slice(0, remainingCharacters);
      remainingCharacters -= visibleCharacters.length;
      return { ...segment, text: visibleCharacters.join('') };
    })
    .filter((segment) => segment.text.length > 0);
}

function isHeroLineVisible(lineIndex: number): boolean {
  return (
    isHeroTypingComplete.value ||
    heroTypingLineIndex.value >= lineIndex ||
    (heroTypedCharCounts.value[lineIndex] ?? 0) > 0
  );
}

function getLinePlainText(line: HeroTextLine): string {
  return line.segments.map((segment) => segment.text).join('');
}

function onImageSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (file) {
    requestAddImageFile(file);
  }

  input.value = '';
}

function onReplacementImageSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (file) {
    requestReplaceImageFile(file);
  }

  input.value = '';
}

function onImageDrop(event: DragEvent): void {
  isDraggingFile.value = false;
  const file = Array.from(event.dataTransfer?.files ?? []).find((item) =>
    item.type.startsWith('image/'),
  );

  if (file) {
    requestAddImageFile(file);
  }
}

function requestAddImageFile(file: File): void {
  if (!isValidImageFile(file)) {
    notifyInvalidImageFile();
    return;
  }

  openConfirmDialog(
    {
      title: 'ยืนยันการเพิ่มรูป Hero?',
      message: `ต้องการเพิ่ม "${file.name}" เป็นรูป Hero ใหม่หรือไม่`,
      confirmLabel: 'เพิ่มรูป',
      icon: 'add_photo_alternate',
      confirmIcon: 'add',
    },
    () => {
      void addImageFile(file);
    },
  );
}

function requestReplaceImageFile(file: File): void {
  const slide = selectedSlide.value;

  if (!slide) {
    return;
  }

  if (!isValidImageFile(file)) {
    notifyInvalidImageFile();
    return;
  }

  openConfirmDialog(
    {
      title: 'ยืนยันการเปลี่ยนรูป Hero?',
      message: `ต้องการเปลี่ยนรูปของ "${slide.name}" เป็น "${file.name}" หรือไม่`,
      confirmLabel: 'เปลี่ยนรูป',
      icon: 'image',
      confirmIcon: 'image',
    },
    () => {
      void replaceSlideImageFile(slide.id, file);
    },
  );
}

function addImageFile(file: File): Promise<void> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = typeof reader.result === 'string' ? reader.result : '';
      const slide = createHeroSlideTemplate(imageUrl, getImageName(file));
      draftHeroConfig.value.slides.push(slide);
      selectedSlideId.value = slide.id;
      notifyDraftChanged('เพิ่มรูปใน draft แล้ว กดยืนยันการบันทึกเพื่อใช้จริง');
      resolve();
    };
    reader.readAsDataURL(file);
  });
}

function replaceSlideImageFile(slideId: string, file: File): Promise<void> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = typeof reader.result === 'string' ? reader.result : '';
      const slide = draftHeroConfig.value.slides.find((item) => item.id === slideId);

      if (slide) {
        slide.imageUrl = imageUrl;
        notifyDraftChanged('เปลี่ยนรูปใน draft แล้ว กดยืนยันการบันทึกเพื่อใช้จริง');
      }

      resolve();
    };
    reader.readAsDataURL(file);
  });
}

function requestDeleteSelectedSlide(): void {
  if (!selectedSlide.value || draftHeroConfig.value.slides.length <= 1) {
    return;
  }

  const slideName = selectedSlide.value.name;
  const slideId = selectedSlide.value.id;

  openConfirmDialog(
    {
      title: 'ยืนยันการลบรูป Hero?',
      message: `ต้องการลบ "${slideName}" ออกจาก draft หรือไม่`,
      confirmLabel: 'ลบรูป',
      icon: 'delete',
      iconColor: 'negative',
      confirmColor: 'negative',
      confirmIcon: 'delete',
    },
    () => {
      deleteSelectedSlide(slideId);
    },
  );
}

function deleteSelectedSlide(slideId: string): void {
  if (draftHeroConfig.value.slides.length <= 1) {
    return;
  }

  draftHeroConfig.value.slides = draftHeroConfig.value.slides.filter(
    (slide) => slide.id !== slideId,
  );
  selectedSlideId.value = draftHeroConfig.value.slides[0]?.id ?? '';
  notifyDraftChanged('ลบรูปออกจาก draft แล้ว กดยืนยันการบันทึกเพื่อใช้จริง');
}

function requestResetTemplate(): void {
  openConfirmDialog(
    {
      title: 'ยืนยันการ reset template?',
      message:
        'ระบบจะคืนค่า Hero template ใน draft เป็นค่าเริ่มต้น และยังไม่ใช้จริงจนกดยืนยันการบันทึก',
      confirmLabel: 'Reset draft',
      icon: 'restart_alt',
      iconColor: 'negative',
      confirmColor: 'negative',
      confirmIcon: 'restart_alt',
    },
    () => {
      draftHeroConfig.value = createDefaultHeroTemplateConfig();
      selectedSlideId.value = draftHeroConfig.value.slides[0]?.id ?? '';
      notifyDraftChanged('Reset draft แล้ว กดยืนยันการบันทึกเพื่อใช้จริง');
    },
  );
}

function requestDiscardDraft(): void {
  if (!hasUnsavedChanges.value) {
    return;
  }

  openConfirmDialog(
    {
      title: 'ยืนยันการยกเลิก draft?',
      message: 'การแก้ไขที่ยังไม่บันทึกจะถูกยกเลิกทั้งหมด และกลับไปใช้ค่าที่บันทึกล่าสุด',
      confirmLabel: 'ยกเลิก draft',
      icon: 'undo',
      iconColor: 'warning',
      confirmColor: 'warning',
      confirmIcon: 'undo',
    },
    discardDraft,
  );
}

function requestSaveTemplate(): void {
  if (!hasUnsavedChanges.value) {
    $q.notify({ type: 'info', message: 'ยังไม่มีการเปลี่ยนแปลงให้บันทึก', position: 'top' });
    return;
  }

  openConfirmDialog(
    {
      title: 'ยืนยันการบันทึก Hero template?',
      message: 'หลังยืนยัน การเปลี่ยนแปลงนี้จะถูกใช้บนหน้า main และบันทึกลงระบบทันที',
      confirmLabel: 'ยืนยันบันทึก',
      icon: 'save',
      confirmIcon: 'save',
    },
    saveDraftTemplate,
  );
}

function saveDraftTemplate(): void {
  heroStore.setHeroConfig(draftHeroConfig.value);
  draftHeroConfig.value = cloneHeroTemplateConfig(heroStore.heroConfig);
  savedSnapshot.value = serializeHeroConfig(draftHeroConfig.value);
  selectedSlideId.value = draftHeroConfig.value.slides[0]?.id ?? '';
  $q.notify({ type: 'positive', message: 'บันทึก Hero template แล้ว', position: 'top' });
}

function discardDraft(): void {
  draftHeroConfig.value = cloneHeroTemplateConfig(heroStore.heroConfig);
  savedSnapshot.value = serializeHeroConfig(draftHeroConfig.value);
  selectedSlideId.value = draftHeroConfig.value.slides[0]?.id ?? '';
  $q.notify({ type: 'info', message: 'ยกเลิก draft แล้ว', position: 'top' });
}

function addTextLineToSelectedSlide(): void {
  const slide = selectedSlide.value;

  if (!slide) {
    return;
  }

  slide.textBlock.enabled = true;
  slide.textBlock.lines.push(createHeroTextLine(slide.textBlock.lines.length));
}

function addTextSegmentToLine(line: HeroTextLine): void {
  line.segments.push(createHeroTextSegment(line));
}

function requestDeleteHeroTextLine(lineId: string): void {
  const line = selectedSlide.value?.textBlock.lines.find((item) => item.id === lineId);

  if (!line) {
    return;
  }

  openConfirmDialog(
    {
      title: 'ยืนยันการลบบรรทัด?',
      message: `ต้องการลบบรรทัด "${line.label || getLinePlainText(line) || line.id}" ออกจาก draft หรือไม่`,
      confirmLabel: 'ลบบรรทัด',
      icon: 'delete',
      iconColor: 'negative',
      confirmColor: 'negative',
      confirmIcon: 'delete',
    },
    () => {
      deleteHeroTextLine(lineId);
    },
  );
}

function deleteHeroTextLine(lineId: string): void {
  const slide = selectedSlide.value;

  if (!slide) {
    return;
  }

  slide.textBlock.lines = slide.textBlock.lines.filter((line) => line.id !== lineId);
}

function requestDeleteHeroTextSegment(line: HeroTextLine, segmentId: string): void {
  if (line.segments.length <= 1) {
    return;
  }

  const segment = line.segments.find((item) => item.id === segmentId);

  openConfirmDialog(
    {
      title: 'ยืนยันการลบช่วงข้อความ?',
      message: `ต้องการลบ "${segment?.text || 'ช่วงข้อความนี้'}" ออกจาก draft หรือไม่`,
      confirmLabel: 'ลบช่วงข้อความ',
      icon: 'close',
      iconColor: 'negative',
      confirmColor: 'negative',
      confirmIcon: 'delete',
    },
    () => {
      line.segments = line.segments.filter((item) => item.id !== segmentId);
    },
  );
}

function openConfirmDialog(
  options: Partial<Omit<ConfirmDialogState, 'open' | 'cancelLabel'>> & {
    title: string;
    message: string;
    confirmLabel: string;
  },
  action: ConfirmAction,
): void {
  confirmDialog.title = options.title;
  confirmDialog.message = options.message;
  confirmDialog.confirmLabel = options.confirmLabel;
  confirmDialog.cancelLabel = 'ยกเลิก';
  confirmDialog.icon = options.icon ?? 'help_outline';
  confirmDialog.iconColor = options.iconColor ?? 'primary';
  confirmDialog.confirmColor = options.confirmColor ?? 'primary';
  confirmDialog.confirmIcon = options.confirmIcon ?? 'check';
  pendingConfirmAction.value = action;
  confirmDialog.open = true;
}

function handleConfirmDialog(): void {
  const action = pendingConfirmAction.value;
  clearPendingConfirmAction();
  action?.();
}

function clearPendingConfirmAction(): void {
  pendingConfirmAction.value = null;
}

import { nextTick } from 'vue';

function startInlineEdit(segment: HeroTextSegment, event: MouseEvent): void {
  editingSegmentId.value = segment.id;

  void nextTick(() => {
    const target = event.target as HTMLElement;
    if (target) {
      target.focus();

      try {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(target);
        range.collapse(false);
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch {
        // ignore selection errors
      }
    }
  });
}

function finishInlineEdit(segment: HeroTextSegment, event: FocusEvent): void {
  const element = event.target as HTMLElement | null;

  if (element && editingSegmentId.value === segment.id) {
    const newText = element.textContent ?? '';
    segment.text = newText;
  }

  editingSegmentId.value = null;
}

function startTextDrag(event: PointerEvent): void {
  if (!selectedSlide.value || editingSegmentId.value !== null) {
    return;
  }

  const preview = previewRef.value;
  const target = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;

  if (!preview || !target) {
    return;
  }

  const previewRect = preview.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  dragInitialMouse.value = { x: event.clientX, y: event.clientY };
  dragInitialPercent.value = {
    x: selectedSlide.value.textBlock.xPercent,
    y: selectedSlide.value.textBlock.yPercent,
  };

  dragBlockSizePercent.value = {
    width: (targetRect.width / previewRect.width) * 100,
    height: (targetRect.height / previewRect.height) * 100,
  };

  target.setPointerCapture?.(event.pointerId);
  isDraggingText.value = true;
  window.addEventListener('pointermove', updateTextPosition);
  window.addEventListener('pointerup', stopTextDrag, { once: true });
}

function updateTextPosition(event: PointerEvent): void {
  const preview = previewRef.value;
  const slide = selectedSlide.value;

  if (!preview || !slide || !isDraggingText.value) {
    return;
  }

  const rect = preview.getBoundingClientRect();

  const deltaX = event.clientX - dragInitialMouse.value.x;
  const deltaY = event.clientY - dragInitialMouse.value.y;

  const newX = dragInitialPercent.value.x + (deltaX / rect.width) * 100;
  const newY = dragInitialPercent.value.y + (deltaY / rect.height) * 100;

  const maxX = Math.max(0, 100 - dragBlockSizePercent.value.width);
  const maxY = Math.max(0, 100 - dragBlockSizePercent.value.height);

  slide.textBlock.xPercent = clamp(newX, 0, maxX);
  slide.textBlock.yPercent = clamp(newY, 0, maxY);
}

function stopTextDrag(): void {
  isDraggingText.value = false;
  dragInitialMouse.value = { x: 0, y: 0 };
  dragInitialPercent.value = { x: 0, y: 0 };
  dragBlockSizePercent.value = { width: 0, height: 0 };
  window.removeEventListener('pointermove', updateTextPosition);
}

// === Background Drag Panning Logic ===

function parsePosition(pos: string): { x: number; y: number } {
  if (!pos) return { x: 50, y: 50 };
  const parts = pos.trim().split(/\s+/);
  let xStr = parts[0] || '50%';
  let yStr = parts[1] || '50%';

  const mapToPercent = (val: string, defaultVal: number) => {
    if (val === 'center') return 50;
    if (val === 'left' || val === 'top') return 0;
    if (val === 'right' || val === 'bottom') return 100;
    if (val.endsWith('%')) return parseFloat(val.replace('%', ''));
    return defaultVal;
  };

  if (parts.length === 1) {
    if (['top', 'bottom'].includes(xStr)) {
      yStr = xStr;
      xStr = 'center';
    } else {
      yStr = 'center';
    }
  }

  return {
    x: mapToPercent(xStr, 50),
    y: mapToPercent(yStr, 50),
  };
}

const bgPosX = computed({
  get: () => parsePosition(selectedSlide.value?.backgroundPosition || '').x,
  set: (val: number) => {
    if (selectedSlide.value && canDragBgX.value) {
      const current = parsePosition(selectedSlide.value.backgroundPosition);
      selectedSlide.value.backgroundPosition = `${val}% ${current.y}%`;
    }
  },
});

const bgPosY = computed({
  get: () => parsePosition(selectedSlide.value?.backgroundPosition || '').y,
  set: (val: number) => {
    if (selectedSlide.value && canDragBgY.value) {
      const current = parsePosition(selectedSlide.value.backgroundPosition);
      selectedSlide.value.backgroundPosition = `${current.x}% ${val}%`;
    }
  },
});

const canDragBgX = computed(() => {
  if (!previewScale.value || !currentSlideImageSize.value.w || !previewRef.value) return true;
  const rect = previewRef.value.getBoundingClientRect();
  if (rect.height === 0) return true;
  const imageRatio = currentSlideImageSize.value.w / currentSlideImageSize.value.h;
  const containerRatio = 1920 / 600; // Fixed aspect ratio for hero
  return imageRatio > containerRatio + 0.01;
});

const canDragBgY = computed(() => {
  if (!previewScale.value || !currentSlideImageSize.value.h || !previewRef.value) return true;
  const rect = previewRef.value.getBoundingClientRect();
  if (rect.height === 0) return true;
  const imageRatio = currentSlideImageSize.value.w / currentSlideImageSize.value.h;
  const containerRatio = 1920 / 600; // Fixed aspect ratio for hero
  return imageRatio < containerRatio - 0.01;
});

watch(canDragBgX, (can) => {
  if (!can && selectedSlide.value) {
    const current = parsePosition(selectedSlide.value.backgroundPosition);
    selectedSlide.value.backgroundPosition = `50% ${current.y}%`;
  }
});

watch(canDragBgY, (can) => {
  if (!can && selectedSlide.value) {
    const current = parsePosition(selectedSlide.value.backgroundPosition);
    selectedSlide.value.backgroundPosition = `${current.x}% 50%`;
  }
});

function startBgDrag(event: PointerEvent): void {
  if (!selectedSlide.value || isDraggingText.value || editingSegmentId.value !== null) {
    return;
  }

  const target = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
  if (!target) return;

  const currentPos = parsePosition(selectedSlide.value.backgroundPosition);

  bgDragInitialMouse.value = { x: event.clientX, y: event.clientY };
  bgDragInitialPercent.value = { x: currentPos.x, y: currentPos.y };

  target.setPointerCapture?.(event.pointerId);
  isDraggingBg.value = true;
  window.addEventListener('pointermove', updateBgPosition);
  window.addEventListener('pointerup', stopBgDrag, { once: true });
}

function updateBgPosition(event: PointerEvent): void {
  const preview = previewRef.value;
  const slide = selectedSlide.value;

  if (!preview || !slide || !isDraggingBg.value) {
    return;
  }

  const rect = preview.getBoundingClientRect();
  const deltaX = event.clientX - bgDragInitialMouse.value.x;
  const deltaY = event.clientY - bgDragInitialMouse.value.y;

  const sensitivity = 0.5;
  const currentPos = parsePosition(slide.backgroundPosition);
  let newX = currentPos.x;
  let newY = currentPos.y;

  if (canDragBgX.value) {
    newX = bgDragInitialPercent.value.x - (deltaX / rect.width) * 100 * sensitivity;
    newX = clamp(Math.round(newX * 10) / 10, 0, 100);
  }

  if (canDragBgY.value) {
    newY = bgDragInitialPercent.value.y - (deltaY / rect.height) * 100 * sensitivity;
    newY = clamp(Math.round(newY * 10) / 10, 0, 100);
  }

  slide.backgroundPosition = `${newX}% ${newY}%`;
}

function stopBgDrag(): void {
  isDraggingBg.value = false;
  window.removeEventListener('pointermove', updateBgPosition);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(Number.isFinite(value) ? value : min, min), max);
}

function updatePreviewScale(): void {
  if (!previewRef.value) return;
  const container = previewRef.value.parentElement;
  if (!container) return;
  const scale = container.offsetWidth / 1920;
  previewScale.value = Math.min(scale, 1);
}

function onWindowResize() {
  heroPreviewBaseWidth.value = Math.max(1024, window.innerWidth);
  updatePreviewScale();
}

function scalePreviewNumber(value: number): number {
  return Math.round(value * previewScale.value * 100) / 100;
}

function scalePreviewCssLength(value: string): string {
  const trimmedValue = value.trim();
  const match = trimmedValue.match(/^(-?\d+(?:\.\d+)?)(px|rem)$/);

  if (!match?.[1] || !match[2]) {
    return value;
  }

  const multiplier = match[2] === 'rem' ? 16 : 1;
  return `${scalePreviewNumber(Number(match[1]) * multiplier)}px`;
}

function getImageName(file: File): string {
  return file.name.replace(/\.[^.]+$/, '') || 'New Hero Image';
}

function isValidImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

function notifyInvalidImageFile(): void {
  $q.notify({ type: 'negative', message: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น', position: 'top' });
}

function notifyDraftChanged(message: string): void {
  $q.notify({ type: 'info', message, position: 'top' });
}

function serializeHeroConfig(config: HeroTemplateConfig): string {
  return JSON.stringify(config);
}

onMounted(() => {
  updatePreviewScale();
  if (typeof window !== 'undefined') {
    heroPreviewBaseWidth.value = Math.max(1024, window.innerWidth);
    window.addEventListener('resize', onWindowResize);
  }

  if (!previewRef.value) {
    return;
  }

  previewResizeObserver = new ResizeObserver(updatePreviewScale);
  previewResizeObserver.observe(previewRef.value);

  startHeroTyping();
});

onBeforeUnmount(() => {
  stopHeroTyping();
  previewResizeObserver?.disconnect();
  window.removeEventListener('pointermove', updateTextPosition);
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', onWindowResize);
  }
});
</script>

<style lang="scss" scoped>
.hero-template-editor {
  display: grid;
  gap: 18px;
}

/* Hide native number spin buttons to fix alignment in dense inputs */
.hero-template-editor :deep(input[type='number']::-webkit-outer-spin-button),
.hero-template-editor :deep(input[type='number']::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}
.hero-template-editor :deep(input[type='number']) {
  -moz-appearance: textfield;
  appearance: textfield;
}

.hero-template-editor__layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 18px;
}

.hero-template-sidebar,
.hero-template-workspace,
.hero-control-card {
  border: 1px solid rgba(16, 35, 63, 0.09);
  border-radius: 18px;
  background: #ffffff;
}

.hero-template-sidebar {
  align-self: start;
  display: grid;
  gap: 16px;
  padding: 18px;
}

.hero-template-sidebar__header,
.hero-template-toolbar,
.hero-control-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.hero-template-sidebar__header p,
.hero-template-toolbar p {
  margin: 0 0 5px;
  color: #b7791f;
  font-size: 0.72rem;
  font-weight: 950;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.hero-template-sidebar__header h4,
.hero-template-toolbar h4,
.hero-control-card h5 {
  margin: 0;
  color: #10233f;
  font-weight: 950;
  letter-spacing: -0.02em;
}

.hero-drop-zone {
  display: grid;
  place-items: center;
  gap: 7px;
  min-height: 160px;
  padding: 18px;
  border: 1.5px dashed rgba(15, 118, 110, 0.34);
  border-radius: 16px;
  color: #0f766e;
  background:
    radial-gradient(circle at top right, rgba(245, 166, 35, 0.1), transparent 34%), #f8fffd;
  cursor: pointer;
  text-align: center;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.hero-drop-zone strong {
  color: #10233f;
}

.hero-drop-zone span {
  color: #65758a;
  font-size: 0.82rem;
}

.hero-drop-zone--active,
.hero-drop-zone:hover {
  border-color: #f5a623;
  box-shadow: 0 14px 28px rgba(15, 118, 110, 0.1);
  transform: translateY(-2px);
}

.hero-global-settings {
  display: grid;
  gap: 10px;
}

.hero-slide-list {
  display: grid;
  gap: 10px;
  max-height: 360px;
  overflow: auto;
  margin-top: 6px;
  padding: 4px 4px 4px 0;
}

.color-picker-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.hero-slide-picker {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 8px;
  border: 1px solid rgba(16, 35, 63, 0.09);
  border-radius: 16px;
  background: #f8fafc;
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.hero-slide-picker:hover {
  border-color: rgba(245, 166, 35, 0.24);
  background: #ffffff;
  box-shadow:
    0 12px 24px rgba(17, 24, 39, 0.08),
    0 0 0 1px rgba(245, 166, 35, 0.08);
}

.hero-slide-picker--active {
  border-color: rgba(245, 166, 35, 0.52);
  box-shadow:
    0 10px 20px rgba(17, 24, 39, 0.07),
    0 0 0 1px rgba(245, 166, 35, 0.1);
}

.hero-slide-picker img {
  width: 72px;
  height: 44px;
  border-radius: 11px;
  object-fit: cover;
}

.hero-slide-picker strong,
.hero-slide-picker small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-slide-picker strong {
  color: #10233f;
  font-size: 0.88rem;
}

.hero-slide-picker small {
  color: #65758a;
  font-size: 0.76rem;
}

.hero-template-workspace {
  display: grid;
  gap: 16px;
  padding: 18px;
}

.hero-template-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.hero-toolbar-icon-button {
  width: 40px;
  min-width: 40px;
  height: 40px;
}

.hero-draft-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid rgba(15, 118, 110, 0.14);
  border-radius: 18px;
  color: #0f766e;
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.1), rgba(245, 166, 35, 0.09));
  font-size: 0.88rem;
  font-weight: 800;
}

.hero-preview-stage {
  position: relative;
  overflow: hidden;
  width: min(100%, 1040px);
  margin: 0 auto;
  border-radius: 24px;
  background: #111827;
  aspect-ratio: 1920 / 600;
  box-shadow: 0 20px 46px rgba(16, 35, 63, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-preview-stage--pinned {
  position: sticky;
  top: 80px;
  z-index: 1000;
  transform: scale(1);
  transform-origin: top center;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
  border: 2px solid var(--q-primary);
}

.hero-preview-stage__container {
  width: 100%;
  height: 100%;
}

.hero-preview-stage::before {
  content: '';
  display: block;
  padding-bottom: 31.25%; /* 1920/600 aspect ratio */
}

.hero-carousel-preview {
  position: absolute;
  inset: 0;
  height: 100% !important;
  width: 100%;
  background: transparent;
}

.hero-carousel-preview :deep(.q-carousel__slide) {
  padding: 0;
}

.hero-preview-stage__overlay {
  position: absolute;
  inset: 0;
}

.hero-slide {
  cursor: grab;
  user-select: none;
}

.hero-slide--dragging {
  cursor: grabbing !important;
  user-select: none;
}

.hero-bg-hint {
  display: flex;
  align-items: center;
  background-color: rgba(15, 118, 110, 0.05);
  padding: 10px 14px;
  border-radius: 12px;
  color: #0f766e;
  font-size: 0.86rem;
}

.hero-slider-field {
  padding: 0 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-preview-text-block {
  position: absolute;
  z-index: 2;
  display: grid;
  max-width: calc(100% - 24px);
  border: 1px dashed rgba(245, 166, 35, 0.86);
  box-shadow: 0 0 0 999px rgba(16, 35, 63, 0.08);
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.hero-preview-text-block--dragging {
  cursor: grabbing;
  border-color: #0f766e;
}

.hero-preview-text-block--editing {
  cursor: default;
}

.hero-preview-text-line {
  max-width: 100%;
  overflow-wrap: anywhere;
  opacity: 0;
  transform: translateY(0);
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.hero-type-line--visible {
  opacity: 1;
  transform: translateY(0);
}

.hero-type-line--effect-slide-up {
  transform: translateY(18px);
}

.hero-type-line--effect-slide-up.hero-type-line--visible {
  transform: translateY(0);
}

.hero-type-line--effect-typewriter {
  opacity: 1;
  transition: none;
}

.hero-type-line--effect-none {
  opacity: 1;
  transition: none;
}

.hero-preview-segment {
  cursor: grab;
  transition: outline 0.15s ease;
  outline: 2px solid transparent;
  outline-offset: 2px;
  border-radius: 3px;
}

.hero-preview-segment:hover {
  outline-color: rgba(245, 166, 35, 0.5);
}

.hero-preview-segment--editing {
  cursor: text;
  outline: 2px solid #f5a623;
  background: rgba(255, 255, 255, 0.14);
  user-select: text;
}

.hero-editor-note {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 0.88rem;
  font-weight: 750;
}

.hero-control-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  align-items: start;
}

.hero-control-card {
  align-self: start;
  padding: 18px;
  border-radius: 16px;
  background: white;
  border: 1px solid rgba(16, 35, 63, 0.1);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.hero-control-card:hover {
  transform: translateY(-2px);
  border-color: rgba(245, 166, 35, 0.24);
  box-shadow:
    0 12px 24px rgba(17, 24, 39, 0.08),
    0 0 0 1px rgba(245, 166, 35, 0.08);
}

.hero-control-card--collapsible {
  padding: 0 !important;
  overflow: hidden;
  background: #ffffff !important;
  border: 1px solid rgba(16, 35, 63, 0.1);
}

.hero-control-card--collapsible :deep(.q-expansion-item__container),
.hero-control-card--collapsible :deep(.q-item) {
  background: #ffffff !important;
  border: none !important;
  box-shadow: none !important;
}

.hero-control-card--collapsible :deep(.q-item) {
  min-height: 48px;
  transition: background-color 0.3s ease;
}

.hero-control-card--collapsible :deep(.q-item:hover) {
  background: rgba(15, 23, 42, 0.03) !important;
}

.hero-control-card--collapsible :deep(.q-expansion-item__content) {
  background: white;
  border-top: 1px solid rgba(16, 35, 63, 0.08);
}

.hero-control-card h5 {
  margin-bottom: 14px;
}

.hero-control-card__header h5 {
  margin-bottom: 4px;
}

.hero-control-card__header p {
  margin: 0;
  color: #65758a;
  font-size: 0.86rem;
}

.hero-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.hero-form-span-full {
  grid-column: 1 / -1;
}

.hero-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  grid-column: 1 / -1;
}

.hero-form-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 2px 2px 6px;
}

.hero-color-input {
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 9px;
  background: transparent;
  cursor: pointer;
}

.hero-image-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
  color: #65758a;
  font-size: 0.82rem;
  font-weight: 700;
}

.hero-main-outline-button {
  width: fit-content;
  color: var(--q-primary) !important;
  background: #ffffff !important;
  border-color: rgba(0, 0, 0, 0.08) !important;
  box-shadow: none !important;
}

.hero-main-outline-button:hover {
  border-color: rgba(245, 166, 35, 0.24) !important;
  box-shadow: 0 12px 24px rgba(17, 24, 39, 0.08) !important;
}

.hero-main-outline-button--compact {
  min-height: 38px !important;
  padding: 6px 16px !important;
}

.hero-padding-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.hero-form-grid--line-settings {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.hero-inline-controls {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 12px;
  align-items: center;
  margin-top: 12px;
}

.hero-text-lines-card {
  display: grid;
  gap: 10px;
}

.hero-line-editor {
  border: 1px solid rgba(16, 35, 63, 0.08);
  border-radius: 18px;
  overflow: hidden;
}

.hero-line-editor__body {
  display: grid;
  gap: 12px;
  padding: 14px;
  background: #fbfdff;
}

.hero-line-editor__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 42px;
}

.hero-line-editor__actions span {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 850;
}

.hero-line-header-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.hero-line-effect-badge {
  font-size: 0.68rem;
  vertical-align: middle;
}

.hero-segment-list {
  display: grid;
  gap: 10px;
}

.hero-segment-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px 150px 40px;
  gap: 10px;
  align-items: center;
}

@media (max-width: 1100px) {
  .hero-template-editor__layout,
  .hero-control-grid,
  .hero-form-grid--line-settings {
    grid-template-columns: 1fr;
  }

  .hero-template-sidebar {
    position: static;
  }

  .hero-padding-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .hero-form-grid,
  .hero-inline-controls,
  .hero-line-editor__actions,
  .hero-segment-row {
    grid-template-columns: 1fr;
  }

  .hero-line-editor__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-form-toggle-row {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-template-toolbar,
  .hero-control-card__header {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-padding-grid {
    grid-template-columns: 1fr;
  }
}
</style>
