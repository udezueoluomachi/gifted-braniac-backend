const app = require("./app");

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! Shutting down...');
    console.log(err.name, err.message);
    console.log(err)
    process.exit(1);
  });

const port = process.env.port || 2000;

const listener = app.listen(port, () => {
    console.log()
    console.log(`App is running on port ${port}`);
    console.log('---------------------------------')
})

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! Shutting down...');
    console.log(err)
    console.log(err.name, err.message);
    listener.close(() => {
      process.exit(1);
    });
  });