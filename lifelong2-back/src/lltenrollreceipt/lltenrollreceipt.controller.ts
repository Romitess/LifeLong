import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  Ip,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  LltenrollreceiptService,
  ImportResult,
  ImportAndGenerateResponse,
  ReceiptSummaryItem,
} from './lltenrollreceipt.service';
import { QueryEnrollreceiptDto } from './dto/query-enrollreceipt.dto';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { CancelReceiptDto } from './dto/cancel-receipt.dto';
import { CreateExportreceiptlogDto } from './dto/create-exportreceiptlog.dto';
import { ImportPaymentDto } from './dto/import-payment.dto';
import { ImportAndGenerateDto } from './dto/import-and-generate.dto';
import { ReceiptSummaryQueryDto } from './dto/receipt-summary-query.dto';
import { CurrentUser } from '../modules/auth/current-user.decorator';
import { JwtAuthGuard, JwtPayload } from '../modules/auth/jwt-auth.guard';
import { Roles } from '../modules/auth/roles.decorator';
import { Role } from '../modules/auth/enums/role.enum';
import { Lltenrollreceipt } from './entities/lltenrollreceipt.entity';
import { Lltreceipt } from './entities/lltreceipt.entity';
import { Lltexportreceiptlog } from './entities/lltexportreceiptlog.entity';

type ReceiptFileInfo = {
  receiptId: number;
  filename: string;
  receiptType: string;
  url: string;
};

type ReceiptFileResponse = {
  enrollReceiptId: number;
  realReceipt: ReceiptFileInfo | null;
  copyReceipt: ReceiptFileInfo | null;
};

@ApiTags('lltenrollreceipt')
@ApiBearerAuth()
@Roles(Role.Admin, Role.Finance, Role.CentralFinance)
@Controller('lltenrollreceipt')
export class LltenrollreceiptController {
  constructor(private readonly lltenrollreceiptService: LltenrollreceiptService) {}

  @Post('import')
  @Roles(Role.Admin, Role.Finance)
  @ApiOperation({ summary: 'Import batch from CSV' })
  importPaymentRecords(
    @Body() dtos: ImportPaymentDto[],
    @CurrentUser() user: JwtPayload,
  ): Promise<ImportResult & { errors: string[] }> {
    return this.lltenrollreceiptService.importPaymentRecords(dtos, user?.username || 'system');
  }

  @Post('import-and-generate')
  @Roles(Role.Admin, Role.Finance)
  @ApiOperation({ summary: 'Import and generate receipts in one transaction' })
  importAndGenerate(
    @Body() dto: ImportAndGenerateDto,
    @CurrentUser() user: JwtPayload,
    @Ip() ip: string,
    @Headers('user-agent') device: string,
  ): Promise<ImportAndGenerateResponse> {
    const creatorUserId = dto.creatorUserId || user?.sub;
    dto.creatorUserId = creatorUserId;
    dto.creatorIp = dto.creatorIp?.trim() ? dto.creatorIp : ip;
    dto.creatorDevice = dto.creatorDevice?.trim() ? dto.creatorDevice : device;
    return this.lltenrollreceiptService.importAndGenerate(dto, user?.username || 'system');
  }

  @Get()
  @ApiOperation({ summary: 'Find all enroll receipts with filter/pagination' })
  findAll(
    @Query() query: QueryEnrollreceiptDto,
  ): Promise<{ data: Lltenrollreceipt[]; total: number }> {
    return this.lltenrollreceiptService.findAll(query);
  }

  @Get('receipt-summary')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Receipt summary report' })
  getReceiptSummary(
    @Query() query: ReceiptSummaryQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: true; total: number; data: ReceiptSummaryItem[] }> {
    const currentUser = user as JwtPayload & { facCode?: number | string; facId?: number | null };
    return this.lltenrollreceiptService.getReceiptSummary(
      query,
      currentUser.facCode ?? currentUser.facId,
      currentUser.sub,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find one enroll receipt' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Lltenrollreceipt> {
    return this.lltenrollreceiptService.findOne(id);
  }

  @Get(':id/receipt-file')
  @Roles(Role.Admin, Role.Finance, Role.CentralFinance, Role.Student)
  @ApiOperation({ summary: 'Get receipt file information' })
  async getReceiptFile(@Param('id', ParseIntPipe) id: number): Promise<ReceiptFileResponse> {
    const enroll = await this.lltenrollreceiptService.findOne(id);

    const mapReceipt = (receipt: Lltreceipt): ReceiptFileInfo => {
      const filename =
        receipt.receiptType === 'D' ? `${receipt.receiptFilename}_copy` : receipt.receiptFilename;
      return {
        receiptId: receipt.id,
        filename,
        receiptType: receipt.receiptType,
        url: `/api/files/receipts/${receipt.receiptFilename}`,
      };
    };

    return {
      enrollReceiptId: enroll.id,
      realReceipt: enroll.realReceipt ? mapReceipt(enroll.realReceipt) : null,
      copyReceipt: enroll.copyReceipt ? mapReceipt(enroll.copyReceipt) : null,
    };
  }

  @Get(':id/full-receipt-data')
  @Roles(Role.Admin, Role.Finance, Role.CentralFinance, Role.Student)
  @ApiOperation({ summary: 'Get full receipt data by id' })
  async getReceiptDataById(@Param('id', ParseIntPipe) id: number): Promise<{
    enrollReceiptId: number;
    realReceipt: ReceiptFileInfo | null;
    copyReceipt: ReceiptFileInfo | null;
    enrollData: {
      receiptNo: number;
      receivedFrom: string;
      taxId: string;
      address: string;
      date: string;
      amount: number | null;
      effectiveDate: Date | null;
      coseCode: string | null;
      coseNameTh: string | null;
    };
  }> {
    return this.lltenrollreceiptService.getReceiptDataById(id);
  }

  @Get('enroll/:enrollId/receipt-data')
  @Roles(Role.Admin, Role.Finance, Role.CentralFinance, Role.Student)
  @ApiOperation({ summary: 'Get receipt data by enrollId' })
  async getReceiptDataByEnrollId(@Param('enrollId', ParseIntPipe) enrollId: number): Promise<{
    enrollReceiptId: number;
    realReceipt: ReceiptFileInfo | null;
    copyReceipt: ReceiptFileInfo | null;
    enrollData: {
      receiptNo: number;
      receivedFrom: string;
      taxId: string;
      address: string;
      date: string;
      amount: number | null;
      effectiveDate: Date | null;
      coseCode: string | null;
      coseNameTh: string | null;
    };
  }> {
    return this.lltenrollreceiptService.getReceiptDataByEnrollId(enrollId);
  }

  @Post(':id/receipt')
  @Roles(Role.Admin, Role.Finance)
  @ApiOperation({ summary: 'Generate receipt (R or D)' })
  generateReceipt(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReceiptDto,
  ): Promise<Lltreceipt> {
    return this.lltenrollreceiptService.generateReceipt(id, dto.type, dto.createdBy);
  }

  @Patch(':id/cancel')
  @Roles(Role.Admin, Role.Finance)
  @ApiOperation({ summary: 'Cancel receipt' })
  cancelReceipt(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelReceiptDto,
  ): Promise<Lltenrollreceipt> {
    return this.lltenrollreceiptService.cancelReceipt(id, dto);
  }

  @Post('log')
  @ApiOperation({ summary: 'Record export log' })
  logExport(
    @Body() dto: CreateExportreceiptlogDto,
    @Ip() ip: string,
    @Headers('user-agent') device: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Lltexportreceiptlog> {
    const userId = dto.userId || user?.sub;
    const reqIp = dto.ip || ip;
    const reqDevice = dto.device || device;
    return this.lltenrollreceiptService.logExport(dto.receiptId, userId, reqIp, reqDevice);
  }
}
