export default interface ProductState {
  products: {
    list: any;
    total: {
      variant: number;
      virtual: number;
    }
  };
  appliedFilters: {
    included: {
      tags: Array<string>
    },
    excluded: {
      tags: Array<string>
    }
  };
  query: any;
  threshold: number;
}