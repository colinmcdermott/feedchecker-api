export class MissingFeedParameterError extends Error {
    constructor() {
      super('Missing feed parameter');
      this.name = 'MissingFeedParameterError';
      this.statusCode = 400;
    }
  }
  
  export class InvalidFeedParameterError extends Error {
    constructor() {
      super('Invalid feed parameter, should be a valid URL');
      this.name = 'InvalidFeedParameterError';
      this.statusCode = 400;
    }
  }
  
  export class InvalidApiKeyError extends Error {
    constructor() {
      super('Invalid API key');
      this.name = 'InvalidApiKeyError';
      this.statusCode = 401;
    }
  }
  
  export class FetchError extends Error {
    constructor() {
      super('Error fetching feed size or WebSub/Google Ping APIs, please check that the feed URL is valid');
      this.name = 'FetchError';
      this.statusCode = 500;
    }
  }
  