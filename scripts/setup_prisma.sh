# SETTING UP PRISMA
npx prisma init
npx prisma db pull
npx prisma generate

# RUNNING SETUP SCRIPT
node setup.js

# STARTING APPLICATION IN BACKGROUND
cd ..
cd bin
pm2 start ./www --name tpath