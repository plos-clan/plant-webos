function splitFileName(filename) {
  const index = filename.lastIndexOf(".");
  const name = filename.substring(0, index);
  const extension = filename.substring(index + 1);
  return { name, extension };
}
