<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import Sortable from "sortablejs";
import type {
  UniqueIdentifier,
  SortableTreeProps,
  SortableTreeEmits,
  FlattenedItem,
} from "../types/tree";
import { useTree } from "./useTree";
import { useTreeDrag } from "./useTreeDrag";
import { insertNodeAt, removeNode } from "../utils";
import "./index.css";

const props = withDefaults(defineProps<SortableTreeProps>(), {
  items: () => [],
  indentationWidth: 24,
  defaultExpandedLevels: -1, // 默认展开的层级数，-1 展开所有，0 折叠所有
  maxDepth: Infinity,
  disabled: false,
  delay: 0,
  animation: 150,
  swapThreshold: 0.5,
  handle: "",
  filter: ".ignore-elements",
  ghostClass: "sortable-ghost",
  chosenClass: "sortable-chosen",
  dragClass: "sortable-drag",
  fallbackClass: "sortable-fallback",
});

const emit = defineEmits<SortableTreeEmits>();

const listRef = ref<HTMLElement | null>(null);

let sortableInstance: Sortable | null = null;

const {
  flattenedItems,
  visibleItems,
  tempHiddenIds,
  toggleExpand,
  isExpanded,
  expandNode,
  expandAll,
  hideChildren,
  showChildren,
} = useTree(props);

const { dragState, projection, handleDragStart, handleDragEnd, handleDragOver } = useTreeDrag(
  props,
  computed(() => visibleItems.value),
  emit,
);

function isDisabled(item: FlattenedItem, index: number): boolean {
  if (typeof props.disabled === "function") {
    return props.disabled(item, index);
  }
  return props.disabled ?? false;
}

function initSortable() {
  if (!listRef.value) return;

  sortableInstance = Sortable.create(listRef.value, {
    delay: props.delay,
    animation: props.animation,
    swapThreshold: props.swapThreshold,
    handle: props.handle,
    filter: props.filter,
    ghostClass: props.ghostClass,
    chosenClass: props.chosenClass,
    dragClass: props.dragClass,
    forceFallback: true, // 强制使用后备模式，不用 HTML5 原生拖拽
    fallbackClass: props.fallbackClass,
    onStart: (evt) => {
      const index = evt.oldIndex!;
      const item = visibleItems.value[index]!;
      // @ts-ignore
      const originalEvent = evt.originalEvent as MouseEvent | TouchEvent;
      handleDragStart(originalEvent, item, index);

      if (item.hasChildren && isExpanded(item.id)) {
        const timer = setTimeout(() => {
          hideChildren(item.id);
        }, 100);
        originalEvent.target?.addEventListener("mouseup", () => clearTimeout(timer), {
          once: true,
        });
      }
    },
    onChange: (evt) => {
      const index = evt.newIndex!;
      const item = visibleItems.value[index]!;
      handleDragOver(item, index);
    },
    onEnd: (evt) => {
      const from = evt.oldIndex!;
      const to = evt.newIndex!;
      const item = visibleItems.value[from]!;

      if (from !== to) {
        removeNode(evt.item);
        insertNodeAt(evt.from, evt.item, from);
      }

      handleDragEnd(item, from, to);

      if (item.hasChildren) showChildren(item.id);
    },
  });
}

function scrollIntoView(id: UniqueIdentifier, options?: ScrollIntoViewOptions | boolean): void {
  const targetItem = flattenedItems.value.find((item) => item.id === id);
  if (!targetItem) return;

  if (targetItem.path.length > 0) {
    targetItem.path.forEach((ancestorId) => {
      expandNode(ancestorId, true);
    });
  }

  nextTick(() => {
    const domElement = listRef.value?.querySelector(
      `[data-id="${String(id)}"]`,
    ) as HTMLElement | null;
    domElement?.scrollIntoView(options ?? { behavior: "smooth", block: "center" });
  });
}

const itemDepth = (item: FlattenedItem, _index: number) => {
  const isDragging = dragState.value.isDragging && dragState.value.draggedId === item.id;
  const depth = isDragging ? (projection.value?.depth ?? item.depth) : item.depth;
  return depth;
};

onMounted(() => {
  initSortable();
});

onUnmounted(() => {
  sortableInstance?.destroy();
});

watch(
  () => visibleItems.value,
  () => {
    nextTick(() => {
      sortableInstance?.option("disabled", false);
    });
  },
  { deep: true },
);

defineExpose({
  dragState,
  isExpanded,
  expandAll,
  expandNode,
  scrollIntoView,
  getFlattenedItems: () => flattenedItems.value,
});
</script>

<template>
  <div ref="listRef">
    <div
      v-for="(item, index) in visibleItems"
      v-show="!tempHiddenIds.has(item.id)"
      :key="item.id"
      :class="{
        'vue-sortable-item': true,
        [props.filter.slice(1)]: isDisabled(item, index),
      }"
      :data-index="index"
      :data-id="item.id"
    >
      <slot
        :item="item.originalItem"
        :flattened-item="item"
        :index="index"
        :depth="itemDepth(item, index)"
        :is-dragging="dragState.isDragging && dragState.draggedId === item.id"
        :is-leaf="!item.hasChildren"
        :is-expanded="isExpanded(item.id)"
        :toggle-expand="() => toggleExpand(item)"
      >
        <div
          class="vue-sortable-tree-node"
          :style="{
            paddingLeft: `${itemDepth(item, index) * props.indentationWidth}px`,
          }"
        >
          <span
            v-if="item.hasChildren"
            :class="{
              'vue-sortable-tree-icon': true,
              'vue-sortable-tree-icon-expanded': isExpanded(item.id),
              'vue-sortable-tree-icon-collapsed': !isExpanded(item.id),
            }"
            @click.stop="toggleExpand(item)"
          >
            {{ isExpanded(item.id) ? "▼" : "▶" }}
          </span>
          <span v-else class="vue-sortable-tree-icon vue-sortable-tree-icon-leaf"> • </span>

          <span>{{ item.originalItem.label }}</span>
        </div>
      </slot>
    </div>
  </div>
</template>
