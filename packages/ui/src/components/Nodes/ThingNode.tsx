import { Descriptions, Tag } from "antd"
import _ from "lodash"
import { useMemo } from "react"

interface Props {
  Name?: string
  Abstract?: boolean
}
const ThingNode: React.FC<Props> = ({ Name = "", Abstract = false }) => {
  return (
    <div className="flex">
      <div>ThingDef</div>
      <div className="ml-2">
        <Descriptions
          column={1}
          items={_.compact([
            Name
              ? {
                  key: "1",
                  label: "物品名称",
                  children: <Tag color="success">{Name}</Tag>
                }
              : null,
            Abstract
              ? {
                  key: "2",
                  label: "抽象类",
                  children: Abstract ? <Tag>是</Tag> : <Tag>否</Tag>
                }
              : null
          ])}
        />
      </div>
    </div>
  )
}
export default ThingNode
