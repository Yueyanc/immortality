import xml2js from "xml2js";
import _ from "lodash";
export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(" ");
}
export interface FolderTreeNode {
  fileName: string;
  handle: FileSystemDirectoryHandle | FileSystemFileHandle;
  isDir: boolean;
  key: string | number;
  parent?: FolderTreeNode;
  children?: FolderTreeNode[];
}
export function traverseTree(
  tree: FolderTreeNode[],
  callback: (node: FolderTreeNode) => any
) {
  function traverse(
    node: FolderTreeNode,
    callback: (node: FolderTreeNode) => any
  ) {
    if (!node) return;
    callback(node);
    if (node.children)
      node.children.forEach((item) => traverse(item, callback));
  }
  tree.forEach((item) => traverse(item, callback));
}
export function findTreeNode(
  tree: FolderTreeNode[],
  condition: (node: FolderTreeNode) => any
) {
  for (const value of tree) {
    console.log(value);

    if (condition(value)) {
      return value;
    }
    if (value.children) return findTreeNode(value.children, condition);
  }
}
export const findNodesInTree = <T extends Record<string, any>>(
  tree: T[],
  predicate: (node: T) => any,
  prop = { children: "children" }
): T[] => {
  return _.flatMapDeep(tree, (node) => {
    if (predicate(node)) {
      return [node];
    }
    if (node[prop.children]) {
      return findNodesInTree(node[prop.children], predicate);
    }
    return [];
  });
};

// 获取文件树
export async function getFolderTree(
  directoryHandle: FileSystemDirectoryHandle
): Promise<FolderTreeNode[]> {
  // 处理每个文件/文件夹
  const processEntry = async (
    entry: FileSystemHandle
  ): Promise<FolderTreeNode> => {
    const isDir = entry.kind === "directory";
    const handle = isDir
      ? (entry as FileSystemDirectoryHandle)
      : (entry as FileSystemFileHandle);

    // 创建节点对象
    const node: FolderTreeNode = {
      fileName: entry.name,
      handle,
      isDir,
      key: _.uniqueId(),
    };

    // 如果是文件夹，递归获取子节点
    if (isDir) {
      const children = await getFolderTree(handle as FileSystemDirectoryHandle);
      node.children = children;
      children.forEach((child) => {
        child.parent = node;
      });
    }
    return node;
  };
  const asyncEntries = directoryHandle.entries();
  const entries: FolderTreeNode[] = [];
  for await (const [, entry] of asyncEntries) {
    entries.push(await processEntry(entry));
  }
  return entries;
}

const XMLObjectMap: Map<FileSystemFileHandle, Record<string, any>> = new Map();
export async function parseXMLFile(fileHandle: FileSystemFileHandle) {
  let file = XMLObjectMap.get(fileHandle);
  if (!file) {
    file = await fileHandle.getFile();
  }
  const text = await file.text();

  return parseXML(text);
}
const parser = new xml2js.Parser();
export function parseXML(content: string) {
  return parser.parseStringPromise(content);
}
export interface TagTree {
  $tagName: string;
  $tagType: TagType;
  $parent?: TagTree;
  key: string | number;
  $label?: string;
  $childrens?: TagTree[];
  $value?: string;
  $pathSymbol?: string;
  $?: any;
}
export enum TagType {
  Text = "Text",
  Node = "Node",
  Attr = "Attr",
}

function assembleNode(value: any, key: string) {
  const node: TagTree = {
    $tagType: key === "$" ? TagType.Attr : TagType.Node,
    $tagName: key,
    $: value.$,
    key: _.uniqueId(),
  };
  const childs = transformXMLObjectToTree(value, node);
  node.$childrens = childs;
  const label = childs.find((item) => item.$tagName === "label")?.$value;
  const $value = childs.find((item) => item.$tagType === TagType.Text)?.$value;
  if (label) node.$label = label;
  if ($value) node.$value = $value;

  return node;
}
export function transformXMLObjectToTree(
  value: any,
  parent?: TagTree
): TagTree[] {
  if (_.isPlainObject(value)) {
    const arr: TagTree[] = [];
    _.map(value, (val, key) => {
      if (_.isArray(val)) {
        arr.push(
          ...val.map((item, index) => {
            const node = assembleNode(item, key);
            node.$pathSymbol = (parent?.$pathSymbol || ``) + `${index}.key`;
            node.$parent = parent;
            return node;
          })
        );
      } else {
        const node = assembleNode(val, key);
        node.$parent = parent;
        arr.push(node);
      }
    });
    return arr;
  } else if (_.isString(value)) {
    return [
      {
        $tagType: TagType.Text,
        $tagName: value,
        key: _.uniqueId(),
        $value: value,
      },
    ];
  }
  return [];
}
export function treeToList(tree: any[], childrenProp = "childrens") {
  const arr: any[] = [];
  tree.forEach((item) => {
    arr.push(item);
    if (_.isArray(item[childrenProp])) {
      arr.push(...treeToList(item[childrenProp], childrenProp));
    }
  });
  return arr;
}
