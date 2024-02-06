import xml2js from "xml2js"
import { Button, Select, Space, Table, TableProps, Tree, TreeProps } from "antd"
import { ProTable, ProTableProps } from "@ant-design/pro-components"
import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import {
  FloderTree,
  TagTree,
  TagType,
  flattenTree,
  getFolderTree,
  parseXMLFile,
  transformXMLObjectToTree,
  treeToList
} from "shared/utils"
import { DownOutlined } from "@ant-design/icons"
import ThingNode from "@/components/Nodes/ThingNode"
import NormalNode from "@/components/Nodes/NormalNode"
// @ts-ignore
import valueMap from "@/assets/valueMap"
import _ from "lodash"

function App() {
  const directoryHandle = useRef<FileSystemDirectoryHandle>()
  const [isPengding, setTransition] = useTransition()
  const [floderTree, setFloderTree] = useState<FloderTree[]>([])
  const [floderList, setFloderList] = useState<FloderTree[]>([])
  const [currentFile, setCurrentFile] = useState<FileSystemFileHandle>()
  const [currentFileXMLTree, setCurrentFileXMLTree] = useState<TagTree[]>([])
  const [currentSelectNode, setCurrentSelectNode] = useState<TagTree>()
  const [expandKeys, setExpandKeys] = useState<any[]>([])
  const valueSource = useMemo(() => {
    const tagName = currentSelectNode?.$tagName
    if (tagName && _.isArray(valueMap[tagName])) {
      return valueMap[tagName].map((item: any) => ({
        key: _.uniqueId(),
        value: item.value,
        path: item.path
      }))
    }
    return []
  }, [currentSelectNode])
  const valueTableColumns: ProTableProps<any, any>["columns"] = [
    { title: "可能的值", dataIndex: "value" },
    { title: "路径", dataIndex: "path", ellipsis: true }
  ]
  useEffect(() => {
    if (currentFile) {
      parseXMLFile(currentFile).then((res) => {
        const tree = transformXMLObjectToTree(res)
        setCurrentFileXMLTree(tree)
        setExpandKeys(tree.map((item) => item.key))
        console.log(
          tree.map((item) => item.key),
          tree
        )
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
      <div className="flex h-screen flex-1 flex-col ">
        <div className="flex-1 overflow-y-auto p-5">
          <Tree<TagTree>
            showLine
            expandedKeys={expandKeys}
            onExpand={(keys) => {
              setExpandKeys(keys)
            }}
            titleRender={(nodeData) => {
              if (nodeData.$) {
                return <ThingNode {...nodeData.$} label={nodeData.$label} />
              }
              return (
                <NormalNode
                  tagName={nodeData.$tagName}
                  label={nodeData.$label}
                />
              )
            }}
            fieldNames={{
              title: "$tagName",
              key: "key",
              children: "$childrens"
            }}
            switcherIcon={<DownOutlined />}
            onSelect={(selectedKeys, { selectedNodes }) => {
              setTransition(() => {
                setCurrentSelectNode(selectedNodes[0])
              })
            }}
            treeData={currentFileXMLTree}
          />
        </div>
        <div className="border-gray h-[500px] border-t-2">
          <ProTable
            title={() =>
              currentSelectNode?.$tagName && (
                <div className="text-[16px] font-bold">
                  {currentSelectNode?.$tagName}
                </div>
              )
            }
            pagination={{ defaultPageSize: 100 }}
            dataSource={valueSource}
            columns={valueTableColumns}
            search={false}
            scroll={{ x: "100%", y: 290 }}
          />
        </div>
      </div>
    </div>
  )
}

export default App
