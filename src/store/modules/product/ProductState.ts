export default interface ProductState {
  products: {
    list: any;
    total: {
      variant: number;
      virtual: number;
    }
  };
  facets: any;
}