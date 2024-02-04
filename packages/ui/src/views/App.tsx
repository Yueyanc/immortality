import xml2js from "xml2js"
import { Select, Space } from "antd"
import { Button } from "@shadcn/components/ui/button"
import { useRef, useState } from "react"
import { FloderTree, flattenTree, getFolderTree } from "@/utils"
function App() {
  const directoryHandle = useRef<FileSystemDirectoryHandle>()
  const [floderTree, setFloderTree] = useState<FloderTree[]>([])
  const [floderList, setFloderList] = useState<FloderTree[]>([])
  console.log(floderList)
  return (
    <div className="relative overflow-hidden bg-white p-10">
      <Space>
        <Button
          onClick={async () => {
            const fileSystemDirectoryHandle = await window.showDirectoryPicker({
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
    </div>
  )
}

export default App
