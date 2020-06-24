const ll = console.log;

// more rules in place to help make asynchronous code well
const doWorkPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    // promise ends when reject or resolve is called - handled automatically compared to callback pattern
    // resolve("This is my success");
    reject("This is my error");
  }, 1000); // pending for one second
});

doWorkPromise
  .then((result) => {
    ll("success", result);
  })
  .catch((error) => {
    ll("Error!", error);
  });
