import app from './app';

app.listen(app.get('port'), () => {
  console.log(`App is listened at ${app.get('port')}`);
});
