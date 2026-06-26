<template>
  <div class="image-upload">
    <ImageDisplay
      v-if="model"
      :image-path="model"
      :alt="alt"
      width="100%"
      height="180px"
      border-radius="8px"
    />

    <q-file
      v-model="selectedFile"
      outlined
      dense
      accept="image/jpeg,image/png,image/webp"
      :loading="isUploading"
      :disable="isUploading"
      @update:model-value="onFileSelected"
    >
      <template #prepend>
        <q-icon name="image" />
      </template>
      <template #append>
        <q-btn
          v-if="model"
          flat
          round
          dense
          icon="close"
          :disable="isUploading"
          @click.stop.prevent="clearImage"
        />
      </template>
    </q-file>

    <div v-if="uploadError" class="image-upload__error">
      {{ uploadError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ImageDisplay from './image-display.vue';
import { useImageUpload } from 'src/composables/use-image-upload';

interface Props {
  folder?: string;
  alt?: string;
}

const props = withDefaults(defineProps<Props>(), {
  folder: 'profile',
  alt: 'Uploaded image',
});

const model = defineModel<string | null>({ default: null });
const selectedFile = ref<File | null>(null);
const { isUploading, uploadError, handleImageUpload } = useImageUpload({
  onSuccess: (imagePath) => {
    model.value = imagePath;
  },
});

async function onFileSelected(file: File | null): Promise<void> {
  if (!file) return;
  await handleImageUpload(file, props.folder);
}

function clearImage(): void {
  selectedFile.value = null;
  model.value = null;
}
</script>

<style scoped>
.image-upload {
  display: grid;
  gap: 10px;
}

.image-upload__error {
  color: #c62828;
  font-size: 13px;
  line-height: 1.4;
}
</style>
