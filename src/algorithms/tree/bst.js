class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.id = Math.random().toString(36).substr(2, 9);
  }
}

export class BST {
  constructor() {
    this.root = null;
  }

  insert(value, animations = []) {
    const newNode = new Node(value);
    if (!this.root) {
      this.root = newNode;
      animations.push({ type: 'visit', nodeId: newNode.id, value: value });
      return this.root;
    }
    this._insertNode(this.root, newNode, animations);
  }

  _insertNode(node, newNode, animations) {
    animations.push({ type: 'compare', nodeId: node.id, value: newNode.value });
    if (newNode.value < node.value) {
      if (!node.left) {
        node.left = newNode;
        animations.push({ type: 'added', nodeId: newNode.id, parentId: node.id, side: 'left' });
      } else {
        this._insertNode(node.left, newNode, animations);
      }
    } else {
      if (!node.right) {
        node.right = newNode;
        animations.push({ type: 'added', nodeId: newNode.id, parentId: node.id, side: 'right' });
      } else {
        this._insertNode(node.right, newNode, animations);
      }
    }
  }

  search(value, animations = []) {
    return this._searchNode(this.root, value, animations);
  }

  _searchNode(node, value, animations) {
    if (!node) {
      animations.push({ type: 'not_found' });
      return null;
    }
    animations.push({ type: 'compare', nodeId: node.id, target: value });
    if (value === node.value) {
      animations.push({ type: 'found', nodeId: node.id });
      return node;
    }
    if (value < node.value) {
      return this._searchNode(node.left, value, animations);
    }
    return this._searchNode(node.right, value, animations);
  }

  inorder(node = this.root, animations = []) {
    if (node) {
      this.inorder(node.left, animations);
      animations.push({ type: 'visit', nodeId: node.id, value: node.value });
      this.inorder(node.right, animations);
    }
    return animations;
  }

  preorder(node = this.root, animations = []) {
    if (node) {
      animations.push({ type: 'visit', nodeId: node.id, value: node.value });
      this.preorder(node.left, animations);
      this.preorder(node.right, animations);
    }
    return animations;
  }

  postorder(node = this.root, animations = []) {
    if (node) {
      this.postorder(node.left, animations);
      this.postorder(node.right, animations);
      animations.push({ type: 'visit', nodeId: node.id, value: node.value });
    }
    return animations;
  }
}
