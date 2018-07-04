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

PaymentSchema.pre('save', function (next) {
  // 旅費交通費
  var transport = this.transports.reduce((s, f) => {
    return s + f.fee + f.taxi_fee;
  }, 0);
  var trip = this.trips.reduce((s, f) => {
    return s + f.fee + f.stay_fee;
  }, 0);
  this.transport_fee = transport + trip;
  // 車両費
  this.vehicle_fee = this.vehicles.reduce((s, f) => {
    return s + f.fee;
  }, 0);
  // 通信費
  this.communicate_fee = this.others.reduce((s, f) => {
    if (f.kind === 1) {
      return s + f.fee;
    } else {
      return s;
    }
  }, 0);
  // 通信費
  this.ship_fee = this.others.reduce((s, f) => {
    if (f.kind === 2) {
      return s + f.fee;
    } else {
      return s;
    }
  }, 0);
  // 備品消耗品費
  this.supplie_fee = this.others.reduce((s, f) => {
    if (f.kind === 3) {
      return s + f.fee;
    } else {
      return s;
    }
  }, 0);
  // 備品消耗品費
  this.book_fee = this.others.reduce((s, f) => {
    if (f.kind === 4) {
      return s + f.fee;
    } else {
      return s;
    }
  }, 0);
  // 事務用品費
  this.office_fee = this.others.reduce((s, f) => {
    if (f.kind === 5) {
      return s + f.fee;
    } else {
      return s;
    }
  }, 0);
  // その他
  this.other_fee = this.others.reduce((s, f) => {
    if (f.kind === 6) {
      return s + f.fee;
    } else {
      return s;
    }
  }, 0);
  // その他2
  this.other1_fee = this.others.reduce((s, f) => {
    if (f.kind === 7) {
      return s + f.fee;
    } else {
      return s;
    }
  }, 0);
  // その他3
  this.other2_fee = this.others.reduce((s, f) => {
    if (f.kind === 8) {
      return s + f.fee;
    } else {
      return s;
    }
  }, 0);
  // 会議費
  this.meeting_fee = this.mettings.reduce((s, f) => {
    if (f.account === 1) {
      return s + f.fee;
    } else {
      return s;
    }
  }, 0);
  // 接待交際費
  this.relax_fee = this.mettings.reduce((s, f) => {
    if (f.account === 2) {
      return s + f.fee;
    } else {
      return s;
    }
  }, 0);
  // 厚生費
  this.welfare_fee = this.mettings.reduce((s, f) => {
    if (f.account === 3) {
      return s + f.fee;
    } else {
      return s;
    }
  }, 0);

  this.total = this.transport_fee + this.vehicle_fee + this.communicate_fee + this.ship_fee
    + this.supplie_fee + this.book_fee + this.office_fee + this.other_fee
    + this.other2_fee + this.other1_fee + this.meeting_fee + this.relax_fee + this.welfare_fee;

  next();
});

mongoose.model('Payment', PaymentSchema);
