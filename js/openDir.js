async function openDir(path) {
  try {
    const response = await fetch('/api/opendir?dir=' + path);
    if (!response.ok) {
      throw new Error('网络请求失败');
    }
    const data = await response.json();
    data.sort(function (a, b) {
      if (a.type === null && b.type !== null) return -1;
      if (a.type !== null && b.type === null) return 1;
      var nameA = a.name.toUpperCase();
      var nameB = b.name.toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
    return data
  } catch (error) {
    console.error('发生错误:', error);
  }
}