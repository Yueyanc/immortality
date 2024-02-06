import tagHint from "@/utils/tagHint"
import labelHint from "@/assets/labelHint"
import { Descriptions } from "antd"

interface Props {
  tagName?: string
  label?: string
}
const NormalNode: React.FC<Props> = ({ tagName = "", label = "" }) => {
  return (
    <div className="flex">
      <div>{tagName}</div>
      <div className="ml-2">{tagHint[tagName] ?? ""}</div>
      {/* @ts-ignore */}
      <div>{(label && labelHint[label]) ?? label}</div>
    </div>
  )
}
export default NormalNode
