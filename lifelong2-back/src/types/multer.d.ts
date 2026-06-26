declare module 'multer' {
  interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination?: string;
    filename?: string;
    path?: string;
    buffer?: Buffer;
  }

  interface DiskStorageOptions {
    destination?: (
      req: unknown,
      file: MulterFile,
      callback: (error: Error | null, destination: string) => void,
    ) => void;
    filename?: (
      req: unknown,
      file: MulterFile,
      callback: (error: Error | null, filename: string) => void,
    ) => void;
  }

  interface StorageEngine {
    _handleFile?: (
      req: unknown,
      file: MulterFile,
      callback: (error?: Error | null, info?: Partial<MulterFile>) => void,
    ) => void;
    _removeFile?: (req: unknown, file: MulterFile, callback: (error: Error | null) => void) => void;
  }

  interface MulterModule {
    diskStorage(options: DiskStorageOptions): StorageEngine;
  }

  export function diskStorage(options: DiskStorageOptions): StorageEngine;
}
