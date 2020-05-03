import ArrayList from 'core/ArrayList';

export default class EntityList extends ArrayList {
  getElementById(id) {
    return this.find(e => e.id === id);
  }

  hasElement(obj) {
    return !!this.getElementById(obj.id);
  }

  addElement(obj, index) {
    if (!obj) {
      return;
    }

    if (index !== undefined) {
      this.insert(obj, index);
    } else {
      this.push(obj);
    }

    return obj;
  }

  removeElement(obj) {
    if (!this.hasElement(obj)) {
      return false;
    }

    return this.remove(this.indexOf(obj));
  }

  shiftElement(obj, spaces) {
    if (!this.hasElement(obj)) {
      return false;
    }

    const index = this.indexOf(obj);
    const newIndex = index + spaces;

    this.swap(index, newIndex);

    return this.indexOf(obj) !== index;
  }

  toJSON() {
    return this.map(e => e.toJSON());
  }
}
