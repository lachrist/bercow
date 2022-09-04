import { default as minimist } from "minimist";
import { main } from "../lib/main.mjs";

main(minimist(process.argv.slice(2)));
