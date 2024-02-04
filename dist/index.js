"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// index.ts
var import_xml2js = require("xml2js");
var import_path = __toESM(require("path"));
var import_fs = __toESM(require("fs"));
var root = process.cwd();
function parseXml(filePath) {
  const content = import_fs.default.readFileSync(filePath);
  (0, import_xml2js.parseString)(content, (err, result) => {
    result.Defs.ThingDef.forEach((item) => item.description = []);
    import_fs.default.writeFileSync(
      import_path.default.join(
        filePath,
        `../${import_path.default.basename(filePath).replace("xml", "")}.js`
      ),
      `export default 
${JSON.stringify(result)}
`
    );
  });
  return;
}
parseXml(import_path.default.join(root, "./Defs/Items_Food.xml"));
