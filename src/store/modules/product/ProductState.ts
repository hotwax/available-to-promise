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
      tags: Array<string>,
      productCategoryNames: Array<string>
    },
    excluded: {
      tags: Array<string>,
      productCategoryNames: Array<string>
    }
  };
  query: any;
}