export default class ResponseData {
  data?: any;
  message?: string;

  constructor(_data?: any, _message?: string) {
    this.data = _data;
    this.message = _message;
  }
}
