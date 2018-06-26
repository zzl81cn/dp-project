import { parse } from 'url';
import moment from 'moment';
// mock ComplaintManageDataSource
let tableListDataSource = [];
const beginDay = new Date().getTime();
for (let i = 0; i < 46; i += 1) {
  const j = Math.ceil(Math.random() * 5);
  tableListDataSource.push({
    key: i + 1,
    disabled: i % 6 === 0,
    id: `TradeCode ${i}`,
    type: `一个任务名称 ${i}`,
    name: 'xxx',
    mark: '这是一段描述',
    range: '全部',
    orgId: "21540004",
    amount: "1000",
    caseName: `某某纠纷${i}`,
    caseNumber: `UL20180419${i}`,
    courtHierarchy: "01",
    operatorInstt2: "某省某分公司-某部门",
    badEndogenous: "",
    firstSessionDt: "",
    controversialIssue: "",
    agency: "某联合律师事务所",
    caseReason: "",
    prjName: "阿拉伯******购项目",
    createdBy: "2018-04-20 15:30:03",
    defendantPrjTyp: "2",
    judicialType: "02",
    plainTiff: "s",
    defendant: "s",
    wfApprSts: `${j}`,
    lawsuitsFee: "",
    lawYer: "李四",
    trialStage: "087019",
    defendantCaseType: "206002",
    modifyTime: "oracle.sql.TIMESTAMP@4ceeb24a",
    newCreateDt: "2018-02-09 10:00:21",
    agencyCost: "",
    defendantStartDate: moment(new Date(beginDay + 1000 * 60 * 60 * 24 * i)).format('YYYY-MM-DD'),
    defendantEndDate: moment(new Date(beginDay + 1000 * 60 * 60 * 24 * i)).format('YYYY-MM-DD'),
    bizNo: "",
    applyAssetPreservation: "",
    operatorName2: "张三",
    operatorInsTT: "21540004",
    prjType: "项目类",
    proxyMode: "182001",
    prjNo: "0002016000006",
    prjMainType: "0101",
    wtAbandoned: "0",
    disputeProcess: "01",
    debtContractNo: "",
    caseJurisdiction: "",
    refereeDocNumber: "",
    defendantCaseNo: "UL2018020963735",
    responsesRequest: "",
    specialExecuteProgram: "",
    trialCourt: "非官方",
    bizName: "",
    endCaseTime: "",
    createDt: "oracle.sql.TIMESTAMP@6b304e08",
    customerName: "",
    customerNo: "",
    modifyName: "612332",
    assetPreserveCondition: "",
    operatorName: "612332",
});
}

export function getComplaint(req, res, u) {
  let url = u;
  if (!url || Object.prototype.toString.call(url) !== '[object String]') {
    url = req.url; // eslint-disable-line
  }

  const params = parse(url, true).query;

  let dataSource = [...tableListDataSource];

  if (params.sorter) {
    const s = params.sorter.split('_');
    dataSource = dataSource.sort((prev, next) => {
      if (s[1] === 'descend') {
        return next[s[0]] - prev[s[0]];
      }
      return prev[s[0]] - next[s[0]];
    });
  }

  if (params.status) {
    const status = params.status.split(',');
    let filterDataSource = [];
    status.forEach(s => {
      filterDataSource = filterDataSource.concat(
        [...dataSource].filter(data => parseInt(data.status, 10) === parseInt(s[0], 10))
      );
    });
    dataSource = filterDataSource;
  }

  if (params.no) {
    dataSource = dataSource.filter(data => data.no.indexOf(params.no) > -1);
  }

  let pageSize = 10;
  if (params.pageSize) {
    pageSize = params.pageSize * 1;
  }

  const result = {
    retCode: 0,
    errMsg: null,
    message: "SUCCESS",
    list: dataSource,
    pagination: {
      total: dataSource.length,
      pageSize,
      current: parseInt(params.currentPage, 10) || 1,
    },
  };

  if (res && res.json) {
    res.json(result);
  } else {
    return result;
  }
}

export function postComplaint(req, res, u, b) {
  let url = u;
  if (!url || Object.prototype.toString.call(url) !== '[object String]') {
    url = req.url; // eslint-disable-line
  }

  const body = (b && b.body) || req.body;
  const { method, caseNumber, caseName, description } = body;

  switch (method) {
    /* eslint no-case-declarations:0 */
    case 'delete':
      tableListDataSource = tableListDataSource.filter(item => caseNumber.indexOf(item.caseNumber) === -1);
      break;
    case 'post':
      const i = Math.ceil(Math.random() * 10000);
      tableListDataSource.unshift({
        key: i,
        href: 'https://ant.design',
        avatar: [
          'https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png',
          'https://gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png',
        ][i % 2],
        caseNumber: `UL20180419${i}`,
        caseName: caseName,
        // no: `TradeCode ${i}`,
        title: `一个任务名称 ${i}`,
        owner: 'xxx',
        description,
        callNo: Math.floor(Math.random() * 1000),
        status: Math.floor(Math.random() * 10) % 2,
        updatedAt: new Date(),
        createdAt: new Date(),
        progress: Math.ceil(Math.random() * 100),
      });
      break;
    default:
      break;
  }

  const result = {
    list: tableListDataSource,
    pagination: {
      total: tableListDataSource.length,
    },
  };

  if (res && res.json) {
    res.json(result);
  } else {
    return result;
  }
}

export default {
  getComplaint,
  postComplaint,
};
