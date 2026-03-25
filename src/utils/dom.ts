/**
 * Inserts a element into the DOM at a given index.
 * @param parentElement
 * @param element
 * @param {number} index
 * @see https://github.com/Alfred-Skyblue/vue-draggable-plus/blob/a3829222095e1949bf2c9a20979d7b5930e66f14/src/utils/index.ts#L81C1-L94C2
 */
export function insertNodeAt(parentElement: Element, element: Element, index: number) {
  const refElement = parentElement.children[index];
  // @ts-ignore
  parentElement.insertBefore(element, refElement);
}

/**
 * Removes a node from the DOM.
 * @param {Node} node
 * @see https://github.com/Alfred-Skyblue/vue-draggable-plus/blob/a3829222095e1949bf2c9a20979d7b5930e66f14/src/utils/index.ts#L96C1-L102C2
 */
export function removeNode(node: Node) {
  if (node.parentNode) node.parentNode.removeChild(node);
}
