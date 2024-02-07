import {
  getFolderTree,
  parseXMLFile,
  transformXMLObjectToTree,
  traverseTree,
  treeToList
} from "shared/utils"

export default function useTranslate() {
  async function startTranslate(dirHandle: FileSystemDirectoryHandle) {
    const floderTree = await getFolderTree(dirHandle)
    const floderList = treeToList(floderTree, "children")
    const xmlList = floderList.filter((item) => item.fileName.endsWith(".xml"))

    const fields = []
    for (const xml of xmlList) {
      const res = await parseXMLFile(xml.handle as FileSystemFileHandle)
      const tree = transformXMLObjectToTree(res)
      const list = treeToList(tree, "$childrens").filter(
        (item) => item.$tagName === "label"
      )
      fields.push(...list)
    }
    console.log(fields)
  }
  return { startTranslate }
}
