import { ProDescriptions } from "@ant-design/pro-components"
import { useState, useEffect } from "react"
import { Image } from "antd"
import { Def } from "shared/utils/file"
import { GraphicClass } from "@/types"

async function getTexture(
  paths: string[],
  textureDirHandle: FileSystemDirectoryHandle,
  graphicClass: GraphicClass
) {
  let urls: string[] = []
  let handles = []
  async function getUrlByHandle(handle: FileSystemFileHandle) {
    return URL.createObjectURL(await handle.getFile())
  }
  let target: any = textureDirHandle
  for (let index = 0; index < paths.length; index++) {
    const name = paths[index]
    if (index !== paths.length - 1) {
      target = await target?.getDirectoryHandle(name)
    } else {
      if (graphicClass === GraphicClass.Graphic_Single) {
        handles = [await target?.getFileHandle(name + ".png")]
      } else if (graphicClass === GraphicClass.Graphic_Multi) {
        handles = ["_east", "_north", "_south"].map((item) => {
          return target?.getFileHandle(name + item + ".png")
        })
      }
    }
  }
  urls = await Promise.all(handles).then(async (res) => {
    return Promise.all(res.map(async (item) => await getUrlByHandle(item)))
  })

  return urls.filter((item) => item)
}

const Descriptions: React.FC<{ record: Def }> = ({ record }) => {
  // TODO: 多视角图片支持
  const [textureUrls, setTextureUrls] = useState<string[]>([])
  useEffect(() => {
    console.log(record)

    const paths =
      record.parsed?.graphicData?.[0]?.texPath?.[0]?.split("/") || []
    const handle = record?.getMod()?.textureDir?.handle
    const graphicClass =
      record.parsed?.graphicData?.[0]?.graphicClass?.[0] ||
      GraphicClass.Graphic_Single
    if (paths.length !== 0 && handle && graphicClass) {
      getTexture(paths, handle, graphicClass).then((res) => {
        setTextureUrls(res)
      })
    }
  }, [])
  return (
    <ProDescriptions editable={{}} dataSource={record}>
      {textureUrls.length !== 0 && (
        <ProDescriptions.Item
          editable={false}
          span={3}
          contentStyle={{
            maxWidth: "100%"
          }}
          label="贴图"
        >
          {textureUrls.map((url, index) => (
            <Image key={index} src={url} height={200} />
          ))}
        </ProDescriptions.Item>
      )}

      <ProDescriptions.Item
        editable={false}
        span={2}
        contentStyle={{
          maxWidth: "100%"
        }}
        valueType="text"
        label="描述"
      >
        {record.description}
      </ProDescriptions.Item>
      <br />
      <ProDescriptions.Item
        editable={false}
        valueType="text"
        label="游戏内名称"
        span={3}
        ellipsis
      >
        {record.label}
      </ProDescriptions.Item>
      <ProDescriptions.Item label="定义代码" valueType="jsonCode">
        {JSON.stringify(record.parsed)}
      </ProDescriptions.Item>
    </ProDescriptions>
  )
}
export default Descriptions
