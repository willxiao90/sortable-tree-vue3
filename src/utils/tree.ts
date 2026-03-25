import type { UniqueIdentifier, TreeItem, FlattenedItem, DragProjection } from "../types/tree";
import { arrayMove } from "./array";

export function flattenTree(
  items: TreeItem[],
  parentId: UniqueIdentifier | null = null,
  depth = 0,
  path: UniqueIdentifier[] = [],
): FlattenedItem[] {
  const result: FlattenedItem[] = [];

  for (const item of items) {
    const id = item.id;
    const currentPath = [...path, id];
    const hasChildren = !!(item.children && item.children.length > 0);

    result.push({
      id,
      originalItem: item,
      depth,
      parentId,
      index: items.indexOf(item),
      hasChildren,
      path: currentPath,
    });

    if (hasChildren) {
      result.push(...flattenTree(item.children ?? [], id, depth + 1, currentPath));
    }
  }

  return result;
}

export function buildTree(flattenedItems: FlattenedItem[]): TreeItem[] {
  const root: TreeItem = { id: "__root", children: [] };
  const nodes: Record<string, TreeItem> = { [root.id]: root };
  const items: TreeItem[] = flattenedItems.map((item) => ({
    ...item.originalItem,
    children: [],
  }));

  for (const item of items) {
    const flatItem = flattenedItems.find(({ id }) => id === item.id);
    if (!flatItem) continue;

    const parentId = flatItem.parentId ?? root.id;
    const parent = nodes[parentId] ?? items.find(({ id }) => id === parentId);

    if (!parent) continue;

    nodes[item.id] = item;
    parent.children!.push(item);
  }

  return root.children!;
}

export function getProjection(
  flattenedItems: FlattenedItem[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  dragOffsetX: number,
  indentationWidth: number,
  depthLimit: number,
): DragProjection | null {
  const activeIndex = flattenedItems.findIndex((item) => item.id === activeId);
  const overIndex = flattenedItems.findIndex((item) => item.id === overId);

  if (activeIndex === -1 || overIndex === -1) return null;

  const activeItem = flattenedItems[activeIndex];
  if (!activeItem) return null;

  const newItems = arrayMove(flattenedItems, activeIndex, overIndex);

  const previousItem = newItems[overIndex - 1];
  let maxDepth = previousItem?.depth !== undefined ? previousItem.depth + 1 : 0;
  if (depthLimit !== Infinity) {
    const activeItemHeight = getTreeHeight(activeItem.originalItem);
    maxDepth = Math.min(maxDepth, depthLimit - activeItemHeight);
  }

  const nextItem = newItems[overIndex + 1];
  const minDepth = nextItem?.depth !== undefined ? nextItem.depth : 0;

  const dragDepth = Math.round(dragOffsetX / indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;

  const depth = Math.max(minDepth, Math.min(projectedDepth, maxDepth));

  let parentId: UniqueIdentifier | null = null;

  if (depth === 0) {
    parentId = null;
  } else if (previousItem?.depth !== undefined && depth === previousItem.depth) {
    parentId = previousItem.parentId;
  } else if (previousItem?.depth !== undefined && depth > previousItem.depth) {
    parentId = previousItem.id;
  } else {
    const ancestor = newItems
      .slice(0, overIndex)
      .reverse()
      .find((item) => item.depth === depth);
    parentId = ancestor?.parentId ?? null;
  }

  return { depth, parentId, minDepth, maxDepth };
}

export function removeChildrenOf(
  items: FlattenedItem[],
  idsToRemove: Set<UniqueIdentifier>,
): FlattenedItem[] {
  const directlyNested = new Set<UniqueIdentifier>();
  const nested = new Set<UniqueIdentifier>();

  for (const item of items) {
    if (idsToRemove.has(item.parentId!)) {
      directlyNested.add(item.id);
    }
    if (item.path.some((id) => idsToRemove.has(id))) {
      nested.add(item.id);
    }
  }

  return items.filter((item) => !directlyNested.has(item.id) && !nested.has(item.id));
}

export function getDescendants(
  items: FlattenedItem[],
  parentId: UniqueIdentifier,
): Set<UniqueIdentifier> {
  const directChildren = items.filter((item) => item.parentId === parentId);

  return directChildren.reduce((descendants, child) => {
    return new Set([...descendants, child.id, ...getDescendants(items, child.id)]);
  }, new Set<UniqueIdentifier>());
}

export function getTreeHeight(item: TreeItem, initial: number = 0): number {
  let res = initial;
  if (item?.children && item?.children.length) {
    res += 1;
    for (const child of item.children) {
      res = Math.max(res, getTreeHeight(child as TreeItem, res));
    }
  }
  return res;
}
