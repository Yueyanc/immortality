import xml2js, { Parser } from "xml2js";
import _ from "lodash";

interface BaseNodeOptions {
  handle: FileSystemFileHandle | FileSystemDirectoryHandle;
  parent?: DirNode;
  root?: DirNode;
}

class BaseNode {
  handle;
  parent;
  root;
  name;
  key;
  constructor({ handle, parent, root }: BaseNodeOptions) {
    this.handle = handle;
    this.parent = parent;
    this.root = root;
    this.name = handle.name;
    this.key = _.uniqueId();
  }
  isDir(): this is DirNode {
    return this.handle.kind === "directory";
  }
  getPath() {
    const paths = [this.name];
    let current: any = this;
    while ((current = current.parent)) {
      paths.unshift(current.name);
    }
    return paths;
  }
}

interface FileNodeOptions {
  handle: FileSystemFileHandle;
}
export class FileNode extends BaseNode {
  fileName;
  handle;
  parent;
  xml;
  constructor({ handle, parent, root }: FileNodeOptions & BaseNodeOptions) {
    super({ handle, parent, root });
    this.handle = handle;
    this.fileName = handle.name;
    this.parent = parent;
    this.xml = handle.name.endsWith(".xml") ? new XML({ file: this }) : null;
  }
  async initFile() {
    this.isXML() && (await this.xml?.parseXML());
  }
  isXML(): this is FileNode & { xml: XML } {
    return !!this.xml;
  }
}

interface XMLoptions {
  file: FileNode;
}

function flatObject(obj: Record<string, any>) {
  var result: Record<string, any> = {};

  function recurse(curObj: Record<string, any>, propNamePrefix: string = "") {
    for (var key in curObj) {
      if (!curObj.hasOwnProperty(key)) continue; // 只处理自身属性而非原型上的属性

      var propName = propNamePrefix ? propNamePrefix + "." + key : key;

      if (typeof curObj[key] === "object") {
        recurse(curObj[key], propName);
      } else {
        result[propName] = curObj[key];
      }
    }
  }

  recurse(obj);

  return result;
}
export class Def {
  isAbstract: Boolean;
  flattenedObject!: Record<string, any>;
  parsed: Record<string, any>;
  className?: string;
  parentName?: string;
  defName?: string;
  label?: string;
  description?: string;
  key: string;
  defType: string;
  xmlFile: FileNode;
  filePaths: string[];
  private mod?: DirNode;
  constructor(defObj: Record<string, any>, defType: string, xmlFile: FileNode) {
    this.key = _.uniqueId();
    this.defType = defType;
    this.filePaths = xmlFile.getPath();
    this.flattenedObject = flatObject(defObj);
    this.parsed = defObj;
    this.xmlFile = xmlFile;
    this.isAbstract = this.parsed?.$?.Abstract ? true : false;
    if (this.isAbstract) {
      this.className = this.parsed?.$?.Name;
    }
    this.parentName = this.parsed?.$?.ParentName;
    this.defName = this.parsed?.defName?.[0];
    this.label = this.parsed?.label?.[0];
    this.description = this.parsed?.description?.[0];
  }
  getMod() {
    if (this.mod) return this.mod;
    let parent = this.xmlFile.parent;
    while ((parent = parent?.parent)) {
      if (parent.isMod()) {
        this.mod = parent;
        break;
      }
    }
    return this.mod;
  }
}
export class XML {
  file;
  handle: FileSystemFileHandle;
  parsed: any;
  xmlParser: Parser;
  defs: Def[] = [];
  flattenedObject!: Record<string, any>;
  constructor({ file }: XMLoptions) {
    this.handle = file.handle;
    this.file = file;
    this.xmlParser = new xml2js.Parser();
  }
  async parseXML() {
    this.parsed = await this.xmlParser.parseStringPromise(
      await this.handle.getFile().then((res) => res.text())
    );
    this.flattenedObject = flatObject(this.parsed);
    _.mapValues(this.parsed?.Defs, (value, key) => {
      if (key.endsWith("Def")) {
        if (Array.isArray(value)) {
          this.defs = this.defs.concat(
            value.map((item) => new Def(item, key, this.file))
          );
        } else {
          this.defs = this.defs.concat(new Def(value, key, this.file));
        }
      }
    });
    return this.parsed;
  }
}
interface DirNodeOptions {
  handle: FileSystemDirectoryHandle;
}
export class DirNode extends BaseNode {
  dirName;
  handle: FileSystemDirectoryHandle;
  children: (DirNode | FileNode)[] | undefined;
  textureDir?: DirNode;
  private modFlag: null | boolean = null;
  constructor({ handle, parent, root }: DirNodeOptions & BaseNodeOptions) {
    super({ handle, parent, root });
    this.handle = handle;
    this.dirName = handle.name;
  }
  async initDir() {
    await this.getEntries();
    this.initMod();
  }
  initMod() {
    if (this.isMod()) {
      this.textureDir = this.find((node) => {
        return node.isDir() && node.name === "Textures";
      }) as DirNode | undefined;
    }
  }
  searchMod() {}
  isMod() {
    if (this.modFlag !== null) return this.modFlag;
    const aboutDir = this.children?.find((item) => item.name === "About");
    if (!aboutDir?.isDir()) return (this.modFlag = false);
    const aboutXML = aboutDir.children?.find(
      (item) => !item.isDir() && item.fileName === "About.xml"
    );

    if (aboutXML) return true;
    return false;
  }
  traverse(callback: (node: DirNode | FileNode) => any) {
    callback(this);
    if (this.children) {
      this.children.forEach((child) => {
        callback(child);
        if (child.isDir()) child.traverse(callback);
      });
    }
  }
  find(
    callback: (node: DirNode | FileNode) => any
  ): DirNode | FileNode | undefined {
    if (callback(this)) {
      return this;
    }
    let result;
    if (this.children) {
      for (let index = 0; index < this.children.length; index++) {
        if (result) break;
        const child = this.children[index];
        if (callback(child)) {
          result = child;
          break;
        }
        if (child.isDir()) result = child.find(callback);
      }
    }

    return result;
  }
  setRoot(root: DirNode) {
    this.traverse((node) => (node.root = root));
  }
  async getEntries() {
    if (this.children) return this.children;
    this.children = [];
    for await (const [name, handle] of this.handle.entries()) {
      if (handle.kind === "directory") {
        const node = new DirNode({ handle, parent: this });
        await node.initDir();
        this.children.push(node);
      } else {
        const node = new FileNode({ handle, parent: this });
        await node.initFile();
        this.children.push(node);
      }
    }
  }
}
