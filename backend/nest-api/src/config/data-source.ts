import { DataSource } from 'typeorm';
import { join } from 'path';

// Sử dụng đường dẫn tương đối thay vì alias
import { User } from '../user/entities/user.entity';
import { CoinTransaction } from '../user/entities/coin-transaction.entity';
import { Notification } from '../notification/entities/notification.entity';

export default new DataSource({
  type: 'sqlite',
  database: join(__dirname, '../../mobile_app.sqlite'),
  entities: [User, CoinTransaction, Notification],
  migrations: [join(__dirname, '../migrations/*.{ts,js}')],
  synchronize: false,
  logging: true,
});