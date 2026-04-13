import { Controller, Post, Get, UseGuards, Logger } from '@nestjs/common';
import { SeedService } from './seed.service';
import { AdminGuard } from '../auth/admin.guard';
import { DataSource } from 'typeorm';

@Controller('seed')
export class SeedController {
    private readonly logger = new Logger('SeedController');

    constructor(
        private readonly seedService: SeedService,
        private readonly dataSource: DataSource,
    ) { }

    @Post()
    @UseGuards(AdminGuard)
    async seed() {
        await this.seedService.seedAll();
        return { message: 'Database seeded successfully' };
    }

    @Post('clear')
    @UseGuards(AdminGuard)
    async clear() {
        await this.seedService.clearAll();
        return { message: 'Database cleared successfully' };
    }

    /**
     * One-time migration for webhook refactor.
     * Safe to run multiple times — all operations are idempotent.
     */
    @Post('migrate')
    @UseGuards(AdminGuard)
    async migrate() {
        const results: string[] = [];
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();

        try {
            // Step 1: Change status column from ENUM to VARCHAR (if still enum)
            const [statusCol] = await runner.query(
                `SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'status'`
            );
            if (statusCol && statusCol.COLUMN_TYPE?.startsWith('enum')) {
                await runner.query(`ALTER TABLE orders MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending_payment'`);
                results.push('status column: converted from ENUM to VARCHAR(50)');
            } else {
                results.push('status column: already VARCHAR, skipped');
            }

            // Step 2: Add paymentIntentId column
            const [piCol] = await runner.query(
                `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'paymentIntentId'`
            );
            if (!piCol) {
                await runner.query(`ALTER TABLE orders ADD COLUMN paymentIntentId VARCHAR(255) NULL`);
                // Add unique index separately (ignoring duplicates for safety)
                try {
                    await runner.query(`ALTER TABLE orders ADD UNIQUE INDEX idx_paymentIntentId (paymentIntentId)`);
                } catch (e) {
                    results.push('paymentIntentId unique index: already exists');
                }
                results.push('paymentIntentId column: added');
            } else {
                results.push('paymentIntentId column: already exists, skipped');
            }

            // Step 3: Add squareSyncStatus column
            const [ssCol] = await runner.query(
                `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'squareSyncStatus'`
            );
            if (!ssCol) {
                await runner.query(`ALTER TABLE orders ADD COLUMN squareSyncStatus VARCHAR(255) NOT NULL DEFAULT 'pending'`);
                results.push('squareSyncStatus column: added');
            } else {
                results.push('squareSyncStatus column: already exists, skipped');
            }

            // Step 4: Add squareSyncAttempts column
            const [saCol] = await runner.query(
                `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'squareSyncAttempts'`
            );
            if (!saCol) {
                await runner.query(`ALTER TABLE orders ADD COLUMN squareSyncAttempts INT NOT NULL DEFAULT 0`);
                results.push('squareSyncAttempts column: added');
            } else {
                results.push('squareSyncAttempts column: already exists, skipped');
            }

            // Step 5: Add squareSyncLastError column
            const [seCol] = await runner.query(
                `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'squareSyncLastError'`
            );
            if (!seCol) {
                await runner.query(`ALTER TABLE orders ADD COLUMN squareSyncLastError VARCHAR(500) NULL`);
                results.push('squareSyncLastError column: added');
            } else {
                results.push('squareSyncLastError column: already exists, skipped');
            }

            // Step 6: Set correct defaults for existing orders
            const updated1 = await runner.query(
                `UPDATE orders SET squareSyncStatus = 'synced' WHERE squareOrderId IS NOT NULL AND squareSyncStatus = 'pending'`
            );
            results.push(`Existing orders with Square ID: ${updated1.affectedRows || 0} marked as synced`);

            const updated2 = await runner.query(
                `UPDATE orders SET squareSyncStatus = 'not_required' WHERE squareOrderId IS NULL AND status IN ('delivered', 'picked_up', 'cancelled') AND squareSyncStatus = 'pending'`
            );
            results.push(`Completed orders without Square: ${updated2.affectedRows || 0} marked as not_required`);

            this.logger.log(`[MIGRATION] Completed successfully: ${results.join('; ')}`);
            return { success: true, results };
        } catch (err: any) {
            this.logger.error(`[MIGRATION] Failed: ${err.message}`);
            return { success: false, error: err.message, results };
        } finally {
            await runner.release();
        }
    }

    /**
     * Check current migration status
     */
    @Get('migrate/status')
    @UseGuards(AdminGuard)
    async migrateStatus() {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();

        try {
            const columns = await runner.query(
                `SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' ORDER BY ORDINAL_POSITION`
            );

            const colNames = columns.map((c: any) => c.COLUMN_NAME);
            const statusCol = columns.find((c: any) => c.COLUMN_NAME === 'status');

            return {
                columns: colNames,
                statusColumnType: statusCol?.COLUMN_TYPE,
                hasPaymentIntentId: colNames.includes('paymentIntentId'),
                hasSquareSyncStatus: colNames.includes('squareSyncStatus'),
                hasSquareSyncAttempts: colNames.includes('squareSyncAttempts'),
                hasSquareSyncLastError: colNames.includes('squareSyncLastError'),
                migrationNeeded: !colNames.includes('paymentIntentId') || !colNames.includes('squareSyncStatus') || statusCol?.COLUMN_TYPE?.startsWith('enum'),
            };
        } finally {
            await runner.release();
        }
    }
}
