import xml2js from "xml2js"
import _ from "lodash"
export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(" ")
}
export interface FloderTree {
  fileName: string
  handle: FileSystemDirectoryHandle | FileSystemFileHandle
  isDir: boolean
  key: string | number
  children?: FloderTree[]
}
export async function getFolderTree(
  directoryHandle: FileSystemDirectoryHandle
): Promise<FloderTree[]> {
  const entries = directoryHandle.entries()
  const tree: FloderTree[] = []

  for await (const entry of entries) {
    const isDir = entry[1] instanceof FileSystemDirectoryHandle
    tree.push({
      fileName: entry[0],
      key: _.uniqueId(),
      handle: entry[1],
      isDir,
      children: isDir
        ? await getFolderTree(entry[1] as FileSystemDirectoryHandle)
        : undefined
    })
  }
  return tree
}
export function flattenTree(tree: FloderTree[]): FloderTree[] {
  const flattenedTree: FloderTree[] = []
  for (const node of tree) {
    flattenedTree.push(node)
    if (node.isDir && node.children) {
      const flattenedChildren = flattenTree(node.children)
      flattenedTree.push(...flattenedChildren)
    }
  }
  return flattenedTree
}

const XMLObjectMap: Map<FileSystemFileHandle, Record<string, any>> = new Map()
export async function parseXMLFile(fileHandle: FileSystemFileHandle) {
  let file = XMLObjectMap.get(fileHandle)
  if (!file) {
    file = await fileHandle.getFile()
  }
  const text = await file.text()
  console.log(text)

  return parseXML(text)
}
const parser = new xml2js.Parser()
export function parseXML(content: string) {
  return parser.parseStringPromise(content)
}
export interface TagTree {
  $tagName?: string
  $tagType: TagType
  key: string | number
  value?: string
  $childrens?: TagTree[]
  $?: any
}
enum TagType {
  Text = "Text",
  Node = "Node",
  Attr = "Attr"
}

function getAttr(items: TagTree[]) {
  const attr = items.find((item) => item.$tagName === "$")
  return attr
}
export function transformXMLObjectToTree(value: any): TagTree[] {
  if (_.isPlainObject(value)) {
    const arr: TagTree[] = []
    _.map(value, (val, key) => {
      if (_.isArray(val)) {
        arr.push(
          ...val.map((item) => {
            const childs = transformXMLObjectToTree(item)
            return {
              $tagType: key === "$" ? TagType.Attr : TagType.Node,
              $tagName: key,
              $: item.$ ? item.$ : null,
              key: _.uniqueId(),
              $childrens: childs
            }
          })
        )
      } else {
        const childs = transformXMLObjectToTree(val)
        arr.push({
          $tagType: key === "$" ? TagType.Attr : TagType.Node,
          $tagName: key,
          $: val.$ ? val.$ : null,
          key: _.uniqueId(),
          $childrens: childs
        })
      }
    })
    return arr
  } else if (_.isString(value)) {
    return [
      { $tagType: TagType.Text, $tagName: value, key: _.uniqueId(), value }
    ]
  }
  return []
}
