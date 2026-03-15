import app from './app.js';
import { env } from './config/env.js';

const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${env.NODE_ENV})`);
});
