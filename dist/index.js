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
var root = process.cwd();
var parser = new xml2js.Parser({
  valueProcessors: [
    (value, name) => {
      console.log("value", value, name);
      return value;
    }
  ]
});
function parseXmlByPath(filePath) {
  return __async(this, null, function* () {
    const content = fs.readFileSync(filePath);
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
    const pathList = findXmlFiles(path.join(root, "./packages/Core"));
    for (const filePath of pathList) {
      const obj = yield parseXmlByPath(pathList[6]);
      const defs = collectDefs(obj.Defs);
      defs.forEach((def) => {
        def.path = filePath;
      });
    }
  });
}
function collectDefs(defs) {
  const arr = [];
  Object.keys(defs).map((key) => {
    const value = defs[key];
    arr.push(
      ...value.map((item) => {
        var _a;
        return {
          defName: item.defName,
          key,
          abstract: ((_a = value == null ? void 0 : value.$) == null ? void 0 : _a.abstract) === "true"
        };
      })
    );
  });
  return arr;
}
main();
//# sourceMappingURL=index.js.map