# How to test Breezify on your projects

1. Create a folder in the `tests/data/build-files` directory with the name of your test project
2. Add the files you want to test in the folder you created
3. You can create a config file for your folder in the `tests/data/config-files`. Name it like `${folderName}.json`
4. Run `pnpm test` or `pnpm test:watch` to run the tests
5. The result will be in the `tests/data/output-files` directory
