import xml2js, { ParserOptions } from "xml2js";
import path from "path";
import fs from "fs";
import _ from "lodash";
const root = process.cwd();
const valueMap: Record<string, any> = {};

// 收集可能的value值
function collectValue(value: string, name: string, filePath: string) {
  const arr = valueMap[name];
  if (arr) {
    arr.push({ value, path: path.relative(root, filePath) });
  } else {
    valueMap[name] = [{ value, path: path.relative(root, filePath) }];
  }
}
// 解析path的xml文件为obj
async function parseXmlByPath(filePath: string, options?: ParserOptions) {
  const content = fs.readFileSync(filePath);
  const parser = new xml2js.Parser(options);
  return await parser.parseStringPromise(content);
}

// 查找所有xml文件
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
  const pathList = findXmlFiles(path.join(root, "./packages/Core/Defs"));
  const parsed = [];
  for (const filePath of pathList) {
    const obj = await parseXmlByPath(filePath, {
      valueProcessors: [
        (value, name) => {
          collectValue(value, name, filePath);
        },
      ],
    });
    parsed.push({ parseResult: obj, filePath });
  }
  _.each(valueMap, (value, key) => {
    valueMap[key] = _.unionBy(value, "value");
  });
  fs.writeFileSync(
    path.join(root, "./valueMap.js"),
    `export default \n${JSON.stringify(valueMap)}\n`
  );
  // console.dir(valueMap, { depth: null });
}
main();
