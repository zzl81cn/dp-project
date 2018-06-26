// import { filterApproveType } from '../../utils/filter';
// 容器文件
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  DatePicker,
  Modal,
  message,
} from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './ComplaintManage.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
// const statusMap = ['default', 'processing', 'success', 'error'];
// const status = ['关闭', '运行中', '已上线', '异常'];

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
        form.resetFields();
        handleAdd(fieldsValue);
    });
  };
  return (
    <Modal
      title="新建记录"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="描述">
        {form.getFieldDecorator('desc', {
          complaints: [{ required: true, message: 'Please input some description...' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <Button type="default" onClick={() => this.handleModalVisible2(true)}>testModal</Button>
    </Modal>
  );
});

// dva 的 connect 方法可以将组件和数据关联在一起，连接model层的state数据，然后通过this.props.state名(namespace)访问model层的state数据
@connect(({ complaint, loading }) => ({
  complaint,
  loading: loading.models.complaint,
}))
@Form.create()
// 路由组件：具有监听数据行为的组件，一般来说它们的职责是绑定相关联的 model 数据，以数据容器的角色包含其它子组件，通常在项目中表现出来的类型为：Layouts、Router Components 以及普通 Containers 组件。
export default class ComplaintManage extends PureComponent {
  state = {
    modalVisible: false,
    modalVisible2: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    scrollAttr: { x: 3840 }, // 建议指定 scroll.x 为大于表格宽度的固定值或百分比。注意，且非固定列宽度之和不要超过 scroll.x。
    alertVisible: false,//控制弹层是否显示
    baseformshow: 'block',//控制默认显示的第一级大表单的显示隐藏
  };

  componentDidMount() {
    const { dispatch } = this.props;
    /**
     * 前端请求流程#
     * 在 Ant Design Pro 中，一个完整的前端 UI 交互到服务端处理流程是这样的：
     * UI 组件交互操作；
     * 调用 model 的 effect；
     * 调用统一管理的 service 请求函数；
     * 使用封装的 request.js 发送请求；
     * 获取服务端返回；
     * 然后调用 reducer 改变 state；
     * 更新 model。
     */
    // 调用model的effects，通过action触发model层的state的初始化
    // 这里就是在容器组件的 componentDidMount 钩子里面使用dispatch触发models里面的action进行state数据的初始化
    dispatch({
      type: 'complaint/fetch',
    });
  }

  // onChangeDateRange, disabledStartDate, disabledEndDate, onChange, onStartChange, onEndChange, handleStartOpenChange, handleEndOpenChange is for date range input form item.
  onChangeDateRange = (date, dateString) => {
    console.log(date, dateString);
  }
  disabledStartDate = (startValue) => {
    const endValue = this.state.endValue;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }

  disabledEndDate = (endValue) => {
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  }

  onStartChange = (value, date) => {
    console.log('Start date is: ',date);
    this.onChange('startValue', value);
  }

  onEndChange = (value, date) => {
    console.log('End date is: ',date);
    this.onChange('endValue', value);
  }

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  }
  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
  }

  // 分页查询
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'complaint/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'complaint/fetch',
      payload: {},
    });
  };

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  };

  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;

    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'complaint/remove',
          payload: {
            /* params: '111, 222, 333, ...' */
            no: selectedRows.map(row => row.no).join(','),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'complaint/fetch',
        payload: values,
      });
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleAdd = fields => {
    this.props.dispatch({
      type: 'complaint/add',
      payload: {
        description: fields.desc,
      },
    });

    message.success('添加成功');
    this.setState({
      modalVisible: false,
    });
  };
  handleModalVisible2 = flag => {
    console.log('modaling');
    this.setState({
      modalVisible2: !!flag,
    });
  };
  handleAdd2 = () => {
    // message.success('第二层Modal已关闭');
    console.log('第二层Modal已关闭');
  };

  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="被诉案件编号">
              {getFieldDecorator('caseNumber')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="案件名称">
              {getFieldDecorator('caseName')(<Input placeholder="案件名称" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24} style={{textAlign: 'right'}}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    const { startValue, endValue, endOpen } = this.state;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="被诉案件编号">
              {getFieldDecorator('caseNumber')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="案件名称">
              {getFieldDecorator('caseName')(<Input placeholder="案件名称" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="被诉事项类型">
              {getFieldDecorator('prjType')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">占位字符1</Option>
                  <Option value="1">占位字符2</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48}}>
          <Col md={8} sm={24}>
            <FormItem label="纠纷程序">
              {getFieldDecorator('disputeProcess')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">占位字符1</Option>
                  <Option value="1">占位字符2</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="审批状态">
              {getFieldDecorator('wfApprSts')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">占位字符1</Option>
                  <Option value="1">占位字符2</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="项目主类型">
              {getFieldDecorator('prjMainType')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">占位字符1</Option>
                  <Option value="1">占位字符2</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48}}>
          <Col md={8} sm={24}>
            <FormItem label="项目编号">
              {getFieldDecorator('prjNo')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="项目名称">
              {getFieldDecorator('prjName')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="案件权限">
              {getFieldDecorator('judicialType')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="1">分公司权限内</Option>
                  <Option value="2">分公司超权限</Option>
                  <Option value="3">公司部门权限内</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48}}>
          <Col md={8} sm={24}>
            <FormItem label="代理律师名称">
              {getFieldDecorator('lawYer')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="法院层级">
              {getFieldDecorator('courtHierarchy')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">占位字符1</Option>
                  <Option value="1">占位字符2</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="标的金额(元)">
              {getFieldDecorator('amount')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48}}>
          <Col md={8} sm={24}>
            <FormItem label="审理法院/仲裁委">
              {getFieldDecorator('trialCourt')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
                  {/* value={startValue} */}
          <Col md={8} sm={24}>
            <FormItem label="被诉时间">
             {getFieldDecorator('defendantStartDate', {initialValue: null,})(
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={this.disabledStartDate}
                  format="YYYY-MM-DD"
                  placeholder="被诉时间"
                  onChange={this.onStartChange}
                  onOpenChange={this.handleStartOpenChange}
                />
             )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="至">
              {getFieldDecorator('defendantEndDate', {initialValue: null,})(
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={this.disabledEndDate}
                  format="YYYY-MM-DD"
                  placeholder="结案时间"
                  onChange={this.onEndChange}
                  open={endOpen}
                  onOpenChange={this.handleEndOpenChange}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48}}>
          <Col md={8} sm={24}>
            <FormItem label="代理方式">
              {getFieldDecorator('proxyMode')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="经办机构">
              {getFieldDecorator('operatorInstt2')(
                <Input placeholder="经办机构名称" />
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ float: 'right', marginBottom: 24 }}>
            <a style={{ marginLeft: 8, marginRight: 24 }} onClick={this.toggleForm}>
              <Button icon="up"></Button>
            </a>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button type="primary" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
          </span>
        </div>
      </Form>
    );
  }

  renderForm() {
    return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  edit = key => {
    //点击编辑按钮，显示弹层，隐藏第一级大表单
    this.setState({
      alertVisible: true,
      baseformshow:'none',
    });
  };
  //此方法用于接收点击弹层的关闭按钮后接收值使弹层消失，第一级大表单显示出来
  onBlockClick = (editable, baseformshow) => {
    this.setState({
      alertVisible: editable,
      baseformshow,
    });
  }
  render() {
    // 传递给Table组件前的数据处理，数据处理全部放在此处，不要放到表格配置中去，表格配置只有展示相关
    const { complaint: { data }, loading } = this.props;
    const { selectedRows, modalVisible, modalVisible2 } = this.state;
    // 表格滚动
    const { scrollAttr } = this.state;
    // 表头及表格列定义
    const columns = [
      {
        title: '序号',
        dataIndex: 'key',
        fixed: 'left'
      },
      {
        title: '被诉案件编号',
        dataIndex: 'caseNumber',
        width: 230,
        fixed: 'left'
      },
      {
        title: '案件名称',
        dataIndex: 'caseName',
        width: 100
      },
      {
        title: '被诉事项类型',
        dataIndex: 'prjType',
      },
      {
        title: '纠纷程序',
        dataIndex: 'disputeProcess',
      },
      {
        title: '审批状态',
        dataIndex: 'wfApprSts',
        width: 100,
        align: 'center',
        render: (text, record, index) => {
          return filterApproveType(text)
        }
      },
      {
        title: '项目主类型',
        dataIndex: 'prjMainType',
      },
      {
        title: '项目编号',
        dataIndex: 'prjNo',
      },
      {
        title: '项目名称',
        dataIndex: 'prjName',
      },
      {
        title: '代理律师机构名称',
        dataIndex: 'agency',
      },
      {
        title: '代理律师名称',
        dataIndex: 'lawYer',
      },
      {
        title: '法院层级',
        dataIndex: 'courtHierarchy',
      },
      {
        title: '标的金额',
        dataIndex: 'amount',
      },
      {
        title: '被诉时间',
        dataIndex: 'defendantStartDate',
      },
      {
        title: '结案时间',
        dataIndex: 'defendantEndDate',
      },
      {
        title: '审理法院/仲裁委',
        dataIndex: 'trialCourt',
      },
      {
        title: '代理方式',
        dataIndex: 'proxyMode',
      },
      {
        title: '经办机构',
        dataIndex: 'operatorInstt2',
      },
      {
        title: '创建时间',
        dataIndex: 'createdBy',
      },
      {
        title: '(法院或其他机构)案号',
        dataIndex: ''
      },
      {
        title: '裁判文书号',
        dataIndex: ''
      },
      {
        title: '案由',
        dataIndex: ''
      },
      {
        title: '原告人/申请人',
        dataIndex: ''
      },
      {
        title: '被告人/被申请人',
        dataIndex: ''
      },
      {
        title: '备注',
        dataIndex: 'mark',
        width: 230,
        fixed: 'right'
      },
    ];

    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
      handleAdd2: this.handleAdd2,
    };

    return (
      <PageHeaderLayout title="业务列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新建
              </Button>
              {selectedRows.length > 0 && (
                <span>
                  <Button>批量操作</Button>
                  <Dropdown overlay={menu}>
                    <Button>
                      更多操作 <Icon type="down" />
                    </Button>
                  </Dropdown>
                </span>
              )}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              scroll={scrollAttr}
            />
          </div>
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} />
        <CreateModal modalVisible2={modalVisible2} />
      </PageHeaderLayout>
    );
  }
}
