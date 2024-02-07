import xml2js from "xml2js";
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
    const paths = [this];
    let current: any = this;
    while ((current = this.parent)) {
      paths.unshift(current);
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

const xmlParser = new xml2js.Parser();
interface XMLoptions {
  file: FileNode;
}
export class XML {
  file;
  handle: FileSystemFileHandle;
  parsed: any;
  constructor({ file }: XMLoptions) {
    this.handle = file.handle;
    this.file = file;
  }
  async parseXML() {
    return (this.parsed = await xmlParser.parseStringPromise(
      await this.handle.getFile()
    ));
  }
}
interface DirNodeOptions {
  handle: FileSystemDirectoryHandle;
}
export class DirNode extends BaseNode {
  dirName;
  handle: FileSystemDirectoryHandle;
  children: (DirNode | FileNode)[] | undefined;
  private modFlag: null | boolean = null;
  constructor({ handle, parent, root }: DirNodeOptions & BaseNodeOptions) {
    super({ handle, parent, root });
    this.handle = handle;
    this.dirName = handle.name;
  }
  async initDir() {
    await this.getEntries();
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
