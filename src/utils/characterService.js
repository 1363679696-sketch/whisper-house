export const characterService = {
  getAll() {
    return JSON.parse(localStorage.getItem("characters") || "[]");
  },

  save(char) {
    const all = this.getAll();
    const idx = all.findIndex(c => c.name === char.name);
    if (idx >= 0) all[idx] = char;
    else all.push(char);
    localStorage.setItem("characters", JSON.stringify(all));
  },

  delete(name) {
    const all = this.getAll().filter(c => c.name !== name);
    localStorage.setItem("characters", JSON.stringify(all));
  },

  // 🆕 设置启用人设（根据身份区分）
  setActive(char) {
    const all = this.getAll().map(c =>
      c.role === char.role ? { ...c, isActive: c.name === char.name } : c
    );
    localStorage.setItem("characters", JSON.stringify(all));
  },

  getActive() {
    return this.getAll().filter(c => c.isActive);
  },
};
