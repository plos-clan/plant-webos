function splitFileName(filename) {
  var lastDotIndex = filename.lastIndexOf(".");
  var name = filename.substring(0, lastDotIndex);
  var extension = filename.substring(lastDotIndex + 1);

  return { name: name, extension: extension };
}
