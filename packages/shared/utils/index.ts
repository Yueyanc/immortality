import xml2js from "xml2js";
import _ from "lodash";
export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(" ");
}
export interface FloderTree {
  fileName: string;
  handle: FileSystemDirectoryHandle | FileSystemFileHandle;
  parent?: FloderTree;
  isDir: boolean;
  key: string | number;
  children?: FloderTree[];
}
export function traverseTree(
  tree: FloderTree[],
  callback: (node: FloderTree) => any
) {
  function traverse(node: FloderTree, callback: (node: FloderTree) => any) {
    if (!node) return;
    callback(node);
    if (node.children)
      node.children.forEach((item) => traverse(item, callback));
  }
  tree.forEach((item) => traverse(item, callback));
}
export function findTreeNode(
  tree: FloderTree[],
  condition: (node: FloderTree) => any
) {
  for (const value of tree) {
    console.log(value);

    if (condition(value)) {
      return value;
    }
    if (value.children) return findTreeNode(value.children, condition);
  }
}

export async function getFolderTree(
  directoryHandle: FileSystemDirectoryHandle,
  parent?: FloderTree
): Promise<FloderTree[]> {
  const entries = directoryHandle.entries();
  const tree: FloderTree[] = [];

  for await (const entry of entries) {
    const isDir = entry[1] instanceof FileSystemDirectoryHandle;
    const node: FloderTree = {
      parent,
      fileName: entry[0],
      key: _.uniqueId(),
      handle: entry[1],
      isDir,
    };
    node.children = isDir
      ? await getFolderTree(entry[1] as FileSystemDirectoryHandle, node)
      : undefined;
    tree.push(node);
  }
  return tree;
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
