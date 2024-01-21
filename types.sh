grep -Evh "import" src/app/auth/entities/*.ts >../bigtrail-types/api/index.ts
grep -Evh "import" src/app/auth/dto/*.ts >>../bigtrail-types/api/index.ts
grep -Evh "import" src/app/minio-client/dto/*.ts >>../bigtrail-types/api/index.ts
grep -Evh "import" src/app/track/entities/*.ts >../bigtrail-types/api/index.ts
grep -Evh "import" src/app/track/dto/*.ts >>../bigtrail-types/api/index.ts
grep -Evh "import" src/app/user/dto/*.ts >>../bigtrail-types/api/index.ts
grep -Evh "import" src/app/user/dto/*.ts >>../bigtrail-types/api/index.ts