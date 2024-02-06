var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// index.ts
import xml2js from "xml2js";
import path from "path";
import fs from "fs";
import _ from "lodash";
var root = process.cwd();
var valueMap = {};
function collectValue(value, name, filePath) {
  const arr = valueMap[name];
  if (arr) {
    arr.push({ value, path: path.relative(root, filePath) });
  } else {
    valueMap[name] = [{ value, path: path.relative(root, filePath) }];
  }
}
function parseXmlByPath(filePath, options) {
  return __async(this, null, function* () {
    const content = fs.readFileSync(filePath);
    const parser = new xml2js.Parser(options);
    return yield parser.parseStringPromise(content);
  });
}
function findXmlFiles(folderPath) {
  const files = fs.readdirSync(folderPath);
  let xmlFilesPatch = [];
  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      xmlFilesPatch = xmlFilesPatch.concat(findXmlFiles(filePath));
    } else if (path.extname(file) === ".xml") {
      xmlFilesPatch.push(filePath);
    }
  });
  return xmlFilesPatch;
}
function main() {
  return __async(this, null, function* () {
    const pathList = findXmlFiles(path.join(root, "./packages/Core/Defs"));
    const parsed = [];
    for (const filePath of pathList) {
      const obj = yield parseXmlByPath(filePath, {
        valueProcessors: [
          (value, name) => {
            collectValue(value, name, filePath);
          }
        ]
      });
      parsed.push({ parseResult: obj, filePath });
    }
    _.each(valueMap, (value, key) => {
      valueMap[key] = _.unionBy(value, "value");
    });
    fs.writeFileSync(
      path.join(root, "./valueMap.js"),
      `export default 
${JSON.stringify(valueMap)}
`
    );
  });
}
main();
//# sourceMappingURL=index.js.map