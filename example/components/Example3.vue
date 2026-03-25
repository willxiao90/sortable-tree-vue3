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

const addFolder = () => {
  const newId = `folder-${Date.now()}`;
  treeData.value = [
    ...treeData.value,
    {
      id: newId,
      label: "New Folder",
      children: [],
    },
  ];
  nextTick(() => {
    treeRef.value?.scrollIntoView(newId);
  });
};

const removeNode = (items: TreeItem[], id: string | number): TreeItem[] => {
  return items
    .filter((item) => item.id !== id)
    .map((item) => ({
      ...item,
      children: item.children ? removeNode(item.children, id) : [],
    }));
};

const handleRemoveNode = (id: string | number) => {
  treeData.value = removeNode(treeData.value, id);
};
</script>

<template>
  <section class="demo-section">
    <h2>Dynamic Add and Remove</h2>
    <p class="demo-description">Dynamically add and remove nodes</p>
    <div class="demo-controls">
      <button @click="addFolder">Add Folder</button>
    </div>
    <div style="height: 400px; overflow-y: auto">
      <SortableTree
        ref="treeRef"
        :items="treeData"
        :indentation-width="30"
        @change="handleChange"
        @start="handleStart"
        @over="handleOver"
        @end="handleEnd"
      >
        <template #default="{ item, flattenedItem, depth, isLeaf, isExpanded, toggleExpand }">
          <div class="folder-item" :style="{ paddingLeft: `${depth * 30}px` }">
            <span
              v-if="!isLeaf"
              class="node-icon"
              :class="{ 'is-expanded': isExpanded }"
              @click.stop="toggleExpand"
            >
            </span>
            <span v-else class="node-icon" :class="{ 'is-leaf': isLeaf }"></span>

            <span class="folder-icon">
              {{ isLeaf ? "📁" : isExpanded ? "📂" : "📁" }}
            </span>
            <span class="folder-name">{{ item.label }}</span>
            <button class="delete-btn" @click.stop="handleRemoveNode(flattenedItem.id)">X</button>
          </div>
        </template>
      </SortableTree>
    </div>
  </section>
</template>

<style scoped>
.folder-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
}

.folder-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.node-icon {
  display: inline-flex;
  width: 20px;
  height: 20px;
  margin-right: 4px;
  justify-content: center;
  cursor: "pointer";
  background: url("../assets/triangle-right.svg") no-repeat center / contain;
}

.node-icon.is-expanded {
  background-image: url("../assets/triangle-down.svg");
}

.node-icon.is-leaf {
  background-image: none;
}

.folder-icon {
  margin-right: 8px;
  font-size: 1.2em;
}

.folder-name {
  font-size: 0.95em;
  color: #2c3e50;
  flex: 1;
}

.delete-btn {
  margin-left: 8px;
  padding: 2px 6px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;
  opacity: 0;
}

.folder-item:hover .delete-btn {
  opacity: 1;
}

:deep(.vue-sortable-item.sortable-ghost) {
  background-color: lightskyblue;
}

:deep(.vue-sortable-item.sortable-fallback) {
  display: none;
}
</style>
