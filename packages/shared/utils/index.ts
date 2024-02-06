import xml2js from "xml2js";
import _ from "lodash";
export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(" ");
}
export interface FloderTree {
  fileName: string;
  handle: FileSystemDirectoryHandle | FileSystemFileHandle;
  isDir: boolean;
  key: string | number;
  children?: FloderTree[];
}
export async function getFolderTree(
  directoryHandle: FileSystemDirectoryHandle
): Promise<FloderTree[]> {
  const entries = directoryHandle.entries();
  const tree: FloderTree[] = [];

  for await (const entry of entries) {
    const isDir = entry[1] instanceof FileSystemDirectoryHandle;
    tree.push({
      fileName: entry[0],
      key: _.uniqueId(),
      handle: entry[1],
      isDir,
      children: isDir
        ? await getFolderTree(entry[1] as FileSystemDirectoryHandle)
        : undefined,
    });
  }
  return tree;
}
export function flattenTree(tree: FloderTree[]): FloderTree[] {
  const flattenedTree: FloderTree[] = [];
  for (const node of tree) {
    flattenedTree.push(node);
    if (node.isDir && node.children) {
      const flattenedChildren = flattenTree(node.children);
      flattenedTree.push(...flattenedChildren);
    }
  }
  return flattenedTree;
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
  $tagName?: string;
  $tagType: TagType;
  key: string | number;
  $label?: string;
  $childrens?: TagTree[];
  $value?: string;
  $?: any;
}
export enum TagType {
  Text = "Text",
  Node = "Node",
  Attr = "Attr",
}

function assembleNode(value: any, key: string) {
  const childs = transformXMLObjectToTree(value);
  const node: TagTree = {
    $tagType: key === "$" ? TagType.Attr : TagType.Node,
    $tagName: key,
    $: value.$,
    key: _.uniqueId(),
    $childrens: childs,
  };
  const label = childs.find((item) => item.$tagName === "label")?.$value;
  const $value = childs.find((item) => item.$tagType === TagType.Text)?.$value;
  if (label) node.$label = label;
  if ($value) node.$value = $value;

  return node;
}
export function transformXMLObjectToTree(value: any): TagTree[] {
  if (_.isPlainObject(value)) {
    const arr: TagTree[] = [];
    _.map(value, (val, key) => {
      if (_.isArray(val)) {
        arr.push(
          ...val.map((item) => {
            return assembleNode(item, key);
          })
        );
      } else {
        arr.push(assembleNode(val, key));
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
export function treeToList(tree: TagTree[]) {
  const arr: TagTree[] = [];
  tree.forEach((item) => {
    arr.push(item);
    if (_.isArray(item.$childrens)) {
      arr.push(...treeToList(item.$childrens));
    }
  });
  return arr;
}
