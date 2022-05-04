export default interface ProductState {
  cached: any;
  products: {
    list: any;
    count:{
      variant: number;
      virtual: number;
    }
  }
}