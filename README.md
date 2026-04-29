# sortable-tree-vue3

![npm](https://img.shields.io/npm/v/sortable-tree-vue3)
![license](https://img.shields.io/npm/l/sortable-tree-vue3)

基于 Vue 3 + SortableJS 的高性能可拖拽树形组件，支持无限层级的树形结构。

[Live Demo](https://willxiao90.github.io/sortable-tree-vue3/)

## 特性

- 🚀 基于 SortableJS 实现流畅的拖拽体验
- 🌲 支持无限层级的树形结构
- ✨ 拖拽时自动计算插入位置和嵌套层级
- 🎨 支持自定义节点渲染模板
- 🔒 支持禁用特定节点
- 🎯 支持动态新增和删除
- 📦 完整 TypeScript 类型支持

## 安装

```bash
pnpm add sortable-tree-vue3
# 或
npm install sortable-tree-vue3
```

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import SortableTree from 'sortable-tree-vue3'
import 'sortable-tree-vue3/style.css'
import type { TreeItem } from 'sortable-tree-vue3'

const treeData = ref<TreeItem[]>([
  {
    id: '1',
    label: '根节点',
    children: [
      { id: '1-1', label: '子节点 1' },
      { id: '1-2', label: '子节点 2' }
    ]
  }
])

const handleChange = (data: TreeItem[]) => {
  console.log('树结构变化:', data)
}
</script>

<template>
  <SortableTree
    :items="treeData"
    @change="handleChange"
  />
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `TreeItem[]` | `[]` | 树形数据，必填 |
| `indentationWidth` | `number` | `24` | 每个层级缩进的像素宽度 |
| `defaultExpandedLevels` | `number` | `-1` | 默认展开的层级数，`-1` 展开所有，`0` 折叠所有 |
| `maxDepth` | `number` | `Infinity` | 限制树节点最大深度 |
| `disabled` | `boolean \| (item, index) => boolean` | `false` | 禁用节点，可为布尔值或函数 |
| `delay` | `number` | `150` | 拖拽延迟（毫秒） |
| `animation` | `number` | `150` | 排序动画时长（毫秒） |
| `swapThreshold` | `number` | `0.5` | 交换阈值 |
| `handle` | `string` | `-` | CSS 选择器，指定拖拽句柄元素 |
| `filter` | `string` | `'.ignore-elements'` | 忽略拖拽的元素选择器 |
| `ghostClass` | `string` | `'sortable-ghost'` | 拖拽占位符的 CSS 类名 |
| `chosenClass` | `string` | `'sortable-chosen'` | 被选中元素的 CSS 类名 |
| `dragClass` | `string` | `'sortable-drag'` | 拖拽中元素的 CSS 类名 |
| `fallbackClass` | `string` | `'sortable-fallback'` | 后备元素的 CSS 类名 |

### TreeItem 类型

```typescript
interface TreeItem {
  id: string | number // 必须唯一
  label?: string
  children: TreeItem[]
  [key: string]: any
}
```

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `change` | `(data: TreeItem[])` | 树结构发生变化时触发 |
| `start` | `({ item, index, evt })` | 开始拖拽时触发 |
| `over` | `({ item, index })` | 拖拽经过某个节点时触发 |
| `end` | `({ item, from, to, depth, parentId })` | 拖拽结束时触发 |

## Slots

### default 插槽

| 作用域变量 | 类型 | 说明 |
|------------|------|------|
| `item` | `TreeItem` | 原始节点数据 |
| `flattenedItem` | `FlattenedItem` | 扁平化后的节点数据 |
| `index` | `number` | 节点在扁平列表中的索引 |
| `depth` | `number` | 节点嵌套层级 |
| `isDragging` | `boolean` | 是否正在被拖拽 |
| `isLeaf` | `boolean` | 是否为叶节点 |
| `isExpanded` | `boolean` | 节点是否展开 |
| `toggleExpand` | `() => void` | 切换节点展开状态 |

## 方法

通过 `ref` 暴露以下方法：

| 方法 | 参数 | 说明 |
|------|------|------|
| `isExpanded` | `(id: UniqueIdentifier)` | 判断节点是否展开 |
| `expandAll` | `(expand?: boolean)` | 展开或折叠所有节点 |
| `expandNode` | `(id: UniqueIdentifier, expanded: boolean)` | 控制指定节点的展开/收起状态 |
| `scrollIntoView` | `(id: UniqueIdentifier, options?: ScrollIntoViewOptions \| boolean)` | 滚动到指定节点 |
| `getFlattenedItems` | `()` | 获取扁平化后的节点列表 |

```vue
<script setup lang="ts">
import { ref } from 'vue'
import SortableTree from 'sortable-tree-vue3'

const treeRef = ref<InstanceType<typeof SortableTree>>()

// 展开所有节点
treeRef.value?.expandAll()

// 滚动到指定节点
treeRef.value?.scrollIntoView('node-id', { behavior: "smooth", block: "center" })
</script>

<template>
  <SortableTree ref="treeRef" :items="items" />
</template>
```

## 示例

### 自定义树节点内容、展开/收起图标和样式

```vue
<template>
  <SortableTree :items="items" @change="handleChange">
    <template #default="{ item, depth, isLeaf, isExpanded, toggleExpand }">
      <div class="folder-item" :style="{ paddingLeft: `${depth * 30}px` }">
        <!-- 自定义展开/收起图标 -->
        <span
          v-if="!isLeaf"
          class="node-icon"
          :class="{ 'is-expanded': isExpanded }"
          @click.stop="toggleExpand"
        >
        </span>
        <span
          v-else
          class="node-icon"
          :class="{ 'is-leaf': isLeaf }"
        ></span>

        <!-- 自定义树节点内容 -->
        <span class="folder-name">{{ item.label }}</span>
        <button class="delete-btn"> X </button>
      </div>
    </template>
  </SortableTree>
</template>

<style scoped>
/* 树节点样式 */
.folder-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
}
.folder-name {
  color: #2c3e50;
}

/* 展开/收起图标 */
.node-icon {
  display: inline-flex;
  width: 20px;
  height: 20px;
  margin-right: 4px;
  justify-content: center;
  cursor: pointer;
  background: url("../assets/triangle-right.svg") no-repeat center / contain;
}
.node-icon.is-expanded {
  background-image: url("../assets/triangle-down.svg");
}
.node-icon.is-leaf {
  background-image: none;
}

/* sortablejs 相关样式 */
:deep(.vue-sortable-item.sortable-ghost) {
  background-color: lightskyblue;
}
:deep(.vue-sortable-item.sortable-fallback) {
  display: none;
}
</style>
```

### 全部禁用或禁用特定节点

```vue
<script setup lang="ts">
const disableAll = ref(false);
const isDisabled = (item: any, index: number) => {
  return disableAll.value || item.id === "company";
};
</script>

<template>
  <SortableTree :items="items" :disabled="isDisabled" />
</template>
```

更多示例见 [example\components\SortableTreeDemo.vue](example\components\SortableTreeDemo.vue)

## 全局 CSS Class

- vue-sortable-item
- vue-sortable-tree-node
- vue-sortable-tree-icon
- vue-sortable-tree-icon-expanded
- vue-sortable-tree-icon-collapsed
- vue-sortable-tree-icon-leaf

## 协议

本项目采用 [MIT](https://opensource.org/licenses/MIT) 许可证。
