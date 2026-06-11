# vidate

本地测试平台用于按 UID 设置测试库用户金币余额。当前实现只包含一个受限操作，目标余额由页面表单动态填写：

- `vidate_test.coin_wallet.balance = 页面填写的目标余额`
- `joymeet_test.wallet.balance = 页面填写的目标余额`

## 启动

```bash
npm install
cp .env.example .env
npm run dev
```

启动后访问 `http://localhost:3000`。

## 配置

`.env` 中需要配置数据库连接：

```bash
PORT=3000
DB_HOST=10.10.12.20
DB_PORT=3306
DB_USER=root
DB_PASSWORD=replace_with_database_password
DB_CONNECTION_LIMIT=4
```

## 接口

```http
POST /api/wallets/set-balance
Content-Type: application/json

{
  "userId": "2311247",
  "balance": "8000",
  "confirm": true
}
```

接口只接受数字 UID 和整数余额，库表名固定在服务端代码中，SQL 值使用 prepared statement 传参。

清空用户金币：

```sql
UPDATE `vidate_test`.`coin_wallet` SET `balance` = 0 WHERE `user_id` = <uid>;
UPDATE `joymeet_test`.`wallet` SET `balance` = 0 WHERE `user_id` = <uid>;
```

## Sayhi 查询

查询 `user_sayhi_record` 集合：

```js
db.getCollection("user_sayhi_record").find({ "from_uuid": "<uuid>" }).limit(1000).skip(0)
```

需要在 `.env` 中配置 Mongo：

```bash
MONGO_URI=mongodb://10.10.12.20:27017
MONGO_DB_NAME=replace_with_mongo_database
MONGO_SAYHI_COLLECTION=user_sayhi_record
SAYHI_QUERY_LIMIT=1000
SAYHI_QUERY_SKIP=0
```

更新 sayhi 次数：

```sql
UPDATE `vidate_test`.`user_sayhi_count` SET `count` = <count> WHERE `id` = <uid>;
```
