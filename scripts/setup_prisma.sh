# SETTING UP PRISMA
npx prisma init
npx prisma db pull
mkdir -p prisma/migrations/0_init
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
npx prisma migrate resolve --applied 0_init
npx prisma generate

# RUNNING SETUP SCRIPT
node setup.js

# STARTING APPLICATION IN BACKGROUND
cd ..
cd bin
pm2 start ./www --name tpath