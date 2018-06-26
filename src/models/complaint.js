import { queryComplaint, removeComplaint, addComplaint } from '../services/api';

export default {
  namespace: 'complaint',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    // effects里面触发action的方法是yield put
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryComplaint, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      // 拿到http请求数据后触发reducer修改state的数据
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addComplaint, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeComplaint, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
