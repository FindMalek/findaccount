# TODO

This file would contain a list of tasks that need to be completed.
The format would be:

- [ ] Task 1 || Priority
- [ ] Task 2 || Priority
- [ ] Task 3 || Priority

## Tasks

- [ ] Implement oRPC instead of Next.js Server Actions || Low
      This would let us scale into using API calls for external usage of the app, to be used in other apps.

- [x] Change return types of the Server Actions || High
      Currently we use ZOD.parse() in the server actions to validate the data.
      Which is good, but I would like to use `entity.ts` and `query.ts` to validate the data - Each Prisma model would have a corresponding entity and query.

- [x] Create a `verify` function for the `better-auth` library || High
      This would be used to verify the user session in the server actions. We could use this in the client as well.

- [x] We should change the `Credential`, like `loginUrl` is not neccesary. Because that could be stored in the `Platform` model.

- [x] Finish editing the `DashboardAddCredentialDialog`
      Make sure there are 2 columns, one for the important fields, and one for the optional fields.

- [ ] Use Tanstack Query for reloading data

- [ ] Usage of 'logo.dev' for `Platforms` model

- [ ] In the `Credential` model changes
      Change the `username` to `identifier` to make it more clear that it could be anything.
