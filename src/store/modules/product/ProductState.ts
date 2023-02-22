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
      tags: {
        list: any;
        operator: string;
      };
    },
    excluded: {
      tags: {
        list: any;
        operator: string;
      };
    }
  };
  query: any;
  threshold: number;
}