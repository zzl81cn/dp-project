// import moment from 'moment';

// 被诉案件管理——审批状态
export function filterApproveType(value) {
  // console.log('Current item value is: ', value);
  switch (value) {
    case '0':
      return '待发起';
    case '1':
      return '审批中';
    case '2':
      return '拿回';
    case '3':
      return '打回';
    case '4':
      return '通过';
    default:
      return '未知数据';
  }
};
