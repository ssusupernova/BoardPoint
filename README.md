# Welcome to your Expo app 

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Supabase backend

The app reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from `.env`. Set the URL to the project root (for example, `https://<project-ref>.supabase.co`), not an API endpoint such as `/rest/v1/`. Apply the base BoardPoint schema before the migrations in `supabase/migrations`.

The landlord verification migration creates a private `verification-files` bucket, restricts landlord write policies until an application is approved, and adds admin-only review functions. Landlords confirm their email before submitting the required ID-front, ID-back, selfie-with-ID, and proof-of-address images. Administrators review live submissions from Admin → Landlord verification; document access is audited and signed preview links expire after one minute. Apply the migration before testing this flow.

Username login and username-based password recovery use the `username-auth` Edge Function. After linking the Supabase CLI to the project, apply the migration, set a random server-only rate-limit secret, and deploy the function:

```bash
supabase db push
supabase secrets set USERNAME_LOGIN_RATE_LIMIT_SECRET="<random secret>"
supabase functions deploy username-auth
```

Supabase provides the function's `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` values. Never add the service-role key to the app's `.env`.

The function resolves usernames server-side, rate-limits attempts, and only returns an Auth session after the password is verified. It does not return the account email to the app.
