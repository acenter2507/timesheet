'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Payment Schema
 */
var PaymentSchema = new Schema({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  // 1-Unsend, 2-Send, 3-Done
  status: { type: Number, default: 1 },
  historys: [{
    // Action of history 1:Created - 2:Updated - 3:Send - 4:Approved - 5:Rejected - 6:Cancel
    action: { type: Number },
    // Time of history
    timing: { type: Date },
    // Owner
    user: { type: Schema.ObjectId, ref: 'User' },
  }],
  // 交通費
  transports: [{
    // 日付
    date: { type: Date },
    // 顧客名/事業内容
    content: { type: String },
    // 起点
    start: { type: String },
    // 終点
    end: { type: String },
    // 往復
    round: { type: Boolean },
    // 手段
    method: { type: String },
    // 手段Other
    method_other: { type: String },
    // 金額
    fee: { type: Number },
    // 領収書
    receipts: [{ type: String }]
  }],
  // 出張旅費
  business: [{
    // 日付
    date: { type: Date },
    // 顧客名/事業内容
    content: { type: String },
    // 起点
    start: { type: String },
    // 終点
    end: { type: String },
    // 往復
    round: { type: Boolean },
    // 摘要
    method: { type: String },
    // 金額
    fee: { type: Number },
    // 宿泊費
    stay_fee: { type: Number },
    // 領収書
    receipts: [{ type: String }]
  }],
  // その他の費用（備品等）
  others: [{
    // 日付
    date: { type: Date },
    // 摘要
    content: { type: String },
    // 勘定科目
    kind: { type: String },
    // 金額
    fee: { type: Number },
    // 領収書
    receipts: [{ type: String }]
  }],
  // 車両燃料費
  vehicles: [{
    // 日付
    date: { type: Date },
    // 摘要
    content: { type: String },
    // 目的
    purpose: { type: String },
    // 金額
    fee: { type: Number },
    // 領収書
    receipts: [{ type: String }]
  }],
  // 会議費 ･接待交際費報告書
  meetings: [{
    // 日付
    date: { type: Date },
    // 顧客名/事業内容
    content: { type: String },
    // 場所
    location: { type: String },
    // 顧客氏名
    partner_names: [{ type: String }],
    // 社員氏名
    employee_names: [{ type: String }],
    // 人数合計
    total: { type: Number },
    // 使用金額
    fee: { type: Number },
    // 1人当たり
    amount: { type: Number },
    // 勘定科目
    kind: { type: String },
    // 種別
    type: { type: String },
    // 領収書
    receipts: [{ type: String }]
  }],
  // 旅費交通費
  transport_fee: {},
  // 車両費
  vehicle_fee: {},
  // 通信費
  communicate_fee: {},
  // 発送配達費
  ship_fee: {},
  // 備品消耗品費
  supplie_fee: {},
  // 図書研究費
  book_fee: {},
  // 事務用品費
  office_fee: {},
  // 会議費
  meeting_fee: {},
  // 接待交際費
  relax_fee: {},
  // 厚生費
  welfare_fee: {},
  // その他
  other_fee: {},
  // その他1
  other1_fee: {},
  // その他2
  other2_fee: {},
  // 支払総額
  total: { type: Number },
  comments: [{
    author: { type: String },
    content: { type: String },
    time: { type: String }
  }],
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' }
});
PaymentSchema.plugin(paginate);

mongoose.model('Payment', PaymentSchema);
