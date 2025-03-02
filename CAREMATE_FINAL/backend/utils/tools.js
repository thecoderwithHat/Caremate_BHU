import { createHash } from 'crypto';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

function hashPassword(password) {
  return Buffer.from(
      createHash('sha256')
      .update(password + process.env.PASSWORD_SALT)
      .digest('hex')
  ).toString('base64');
}

async function uploadImage(id, image, mimeType) {
  await axios.post(process.env.API_URL, {
    id,
    image,
    mimeType,
  }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.API_KEY}`,
    }
  });
}

export { hashPassword, uploadImage };
