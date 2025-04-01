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

class EmptyExamNameError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EmptyExamNameError';
  }
};

class EmptyExamResultsError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EmptyExamResultsError';
  }
};

class FormFieldError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FormFieldError';
  }
};

export {
  FileUploadError,
  EmptyExamNameError,
  EmptyExamResultsError,
  FormFieldError
};
