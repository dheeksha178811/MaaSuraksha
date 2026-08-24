import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`MaaSuraksha API listening on port ${PORT}`);
});
