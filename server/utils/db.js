const mongoose = require('mongoose');
const connectDB = async () => {
    try {
      const conn = await mongoose.connect(`mongodb://mongo:CUiqckCUuGKUTeBXgbPYVWynprLUNpWD@autorack.proxy.rlwy.net:53271`, {
        useNewUrlParser: true,
        dbName: 'thesis',
      });
      console.log(`MongoDB Connected: {conn.connection.host}`);
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
}

module.exports = connectDB;