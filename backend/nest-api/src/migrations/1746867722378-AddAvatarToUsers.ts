import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAvatarToUsers1746867722378 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Kiểm tra xem cột avatar đã tồn tại chưa
        const table = await queryRunner.getTable('users');
        const hasAvatarColumn = table.findColumnByName('avatar');
        
        if (!hasAvatarColumn) {
            await queryRunner.addColumn(
                'users',
                new TableColumn({
                    name: 'avatar',
                    type: 'varchar',
                    isNullable: true
                })
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'avatar');
    }
}
