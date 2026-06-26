import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReceiptTables1748400000004 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // Create LLTENROLLRECEIPT if not exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS LLTENROLLRECEIPT (
        ENROLLRECEIPT_ID        INT AUTO_INCREMENT PRIMARY KEY,
        ENROLL_ID               INT NULL,
        ENROLL_CODE             VARCHAR(20) NULL,
        USER_ID                 INT NULL,
        USER_FNAMETH            VARCHAR(50) NULL,
        USER_LNAMETH            VARCHAR(50) NULL,
        OPENCLASS_ID            INT NULL,
        OPENCLASS_GEN           VARCHAR(100) NULL,
        OPENCLASS_GROUP         VARCHAR(100) NULL,
        COSE_ID                 INT NULL,
        COSE_CODE               VARCHAR(9) NULL,
        COSE_NAMETH             VARCHAR(255) NULL,
        COSE_NAMEEN             VARCHAR(255) NULL,
        FAC_ID                  TINYINT NULL,
        FAC_NAME                VARCHAR(255) NULL,
        AMOUNT                  INT NULL,
        PAYDATE                 VARCHAR(10) NULL,
        PAYTIME                 VARCHAR(8) NULL,
        BANK_NAME               VARCHAR(50) NULL,
        TRANS_CODE              VARCHAR(10) NULL,
        EFFECTIVE_DATE          DATE NULL,
        BUDYEAR                 VARCHAR(4) NULL,
        RECEIPT_NO              BIGINT NULL,
        RECEIPT_NAME            VARCHAR(100) NULL,
        RECEIPT_STATUS          VARCHAR(1) NULL DEFAULT 'Y',
        CASHIER_NAME            VARCHAR(255) NULL,
        BOOKNO                  VARCHAR(4) NULL,
        RUNNO                   INT NULL,
        RECEIPT_ID_REAL         INT NULL,
        RECEIPT_ID_COPY         INT NULL,
        PAY_COMPANYACCOUNT      VARCHAR(20) NULL,
        PAY_COMPANYNAME         VARCHAR(255) NULL,
        PAY_SERVICECODE         VARCHAR(10) NULL,
        RECEIPT_CANCLEDATE      DATETIME NULL,
        RECEIPT_CANCLEUSER_ID   INT NULL,
        RECEIPT_CANCLEUSER_NAME VARCHAR(255) NULL,
        RECEIPT_CANCLEREMARK    VARCHAR(500) NULL,
        RECEIPT_CANCLERECEIPTNEW BIGINT NULL,
        CREATEUSER              VARCHAR(100) NULL,
        CREATEDATE              DATETIME NULL,
        UPDATEUSER              VARCHAR(100) NULL,
        UPDATEDATE              DATETIME NULL,
        UPDATEPROG              VARCHAR(100) NULL
      )
    `);

    // Create LLTRECEIPT if not exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS LLTRECEIPT (
        RECEIPT_ID       INT AUTO_INCREMENT PRIMARY KEY,
        ENROLLRECEIPT_ID INT NULL,
        RECEIPT_FILENAME VARCHAR(255) NULL,
        RECEIPT_TYPE     VARCHAR(1) NULL,
        RECEIPT_CREATE   VARCHAR(255) NULL,
        CREATEUSER       VARCHAR(100) NULL,
        CREATEDATE       DATETIME NULL,
        UPDATEPROG       VARCHAR(100) NULL
      )
    `);

    // Create LLTEXPORTRECEIPTLOG if not exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS LLTEXPORTRECEIPTLOG (
        RECEIPTLOG_ID  INT AUTO_INCREMENT PRIMARY KEY,
        RECEIPT_ID     INT NULL,
        USER_ID        INT NULL,
        RECEIPT_IP     VARCHAR(255) NULL,
        RECEIPT_DEVICE VARCHAR(255) NULL,
        CREATEUSER     VARCHAR(100) NULL,
        CREATEDATE     DATETIME NULL,
        CREATEPROG     VARCHAR(100) NULL
      )
    `);

    // If LLTENROLLRECEIPT already existed with old schema, alter columns
    await queryRunner.query(`
      ALTER TABLE LLTENROLLRECEIPT
        MODIFY COLUMN ENROLL_CODE VARCHAR(20) NULL,
        MODIFY COLUMN PAYDATE     VARCHAR(10) NULL,
        MODIFY COLUMN PAYTIME     VARCHAR(8)  NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS LLTEXPORTRECEIPTLOG`);
    await queryRunner.query(`DROP TABLE IF EXISTS LLTRECEIPT`);
    await queryRunner.query(`DROP TABLE IF EXISTS LLTENROLLRECEIPT`);
  }
}
