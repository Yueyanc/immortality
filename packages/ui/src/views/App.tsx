import xml2js from "xml2js"
import { Button, Select, Space, Table, TableProps, Tree, TreeProps } from "antd"
import { ProTable, ProTableProps } from "@ant-design/pro-components"
import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { StyleProvider } from "@ant-design/cssinjs"
import {
  FolderTreeNode,
  TagTree,
  TagType,
  findTreeNode,
  treeToList,
  getFolderTree,
  parseXMLFile,
  transformXMLObjectToTree,
  traverseTree,
  findNodesInTree
} from "shared/utils"
import { DownOutlined } from "@ant-design/icons"
import ThingNode from "@/components/Nodes/ThingNode"
import NormalNode from "@/components/Nodes/NormalNode"
// @ts-ignore
import valueMap from "@/assets/valueMap"
import _ from "lodash"
import useTranslate from "@/hooks/useTranslate"
import { BasicDataNode } from "antd/es/tree"
import useMods from "@/hooks/useMods"
import { DirNode, FileNode } from "../../../shared/utils/file"

function App() {
  const directoryHandle = useRef<FileSystemDirectoryHandle>()
  const [isPengding, setTransition] = useTransition()
  const [workspaceTree, setWorkspaceTree] = useState<FolderTreeNode[]>([])
  const [currentFloderTree, setCurrentFloderTree] = useState<DirNode[]>([])
  const [currentFile, setCurrentFile] = useState<FileSystemFileHandle>()
  const [currentFileXMLTree, setCurrentFileXMLTree] = useState<TagTree[]>([])
  const [currentSelectNode, setCurrentSelectNode] = useState<TagTree>()

  const [expandKeys, setExpandKeys] = useState<any[]>([])
  const { startTranslate } = useTranslate()
  const { modList } = useMods(workspaceTree)
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
      })
    }
  }, [currentFile])

  const dirTreeSelect: TreeProps<
    (DirNode | FileNode) & BasicDataNode
  >["onSelect"] = (value, { selected, node }) => {
    if (selected && !node.isDir()) {
      setCurrentFile(node.handle)
    }
  }

  return (
    <StyleProvider hashPriority="high">
      <div className="relative flex bg-white">
        <div className="h-screen shrink-0 overflow-y-auto border-r-2 p-5">
          <Space>
            <Button
              onClick={async () => {
                const fileSystemDirectoryHandle =
                  await window.showDirectoryPicker({
                    mode: "readwrite"
                  })
                directoryHandle.current = fileSystemDirectoryHandle
                const tree = new DirNode({
                  handle: fileSystemDirectoryHandle
                })
                await tree.getEntries()
                tree.setRoot(tree)
                setCurrentFloderTree([tree])
              }}
            >
              选取mod文件夹
            </Button>
            <Select
              className="w-[200px]"
              options={modList.map((item) => ({
                label: item.info.name,
                value: item.key
              }))}
              onSelect={(value) => {
                const mod = modList.find((item) => item.key === value)
                mod?.parent && setCurrentFloderTree([mod])
              }}
            />
            <Button
              type="primary"
              onClick={() => {
                currentFloderTree?.[0]?.handle && currentFloderTree?.[0]?.isDir
                startTranslate(
                  currentFloderTree[0]?.handle as FileSystemDirectoryHandle
                )
              }}
            >
              汉化当前mod
            </Button>
          </Space>
          <Tree<DirNode>
            showLine
            fieldNames={{ title: "name", key: "key" }}
            switcherIcon={<DownOutlined />}
            treeData={currentFloderTree}
            onSelect={dirTreeSelect}
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
          <div className="border-gray border-t-2">
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
    </StyleProvider>
  )
}

export default App
