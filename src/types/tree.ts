/**
 * 树节点的唯一标识符。可以是字符串或数字。
 */
export type UniqueIdentifier = string | number;

/**
 * 表示层级数据结构中的单个节点。
 *
 * - `id` 是节点的唯一标识符。
 * - `label` 是显示在节点上的文本。
 * - `children` 是可选的嵌套 `TreeItem` 数组。
 * - 允许额外的任意属性以支持自定义元数据
 */
export interface TreeItem {
  id: UniqueIdentifier;
  label?: string;
  children: TreeItem[];
  [key: string]: any;
}

/**
 * 可排序树内部使用的节点表示。
 *
 * 为了支持拖拽操作，树会被扁平化，
 * 这个接口捕获了必要的上下文：
 *
 * - `id` 引用原始项的标识符。
 * - `originalItem` 保存完整的 `TreeItem` 对象。
 * - `depth` 表示嵌套层级（根节点为 0）。
 * - `parentId` 是父节点的标识符，根级节点为 `null`。
 * - `index` 是在同级节点中的位置。
 * - `hasChildren` 是一个快速标志，表示该节点是否有子节点。
 * - `path` 是一个标识符数组，显示从根到该节点
 *   的祖先链（包括自身）。
 */
export interface FlattenedItem {
  id: UniqueIdentifier;
  originalItem: TreeItem;
  depth: number;
  parentId: UniqueIdentifier | null;
  index: number;
  hasChildren: boolean;
  path: UniqueIdentifier[];
}

/**
 * 描述拖拽操作期间项目的预测位置。用于确定如果
 * 在当前光标位置放下该项目，它将落在哪。
 *
 * - `depth` 是计算出的嵌套深度。
 * - `parentId` 是预测的父节点标识符，根节点为 `null`。
 * - `minDepth` 和 `maxDepth` 定义了根据配置允许的
 *   深度范围。
 */
export interface DragProjection {
  depth: number;
  parentId: UniqueIdentifier | null;
  minDepth: number;
  maxDepth: number;
}

/**
 * `<SortableTree>` 组件接受的属性。
 */
export interface SortableTreeProps {
  /**
   * 要渲染为可排序树的层级数据
   */
  items: TreeItem[];

  /**
   * 每个缩进级别的宽度（像素）
   */
  indentationWidth?: number;

  /**
   * 默认展开的层级数，-1 展开所有，0 折叠所有
   */
  defaultExpandedLevels?: number;

  /** 限制树节点最大深度 */
  maxDepth?: number;

  /**
   * 禁用节点，可为布尔值或函数
   */
  disabled?: boolean | ((item: FlattenedItem, index: number) => boolean);

  /** 拖拽延迟（毫秒） */
  delay?: number;
  /** 排序动画时长（毫秒） */
  animation?: number;
  /** 在拖动时交换元素的阈值（0 到 1）。 */
  swapThreshold?: number;
  /** CSS 选择器，指定拖拽句柄元素 */
  handle?: string;
  /** 忽略拖拽的元素选择器 */
  filter?: string;

  /** 拖拽占位符的 CSS 类名 */
  ghostClass?: string;
  /** 被选中元素的 CSS 类名 */
  chosenClass?: string;
  /** 拖拽中元素的 CSS 类名 */
  dragClass?: string;
  /** 后备元素的 CSS 类名 */
  fallbackClass?: string;
}

/**
 * 定义 `<SortableTree>` 组件发出的自定义事件及其负载。
 */
export interface SortableTreeEmits {
  /**
   * 在树数据因放置或重新排序而更改后发出。负载为新的
   * 完整树结构。
   */
  (event: "change", data: TreeItem[]): void;

  /**
   * 当项目开始拖动时发出。提供扁平化项目、其索引和原始
   * 事件（鼠标/触摸）。
   */
  (
    event: "start",
    data: { item: FlattenedItem; index: number; evt: MouseEvent | TouchEvent },
  ): void;

  /**
   * 当拖动的项目移动到新的潜在放置位置时触发。
   */
  (event: "over", data: { item: FlattenedItem; index: number }): void;

  /**
   * 在拖动操作结束时发出。数据包括项目、原始和新索引、
   * 计算深度以及新的父 ID（如果有）。
   */
  (
    event: "end",
    data: {
      item: FlattenedItem;
      from: number;
      to: number;
      depth: number;
      parentId: UniqueIdentifier | null;
    },
  ): void;
}
