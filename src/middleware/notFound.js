const notFoundMiddleware = require('./middleware/notFound');

app.use(notFoundMiddleware);

app.use((req, res, next) => {
    res.status(404).json({ msg: 'Not found' });
  });
  