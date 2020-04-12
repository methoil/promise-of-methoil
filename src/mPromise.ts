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

  public done(onFulfilled, onRejected) {
    // ensure we're always asynchronous
    setTimeout(() => {
      this.handle({
        onFulfilled,
        onRejected,
      });
    }, 0);
  }

  public then(onFulfilled, onRejected) {
    return new MPromise((resolve, reject) => {
      return this.done(
        result => {
          if (typeof onFulfilled === "function") {
            try {
              return resolve(onFulfilled(result));
            } catch (ex) {
              return reject(ex);
            }
          } else {
            return resolve(result);
          }
        },
        err => {
          if (typeof onRejected === "function") {
            try {
              return resolve.onRejected(err);
            } catch (ex) {
              return reject(ex);
            }
          }
        }
      );
    });
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
    this.handlers.forEach(this.handle);
    this.handlers = null;
  }

  reject(error: Object | string) {
    this.state = state.rejected;
    this.value = error;
    this.handlers.forEach(this.handle);
    this.handlers = null;
  }

  handle(handler) {
    if (this.state === state.pending) {
      this.handlers.push(handler);
    } else {
      if (this.state === state.fulfilled) {
        handler.onFulfilled(this.value);
      } else if (this.state === state.fulfilled) {
        handler.onReject(this.value);
      }
    }
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
