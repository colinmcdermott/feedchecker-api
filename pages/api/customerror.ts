class MissingFeedParameterError extends Error {
    constructor() {
      super('Missing feed parameter');
      this.name = 'MissingFeedParameterError';
      this.statusCode = 400;
    }
  }
  
  class InvalidFeedParameterError extends Error {
    constructor() {
      super('Invalid feed parameter');
      this.name = 'InvalidFeedParameterError';
      this.statusCode = 400;
    }
  }
  
  class InvalidApiKeyError extends Error {
    constructor() {
      super('Invalid API key');
      this.name = 'InvalidApiKeyError';
      this.statusCode = 401;
    }
  }
  
  class FetchError extends Error {
    constructor() {
      super('Error fetching feed size or WebSub/Google Ping APIs');
      this.name = 'FetchError';
      this.statusCode = 500;
    }
  }
  
  export { MissingFeedParameterError, InvalidFeedParameterError, InvalidApiKeyError, FetchError };
  