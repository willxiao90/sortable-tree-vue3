import { ref, computed, watch } from "vue";
import type {
  UniqueIdentifier,
  FlattenedItem,
  SortableTreeProps,
} from "../types/tree";
import { flattenTree, getDescendants } from "../utils/tree";

export function useTree(
  props: Required<SortableTreeProps>,
) {
  const flattenedItems = ref<FlattenedItem[]>([]);
  const collapsedIds = ref<Set<UniqueIdentifier>>(new Set());
  const tempHiddenIds = ref<Set<UniqueIdentifier>>(new Set());
  const firstRender = ref(true);

  function buildFlattenedItems() {
    flattenedItems.value = flattenTree(props.items);
    // console.log("flattened items:", flattenedItems.value);

    if (firstRender.value && props.defaultExpandedLevels >= 0) {
      const maxDepth = props.defaultExpandedLevels - 1;
      const collapsed = flattenedItems.value
        .filter((item) => item.depth > maxDepth && item.hasChildren)
        .map((item) => item.id);
      collapsed.forEach((id) => collapsedIds.value.add(id));
    }
    firstRender.value = false;
  }

  watch(() => props.items, buildFlattenedItems, {
    deep: true,
    immediate: true,
  });

  const visibleItems = computed(() => {
    const collapsed = new Set([...collapsedIds.value]);
    return flattenedItems.value.filter((item) => {
      const parentPath = item.path.slice(0, -1);
      const parentId = parentPath[parentPath.length - 1];
      if (!parentId) return true;
      return !collapsed.has(parentId);
    });
  });

  function isExpanded(id: UniqueIdentifier): boolean {
    return !collapsedIds.value.has(id);
  }

  function expandAll(expanded: boolean = true) {
    if (expanded) {
      collapsedIds.value.clear();
      return;
    }
    flattenedItems.value.forEach((item) => {
      if (item.hasChildren) {
        collapsedIds.value.add(item.id);
      }
    });
  }

  function expandNode(id: UniqueIdentifier, expanded: boolean = true) {
    if (expanded) {
      collapsedIds.value.delete(id);
    } else {
      collapsedIds.value.add(id);

      const targetItem = flattenedItems.value.find((item) => item.id === id);
      if (!targetItem) return;

      targetItem.originalItem.children?.forEach((item) => {
        const hasChildren = !!(item.children && item.children.length > 0);
        if (hasChildren) expandNode(item.id, false);
      });
    }
  }

  function toggleExpand(item: FlattenedItem) {
    if (!item.hasChildren) return;
    expandNode(item.id, !isExpanded(item.id));
  }

  function hideChildren(id: UniqueIdentifier) {
    const children = getDescendants(flattenedItems.value, id);
    children.forEach((id) => tempHiddenIds.value.add(id));
  }

  function showChildren(id: UniqueIdentifier) {
    const children = getDescendants(flattenedItems.value, id);
    children.forEach((id) => tempHiddenIds.value.delete(id));
  }

  return {
    flattenedItems,
    visibleItems,
    tempHiddenIds,
    toggleExpand,
    isExpanded,
    expandAll,
    expandNode,
    hideChildren,
    showChildren,
    buildFlattenedItems,
  };
}
