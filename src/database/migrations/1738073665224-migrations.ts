import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1738073665224 implements MigrationInterface {
  name = 'Migrations1738073665224';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "loan_history" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "bookId" varchar NOT NULL,  -- Ajuste o tipo se necessário
                "borrowedAt" timestamp NOT NULL,
                "returnedAt" timestamp,
                "userId" uuid NOT NULL,
                FOREIGN KEY ("userId") REFERENCES "user"("id")
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "loan_history";
        `);
  }
}
