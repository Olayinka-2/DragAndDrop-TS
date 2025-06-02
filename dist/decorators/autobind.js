export function autoBind(target, nmethodName, PropertyDescriptor) {
    const originalMethod = PropertyDescriptor.value;
    const adjDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}
