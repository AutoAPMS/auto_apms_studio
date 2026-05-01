export const collisionUtils = (
  nodes,
  { maxIterations = 50, overlapThreshold = 0.5, margin = 0 } = {}
) => {
  const boxes = getBoxesFromNodes(
    nodes.filter((n) => n.hidden !== true),
    margin
  );

  for (let iter = 0; iter <= maxIterations; iter++) {
    let moved = false;

    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const A = boxes[i];
        const B = boxes[j];

        const centerAX = A.x + A.width * 0.5;
        const centerAY = A.y + A.height * 0.5;
        const centerBX = B.x + B.width * 0.5;
        const centerBY = B.y + B.height * 0.5;

        const dx = centerAX - centerBX;
        const dy = centerAY - centerBY;

        const px = (A.width + B.width) * 0.5 - Math.abs(dx);
        const py = (A.height + B.height) * 0.5 - Math.abs(dy);

        if (px > overlapThreshold && py > overlapThreshold) {
          A.moved = B.moved = moved = true;

          const sx = dx > 0 ? 1 : -1;
          const moveAmount = (px / 2) * sx;
          A.x += moveAmount;
          B.x -= moveAmount;
        }
      }
    }

    if (!moved) break;
  }

  const boxMap = new Map(boxes.map((box) => [box.node.id, box]));

  return nodes.map((node) => {
    if (!boxMap.has(node.id)) return node;
    const box = boxMap.get(node.id);

    if (box.moved) {
      return {
        ...box.node,
        position: {
          x: box.x + margin,
          y: box.y + margin,
        },
      };
    }
    return box.node;
  });
};

function getBoxesFromNodes(nodes, margin = 0) {
  return nodes.map((node) => ({
    x: node.position.x - margin,
    y: node.position.y - margin,
    width: (node.width ?? node.measured?.width ?? 0) + margin * 2,
    height: (node.height ?? node.measured?.height ?? 0) + margin * 2,
    node,
    moved: false,
  }));
}
