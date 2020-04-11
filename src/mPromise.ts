// interface IExecutor = (resolve: function, reject: function) => any;
// TODO: return types for functions?

enum state {
  pending = 0,
  fulfilled = 1,
  rejected = 2,
}

class MPromise {
  state: number = 0;
  value: any;
  handlers: any[];

  constructor(executor) {
      this.doResolve(executor, this.resolve, this.reject);
  }

  resolve(result) {
    try {
      const then = this.getThen(result);
      if (then) {
        this.doResolve(then.bind(result), this.resolve, this.reject);
        return;
      }
      this.fulfill(result);
    } catch (err) {
      this.reject(err);
    }
  }

   /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   *
   * @param {Function} fn A resolver function that may not be trusted
   * @param {Function} onFulfilled
   * @param {Function} onRejected
   */
  doResolve(executor, onFulfill, onReject) {
    let done = false;
    try {
      executor(
        value => {
          if (done) return;
          done = true;
          onFulfill(value);
        },
        reason => {
          if (done) return;
          done = true;
          onReject(reason);
        }
      );
    } catch (err) {
      if (done) return;
      done = true;
      onReject(err);
    }
  }

  fulfill(result: any) {
    this.state = state.fulfilled;
    this.value = result;
  }

  reject(error: Object | string) {
    this.state = state.rejected;
    this.value = error;
  }

  /**
   * Check if a value is a Promise and, if it is,
   * return the `then` method of that promise.
   *
   * @param {Promise|Any} value
   * @return {Function|Null}
   */
  getThen(value) {
    if (typeof value?.then === "function") {
      return value;
    }
    return null;
  }
}
