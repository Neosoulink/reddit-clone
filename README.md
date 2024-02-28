# 👽 Reddit Clone

Simple Reddit clone.

## Live demo 👉 [Reddit-clone-nine-xi](https://reddit-clone-nine-xi.vercel.app/)

## 📝 Features

- Public post reading.
- Post creation
- Nested commentary system
- Voting system

## 🛠 How to start

To be able to run this project locally, you will have to follow a few steps:

### Environments configuration

This app needs some `.env` config props, make you sure to provide:

- `DATABASE_URL`: The live demo is using `Postgres` hosted on `Supabase`.
  You're free to use any BD you'll prefer, just make sure to set the correct provide in your `prisma.schema`
- `DIRECT_URL`: Used for migrations. You can remove it if you plan to use another provider. (make sure to remove it in `prisma.schema`).
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

After the above is done, you can proceed with the installation and the application launch:

```bash
# Install dependency
pnpm install

# Launch the project in dev mode
pnpm run dev
```

<br />

> 💡 Note: This project is using `pnpm`, you are free to use any packages manager that will suite you.
> Just Make sure to have the latest `NodeJS` version installed!

## 🙌 Contribution

Any kind of contribution will be gratefully appreciated.
Feel free to raise an [issue](https://github.com/Neosoulink/reddit-clone/issues) 👈

## 👀 Others

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app` with [shadcn](https://ui.shadcn.com/) for commponents and [Clerk](https://clerk.com/) for Authentication.
