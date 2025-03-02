import prisma from './database.js';

async function getUser(token) {
  const user = await prisma.user.findFirst({
    where: {
      token: token,
      enabled: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    }
  })
  if (!user) {
    return null;
  }

  return user;
}

export default getUser;
