'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  _ = require('underscore'),
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
    method: { type: Number },
    // 手段Other
    method_other: { type: String },
    // 金額
    fee: { type: Number, default: 0 },
    // 金額
    taxi_fee: { type: Number, default: 0 },
    // 領収書
    receipts: [{ type: String }]
  }],
  // 出張旅費
  trips: [{
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
    method: { type: Number },
    // 手段Other
    method_other: { type: String },
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
    kind: { type: Number },
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
    partners: [{
      time: { type: Number },
      name: { type: String }
    }],
    // 社員氏名
    employees: [{
      time: { type: Number },
      name: { type: String }
    }],
    // 人数合計
    total: { type: Number },
    // 使用金額
    fee: { type: Number },
    // 1人当たり
    amount: { type: Number },
    // 勘定科目
    account: { type: Number },
    // 勘定科目Other
    account_other: { type: String },
    // 種別
    kind: { type: Number },
    // 種別Other
    kind_other: { type: String },
    // 領収書
    receipts: [{ type: String }]
  }],
  // 旅費交通費
  transport_fee: { type: Number, default: 0 },
  // 車両費
  vehicle_fee: { type: Number, default: 0 },
  // 通信費
  communicate_fee: { type: Number, default: 0 },
  // 発送配達費
  ship_fee: { type: Number, default: 0 },
  // 備品消耗品費
  supplie_fee: { type: Number, default: 0 },
  // 図書研究費
  book_fee: { type: Number, default: 0 },
  // 事務用品費
  office_fee: { type: Number, default: 0 },
  // 会議費
  meeting_fee: { type: Number, default: 0 },
  // 接待交際費
  relax_fee: { type: Number, default: 0 },
  // 厚生費
  welfare_fee: { type: Number, default: 0 },
  // その他
  other_fee: { type: Number, default: 0 },
  // その他1
  other1_fee: { type: Number, default: 0 },
  // その他2
  other2_fee: { type: Number, default: 0 },
  // 支払総額
  total: { type: Number, default: 0 },
  comments: [{
    author: { type: String },
    content: { type: String },
    time: { type: String }
  }],
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' }
});
PaymentSchema.plugin(paginate);

PaymentSchema.pre('save', function (next) {
  // 旅費交通費
  var index = 0;
  var transport = 0;
  var element = {};

  for (index = 0; index < this.transports.length; index++) {
    element = this.transports[index];
    transport = transport + element.fee + element.taxi_fee;
  }
  var trip = 0;
  for (index = 0; index < this.trips.length; index++) {
    element = this.trips[index];
    trip = trip + element.fee + element.stay_fee;
  }
  this.transport_fee = transport + trip;
  // 車両費
  var count = 0;
  for (index = 0; index < this.vehicles.length; index++) {
    element = this.vehicles[index];
    count = count + element.fee;
  }
  this.vehicle_fee = count;
  // 通信費
  count = 0;
  for (index = 0; index < this.others.length; index++) {
    element = this.others[index];
    if (element.kind === 1) {
      count = count + element.fee;
    }
  }
  this.communicate_fee = count;
  // 発送配達費
  count = 0;
  for (index = 0; index < this.others.length; index++) {
    element = this.others[index];
    if (element.kind === 2) {
      count = count + element.fee;
    }
  }
  this.ship_fee = count;
  // 備品消耗品費
  count = 0;
  for (index = 0; index < this.others.length; index++) {
    element = this.others[index];
    if (element.kind === 3) {
      count = count + element.fee;
    }
  }
  this.supplie_fee = count;
  // 備品消耗品費
  count = 0;
  for (index = 0; index < this.others.length; index++) {
    element = this.others[index];
    if (element.kind === 4) {
      count = count + element.fee;
    }
  }
  this.book_fee = count;
  // 事務用品費
  count = 0;
  for (index = 0; index < this.others.length; index++) {
    element = this.others[index];
    if (element.kind === 5) {
      count = count + element.fee;
    }
  }
  this.office_fee = count;
  // その他
  count = 0;
  for (index = 0; index < this.others.length; index++) {
    element = this.others[index];
    if (element.kind === 6) {
      count = count + element.fee;
    }
  }
  this.other_fee = count;
  // その他2
  count = 0;
  for (index = 0; index < this.others.length; index++) {
    element = this.others[index];
    if (element.kind === 7) {
      count = count + element.fee;
    }
  }
  this.other1_fee = count;
  // その他3
  count = 0;
  for (index = 0; index < this.others.length; index++) {
    element = this.others[index];
    if (element.kind === 8) {
      count = count + element.fee;
    }
  }
  this.other2_fee = count;
  // 会議費
  count = 0;
  for (index = 0; index < this.meetings.length; index++) {
    element = this.meetings[index];
    if (element.account === 1) {
      count = count + element.fee;
    }
  }
  this.meeting_fee = count;
  // 接待交際費
  count = 0;
  for (index = 0; index < this.meetings.length; index++) {
    element = this.meetings[index];
    if (element.account === 2) {
      count = count + element.fee;
    }
  }
  this.relax_fee = count;
  // 厚生費
  count = 0;
  for (index = 0; index < this.meetings.length; index++) {
    element = this.meetings[index];
    if (element.account === 3) {
      count = count + element.fee;
    }
  }
  this.welfare_fee = count;

  this.total = this.transport_fee + this.vehicle_fee + this.communicate_fee + this.ship_fee + this.supplie_fee + this.book_fee + this.office_fee + this.other_fee + this.other2_fee + this.other1_fee + this.meeting_fee + this.relax_fee + this.welfare_fee;
  next();
});

mongoose.model('Payment', PaymentSchema);
