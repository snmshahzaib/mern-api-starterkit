export class ApiResponse {
  constructor(code, data = null, message = "Success", meta = null) {
    this.code = code;
    this.message = message;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }
}
