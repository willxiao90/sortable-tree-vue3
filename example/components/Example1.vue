<script setup lang="ts">
import { ref, nextTick } from "vue";
import SortableTree from "../../src/SortableTree/index.vue";
import type { TreeItem, FlattenedItem } from "../../src/types/tree";
import { folderData } from "../constants";

const treeRef = ref<InstanceType<typeof SortableTree> | null>(null);

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

const resetTree = () => {
  treeData.value = folderData;
};

const expandAll = () => {
  treeRef.value?.expandAll();
  log("Expanded all nodes");
};

const collapseAll = () => {
  treeRef.value?.expandAll(false);
  log("Collapsed all nodes");
};
</script>

<template>
  <section class="demo-section">
    <h2>Basic Example</h2>
    <p class="demo-description">Drag to reorder nodes and change hierarchy</p>
    <div class="demo-controls">
      <button @click="resetTree">Reset</button>
      <button @click="expandAll">Expand All</button>
      <button @click="collapseAll">Collapse All</button>
    </div>
    <SortableTree
      ref="treeRef"
      :items="treeData"
      :defaultExpandedLevels="1"
      @change="handleChange"
      @start="handleStart"
      @over="handleOver"
      @end="handleEnd"
    />
  </section>
</template>
