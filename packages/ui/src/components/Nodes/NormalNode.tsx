import tagHint from "@/utils/tagHint"
import { Descriptions } from "antd"

interface Props {
  tagName?: string
}
const NormalNode: React.FC<Props> = ({ tagName = "" }) => {
  return (
    <div className="flex">
      <div>{tagName}</div>
      <div className="ml-2">{tagHint[tagName] ?? ""}</div>
    </div>
  )
}
export default NormalNode
