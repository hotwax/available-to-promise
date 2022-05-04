export default interface ProductState {
  cached: any;
  products: {
    list: any;
    total: {
      variant: number;
      virtual: number;
    }
  };
  facets: any;
}