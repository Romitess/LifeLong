<template>
  <q-badge rounded :color="resolvedColor" :label="resolvedLabel" class="base-status-badge" />
</template>

<script setup lang="ts">
import { computed } from 'vue';

/**
 * Standardized status badge so on/off (and other simple status) labels read the
 * same — colour, shape and weight — across every table and detail view.
 *
 * Boolean mode: `<BaseStatusBadge :active="item.status === 'Y'" />`
 * Custom mode:  `<BaseStatusBadge label="ชำระแล้ว" color="positive" />`
 */
interface Props {
  /** On/off state. When set, drives both label and colour from the *Label/*Color props. */
  active?: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  activeColor?: string;
  inactiveColor?: string;
  /** Explicit label override (wins over the active-derived label). */
  label?: string;
  /** Explicit Quasar colour override (wins over the active-derived colour). */
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  activeLabel: 'เปิด',
  inactiveLabel: 'ปิด',
  activeColor: 'positive',
  inactiveColor: 'grey-5',
});

const resolvedLabel = computed(
  () => props.label ?? (props.active ? props.activeLabel : props.inactiveLabel),
);

const resolvedColor = computed(
  () => props.color ?? (props.active ? props.activeColor : props.inactiveColor),
);
</script>

<style lang="scss" scoped>
.base-status-badge {
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 700;
}
</style>
