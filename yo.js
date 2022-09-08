console.log(process.stdout.isTTY);

process.stdout.write("foo");
setTimeout(
  () => { process.stdout.clearLine(0); },
  1000,
);
