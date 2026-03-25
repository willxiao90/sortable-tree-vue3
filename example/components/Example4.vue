<script setup lang="ts">
import { ref } from "vue";
import SortableTree from "../../src/SortableTree/index.vue";
import type { TreeItem, FlattenedItem } from "../../src/types/tree";
import { folderData } from "../constants";

const treeData = ref<TreeItem[]>(folderData);

const log = (msg: string) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
};

const handleChange = (data: TreeItem[]) => {
  console.log({ data });
  treeData.value = data;
};

const handleStart = (data: { item: FlattenedItem; index: number }) => {
  log(`Started dragging: "${data.item.originalItem.label}" at index ${data.index}`);
};

const handleOver = (data: { item: FlattenedItem; index: number }) => {
  log(`Dragged over: "${data.item.originalItem.label}" at index ${data.index}`);
};

const handleEnd = (data: any) => {
  log(
    `Dropped: "${data.item.originalItem.label}" from index ${data.from} to index ${data.to} at depth ${data.depth} under parent ${data.parentId}`,
  );
};

const disableAll = ref(false);
const isDisabled = (item: any, index: number) => {
  return disableAll.value || item.id === "projects";
};
</script>

<template>
  <section class="demo-section">
    <h2>Disabled Nodes</h2>
    <p class="demo-description">Disable all or disable specific nodes</p>
    <div class="demo-controls">
      <button @click="disableAll = !disableAll">
        {{ disableAll ? "Enable All" : "Disable All" }}
      </button>
    </div>
    <SortableTree
      :items="treeData"
      :disabled="isDisabled"
      @change="handleChange"
      @start="handleStart"
      @over="handleOver"
      @end="handleEnd"
    />
  </section>
</template>

<style scoped>
:deep(.vue-sortable-item.ignore-elements) {
  color: gray;
}
</style>
