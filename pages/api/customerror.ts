class MissingFeedParameterError extends Error {
    statusCode = 400;
    constructor() {
      super('Missing feed parameter');
      this.name = 'MissingFeedParameterError';
    }
  }
  
  class InvalidFeedParameterError extends Error {
    statusCode = 400;
    constructor() {
      super('Invalid feed parameter');
      this.name = 'InvalidFeedParameterError';
    }
  }
  
  class InvalidApiKeyError extends Error {
    statusCode = 401;
    constructor() {
      super('Invalid API key');
      this.name = 'InvalidApiKeyError';
    }
  }
  
  class FetchError extends Error {
    statusCode = 500;
    constructor() {
      super('Error fetching feed size or WebSub/Google Ping APIs');
      this.name = 'FetchError';
    }
  }
  
  export { MissingFeedParameterError, InvalidFeedParameterError, InvalidApiKeyError, FetchError };  