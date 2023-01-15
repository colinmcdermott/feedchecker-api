import { MissingFeedParameterError, InvalidFeedParameterError } from './customerror';

export const feedRegex = new RegExp(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/);

export const validateFeed = (feed: string) => {
  if (!feed) {
    throw new MissingFeedParameterError();
  }
  if (!feedRegex.test(feed)) {
    throw new InvalidFeedParameterError();
  }
};