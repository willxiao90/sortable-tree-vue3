import { shallowRef, computed, onMounted, onUnmounted } from "vue";
import type { ComputedRef } from "vue";
import type {
  UniqueIdentifier,
  FlattenedItem,
  SortableTreeProps,
  SortableTreeEmits,
} from "../types/tree";
import { arrayMove, buildTree, flattenTree, getProjection } from "../utils";

export function useTreeDrag(
  props: Required<SortableTreeProps>,
  visibleItems: ComputedRef<FlattenedItem[]>,
  emit: SortableTreeEmits,
) {
  const dragState = shallowRef({
    isDragging: false,
    draggedIndex: -1,
    draggedId: null as UniqueIdentifier | null,
    startX: 0,
    startY: 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
    overId: null as UniqueIdentifier | null,
  });

  const getEventPosition = (event: MouseEvent | TouchEvent): { x: number; y: number } => {
    if (isTouchEvent(event)) {
      const touch = event.touches[0];
      if (touch) {
        return { x: touch.clientX, y: touch.clientY };
      }
    }
    const mouseEvent = event as MouseEvent;
    return { x: mouseEvent.clientX, y: mouseEvent.clientY };
  };

  function isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
    return "touches" in event;
  }

  const projection = computed(() => {
    if (!dragState.value.isDragging || !dragState.value.draggedId || !dragState.value.overId) {
      return null;
    }

    return getProjection(
      visibleItems.value,
      dragState.value.draggedId,
      dragState.value.overId,
      dragState.value.dragOffsetX,
      props.indentationWidth,
      props.maxDepth,
    );
  });

  function isDisabled(item: FlattenedItem, index: number): boolean {
    if (typeof props.disabled === "function") {
      return props.disabled(item, index);
    }
    return props.disabled ?? false;
  }

  function handleDragStart(evt: MouseEvent | TouchEvent, item: FlattenedItem, index: number) {
    if (isDisabled(item, index)) return;

    const pos = getEventPosition(evt);

    dragState.value = {
      isDragging: true,
      draggedIndex: index,
      draggedId: item.id,
      startX: pos.x,
      startY: pos.y,
      dragOffsetX: 0,
      dragOffsetY: 0,
      overId: item.id,
    };

    emit("start", { item, index, evt });
  }

  function handleDragMove(evt: MouseEvent | TouchEvent) {
    if (!dragState.value.isDragging) return;

    const pos = getEventPosition(evt);

    dragState.value = {
      ...dragState.value,
      dragOffsetX: pos.x - dragState.value.startX,
      dragOffsetY: pos.y - dragState.value.startY,
    };
  }

  function handleDragOver(over: FlattenedItem | null, index: number) {
    if (!dragState.value.isDragging || !over) return;

    const activeId = dragState.value.draggedId!;
    const canDropResult = canDrop(over, activeId);
    if (canDropResult) {
      dragState.value = {
        ...dragState.value,
        overId: over.id,
      };
      emit("over", { item: over, index });
    }
  }

  function canDrop(over: FlattenedItem, activeId: UniqueIdentifier): boolean {
    if (over.id === activeId) return true;
    return !over.path.includes(activeId!); // 禁止将节点拖动到其后代节点上
  }

  function handleDragEnd(item: FlattenedItem, from: number, to: number) {
    const proj = projection.value;
    const state = dragState.value;
    resetState();

    emit("end", {
      item,
      from,
      to,
      depth: proj ? proj.depth : item.depth,
      parentId: proj ? proj.parentId : item.parentId,
    });
    if (!proj) return null;

    const { depth, parentId } = proj;

    if (from !== to || depth !== item.depth) {
      const clonedItems: FlattenedItem[] = JSON.parse(JSON.stringify(flattenTree(props.items)));

      const overIndex = clonedItems.findIndex(({ id }) => id === state.overId);
      const activeIndex = clonedItems.findIndex(({ id }) => id === state.draggedId);
      const activeItem = clonedItems[activeIndex]!;

      clonedItems[activeIndex] = { ...activeItem, depth, parentId };

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newTree = buildTree(sortedItems);
      emit("change", newTree);
    }

    return { parentId, depth };
  }

  function resetState() {
    dragState.value = {
      isDragging: false,
      draggedIndex: -1,
      draggedId: null,
      startX: 0,
      startY: 0,
      dragOffsetX: 0,
      dragOffsetY: 0,
      overId: null,
    };
  }

  onMounted(() => {
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("touchmove", handleDragMove, { passive: false });
  });

  onUnmounted(() => {
    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("touchmove", handleDragMove);
  });

  return {
    dragState,
    projection,
    handleDragStart,
    handleDragMove,
    handleDragOver,
    handleDragEnd,
    resetState,
  };
}
