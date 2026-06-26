import { BadRequestException } from '@nestjs/common';
import { open, unlink } from 'node:fs/promises';

export type MagicFileType = 'jpeg' | 'png' | 'pdf' | 'webp';

function matchesMagic(buf: Buffer, type: MagicFileType): boolean {
  switch (type) {
    case 'jpeg':
      return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    case 'png':
      return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    case 'pdf':
      return buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
    case 'webp':
      return (
        buf[0] === 0x52 &&
        buf[1] === 0x49 &&
        buf[2] === 0x46 &&
        buf[3] === 0x46 &&
        buf[8] === 0x57 &&
        buf[9] === 0x45 &&
        buf[10] === 0x42 &&
        buf[11] === 0x50
      );
  }
}

export async function assertFileMagic(
  filePath: string,
  allowedTypes: MagicFileType[],
): Promise<void> {
  const fd = await open(filePath, 'r');
  const buf = Buffer.alloc(12);
  try {
    await fd.read(buf, 0, 12, 0);
  } finally {
    await fd.close();
  }
  if (!allowedTypes.some((t) => matchesMagic(buf, t))) {
    await unlink(filePath).catch(() => undefined);
    throw new BadRequestException('File type not allowed');
  }
}

export function assertBufferMagic(buffer: Buffer, allowedTypes: MagicFileType[]): void {
  if (buffer.length < 4) throw new BadRequestException('File too small');
  if (!allowedTypes.some((t) => matchesMagic(buffer, t))) {
    throw new BadRequestException('File type not allowed');
  }
}
