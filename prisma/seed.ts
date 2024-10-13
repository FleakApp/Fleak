import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { slugify } from "@fleak-org/remix-utils";

import { cloudinary } from "@/services/cloudinary.server";
import categories from "./../mock/categories-mock.json";

const { hash } = bcrypt;

const prisma = new PrismaClient();

console.log("");
console.log("Initialize seeds");
console.log("");

async function main() {
  const roles = ["admin", "user"];

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        name: role,
      },
      create: {
        name: role,
      },
      update: {
        name: role,
      },
    });
  }

  console.info(`🎭 Roles created mock has been successfully.`);

  const password = await hash("password", 12);

  // primary users
  await prisma.user.upsert({
    where: {
      email: "admin@mail.com",
    },
    update: {
      image:
        "https://res.cloudinary.com/di0adij7g/image/upload/v1723904317/uploads/gjdbkggkw99chsvdkyip.png",
    },
    create: {
      image:
        "https://res.cloudinary.com/di0adij7g/image/upload/v1723904317/uploads/gjdbkggkw99chsvdkyip.png",
      email: "admin@mail.com",
      username: faker.internet.userName(),
      bio: faker.person.bio(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      password,
      verified: faker.date.future({
        years: 10,
        refDate: "2010-01-01T00:00:00.000Z",
      }),
      emailVerified: faker.date.future({
        years: 10,
        refDate: "2010-01-01T00:00:00.000Z",
      }),

      roles: { connect: [{ name: "admin" }, { name: "user" }] },
      account: {
        create: {
          type: "web",
          provider: "web",
          providerAccountId: faker.string.uuid(),
        },
      },
    },
  });

  await prisma.user.upsert({
    where: {
      email: "email@mail.com",
    },
    update: {
      image:
        "https://res.cloudinary.com/di0adij7g/image/upload/v1723904317/uploads/gjdbkggkw99chsvdkyip.png",
    },
    create: {
      image:
        "https://res.cloudinary.com/di0adij7g/image/upload/v1723904317/uploads/gjdbkggkw99chsvdkyip.png",
      email: "smnsqra@duck.com",
      username: "smnsqra",
      bio: faker.person.bio(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      password,
      verified: faker.date.future({
        years: 10,
        refDate: "2010-01-01T00:00:00.000Z",
      }),
      emailVerified: faker.date.future({
        years: 10,
        refDate: "2010-01-01T00:00:00.000Z",
      }),

      roles: { connect: [{ name: "admin" }, { name: "user" }] },
      account: {
        create: {
          type: "web",
          provider: "web",
          providerAccountId: faker.string.uuid(),
        },
      },
    },
  });

  console.info(`🎭 Admin created mock account has been successfully.`);

  // companies
  // await Promise.all(
  //   [...Array(5)].map(async (_) => {
  //     let image = faker.helpers.arrayElement([faker.image.avatarGitHub()]);

  //     if (image) {
  //       const res = await cloudinary.v2.uploader.upload(image, {
  //         use_filename: true,
  //         folder: "avatars",
  //       });
  //       image = res.secure_url;
  //     }

  //     await prisma.user.create({
  //       data: {
  //         email: faker.internet.email().toLowerCase(),
  //         username: faker.internet.userName().toLowerCase(),
  //         bio: faker.person.bio(),
  //         first_name: faker.person.firstName(),
  //         last_name: faker.person.lastName(),

  //         image,
  //         password,

  //         verified: faker.helpers.arrayElement([
  //           faker.date.future({
  //             years: 10,
  //             refDate: "2010-01-01T00:00:00.000Z",
  //           }),
  //           null,
  //         ]),
  //         emailVerified: faker.helpers.arrayElement([
  //           faker.date.future({
  //             years: 10,
  //             refDate: "2010-01-01T00:00:00.000Z",
  //           }),
  //           null,
  //         ]),
  //         account: {
  //           create: {
  //             type: "faker",
  //             provider: "faker",
  //             providerAccountId: faker.string.uuid(),
  //           },
  //         },
  //         // role: "COMPANY",
  //         roles: { connect: [{ name: "user" }] },
  //       },
  //     });
  //   }),
  // );

  // console.info(`🎭 Users created mock has been successfully.`);

  await Promise.all(
    categories.map(async (category, _) => {
      const id = faker.string.uuid();
      const categories = await prisma.category.count({});

      if (categories > 0) {
        return;
      }

      await prisma.category.create({
        data: { ...category, id, active: true },
      });
    }),
  );
  console.info(`🎭 Categories created mock has been successfully.`);

  // await Promise.all(
  //   [...Array(10)].map(async (_) => {
  //     await prisma.tag.create({
  //       data: {
  //         content: faker.lorem.word(),
  //       },
  //     });
  //   }),
  // );
  // console.info(`🎭 Tags created mock has been successfully.`);

  // // posts
  // await Promise.all(
  //   [...Array(50)].map(async (_) => {
  //     const tags = await prisma.tag.findMany();
  //     const users = await prisma.user.findMany();
  //     const categories = await prisma.category.findMany();

  //     let image = faker.image.urlPicsumPhotos({ width: 1920, height: 1080 });

  //     if (image) {
  //       const res = await cloudinary.v2.uploader.upload(image, {
  //         use_filename: true,
  //         folder: "posts",
  //         transformation: ["with_logo"],
  //       });
  //       image = res.secure_url;
  //     }

  //     const title = faker.lorem.paragraph(1);

  //     await prisma.post.create({
  //       data: {
  //         title,
  //         slug: slugify(title),
  //         content: faker.lorem.paragraphs(16),
  //         image,

  //         upVotes: faker.helpers.rangeToNumber({ min: 10, max: 300 }),
  //         views: faker.helpers.rangeToNumber({ min: 100, max: 300 }),
  //         active: faker.helpers.arrayElement([true, false]),

  //         createdAt: faker.date.between({
  //           from: "2020-01-01T00:00:00.000Z",
  //           to: "2024-01-01T00:00:00.000Z",
  //         }),

  //         userId: faker.helpers.arrayElement(users.map((user) => user.id)),
  //         categoryId: faker.helpers.arrayElement(
  //           categories.map((category) => category.id),
  //         ),

  //         tags: {
  //           connect: [
  //             { id: faker.helpers.arrayElement(tags.map((t) => t.id)) },
  //             { id: faker.helpers.arrayElement(tags.map((t) => t.id)) },
  //             { id: faker.helpers.arrayElement(tags.map((t) => t.id)) },
  //             { id: faker.helpers.arrayElement(tags.map((t) => t.id)) },
  //             { id: faker.helpers.arrayElement(tags.map((t) => t.id)) },
  //           ],
  //         },
  //       },
  //     });
  //   }),
  // );

  // console.info(`🎭 Posts created mock has been successfully.`);
}

// run seeds
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
