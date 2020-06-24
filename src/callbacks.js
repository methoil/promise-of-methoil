const ll = console.log;

// more manual approach, error prone
const doWorkCallback = (callback) => {
  setTimeout(() => {
    callback(null, "this is my success");
  }, 1000);
};

doWorkCallback((error, result) => {
  // more manual checking needed vs promises
  if (error) {
    return ll(error);
  }

  ll(result);
});
