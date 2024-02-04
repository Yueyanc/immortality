import { parseString } from "xml2js";
import path from "path";
import fs from "fs";
const root = process.cwd();
function parseXml(filePath: string) {
  const content = fs.readFileSync(filePath);
  parseString(content, (err, result) => {
    result.Defs.ThingDef.forEach((item: any) => (item.description = []));
    fs.writeFileSync(
      path.join(
        filePath,
        `../${path.basename(filePath).replace("xml", "")}.js`
      ),
      `export default \n${JSON.stringify(result)}\n`
    );
  });
  return;
}
parseXml(path.join(root, "./Defs/Items_Food.xml"));
