import xml2js from "xml2js"
import {
  Badge,
  Button,
  Image,
  Select,
  Space,
  Table,
  TableProps,
  Tree,
  TreeProps
} from "antd"
import {
  ProCard,
  ProDescriptions,
  ProDescriptionsItemProps,
  ProTable,
  ProTableProps
} from "@ant-design/pro-components"
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
import { Def, XML } from "shared/utils/file"
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
import { ExpandableConfig } from "antd/es/table/interface"
import Descriptions from "@/components/Descriptions"

function App() {
  const [isPengding, setTransition] = useTransition()
  const [currentFloderTree, setCurrentFloderTree] = useState<DirNode[]>([])
  const [currentFiles, setCurrentFiles] = useState<XML[]>()
  const [defTypeEnum, setDefTypeEnum] = useState(new Map())

  const dirTreeSelect: TreeProps<
    (DirNode | FileNode) & BasicDataNode
  >["onSelect"] = (value, { selected, node }) => {}

  const colums: ProTableProps<Def, any>["columns"] = useMemo(() => {
    return [
      {
        title: "类型",
        dataIndex: "isAbstract",
        render: (text, record) => {
          if (record.isAbstract) {
            return <Badge status="processing" text="抽象类" />
          } else {
            return <Badge status="success" text="具体定义" />
          }
        },
        width: 100,
        valueType: "select",
        valueEnum: {
          true: { text: "抽象类" },
          false: {
            text: "具体定义"
          }
        }
      },
      {
        title: "标题",
        dataIndex: "title",
        renderText: (text, record) => {
          return record.defName || record.className
        },
        copyable: true,
        ellipsis: true,
        width: 180
      },
      {
        title: "定义类型",
        dataIndex: "defType",
        renderText: (text, record) => {
          return record.defType
        },
        copyable: true,
        ellipsis: true,

        width: 150,
        valueEnum: defTypeEnum
      },
      {
        title: "文件路径",
        dataIndex: "key",
        hideInSearch: true,
        renderText: (text, record) => {
          return record?.filePaths?.join("/")
        },
        copyable: true,
        ellipsis: true
      },
      {
        title: "全文搜索",
        dataIndex: "key",
        formItemProps: {
          name: "contextSearch"
        },
        hideInTable: true
      }
    ]
  }, [defTypeEnum])

  const allDefs = useMemo(() => {
    // 扫描全部的定义类型
    const defs = currentFiles?.map((item) => item.defs)?.flat()
    const defTypeEnum = new Map()
    defs?.forEach((value) => {
      const defType = value.defType
      if (!defTypeEnum.has(defType)) defTypeEnum.set(defType, { text: defType })
    })
    setDefTypeEnum(defTypeEnum)
    return defs
  }, [currentFiles])
  const expandedRowRender: ExpandableConfig<Def>["expandedRowRender"] = (
    record
  ) => {
    return <Descriptions record={record} />
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
                const tree = new DirNode({
                  handle: fileSystemDirectoryHandle
                })
                await tree.initDir()
                tree.setRoot(tree)
                setCurrentFloderTree([tree])
                const files: XML[] = []
                tree.traverse((node) => {
                  if (!node.isDir() && node.isXML()) {
                    files.push(node.xml)
                  }
                })
                console.log(tree)
                setTransition(() => {
                  setCurrentFiles(files)
                })
              }}
            >
              选取mod文件夹
            </Button>
            {/* <Select
              className="w-[200px]"
              options={modList.map((item) => ({
                label: item.info.name,
                value: item.key
              }))}
            /> */}
          </Space>
          <Tree<DirNode>
            showLine
            fieldNames={{ title: "name", key: "key" }}
            switcherIcon={<DownOutlined />}
            treeData={currentFloderTree}
            onSelect={dirTreeSelect}
          />
        </div>
        <div className="flex h-screen flex-1 flex-col overflow-y-auto ">
          <ProTable
            params={{ allDefs }}
            request={async (params: any) => {
              const { title, defType, contextSearch, isAbstract } = params
              let result = allDefs
              if (title) {
                result = result?.filter(
                  (def) => def.defName === title || def.className === title
                )
              }
              if (isAbstract) {
                result = result?.filter(
                  (def) => def.isAbstract.toString() === isAbstract
                )
              }
              if (defType) {
                result = result?.filter((def) => def.defType === defType)
              }
              if (contextSearch) {
                result = result?.filter((def) =>
                  JSON.stringify(def.parsed).includes(contextSearch)
                )
              }
              return { success: true, data: result }
            }}
            columns={colums}
            expandable={{ expandedRowRender }}
          />
        </div>
      </div>
    </StyleProvider>
  )
}

export default App
