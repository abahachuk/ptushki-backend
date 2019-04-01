// @ts-ignore
import 'dotenv/config';
import config from 'config';
import app from './app';
import connectDB from './db';
import routes from './routes';

const PORT = config.get('PORT');

(async () => {
  try {
    await connectDB();
    app.use(routes());
    app.listen(PORT, () => {
      console.log(`App is listened at ${PORT}`);
    });
  } catch (e) {
    console.error(e);
  }
})();
