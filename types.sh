grep -Evh "import" src/app/auth/entities/*.ts >types/index.ts
grep -Evh "import" src/app/auth/dto/*.ts >>types/index.ts
grep -Evh "import" src/app/minio-client/dto/*.ts >>types/index.ts
grep -Evh "import" src/app/track/entities/*.ts >types/index.ts
grep -Evh "import" src/app/track/dto/*.ts >>types/index.ts
grep -Evh "import" src/app/user/dto/*.ts >>types/index.ts
grep -Evh "import" src/app/user/dto/*.ts >>types/index.ts