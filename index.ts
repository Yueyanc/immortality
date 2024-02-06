import xml2js from "xml2js";
import path from "path";
import fs from "fs";
import {
  TagTree,
  TagType,
  transformXMLObjectToTree,
  treeToList,
} from "./packages/shared/utils/index";
import _ from "lodash";
const root = process.cwd();
const valueMap = {};
const parser = new xml2js.Parser({
  valueProcessors: [
    (value, name) => {
      console.log("value", value, name);
      if (value) return value;
    },
  ],
});
async function parseXmlByPath(filePath: string) {
  const content = fs.readFileSync(filePath);
  return await parser.parseStringPromise(content);
}
function findXmlFiles(folderPath: string) {
  const files = fs.readdirSync(folderPath);
  let xmlFilesPatch: string[] = [];

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 如果是文件夹，则递归调用 findXmlFilesh 函数
      xmlFilesPatch = xmlFilesPatch.concat(findXmlFiles(filePath));
    } else if (path.extname(file) === ".xml") {
      // 如果是 .xml 文件，则将其添加到结果数组中
      xmlFilesPatch.push(filePath);
    }
  });
  return xmlFilesPatch;
}
async function main() {
  const pathList = findXmlFiles(path.join(root, "./packages/Core"));
  for (const filePath of pathList) {
    const obj = await parseXmlByPath(pathList[6]);
    // console.dir(obj, { depth: null });

    const defs = collectDefs(obj.Defs);
    defs.forEach((def) => {
      def.path = filePath;
    });
  }
  // console.dir(collectDefs(obj.Defs), { depth: null });
}
function collectDefs(defs: Record<string, any>) {
  const arr: any[] = [];
  Object.keys(defs).map((key) => {
    const value = defs[key];
    arr.push(
      ...value.map((item: any) => ({
        defName: item.defName,
        key,
        abstract: value?.$?.abstract === "true",
      }))
    );
  });
  return arr;
}
main();

// async function main() {
//   const nodeValueMap: Record<string, any[]> = {};
//   const pathList = findXmlFiles(path.join(root, "./packages/Core"));
//   const allScanNode = [];
//   for (const xmlPath of pathList) {
//     const obj = await parseXmlByPath(xmlPath);
//     const tree = transformXMLObjectToTree(obj);
//     const list = treeToList(tree).filter(
//       (item) =>
//         item.$tagType === TagType.Node &&
//         item.$childrens?.find((child) => child.$tagType === TagType.Text)
//     );
//     allScanNode.push(...list);
//   }
//   allScanNode.forEach((item) => {
//     const nodeValue = nodeValueMap[item.$tagName as string];
//     if (nodeValue) {
//       Array.isArray(item.$childrens) && nodeValue.push(...item.$childrens);
//     } else {
//       nodeValueMap[item.$tagName as string] = item.$childrens as TagTree[];
//     }
//   });
//   Object.keys(nodeValueMap).forEach((key) => {
//     nodeValueMap[key] = _.unionBy(nodeValueMap[key], (item) => item.value).map(
//       (item) => item.value
//     );
//   });
//   console.dir(nodeValueMap);
//   fs.writeFileSync(
//     path.join(root, "./valueMap.js"),
//     `export default \n${JSON.stringify(nodeValueMap)}\n`
//   );
// }
// main();
