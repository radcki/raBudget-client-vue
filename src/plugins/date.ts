import { format } from 'date-fns';

export const DatePlugin = {
  install() {
    Date.prototype.toJSON = function () {
      return format(this, `yyyy-MM-dd'T'HH:mm:ss`);
    };
  },
};
