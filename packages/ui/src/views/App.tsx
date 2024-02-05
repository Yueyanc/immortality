import xml2js from "xml2js"
import { Button, Select, Space, Tree, TreeProps } from "antd"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  FloderTree,
  TagTree,
  flattenTree,
  getFolderTree,
  parseXMLFile,
  transformXMLObjectToTree
} from "@/utils"
import { DownOutlined } from "@ant-design/icons"
import ThingNode from "@/components/Nodes/ThingNode"
import NormalNode from "@/components/Nodes/NormalNode"
function App() {
  const directoryHandle = useRef<FileSystemDirectoryHandle>()
  const [floderTree, setFloderTree] = useState<FloderTree[]>([])
  const [floderList, setFloderList] = useState<FloderTree[]>([])
  const [currentFile, setCurrentFile] = useState<FileSystemFileHandle>()
  const [currentFileXMLTree, setCurrentFileXMLTree] = useState<TagTree[]>([])
  useEffect(() => {
    if (currentFile) {
      parseXMLFile(currentFile).then((res) => {
        setCurrentFileXMLTree(transformXMLObjectToTree(res))
      })
    }
  }, [currentFile])
  const floderTreeSelect: TreeProps["onSelect"] = (value) => {
    const floder = floderList.find((item) => item.key === value[0])
    if (!floder?.isDir) {
      setCurrentFile(floder?.handle as FileSystemFileHandle)
    }
  }
  return (
    <div className="relative flex overflow-hidden bg-white">
      <div className="h-screen overflow-y-auto border-r-2 p-5">
        <Space>
          <Button
            onClick={async () => {
              const fileSystemDirectoryHandle =
                await window.showDirectoryPicker({
                  mode: "readwrite"
                })
              directoryHandle.current = fileSystemDirectoryHandle
              const tree = await getFolderTree(fileSystemDirectoryHandle)
              setFloderTree(tree)
              setFloderList(flattenTree(tree))
            }}
          >
            选取mod文件夹
          </Button>
          <Select
            className="w-[200px]"
            options={floderList
              .filter((item) => !item.isDir)
              .map((item) => ({ label: item.fileName, value: item.handle }))}
          />
        </Space>
        <Tree
          showLine
          fieldNames={{ title: "fileName", key: "key" }}
          switcherIcon={<DownOutlined />}
          treeData={floderTree}
          onSelect={floderTreeSelect}
        />
      </div>
      <div className="h-screen flex-1 overflow-y-auto p-5">
        <Tree<TagTree>
          showLine
          titleRender={(nodeData) => {
            if (nodeData.$) {
              return <ThingNode {...nodeData.$} />
            }
            return <NormalNode tagName={nodeData.$tagName} />
          }}
          fieldNames={{ title: "$tagName", key: "key", children: "$childrens" }}
          switcherIcon={<DownOutlined />}
          treeData={currentFileXMLTree}
        />
      </div>
    </div>
  )
}

export default App
