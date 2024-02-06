import tagHint from "@/utils/tagHint"
import labelHint from "@/assets/labelHint"
import { Descriptions, Tag } from "antd"
import _ from "lodash"
import { useMemo } from "react"

interface Props {
  Name?: string
  Abstract?: boolean
  label?: string
}
const ThingNode: React.FC<Props> = ({
  Name = "",
  Abstract = false,
  label = ""
}) => {
  return (
    <div className="flex">
      <div>ThingDef</div>
      <div className="ml-2 flex gap-[10px]">
        {/* @ts-ignore */}
        <div>{(label && labelHint[label]) ?? label}</div>
        {Abstract && (
          <div className="flex">
            <span className="text-gray-500">抽象类：</span>
            <Tag color="success">{Abstract}</Tag>
          </div>
        )}
        {Name && (
          <div className="flex">
            <span className="text-gray-500">物品名称：</span>
            <Tag color="success">{Name}</Tag>
          </div>
        )}
      </div>
    </div>
  )
}
export default ThingNode
