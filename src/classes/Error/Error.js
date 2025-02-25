class Error {
  constructor(message) {
    this.message = message;
    this.name = 'Error';
  };
};

class FileUploadError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FileUploadError';
  }
};

export {
  FileUploadError
};
