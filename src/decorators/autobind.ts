export function autoBind(target: any, nmethodName: string, PropertyDescriptor: PropertyDescriptor) {
  const originalMethod = PropertyDescriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    }
  }
  return adjDescriptor;
}