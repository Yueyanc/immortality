import _ from "lodash"
import { useEffect, useState } from "react"
import {
  FolderTreeNode,
  findNodesInTree,
  getFolderTree,
  parseXMLFile
} from "shared/utils"
export type ModNode = FolderTreeNode & { info: { [key in string]: string } }
export default function (workspaceTree: FolderTreeNode[]) {
  const [modList, setModList] = useState<ModNode[]>([])
  useEffect(() => {
    const modRoots = findNodesInTree(workspaceTree, (node) => {
      return (
        node.children &&
        node.children.some((item) => item.fileName === "About.xml") &&
        node.fileName === "About"
      )
    })
    Promise.all(
      modRoots.map(async (root) => {
        const handle = root.children?.find(
          (item) => item.fileName === "About.xml"
        )?.handle
        if (handle instanceof FileSystemFileHandle) {
          return parseXMLFile(handle).then((res) => {
            const data = _.get(res, "ModMetaData")
            _.forIn(data, (value, key, collection) => {
              collection[key] = value?.[0]
            })
            return {
              info: data,
              ...getFolderTree(root.handle as FileSystemDirectoryHandle)
            }
          })
        }
      })
    ).then((mods) => {
      setModList(_.compact(mods) as unknown as ModNode[])
    })
  }, [workspaceTree])
  console.log(modList)

  return { modList, setModList }
}
