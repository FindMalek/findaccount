# TODO

This file would contain a list of tasks that need to be completed.
The format would be:

- [ ] Task 1 || Priority
- [ ] Task 2 || Priority
- [ ] Task 3 || Priority

## Tasks

- [ ] Implement oRPC instead of Next.js Server Actions || Low
This would let us scale into using API calls for external usage of the app, to be used in other apps.

- [ ] Change return types of the Server Actions || High
Currently we use ZOD.parse() in the server actions to validate the data.
Which is good, but I would like to use `entity.ts` and `query.ts` to validate the data - Each Prisma model would have a corresponding entity and query.
