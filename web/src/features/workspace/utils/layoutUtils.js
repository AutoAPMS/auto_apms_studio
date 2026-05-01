import { isRoot } from "./nodeHelpers.js";

/**
 * @param {{x, y: number}} position The position from which the nearest layer is determined.
 * @param {[number]} layers The array of all layers.
 * @returns {number} The index of the nearest layer.
 */
export function getNearestLayer(position, layers) {
  return layers.reduce(
    (minIdx, curr, currIdx, layers) =>
      Math.abs(curr - position.y) < Math.abs(layers[minIdx] - position.y)
        ? currIdx
        : minIdx,
    0
  );
}

/**
 * @param {{x, y: number}} position The initial position.
 * @param {[number]} layers The array of all layers that are available for snapping.
 * @returns {{position: {x, y: number}, layer: number}} The position snapped to the nearest layer and grid position.
 */
export function snapPositionToLayer(position, layers) {
  // const width = options["elk.spacing.nodeNode"];
  const nearestLayer = getNearestLayer(position, layers);

  return {
    position: {
      // x: Math.round(position.x / width) * width,
      x: position.x,
      y: layers[nearestLayer],
    },
    layer: nearestLayer,
  };
}

/**
 * @param {[Object]} nodes The array of all nodes that are moved and snapped at once.
 * @param {[number]} layers The array of all layers that are available for snapping.
 * @returns {[Object]} A new array of all nodes moved by the minimal amount of layers.
 */
export function snapNodesToLayer(nodes, layers) {
  const layerDiffs = nodes.map((node) =>
    Number(getNearestLayer(node.position, layers) - node.data.layer)
  );
  const layerDif = layerDiffs.reduce((min, curr) =>
    Math.abs(curr) < Math.abs(min) ? curr : min
  );

  return nodes.map((node) => {
    const updatedLayer = node.data.layer + layerDif;
    return {
      ...node,
      data: {
        ...node.data,
        layer: updatedLayer,
      },
      position: {
        x: node.position.x,
        y: layers[updatedLayer],
      },
    };
  });
}

/**
 * @param {[number]} layers The array of all available layers.
 * @param {[Object]} nodes An array of nodes to check if they are on the last layer.
 * @param options A dictionary of layout options.
 * @returns {[number]} An array containing the original layers and an additional layer if a node is on the last one.
 */
export function createLayerAfterLast(layers, nodes, options) {
  const nodesOnLastLayer = nodes
    .filter(
      (node) => !isIgnoredNode(node) && node.data.layer === layers.length - 1
    )
    .map((node) => Number(node.measured?.height ?? node.height ?? 50));

  if (nodesOnLastLayer.length !== 0) {
    const maxHeight = Math.max(...nodesOnLastLayer);
    const layerPos = createLayer(layers[layers.length - 1], maxHeight, options);
    return [...layers, layerPos];
  }
  return layers;
}

/**
 * @param {number} position The position of the previous layer from where the new layer is created.
 * @param {number} maxHeight The max height of all the nodes on the previous layer.
 * @param options A dictionary of layout options.
 * @returns {number} The position of the new layer.
 */
export function createLayer(position, maxHeight, options) {
  const spacing = options["elk.layered.spacing.nodeNodeBetweenLayers"];
  return position + maxHeight + spacing;
}

/**
 * @param {[Object]} nodes The array of all nodes.
 * @param {[number]} layers The array of all layers to filter.
 * @returns {[number]} A new array containing only the layers that are in use.
 */
export function removeUnusedLayers(nodes, layers) {
  const nodesByLayer = sortNodesByLayer(nodes, layers);
  let idx = nodesByLayer.length - 1;

  for (; 0 < idx; idx--) if (nodesByLayer[idx].length !== 0) break;

  idx = idx === 0 && nodesByLayer[0].length === 0 ? idx + 1 : idx + 2;
  return layers.slice(0, idx);
}

/**
 * @param {[Object]} nodes The array of all nodes to sort.
 * @param {[number]} layers The array of all layers.
 * @returns {[[Object]]} A new two-dimensional array where all nodes are sorted to their corresponding layer.
 */
export function sortNodesByLayer(nodes, layers) {
  let nodesByLayer = layers.map(() => new Array(0));
  nodes.forEach((node) => {
    if (!isIgnoredNode(node)) nodesByLayer[node.data.layer].push(node);
  });
  return nodesByLayer;
}

/**
 * @param {Object} node
 * @returns {Boolean}
 */
export function isIgnoredNode(node) {
  return node.hidden === true || isRoot(node) || node.data.layer === undefined;
}
