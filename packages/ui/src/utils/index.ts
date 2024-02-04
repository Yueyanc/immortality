export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(" ")
}
export interface FloderTree {
  fileName: string
  handle: FileSystemDirectoryHandle | FileSystemFileHandle
  isDir: boolean
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
