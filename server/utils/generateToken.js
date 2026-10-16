import jwt from 'jsonwebtoken';

export const sendToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const prod = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: prod,
    sameSite: prod ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
